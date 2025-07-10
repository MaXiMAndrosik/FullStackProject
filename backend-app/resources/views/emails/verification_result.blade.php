<!DOCTYPE html>
<html lang="ru">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subject }}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
        }

        .content {
            padding: 30px;
            background-color: #fff;
        }

        .footer {
            text-align: center;
            padding: 20px;
            font-size: 0.9em;
            color: #6c757d;
        }

        .status-approved {
            color: #28a745;
            font-weight: bold;
        }

        .status-rejected {
            color: #dc3545;
            font-weight: bold;
        }

        .notes-box {
            background-color: #f8f9fa;
            padding: 15px;
            border-left: 4px solid #6c757d;
            margin: 20px 0;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>ЖСПК Зенитчик-4</h1>
        </div>

        <div class="content">
            <h2>{{ $subject }}</h2>

            <p>Уважаемый(ая) {{ $verification->last_name }} {{ $verification->first_name }},</p>

            @if($result === 'approved')
            <p class="status-approved">Ваша заявка на верификацию собственника квартиры №{{ $verification->apartment_number }} подтверждена!</p>
            <p>Теперь вы можете пользоваться всеми возможностями системы в качестве подтвержденного собственника.</p>
            @else
            <p class="status-rejected">К сожалению, ваша заявка на верификацию была отклонена.</p>
            @endif

            @if($result === 'rejected')
            <p>Вы можете подать повторную заявку</p>
            <p>При необходимости обратитесь к Председателю правления через функционал сайта.</p>
            @endif

            <p>С уважением,<br>Администрация ЖСПК Зенитчик-4</p>
        </div>

        <div class="footer">
            <p>Это письмо отправлено автоматически. Пожалуйста, не отвечайте на него.</p>
            <p>&copy; {{ date('Y') }} ЖСПК Зенитчик-4. Все права защищены.</p>
        </div>
    </div>
</body>

</html>