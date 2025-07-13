<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appeals;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\AppealsMail;
use App\Mail\AppealResponseMail;

class AppealsController extends Controller
{

    public function index(Request $request)
    {

        $query = Appeals::query();

        // Фильтрация по статусу
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Сортировка
        $sort = $request->get('sort', 'created_at');
        $order = $request->get('order', 'desc');

        return $query->orderBy($sort, $order)
            ->paginate(10);
    }

    public function update(Request $request, $id)
    {
        $appeal = Appeals::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:new,resolved',
            'response' => 'nullable|string'
        ]);

        $updateData = $validated;

        // Автоматически ставим дату ответа
        if ($request->has('response')) {
            $updateData['response_at'] = now();
        }

        $appeal->update($updateData);

        // Отправка уведомления пользователю
        if (!empty($validated['response']) && $validated['status'] === 'resolved') {
            try {
                // Проверяем, что email валиден
                // if (filter_var($appeal->email, FILTER_VALIDATE_EMAIL)) {
                //     Mail::to($appeal->email)->send(
                //         new AppealResponseMail($appeal)
                //     );

                //     Log::info('Ответ на обращение отправлен', [
                //         'appeal_id' => $appeal->id,
                //         'email' => $appeal->email
                //     ]);
                // } else {
                //     Log::warning('Невалидный email для отправки ответа', [
                //         'appeal_id' => $appeal->id,
                //         'email' => $appeal->email
                //     ]);
                // }
                Mail::to('zenitchik-4@yandex.ru')->send(new AppealResponseMail($appeal));
            } catch (\Exception $e) {
                Log::error('Ошибка отправки email', [
                    'error' => $e->getMessage(),
                    'appeal_id' => $appeal->id,
                    'email' => $appeal->email
                ]);
            }
        }

        return response()->json([
            'message' => 'Ответ сохранен' . (isset($updateData['response_at']) ? ' и отправлен' : ''),
            'data' => $appeal
        ], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'message' => 'required|string',
        ]);

        $appeal = Appeals::create($validated);

        // Отправка email
        $recipientEmail = config('mail.contact_recipient');
        Mail::to($recipientEmail)->send(new AppealsMail($appeal));

        Log::info('Appeal received and sent to: ' . $recipientEmail, [
            'contact_id' => $appeal->id,
            'email' => $appeal->email
        ]);

        return response()->json([
            'message' => 'Contact request submitted successfully',
            'data' => $appeal
        ], 201);
    }

    public function destroy($id)
    {
        try {
            $appeal = Appeals::findOrFail($id);

            // Запись в лог перед удалением
            Log::info('Удаление обращения', [
                'appeal_id' => $appeal->id,
                'name' => $appeal->name,
                'email' => $appeal->email,
                'status' => $appeal->status
            ]);

            // Удаление обращения
            $appeal->delete();

            return response()->json([
                'message' => 'Обращение успешно удалено'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Ошибка удаления обращения', [
                'error' => $e->getMessage(),
                'appeal_id' => $id,
            ]);

            return response()->json([
                'error' => 'Server Error',
                'message' => 'Не удалось удалить обращение'
            ], 500);
        }
    }
}
