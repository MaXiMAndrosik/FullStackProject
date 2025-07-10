<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\VerificationOwners;

class VerificationResult extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Экземпляр заявки на верификацию
     *
     * @var VerificationOwners
     */
    public $verification;

    /**
     * Результат верификации
     *
     * @var string
     */
    public $result;

    /**
     * Комментарий модератора
     *
     * @var string|null
     */
    public $notes;

    /**
     * Создание нового сообщения
     *
     * @param VerificationOwners $verification
     * @param string $result ('approved' или 'rejected')
     * @param string|null $notes
     */
    public function __construct(VerificationOwners $verification, string $result, ?string $notes = null)
    {
        $this->verification = $verification;
        $this->result = $result;
        $this->notes = $notes;
    }

    /**
     * Получение конверта сообщения
     */
    public function envelope(): Envelope
    {
        $subject = $this->result === 'approved'
            ? 'Ваша верификация подтверждена'
            : 'Результат проверки вашей заявки';

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Получение определения содержимого сообщения
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.verification_result',
            with: [
                'subject' => $this->envelope()->subject,
                'verification' => $this->verification,
                'result' => $this->result,
                'notes' => $this->notes,
            ],
        );
    }

    /**
     * Получение вложений для сообщения
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
