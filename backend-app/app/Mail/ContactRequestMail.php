<?php

namespace App\Mail;

use App\Models\ContactRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContactRequestMail extends Mailable
{
    use Queueable, SerializesModels;

    public $contactRequest;

    public function __construct(ContactRequest $contactRequest)
    {
        $this->contactRequest = $contactRequest;
    }

    public function build()
    {
        return $this->from(config('mail.from.address'), config('mail.from.name'))
            ->subject('Новое обращение на сайте ' . config('app.name'))
            ->view('emails.contact_request');
    }
}
