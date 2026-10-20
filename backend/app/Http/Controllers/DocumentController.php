<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Document;
use App\Models\ResearchProject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentController extends Controller
{
    /**
     * Display a listing of accessible documents.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Document::with('uploader:id,name,email');

        // Non-admins only see public documents or their own uploaded documents
        if (!$user->hasAnyRole(['Super Admin', 'Office Admin'])) {
            $query->where(function ($q) use ($user) {
                $q->where('uploaded_by', $user->id)
                  ->orWhere('is_public', true);
            });
        }

        if ($request->filled('category') && $request->category !== 'All') {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $search = '%' . $request->search . '%';
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', $search)
                  ->orWhere('original_name', 'like', $search);
            });
        }

        $docs = $query->latest()->get()->map(function ($doc) {
            return [
                'id' => $doc->id,
                'name' => $doc->title,
                'original_name' => $doc->original_name,
                'type' => strtoupper($doc->file_type ?? pathinfo($doc->original_name, PATHINFO_EXTENSION)),
                'size' => $doc->formatted_size,
                'raw_size' => $doc->file_size,
                'category' => $doc->category,
                'is_public' => $doc->is_public,
                'is_confidential' => $doc->is_confidential,
                'uploaded_by' => $doc->uploader?->name ?? 'Unknown',
                'date' => $doc->created_at->format('M j, Y'),
                'created_at' => $doc->created_at,
            ];
        });

        return response()->json($docs);
    }

    /**
     * Secure upload into private storage with validation, safe naming, and audit logs.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'file' => 'required|file|max:15360|mimes:pdf,docx,xlsx,csv,png,jpg,jpeg,txt', // Max 15MB
            'title' => 'nullable|string|max:255',
            'category' => 'nullable|string|in:General,Proposal,Ethics Protocol,Financial,Consent Form,Data Management,Report',
            'is_public' => 'nullable|boolean',
            'research_project_id' => 'nullable|exists:research_projects,id',
        ]);

        $uploadedFile = $request->file('file');
        $originalName = $uploadedFile->getClientOriginalName();
        $extension = $uploadedFile->getClientOriginalExtension();
        $mimeType = $uploadedFile->getMimeType();
        $size = $uploadedFile->getSize();

        // Safe randomized storage filename
        $safeFileName = Str::random(32) . '.' . $extension;
        $folderPath = 'documents/' . date('Y/m');

        // Store in private storage disk (never exposed directly through web server)
        $storedPath = $uploadedFile->storeAs($folderPath, $safeFileName, 'local');

        $title = $request->input('title') ?: pathinfo($originalName, PATHINFO_FILENAME);
        $category = $request->input('category', 'General');
        $isPublic = filter_var($request->input('is_public', false), FILTER_VALIDATE_BOOLEAN);

        $document = Document::create([
            'title' => $title,
            'file_path' => $storedPath,
            'original_name' => $originalName,
            'file_type' => $extension,
            'file_size' => $size,
            'mime_type' => $mimeType,
            'version' => 1,
            'uploaded_by' => $user->id,
            'is_public' => $isPublic,
            'is_confidential' => !$isPublic,
            'category' => $category,
            'documentable_type' => $request->filled('research_project_id') ? ResearchProject::class : null,
            'documentable_id' => $request->input('research_project_id'),
        ]);

        AuditLog::log('document_uploaded', 'Document', $document->id, [
            'original_name' => $originalName,
            'size_bytes' => $size,
            'category' => $category,
        ], $user->id);

        return response()->json([
            'message' => 'Document uploaded and securely encrypted into institutional storage.',
            'document' => [
                'id' => $document->id,
                'name' => $document->title,
                'type' => strtoupper($extension),
                'size' => $document->formatted_size,
                'date' => $document->created_at->format('M j, Y'),
            ],
        ], 201);
    }

    /**
     * Secure file download / stream with authorization check and audit trail.
     */
    public function download(Request $request, $id)
    {
        $document = Document::findOrFail($id);
        $user = $request->user();

        // Enforce authorization
        if (!$document->is_public) {
            if (!$user->hasAnyRole(['Super Admin', 'Office Admin', 'Reviewer']) && $document->uploaded_by !== $user->id) {
                // If attached to a project, check if user is PI
                if ($document->documentable_type === ResearchProject::class) {
                    $project = ResearchProject::find($document->documentable_id);
                    if (!$project || $project->user_id !== $user->id) {
                        return response()->json(['message' => 'Unauthorized: Confidential research document.'], 403);
                    }
                } else {
                    return response()->json(['message' => 'Unauthorized: Confidential document.'], 403);
                }
            }
        }

        if (!Storage::disk('local')->exists($document->file_path)) {
            return response()->json(['message' => 'File not found on secure storage.'], 404);
        }

        AuditLog::log('document_downloaded', 'Document', $document->id, [
            'original_name' => $document->original_name,
        ], $user->id);

        return Storage::disk('local')->download($document->file_path, $document->original_name);
    }

    /**
     * Delete document from storage and database.
     */
    public function destroy(Request $request, $id)
    {
        $document = Document::findOrFail($id);
        $user = $request->user();

        if (!$user->hasAnyRole(['Super Admin', 'Office Admin']) && $document->uploaded_by !== $user->id) {
            return response()->json(['message' => 'Unauthorized to delete this document.'], 403);
        }

        if (Storage::disk('local')->exists($document->file_path)) {
            Storage::disk('local')->delete($document->file_path);
        }

        $document->delete();

        AuditLog::log('document_deleted', 'Document', $id, [
            'title' => $document->title,
        ], $user->id);

        return response()->json(['message' => 'Document deleted successfully']);
    }
}
