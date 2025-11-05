<!DOCTYPE html>
<html>

<head>
    <title>Ответ на ваше обращение</title>
</head>

<body>
    <h2>Здравствуйте, {{ $appeal->name }}!</h2>

    <p>Благодарим вас за обращение в нашу службу поддержки.</p>

    <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #3490dc; margin: 20px 0;">
        <p><strong>Ваше обращение:</strong></p>
        <p>{{ $appeal->message }}</p>
    </div>

    @if($appeal->response)
    <div style="background-color: #e2f0ff; padding: 15px; border-left: 4px solid #38c172; margin: 20px 0;">
        <p><strong>Наш ответ:</strong></p>
        <p>{{ $appeal->response }}</p>
    </div>
    @endif

    <!-- <p>Если у вас остались вопросы, вы можете ответить на это письмо.</p> -->

    <p>С уважением,<br>
        Служба поддержки {{ config('app.name') }}</p>

    <footer style="margin-top: 30px; color: #6c757d; font-size: 0.9em;">
        <p>Это письмо отправлено автоматически. Пожалуйста, не отвечайте на него.</p>
    </footer>
</body>

</html>