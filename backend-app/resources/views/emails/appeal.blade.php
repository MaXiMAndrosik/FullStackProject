<!DOCTYPE html>
<html lang="ru">

<head>
    <meta charset="UTF-8">
    <title>Новое обращение от пользователя</title>
    <style>
        body {
            font-family: Arial, sans-serif;
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
            padding: 15px;
            text-align: center;
        }

        .content {
            padding: 20px;
            background-color: #fff;
        }

        .footer {
            margin-top: 20px;
            padding: 10px;
            text-align: center;
            font-size: 12px;
            color: #6c757d;
        }

        .data-item {
            margin-bottom: 10px;
        }

        .data-label {
            font-weight: bold;
            color: #495057;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h2>Новое обращение на сайте {{ config('app.name') }}</h2>
        </div>

        <div class="content">
            <div class="data-item">
                <span class="data-label">Имя:</span> {{ $appeal->name }}
            </div>

            <div class="data-item">
                <span class="data-label">Email:</span> {{ $appeal->email }}
            </div>

            <div class="data-item">
                <span class="data-label">Телефон:</span> {{ $appeal->phone }}
            </div>

            <div class="data-item">
                <span class="data-label">Сообщение:</span>
                <p style="margin-top: 5px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                    {{ $appeal->message }}
                </p>
            </div>
        </div>

        <div class="footer">
            <p>Это письмо было отправлено автоматически.</p>
            <p>Дата получения: {{ $appeal->created_at->format('d.m.Y H:i') }}</p>
        </div>
    </div>
</body>

</html>