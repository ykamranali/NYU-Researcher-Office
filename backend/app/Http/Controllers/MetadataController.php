<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Faculty;
use App\Models\ResearchCategory;
use Illuminate\Http\Request;

class MetadataController extends Controller
{
    /**
     * Return all taxonomy and classification lookups for forms.
     */
    public function index()
    {
        return response()->json([
            'faculties' => Faculty::with('departments:id,faculty_id,name,slug')->get(['id', 'name', 'slug']),
            'departments' => Department::get(['id', 'faculty_id', 'name', 'slug']),
            'categories' => ResearchCategory::get(['id', 'name', 'slug', 'description']),
        ]);
    }
}
