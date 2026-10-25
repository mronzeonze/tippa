<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityLogController extends AdminController
{
    public function __construct()
    {
        $this->middleware(['auth', 'permission:view-logs']);
    }

    /**
     * Liste des logs d'activité
     * GET /admin/activity-logs
     */
    public function index(Request $request)
    {
        $query = ActivityLog::with('user:id,full_name,username,profile_picture');

        // Filtres
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('action')) {
            $query->where('action', $request->action);
        }

        if ($request->has('model_type')) {
            $query->where('model_type', $request->model_type);
        }

        if ($request->has('date_from')) {
            $query->where('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('created_at', '<=', $request->date_to);
        }

        if ($request->has('search')) {
            $query->where('description', 'like', "%{$request->search}%");
        }

        $logs = $query->latest()->paginate(100);

        // Actions disponibles pour le filtre
        $actions = ActivityLog::select('action')
            ->distinct()
            ->orderBy('action')
            ->pluck('action');

        return Inertia::render('admin/activity-logs/index', [
            'logs' => $logs,
            'actions' => $actions,
            'filters' => [
                'user_id' => $request->user_id,
                'action' => $request->action,
                'model_type' => $request->model_type,
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
                'search' => $request->search,
            ],
            'auth'=> $this->buildAuthPayload(),
        ]);
    }

    /**
     * Voir un log spécifique
     * GET /admin/activity-logs/{log}
     */
    public function show(ActivityLog $log)
    {
        $log->load('user:id,full_name,username,email,profile_picture');

        return Inertia::render('admin/activity-logs/show', [
            'log' => $log,
        ]);
    }
}