<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class DocumentSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected User $uploader;
    protected User $unauthorizedUser;
    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');

        Role::firstOrCreate(['name' => 'Office Admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'Professor', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'Student', 'guard_name' => 'web']);

        $this->uploader = User::firstOrCreate(
            ['email' => 'uploader@nyu.edu'],
            ['name' => 'Dr. Uploader', 'password' => bcrypt('password')]
        );
        $this->uploader->syncRoles(['Professor']);

        $this->unauthorizedUser = User::firstOrCreate(
            ['email' => 'unauthorized@nyu.edu'],
            ['name' => 'Unauthorized Student', 'password' => bcrypt('password')]
        );
        $this->unauthorizedUser->syncRoles(['Student']);

        $this->admin = User::firstOrCreate(
            ['email' => 'admin.doc@nyu.edu'],
            ['name' => 'Doc Admin', 'password' => bcrypt('password')]
        );
        $this->admin->syncRoles(['Office Admin']);
    }

    public function test_user_can_upload_valid_document(): void
    {
        Sanctum::actingAs($this->uploader);

        $file = UploadedFile::fake()->create('research_protocol.pdf', 500, 'application/pdf');

        $response = $this->postJson('/api/documents', [
            'file' => $file,
            'title' => 'Laboratory Safety Protocol',
            'category' => 'General',
            'is_public' => false,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('documents', [
            'title' => 'Laboratory Safety Protocol',
            'uploaded_by' => $this->uploader->id,
            'is_confidential' => true,
        ]);
    }

    public function test_unauthorized_user_cannot_download_confidential_document(): void
    {
        $storedPath = 'documents/2026/10/confidential_patent.pdf';
        Storage::disk('local')->put($storedPath, 'CONFIDENTIAL RESEARCH DATA');

        $doc = Document::create([
            'title' => 'Confidential Patent Disclosure',
            'file_path' => $storedPath,
            'original_name' => 'patent.pdf',
            'file_type' => 'pdf',
            'file_size' => 1024,
            'uploaded_by' => $this->uploader->id,
            'is_public' => false,
            'is_confidential' => true,
            'category' => 'Proposal',
        ]);

        // Attempt download as unauthorized student
        Sanctum::actingAs($this->unauthorizedUser);
        $response = $this->get("/api/documents/{$doc->id}/download");
        $response->assertStatus(403);
    }

    public function test_uploader_and_admin_can_download_confidential_document(): void
    {
        $storedPath = 'documents/2026/10/irb_protocol.pdf';
        Storage::disk('local')->put($storedPath, 'IRB COMPLIANCE DATA');

        $doc = Document::create([
            'title' => 'Human Subjects Protocol',
            'file_path' => $storedPath,
            'original_name' => 'irb_protocol.pdf',
            'file_type' => 'pdf',
            'file_size' => 1024,
            'uploaded_by' => $this->uploader->id,
            'is_public' => false,
            'is_confidential' => true,
            'category' => 'Ethics Protocol',
        ]);

        // Uploader can download
        Sanctum::actingAs($this->uploader);
        $response = $this->get("/api/documents/{$doc->id}/download");
        $response->assertStatus(200);

        // Office Admin can download
        Sanctum::actingAs($this->admin);
        $adminResponse = $this->get("/api/documents/{$doc->id}/download");
        $adminResponse->assertStatus(200);
    }
}
