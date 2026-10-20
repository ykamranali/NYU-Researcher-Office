<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EventController extends Controller
{
    /**
     * Display a listing of research events.
     */
    public function index(Request $request)
    {
        $query = Event::query();

        if ($request->has('upcoming')) {
            $query->where('start_time', '>=', now());
        }

        return response()->json($query->orderBy('start_time', 'asc')->get());
    }

    /**
     * Store a newly created event.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['Super Admin', 'Office Admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'start_time' => 'required|date',
            'end_time' => 'nullable|date|after_or_equal:start_time',
            'location' => 'nullable|string',
            'is_virtual' => 'nullable|boolean',
            'registration_link' => 'nullable|url',
            'featured_image' => 'nullable|string',
        ]);

        $slug = Str::slug($validated['title']) . '-' . substr(uniqid(), -4);

        $event = Event::create(array_merge($validated, [
            'slug' => $slug,
            'is_virtual' => $validated['is_virtual'] ?? false,
        ]));

        AuditLog::log('event_created', 'Event', $event->id, [], $user->id);

        return response()->json([
            'message' => 'Event scheduled successfully',
            'event' => $event,
        ], 201);
    }

    /**
     * Display the specified event.
     */
    public function show($id)
    {
        $event = Event::where('id', $id)->orWhere('slug', $id)->firstOrFail();
        return response()->json($event);
    }

    /**
     * Update the specified event.
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['Super Admin', 'Office Admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $event = Event::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'start_time' => 'sometimes|required|date',
            'end_time' => 'nullable|date',
            'location' => 'nullable|string',
            'is_virtual' => 'nullable|boolean',
            'registration_link' => 'nullable|url',
        ]);

        $event->update($validated);

        AuditLog::log('event_updated', 'Event', $event->id, [], $user->id);

        return response()->json([
            'message' => 'Event updated successfully',
            'event' => $event,
        ]);
    }

    /**
     * Remove the specified event.
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['Super Admin', 'Office Admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $event = Event::findOrFail($id);
        $event->delete();

        AuditLog::log('event_deleted', 'Event', $id, [], $user->id);

        return response()->json(['message' => 'Event deleted successfully']);
    }
}
