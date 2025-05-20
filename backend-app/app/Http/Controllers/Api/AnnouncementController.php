<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AnnouncementController extends Controller
{
    // Сохранение объявления
    public function store(Request $request)
    {
        Log::debug('AnnouncementController store started', ['Request' => $request->all()]);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|array',
            'message.*' => 'string',
            'contacts' => 'required|array',
            'contacts.phone' => 'nullable|string',
            'contacts.email' => 'nullable|email',
            'signature' => 'required|string|max:255',
            'publish' => 'required|date',
            'date' => 'nullable|date',
            'location' => 'nullable|string',
            'necessity' => 'nullable|string',
            'agenda' => 'nullable|array',
            'agenda.*' => 'string',
            'documents' => 'nullable|array',
            'documents.*.name' => 'required_with:documents|string',
            'documents.*.url' => 'required_with:documents|string',
            'expiresAt' => 'required|date'
        ]);

        // Преобразуем даты в правильный формат
        $validated['publish'] = Carbon::parse($validated['publish']);
        $validated['expiresAt'] = Carbon::parse($validated['expiresAt']);
        $validated['date'] = isset($validated['date']) ? Carbon::parse($validated['date']) : null;

        $announcement = Announcement::create($validated);

        Log::debug('AnnouncementController store created', ['Announcement' => $announcement]);

        return response()->json([
            'success' => true,
            'data' => $announcement,
            'message' => 'Объявление успешно создано'
        ], 201);
    }

    // Получение всех актуальных объявлений
    public function index()
    {
        // Удаляем просроченные
        Announcement::where('expiresAt', '<', now())->delete();

        // Получаем актуальные сортировка - более новые вверх
        $announcements = Announcement::orderBy('publish', 'desc')->get();

        Log::debug('AnnouncementController load announcements success');

        return response()->json($announcements);
    }

    /**
     * Удаление объявления по ID
     * 
     * @param int $id ID объявления
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {

            $announcement = Announcement::findOrFail($id);

            $announcement->delete();

            Log::debug('AnnouncementController destroy', ['Announcement' => $announcement]);

            return response()->json([
                'success' => true,
                'message' => 'Объявление успешно удалено'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Объявление не найдено'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при удалении объявления',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
