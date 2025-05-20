<?php

namespace Database\Seeders;

use App\Models\Announcement;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class AnnouncementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        // Заполнение таблицы фабричными данными
        // \App\Models\Announcement::factory()->count(5)->create();

        // Или конкретными данными!!!!!
        // Очищаем таблицу (опционально)
        Announcement::truncate();

        // Создаем записи вручную
        $announcements = [
            [
                'title' => 'Очередное собрание членов ЖСПК',
                'message' => ['Уважаемые члены кооператива! Приглашаем на собрание.'],
                'contacts' => [
                    'phone' => '+375 (29) 123-45-67',
                    'email' => 'zenitchik4@example.com'
                ],
                'signature' => 'Председатель',
                'publish' => Carbon::parse('2024-05-15T18:30:00'),
                'date' => Carbon::parse('2024-05-15T18:30:00'),
                'location' => 'Конференц-зал ЖСПК (ул. Строителей, 15)',
                'necessity' => 'Обязательно для всех членов ЖСПК',
                'agenda' => ['Выборы председателя собрания', 'Утверждение повестки дня', 'Разное'],
                'documents' => [['name' => 'Проект сметы.pdf', 'url' => '/documents/smeta.pdf']],
                'expiresAt' => Carbon::parse('2025-06-15T18:30:00')
            ],
            [
                'title' => 'Письменное общее собрание членов ЖСПК',
                'message' => [
                    '16 апреля 2022 г. членам организации застройщиков в почтовые ящики будут доставлены бюллетени для голосования.',
                    'Продлится письменное собрание до 22 апреля 2022 г. включительно.',
                    'Место возврата заполненных бюллетеней: г.Фаниполь, ул.Комсомольская, д.54, ящик для бюллетеней находится у входа в 3 подъезд либо почтой по адресу: 222750, Минская обл., Дзержинский р-н, г.Фаниполь, ул.Комсомольская, д.54, кв. 25.'
                ],
                'contacts' => [
                    'phone' => '+375 (29) 123-45-67',
                    'email' => 'contact@zenitchik4.example.com'
                ],
                'signature' => 'Председатель',
                'publish' => Carbon::parse('2022-04-12T10:00:00'),
                'date' => Carbon::parse('2022-04-22T21:00:00'),
                'location' => 'г.Фаниполь, ул. Комсомольская, д. 54',
                'necessity' => 'Отчетное собрание',
                'agenda' => [
                    'Утверждение плановой сметы доходов-расходов на 2022год.'
                ],
                'documents' => null,
                'expiresAt' => Carbon::parse('2025-06-15T18:30:00')
            ],
            [
                'title' => 'Уважаемые жильцы!',
                'message' => [
                    'С мая 2022 года в нашем доме вводится в эксплуатацию Автоматизированная Система Контроля и Учета Электроэнергии (АСКУЭ).',
                    'Теперь Вам нет необходимости подавать ежемесячно данные показаний индивидуальных счётчиков электрической энергии.',
                    'Начисление платы за использованную электроэнергию будет осуществляется по данным системы АСКУЭ по состоянию на 1 число следующего за отчетным месяцем.'
                ],
                'contacts' => [
                    'phone' => '',
                    'email' => ''
                ],
                'signature' => 'С уважением, главный бухгалтер.',
                'publish' => Carbon::parse('2024-05-12T18:30:00'),
                'date' => null,
                'location' => '',
                'necessity' => '',
                'agenda' => [''],
                'documents' => null,
                'expiresAt' => Carbon::parse('2025-12-24T18:30:00')
            ]
        ];

        foreach ($announcements as $announcement) {
            // Нормализация данных перед сохранением
            $data['documents'] = $data['documents'] ?? [];
            $data['agenda'] = $data['agenda'] ?? [];

            Announcement::create($announcement);
        }
    }
}
