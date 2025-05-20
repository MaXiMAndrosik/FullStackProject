<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    public function current(Request $request)
    {
        Log::debug('UserController current', ['user' => User::all()]);

        return response()->json([
            'user' => $request->user()->only('id', 'name', 'email', 'role')
        ]);;
    }
}
