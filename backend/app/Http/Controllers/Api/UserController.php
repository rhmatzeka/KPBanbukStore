<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use HandlesApiAccess;

    public function index(Request $request)
    {
        if ($response = $this->requireOwner($request)) {
            return $response;
        }

        $users = User::with('role')->latest()->get();
        return response()->json($users);
    }

    public function store(Request $request, AuditLogger $auditLogger)
    {
        if ($response = $this->requireOwner($request)) {
            return $response;
        }

        $validated = $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'role_id' => 'required|exists:roles,id'
        ]);

        $user = User::create($validated);

        $auditLogger->log(
            $request,
            'create',
            'users',
            'Menambahkan user ' . $user->name,
            null,
            $user->load('role')->toArray(),
            $this->currentUser($request)
        );

        return response()->json($user->load('role'), 201);
    }

    public function show(Request $request, $id)
    {
        if ($response = $this->requireOwner($request)) {
            return $response;
        }

        $user = User::with('role')->findOrFail($id);
        return response()->json($user);
    }

    public function update(Request $request, $id, AuditLogger $auditLogger)
    {
        if ($response = $this->requireOwner($request)) {
            return $response;
        }

        $user = User::findOrFail($id);
        $oldValues = $user->load('role')->toArray();
        
        $validated = $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users,email,' . $id,
            'role_id' => 'required|exists:roles,id'
        ]);

        if ($request->password) {
            $validated['password'] = $request->password;
        }

        $user->update($validated);

        $auditLogger->log(
            $request,
            'update',
            'users',
            'Mengubah user ' . $user->name,
            $oldValues,
            $user->fresh('role')->toArray(),
            $this->currentUser($request)
        );

        return response()->json($user->load('role'));
    }

    public function destroy(Request $request, $id, AuditLogger $auditLogger)
    {
        if ($response = $this->requireOwner($request)) {
            return $response;
        }

        if ($this->currentUser($request)?->id === (int) $id) {
            return response()->json(['message' => 'User yang sedang login tidak dapat menghapus akunnya sendiri'], 400);
        }

        $user = User::findOrFail($id);
        $oldValues = $user->load('role')->toArray();
        $user->delete();

        $auditLogger->log(
            $request,
            'delete',
            'users',
            'Menghapus user ' . $oldValues['name'],
            $oldValues,
            null,
            $this->currentUser($request)
        );

        return response()->json(['message' => 'User deleted']);
    }
}
