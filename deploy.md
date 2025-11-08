## 1. Настройка .env для продакшена на бекенде

**Создайте `.env` в папке бекенда:**

```env
APP_NAME=Zenitchik4-Home-Service
APP_ENV=production
APP_KEY=YOUR_APP_KEY
APP_DEBUG=false

# Если хотите провести посев данных в БД оставьте:
# APP_ENV=local

APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:8000,127.0.0.1

# При production
# APP_URL=https://YOUR_HOST_NAME
# FRONTEND_URL=https://YOUR_HOST_NAME
# SANCTUM_STATEFUL_DOMAINS=YOUR_HOST_NAME

MIX_APP_URL="${APP_URL}"
MIX_FRONTEND_URL="${FRONTEND_URL}"

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file
# APP_MAINTENANCE_STORE=database

PHP_CLI_SERVER_WORKERS=4

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=zenitchik4
DB_USERNAME=zenitchik4
DB_PASSWORD=YOUR_PASSWORD

# SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=localhost
SESSION_DRIVER=cookie
SESSION_SECURE_COOKIE=false
SESSION_SAME_SITE=lax
SESSION_REMEMBER_ME_DAYS=30

# При production
# SESSION_DOMAIN=.YOUR_HOST_NAME  # обратите внимание на точку в начале
# SESSION_SECURE_COOKIE=true  # важно для HTTPS

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

# CACHE_STORE=database
# CACHE_PREFIX=

MEMCACHED_HOST=127.0.0.1

CACHE_DRIVER=redis
REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=smtp.yandex.ru
MAIL_PORT=587
MAIL_USERNAME=zenitchik-4@yandex.ru
MAIL_PASSWORD=YOUR_PASSWORD
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=zenitchik-4@yandex.ru
MAIL_CONTACT_RECIPIENT=zenitchik4@mail.ru
MAIL_FROM_NAME="ЖСПК Зенитчик-4-app"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

# OpenWeatherMap
WEATHER_API_URL=https://api.openweathermap.org/data/2.5/weather
WEATHER_DEFAULT_CITY=Fanipol
WEATHER_UNITS=metric
WEATHER_LANG=ru
WEATHER_API_KEY=YOUR_API_KEY

# VITE_APP_NAME="${APP_NAME}"
```

## Дополнительные настройки для Sanctum:

### В `config/sanctum.php` проверьте:

```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS',
    'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1,'.env('APP_URL')
)),
```

### В `config/session.php`:

```php
'domain' => env('SESSION_DOMAIN', null),  // Должен совпадать с Sanctum
'secure' => env('SESSION_SECURE_COOKIE', true),  // true для HTTPS
```

После исправления настроек проверьте:

```bash
php artisan config:clear
php artisan config:cache
php artisan route:clear
php artisan migrate:fresh --seed
```

## Если фронтенд будет на отдельном поддомене:

Тогда настройки будут такие:

```env
APP_URL=https://api.YOUR_HOST_NAME
FRONTEND_URL=https://app.YOUR_HOST_NAME
SANCTUM_STATEFUL_DOMAINS=app.YOUR_HOST_NAME
SESSION_DOMAIN=.YOUR_HOST_NAME  # ← точка для всех поддоменов
```

## 2. Настройка .env для продакшена на фронтенде

**Создайте `.env.production` в папке фронтенда:**

```env
REACT_APP_VERSION=1.0.0-alpha

# ====================================
# Настройки данных организации
# ====================================
REACT_APP_ORGANIZATION_ADDRESS=222750, г. Фаниполь, ул. Комсомольская, 54
REACT_APP_ORGANIZATION_PHONE1=+375 (44) 494-41-92
REACT_APP_ORGANIZATION_PHONE2=
REACT_APP_ORGANIZATION_EMAIL1=zenitchik4@mail.ru
REACT_APP_ORGANIZATION_EMAIL2=zenitchik-4@yandex.ru
# {process.env.REACT_APP_ORGANIZATION_PHONE1}

# ====================================
# Настройки API OpenWeatherMap
# ====================================
# Базовый URL API
REACT_APP_WEATHER_API_URL=https://api.openweathermap.org/data/2.5/weather
# Город по умолчанию для погоды
REACT_APP_WEATHER_DEFAULT_CITY=Fanipol
# Единицы измерения: metric (Celsius), imperial (Fahrenheit)
REACT_APP_WEATHER_UNITS=metric
# Язык ответа API (ru, en и др.)
REACT_APP_WEATHER_LANG=ru
# Ключ API (получить на https://openweathermap.org/)
REACT_APP_WEATHER_API_KEY=YOUR_API_KEY

# ====================================
# Настройка для локального сервера
# ====================================
# REACT_APP_API_URL=http://localhost:8000/api
# REACT_APP_API_URL_TOKEN=http://localhost:8000

# ====================================
# Настройка для production
# ====================================
REACT_APP_API_URL=https://YOUR_HOST_NAME/api
REACT_APP_API_URL_TOKEN=https://YOUR_HOST_NAME

# ====================================
# API адрес для обратной связи
# ====================================
REACT_APP_APPEALS_ENDPOINT=/appeals

# ====================================
# API адрес для обьявлений
# ====================================
REACT_APP_ADVERTISEMENTS_ENDPOINT=/announcements

# Для правильных путей в роутинге
GENERATE_SOURCEMAP=false
INLINE_RUNTIME_CHUNK=false
```

## 2. Сборка фронтенда

```bash
# Перейдите в папку фронтенда
cd frontend

# Установите зависимости (если не делали)
npm install

# Соберите для продакшена
npm run build
```

**После успешной сборки** появится папка `build/` с файлами:

-   `build/index.html`
-   `build/static/js/`
-   `build/static/css/`
-   `build/static/media/`

## 3. Загрузка фронтенда в бекенд

### Вариант A: Через FTP/File Manager

1. Откройте папку `public/` на хостинге
2. **УДАЛИТЕ** статические файлы Laravel (но НЕ папки!):
    - Сохраните папки: `storage/`, `api/`, `index.php` (Laravel)
    - Удалите: `css/`, `js/`, `images/` (если есть)
3. Загрузите ВСЁ содержимое папки `build/` в `public/`

### Вариант B: Через команды (если есть SSH)

```bash
# Из папки фронтенда
cd build
# Загрузите все файлы в public/ на хостинге
```

## 4. Структура после загрузки:

```

public/
├── .htaccess # ← Сохраняем ваш существующий - важно для Laravel
├── index.php # ← Сохраняем Laravel - точка входа Laravel
├── favicon.ico # ← Берем из build/ (новый)
├── robots.txt # ← Берем из build/ (новый)
├── asset-manifest.json # ← Из build/
├── manifest.json # ← Из build/
├── logo192.png # ← Из build/
├── logo512.png # ← Из build/
├── static/ # ← Из build/ (целиком)
│ ├── js/
│ ├── css/
│ └── media/
├── images/ # ← Из build/ (целиком)
├── documents/ # ← Из build/ (целиком)
├── mocks/ # ← Из build/ (целиком)
└── api/ # ← Из build/ (целиком)
```

**Обязательные Laravel файлы:**

-   [ ] `.htaccess` (обновленный)
-   [ ] `index.php` (оригинальный Laravel)

```
.htaccess

apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Handle X-XRF-Token Header
    RewriteCond %{HTTP:x-xsrf-token} .
    RewriteRule .* - [E=HTTP_X_XSRF_TOKEN:%{HTTP:X-XSRF-Token}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Serve Existing Files Directly
    RewriteCond %{REQUEST_FILENAME} -f
    RewriteRule ^ - [L]

    # Handle API Routes - передаем в Laravel
    RewriteCond %{REQUEST_URI} ^/api/ [NC]
    RewriteRule ^ index.php [L]

    # Handle Storage Files - передаем в Laravel
    RewriteCond %{REQUEST_URI} ^/storage/ [NC]
    RewriteRule ^ index.php [L]

    # All Other Routes - отдаем React SPA
    RewriteRule ^ index.html [L]
</IfModule>
```

## 5. Настройка Laravel для SPA роутинга

**Обновите `routes/web.php`:**

```php
<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;

// API routes - оставляем как есть
Route::prefix('api')->group(function () {
    require __DIR__ . '/api.php';
});

// Serve storage files
Route::get('/storage/{path}', function ($path) {
    $path = storage_path('app/public/' . $path);

    if (!File::exists($path)) {
        abort(404);
    }

    return response()->file($path);
})->where('path', '.*');

// Serve React app for all other routes
Route::get('/{any?}', function () {
    $htmlPath = public_path('index.html');

    if (!File::exists($htmlPath)) {
        return response('Frontend not found. Please build React app.', 500);
    }

    return response()->file($htmlPath);
})->where('any', '^(?!api|storage).*$');
```
