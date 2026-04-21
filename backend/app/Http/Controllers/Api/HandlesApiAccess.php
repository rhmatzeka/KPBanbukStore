<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;

trait HandlesApiAccess
{
    protected function currentUser(Request $request): ?User
    {
        $authorization = (string) $request->header('Authorization', '');
        $token = str_replace('Bearer ', '', $authorization);
        $userId = str_replace('dummy-token-', '', $token);

        if (! is_numeric($userId)) {
            return null;
        }

        return User::with('role')->find((int) $userId);
    }

    protected function hasRole(Request $request, array $roles): bool
    {
        $user = $this->currentUser($request);

        return $user && in_array($user->role?->name, $roles, true);
    }

    protected function denyAccessResponse()
    {
        return response()->json(['message' => 'Akses ditolak untuk role ini'], 403);
    }

    protected function requireOwner(Request $request)
    {
        if (! $this->hasRole($request, ['owner'])) {
            return $this->denyAccessResponse();
        }

        return null;
    }

    protected function requireOwnerOrAdmin(Request $request)
    {
        if (! $this->hasRole($request, ['owner', 'admin'])) {
            return $this->denyAccessResponse();
        }

        return null;
    }
}
