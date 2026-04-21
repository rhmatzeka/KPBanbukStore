<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Throwable;

class AuditLogger
{
    public function log(
        Request $request,
        string $action,
        string $module,
        string $description,
        mixed $oldValues = null,
        mixed $newValues = null,
        ?User $actor = null
    ): void {
        try {
            AuditLog::create([
                'user_id' => $actor?->id ?? $this->resolveUserId($request),
                'action' => $action,
                'module' => $module,
                'description' => $description,
                'old_values' => $oldValues,
                'new_values' => $newValues,
                'ip_address' => $request->ip(),
                'user_agent' => substr((string) $request->userAgent(), 0, 500),
            ]);
        } catch (Throwable $exception) {
            report($exception);
        }
    }

    private function resolveUserId(Request $request): ?int
    {
        $authorization = (string) $request->header('Authorization', '');
        $token = str_replace('Bearer ', '', $authorization);
        $userId = str_replace('dummy-token-', '', $token);

        return is_numeric($userId) ? (int) $userId : null;
    }
}
