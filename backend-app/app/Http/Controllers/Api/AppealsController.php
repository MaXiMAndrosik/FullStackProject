<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appeals;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\AppealsMail;

class AppealsController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'message' => 'required|string',
        ]);

        $appeal = Appeals::create($validated);

        // Отправка email
        $recipientEmail = config('mail.contact_recipient');
        Mail::to($recipientEmail)->send(new AppealsMail($appeal));

        Log::info('Appeal received and sent to: ' . $recipientEmail, [
            'contact_id' => $appeal->id,
            'email' => $appeal->email
        ]);

        return response()->json([
            'message' => 'Contact request submitted successfully',
            'data' => $appeal
        ], 201);
    }
}
