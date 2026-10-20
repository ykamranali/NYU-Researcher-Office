<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\SystemSetting;
use Illuminate\Http\Request;

class SystemSettingsController extends Controller
{
    /**
     * Get all system configuration key-value pairs.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['Super Admin', 'Office Admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $settings = SystemSetting::all()->pluck('value', 'key');

        return response()->json([
            'university_name' => $settings['university_name'] ?? 'New York University',
            'support_email' => $settings['support_email'] ?? 'research-support@nyu.edu',
            'maintenance_mode' => $settings['maintenance_mode'] ?? 'Disabled',
            'allowed_file_types' => $settings['allowed_file_types'] ?? 'pdf,docx,xlsx,csv,png,jpg',
            'max_upload_size_mb' => $settings['max_upload_size_mb'] ?? '15',
            'require_ethics_for_human_subjects' => $settings['require_ethics_for_human_subjects'] ?? 'true',
        ]);
    }

    /**
     * Update system settings.
     */
    public function update(Request $request)
    {
        $user = $request->user();
        if (!$user->hasRole('Super Admin')) {
            return response()->json(['message' => 'Only Super Administrators can modify institutional system parameters.'], 403);
        }

        $validated = $request->validate([
            'university_name' => 'sometimes|required|string|max:255',
            'support_email' => 'sometimes|required|email',
            'maintenance_mode' => 'sometimes|required|string',
            'allowed_file_types' => 'nullable|string',
            'max_upload_size_mb' => 'nullable|numeric|min:1|max:100',
        ]);

        foreach ($validated as $key => $val) {
            SystemSetting::setVal($key, (string) $val, 'general', 'string');
        }

        AuditLog::log('system_settings_updated', 'SystemSetting', null, [
            'updated_keys' => array_keys($validated),
        ], $user->id);

        return response()->json([
            'message' => 'Institutional system settings updated and applied successfully.',
        ]);
    }
}
