<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request, AuditLogger $auditLogger)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::with('role')->where('email', trim($request->email))->first();

        if (!$user) {
            $auditLogger->log(
                $request,
                'failed_login',
                'auth',
                'Percobaan login gagal untuk email ' . trim($request->email)
            );

            return response()->json(['message' => 'User tidak ditemukan'], 401);
        }

        $inputPassword = (string) $request->password;
        $storedPassword = (string) $user->password;

        // Jika password lama masih plain text dan cocok, upgrade langsung ke bcrypt.
        if ($storedPassword === $inputPassword) {
            $user->password = Hash::make($inputPassword);
            $user->save();

            $auditLogger->log(
                $request,
                'login',
                'auth',
                'Login berhasil untuk user ' . $user->name,
                null,
                ['email' => $user->email],
                $user
            );

            return response()->json([
                'user' => $user,
                'token' => 'dummy-token-' . $user->id
            ]);
        }

        $passwordInfo = password_get_info($storedPassword);
        $isBcryptHash = ($passwordInfo['algoName'] ?? 'unknown') === 'bcrypt';

        if (!$isBcryptHash || !Hash::check($inputPassword, $storedPassword)) {
            $auditLogger->log(
                $request,
                'failed_login',
                'auth',
                'Percobaan login gagal untuk user ' . $user->name,
                null,
                ['email' => $user->email],
                $user
            );

            return response()->json(['message' => 'Password salah'], 401);
        }

        $auditLogger->log(
            $request,
            'login',
            'auth',
            'Login berhasil untuk user ' . $user->name,
            null,
            ['email' => $user->email],
            $user
        );

        return response()->json([
            'user' => $user,
            'token' => 'dummy-token-' . $user->id
        ]);
    }

    public function me(Request $request)
    {
        $userId = str_replace('dummy-token-', '', $request->header('Authorization'));
        $user = User::with('role')->find($userId);
        
        return response()->json($user);
    }
}
