@component('mail::message')
# Новый запрос на верификацию

Пользователь {{ $request->user->email }} подал запрос на подтверждение статуса собственника.

**Данные пользователя:**
{{ $request->last_name }} {{ $request->first_name }} {{ $request->patronymic }}

Дата рождения: {{ $request->birth_date->format('d.m.Y') }}

Телефон: {{ $request->phone }}

**Квартира:** №{{ $request->apartment_number }}

@endcomponent