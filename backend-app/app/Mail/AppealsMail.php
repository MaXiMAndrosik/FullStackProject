<?php

namespace App\Mail;

use App\Models\Appeals;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AppealsMail extends Mailable
{
    use Queueable, SerializesModels;

    public $appeal;

    public function __construct(Appeals $appeal)
    {
        $this->appeal = $appeal;
    }

    public function build()
    {
        return $this->from(config('mail.from.address'), config('mail.from.name'))
            ->subject('Новое обращение на сайте ' . config('app.name'))
            ->view('emails.appeal');
    }
}
