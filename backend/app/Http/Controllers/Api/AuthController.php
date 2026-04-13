<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::with('role')->where('email', trim($request->email))->first();

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan'], 401);
        }

        $inputPassword = (string) $request->password;
        $storedPassword = (string) $user->password;

        // Jika password lama masih plain text dan cocok, upgrade langsung ke bcrypt.
        if ($storedPassword === $inputPassword) {
            $user->password = Hash::make($inputPassword);
            $user->save();

            return response()->json([
                'user' => $user,
                'token' => 'dummy-token-' . $user->id
            ]);
        }

        $passwordInfo = password_get_info($storedPassword);
        $isBcryptHash = ($passwordInfo['algoName'] ?? 'unknown') === 'bcrypt';

        if (!$isBcryptHash || !Hash::check($inputPassword, $storedPassword)) {
            return response()->json(['message' => 'Password salah'], 401);
        }

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
