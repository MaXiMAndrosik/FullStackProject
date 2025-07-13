<?php

namespace App\Mail;

use App\Models\Appeals;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AppealResponseMail extends Mailable
{
    use Queueable, SerializesModels;

    public $appeal;

    public function __construct(Appeals $appeal)
    {
        $this->appeal = $appeal;
    }

    public function build()
    {
        return $this->subject('Ответ на ваше обращение #' . $this->appeal->id)
            ->view('emails.appeal_response')
            ->text('emails.appeal_response_plain');
    }
}
