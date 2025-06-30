<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use App\Models\VerificationOwners;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerificationRequestedOwnerMail extends Mailable
{
    use Queueable, SerializesModels;

    public $verification_request;

    public function __construct(VerificationOwners $verification_request)
    {
        $this->verification_request = $verification_request;
    }

    public function build()
    {

        return $this->from(config('mail.from.address'), config('mail.from.name'))
            ->subject('Новый запрос на верификацию на сайте ' . config('app.name'))
            ->markdown('emails.requested')
            ->with([
                'user' => $this->verification_request->user,
                'request' => $this->verification_request
            ]);
    }
}
