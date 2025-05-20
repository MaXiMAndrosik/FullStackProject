<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\ContactRequestMail;

class ContactRequestController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'message' => 'required|string',
        ]);

        $contactRequest = ContactRequest::create($validated);

        // Отправка email
        $recipientEmail = config('mail.contact_recipient');
        Mail::to($recipientEmail)->send(new ContactRequestMail($contactRequest));

        Log::info('Contact request received and sent to: ' . $recipientEmail, [
            'contact_id' => $contactRequest->id,
            'email' => $contactRequest->email
        ]);

        return response()->json([
            'message' => 'Contact request submitted successfully',
            'data' => $contactRequest
        ], 201);
    }
}
