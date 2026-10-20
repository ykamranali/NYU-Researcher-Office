import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    FlaskConical, 
    Users, 
    BookOpen, 
    Briefcase, 
    FileText, 
    Files, 
    CheckSquare, 
    BarChart, 
    Settings,
    LogOut,
    Menu,
    X,
    Bell
} from 'lucide-react';

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const role = user?.role || 'Student';

    const getMenuItems = () => {
        if (role === 'Super Admin' || role === 'Office Admin') {
            return [
                { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
                { name: 'Research', icon: FlaskConical, path: '/admin/research' },
                { name: 'People', icon: Users, path: '/admin/people' },
                { name: 'Publications', icon: BookOpen, path: '/admin/publications' },
                { name: 'Opportunities', icon: Briefcase, path: '/admin/opportunities' },
                { name: 'Content', icon: FileText, path: '/admin/content' },
                { name: 'Documents', icon: Files, path: '/admin/documents' },
                { name: 'Approvals', icon: CheckSquare, path: '/admin/approvals' },
                { name: 'Reports', icon: BarChart, path: '/admin/reports' },
                { name: 'System', icon: Settings, path: '/admin/system' },
            ];
        } else if (role === 'Professor') {
            return [
                { name: 'My Dashboard', icon: LayoutDashboard, path: '/professor' },
                { name: 'My Projects', icon: FlaskConical, path: '/professor/projects' },
                { name: 'My Publications', icon: BookOpen, path: '/professor/publications' },
                { name: 'Profile Settings', icon: Settings, path: '/professor/settings' },
            ];
        } else if (role === 'Student') {
            return [
                { name: 'My Dashboard', icon: LayoutDashboard, path: '/student' },
                { name: 'Opportunities', icon: Briefcase, path: '/student/opportunities' },
                { name: 'My Applications', icon: FileText, path: '/student/applications' },
                { name: 'My Profile', icon: Settings, path: '/student/profile' },
            ];
        }
        return [];
    };

    const menuItems = getMenuItems();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <div className="flex h-screen bg-gray-light font-sans">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-nyu-deep text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-center h-20 border-b border-white/10">
                    <h1 className="text-xl font-heading font-bold text-center px-4 leading-tight">
                        Research Office
                    </h1>
                </div>
                
                <nav className="mt-6 px-4 space-y-1 overflow-y-auto h-[calc(100vh-5rem)] pb-20">
                    {menuItems.map((item) => {
                        // Check if current path matches item path exactly, OR starts with item path + '/'
                        // but prevent Dashboard ('/admin') from lighting up for '/admin/research'
                        const isActive = item.path === '/admin' || item.path === '/professor' || item.path === '/student' 
                            ? location.pathname === item.path
                            : location.pathname === item.path || location.pathname.startsWith(item.path + '/');

                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center px-4 py-3 rounded-lg transition-colors group ${
                                    isActive
                                        ? 'bg-nyu-primary text-white shadow-lg' 
                                        : 'text-nyu-veryLight hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'group-hover:text-white'}`} />
                                <span className="font-medium text-sm">{item.name}</span>
                            </Link>
                        );
                    })}
                    
                    <button 
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 mt-8 text-nyu-light hover:bg-white/10 hover:text-white rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        <span className="font-medium text-sm">Logout</span>
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top header */}
                <header className="flex items-center justify-between h-20 px-6 bg-white border-b border-gray-200 shadow-sm z-10">
                    <div className="flex items-center">
                        <button 
                            className="text-gray-dark focus:outline-none lg:hidden mr-4"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-2xl font-heading text-gray-800">Admin Portal</h2>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <button className="text-gray-500 hover:text-nyu-primary transition-colors">
                            <Bell className="w-6 h-6" />
                        </button>
                        <div className="flex items-center gap-3 border-l pl-4 border-gray-200">
                            <div className="w-10 h-10 rounded-full bg-nyu-primary flex items-center justify-center text-white font-bold">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="hidden md:block text-sm">
                                <p className="font-bold text-gray-900">{user?.name || 'User'}</p>
                                <p className="text-gray-500 text-xs">{role}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main scrollable area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-light p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
