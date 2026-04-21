<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    use HandlesApiAccess;

    public function index(Request $request)
    {
        if ($response = $this->requireOwner($request)) {
            return $response;
        }

        $query = AuditLog::with('user')->latest();

        if ($request->filled('module')) {
            $query->where('module', $request->get('module'));
        }

        if ($request->filled('action')) {
            $query->where('action', $request->get('action'));
        }

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($innerQuery) use ($search) {
                $innerQuery
                    ->where('description', 'like', "%{$search}%")
                    ->orWhere('module', 'like', "%{$search}%")
                    ->orWhere('action', 'like', "%{$search}%");
            });
        }

        return response()->json($query->take(200)->get());
    }
}
