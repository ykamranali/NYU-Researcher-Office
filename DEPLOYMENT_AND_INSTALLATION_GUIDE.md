# NYU Research Office Management System
## Production Deployment, Server Installation & Operations Guide

This guide covers complete, production-grade installation, security hardening, queue configuration, backup/restore procedures, and maintenance for the **NYU Research Office Management System**.

---

## 1. System Requirements & Prerequisites

### Server Architecture
- **Operating System:** Ubuntu 22.04 LTS / 24.04 LTS, Debian 12, or RHEL 9
- **Processor:** Minimum 2 vCPU (4 vCPU recommended for high concurrency)
- **Memory (RAM):** Minimum 4 GB (8 GB recommended)
- **Storage:** NVMe/SSD with minimum 40 GB free space (scales with document repository)

### Software Stack
- **PHP:** `8.2` or `8.3` / `8.4` (CLI, FPM)
  - Required PHP Extensions: `bcmath`, `ctype`, `curl`, `dom`, `fileinfo`, `filter`, `gd`, `hash`, `intl`, `json`, `mbstring`, `openssl`, `pcre`, `pdo`, `pdo_mysql` (or `pdo_pgsql`), `session`, `tokenizer`, `xml`, `zip`
- **Node.js:** `v20.x` or `v22.x` (LTS) & `npm 10+`
- **Web Server:** Nginx `1.22+` (with HTTP/2, TLS 1.3)
- **Database Server:** MySQL `8.0+` / MariaDB `10.11+` or PostgreSQL `15+` (SQLite supported for local development)
- **Process Manager:** `Supervisor` (for persistent background queue workers)

---

## 2. Server Provisioning & Package Installation

```bash
# Update system repositories
sudo apt update && sudo apt upgrade -y

# Install standard utilities
sudo apt install -y curl git unzip zip software-properties-common ufw supervisor nginx

# Install PHP 8.4 and required extensions
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php8.4-fpm php8.4-cli php8.4-common php8.4-mysql php8.4-pgsql \
    php8.4-sqlite3 php8.4-mbstring php8.4-xml php8.4-curl php8.4-bcmath php8.4-zip \
    php8.4-intl php8.4-gd php8.4-opcache

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer

# Install Node.js LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

---

## 3. Application Deployment & Environment Setup

### 3.1 Clone Repository & Set Directory Permissions
```bash
sudo mkdir -p /var/www/nyu-research-office
sudo chown -R $USER:www-data /var/www/nyu-research-office

git clone <YOUR_GIT_REPOSITORY_URL> /var/www/nyu-research-office
cd /var/www/nyu-research-office
```

### 3.2 Backend Configuration
```bash
cd /var/www/nyu-research-office/backend

# Install PHP production dependencies
composer install --no-dev --optimize-autoloader

# Set up production environment configuration
cp .env.example .env

# Generate secure application key
php artisan key:generate
```

Configure `/var/www/nyu-research-office/backend/.env` with your production values:
```ini
APP_NAME="NYU Research Office"
APP_ENV=production
APP_KEY=base64:YOUR_GENERATED_KEY
APP_DEBUG=false
APP_URL=https://research.nyu.edu

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nyu_research_office
DB_USERNAME=nyu_db_user
DB_PASSWORD=YourStrongDatabasePasswordHere

SESSION_DRIVER=database
SESSION_SECURE_COOKIE=true
QUEUE_CONNECTION=database
CACHE_STORE=database

FILESYSTEM_DISK=local
CORS_ALLOWED_ORIGINS=https://research.nyu.edu
SANCTUM_STATEFUL_DOMAINS=research.nyu.edu
```

### 3.3 Database Migration & First Administrator Bootstrap
```bash
# Run database migrations safely (never drops existing data)
php artisan migrate --force

# Bootstrap the initial Super Administrator (automatically permanently locks after execution)
php artisan research:bootstrap-admin \
  --email="admin@nyu.edu" \
  --name="Institutional Super Admin" \
  --password="YourStrongInitialAdminPassword!"
```

### 3.4 File Permissions Hardening
```bash
cd /var/www/nyu-research-office/backend

# Create secure private documents directory
mkdir -p storage/app/private/documents
mkdir -p storage/framework/{sessions,views,cache}
mkdir -p storage/logs

# Set restrictive permissions (www-data can write; public cannot read directly)
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

### 3.5 Frontend Production Build
```bash
cd /var/www/nyu-research-office/frontend

# Configure production environment variables
cat << 'EOF' > .env.production
VITE_API_URL=https://research.nyu.edu/api
EOF

# Install node dependencies & compile production bundle
npm ci
npm run build
```

---

## 4. Nginx Web Server & HTTPS Configuration

Create `/etc/nginx/sites-available/nyu-research-office.conf`:
```nginx
server {
    listen 80;
    server_name research.nyu.edu;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name research.nyu.edu;

    # SSL Certificates (Let's Encrypt or Institutional Certificates)
    ssl_certificate /etc/letsencrypt/live/research.nyu.edu/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/research.nyu.edu/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';" always;

    # Maximum upload size (matches backend configuration)
    client_max_body_size 25M;

    # Frontend Single Page Application (SPA)
    root /var/www/nyu-research-office/frontend/dist;
    index index.html;

    # API Backend Proxy
    location ^~ /api {
        alias /var/www/nyu-research-office/backend/public;
        try_files $uri $uri/ @backend;

        location ~ \.php$ {
            include fastcgi_params;
            fastcgi_param SCRIPT_FILENAME /var/www/nyu-research-office/backend/public/index.php;
            fastcgi_pass unix:/var/run/php/php8.4-fpm.sock;
            fastcgi_index index.php;
            fastcgi_buffers 16 16k;
            fastcgi_buffer_size 32k;
        }
    }

    location @backend {
        rewrite ^/api/(.*)$ /api/index.php?/$1 last;
    }

    # Frontend Static Assets & SPA Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Deny access to hidden files and internal storage paths
    location ~ /\. {
        deny all;
    }

    location ^~ /storage/app/private {
        deny all;
        return 404;
    }
}
```

Enable site & test syntax:
```bash
sudo ln -s /etc/nginx/sites-available/nyu-research-office.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 5. Background Queue Workers (Supervisor)

Create `/etc/supervisor/conf.d/nyu-research-queue.conf`:
```ini
[program:nyu-research-queue]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/nyu-research-office/backend/artisan queue:work database --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/nyu-research-office/backend/storage/logs/queue-worker.log
stopwaitsecs=3600
```

Start queue workers:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start nyu-research-queue:*
```

---

## 6. Scheduled Tasks (Cron)

Edit crontab for `www-data`:
```bash
sudo crontab -u www-data -e
```
Add the standard Laravel scheduler entry:
```crontab
* * * * * cd /var/www/nyu-research-office/backend && php artisan schedule:run >> /dev/null 2>&1
```

---

## 7. Database Backup & Disaster Recovery

### 7.1 Automated Daily Backup Script
Create `/usr/local/bin/backup-research-db.sh`:
```bash
#!/usr/bin/env bash
set -e

BACKUP_DIR="/var/backups/nyu-research-office"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

# MySQL Backup (with single-transaction consistency)
mysqldump --single-transaction --quick --routines --triggers \
  -u nyu_db_user -p"YourStrongDatabasePasswordHere" nyu_research_office \
  | gzip > "$BACKUP_DIR/db_backup_$DATE.sql.gz"

# Backup secure documents vault
tar -czf "$BACKUP_DIR/documents_vault_$DATE.tar.gz" -C /var/www/nyu-research-office/backend/storage/app/private documents

# Retain backups for 30 days
find "$BACKUP_DIR" -type f -mtime +30 -delete
```
Make executable and schedule in root crontab:
```bash
sudo chmod +x /usr/local/bin/backup-research-db.sh
# Run daily at 02:00 AM
echo "0 2 * * * /usr/local/bin/backup-research-db.sh >> /var/log/nyu_backup.log 2>&1" | sudo crontab -
```

### 7.2 Database Restore Procedure
```bash
# Decompress and restore database
gunzip < /var/backups/nyu-research-office/db_backup_20261020_020000.sql.gz | mysql -u nyu_db_user -p nyu_research_office

# Restore secure file vault
tar -xzf /var/backups/nyu-research-office/documents_vault_20261020_020000.tar.gz -C /var/www/nyu-research-office/backend/storage/app/private
```

---

## 8. Verification & Health Monitoring

1. **Verify Backend Status:**
   ```bash
   cd /var/www/nyu-research-office/backend
   php artisan route:list --path=api
   php artisan test
   ```
2. **Verify Queue Worker:**
   ```bash
   sudo supervisorctl status
   ```
3. **Verify Nginx & PHP-FPM:**
   ```bash
   sudo systemctl status nginx
   sudo systemctl status php8.4-fpm
   ```
4. **Audit Logs:**
   Access the `audit_logs` table via database or API to review all administrator actions, project approvals, authentication attempts, and file access requests.
