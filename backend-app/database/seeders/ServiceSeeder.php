<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run()
    {
        // Основные услуги ЖКХ
        $mainServices = [
            [
                'code' => 'capital_repair',
                'name' => 'Капитальный ремонт',
                'description' => 'Основная жилищно-коммунальная услуга по восстановлению основных физико-технических, эстетических и потребительских качеств жилого дома, иного капитального строения (здания, сооружения), их конструктивных элементов, инженерных систем, утраченных в процессе эксплуатации',
                'type' => 'main',
                'calculation_type' => 'area',
                'is_active' => false,
            ],
            [
                'code' => 'current_repair',
                'name' => 'Текущий ремонт',
                'description' => 'Основная жилищно-коммунальная услуга по предотвращению интенсивного износа, восстановлению исправности и устранению повреждений конструктивных элементов, инженерных систем жилого дома',
                'type' => 'main',
                'calculation_type' => 'area',
                'is_active' => false,
            ],
            [
                'code' => 'technical_maintenance',
                'name' => 'Техническое обслуживание',
                'description' => 'Основная жилищно-коммунальная услуга, включающая работы по поддержанию в исправном и работоспособном состоянии конструктивных элементов, инженерных систем, за исключением лифтов, обеспечению установленных параметров и режимов работы инженерных систем, за исключением лифтов, подготовке жилых домов к условиям весенне-летнего и осенне-зимнего периодов года',
                'type' => 'main',
                'calculation_type' => 'area',
                'is_active' => true,
            ],
            [
                'code' => 'technical_elevator',
                'name' => 'Техническое обслуживание лифтов',
                'description' => 'Основная жилищно-коммунальная услуга, включающая работы по поддержанию работоспособности лифта при его эксплуатации',
                'type' => 'main',
                'calculation_type' => 'area',
                'is_active' => false,
            ],
            [
                'code' => 'sanitary_maintenance',
                'name' => 'Санитарное содержание вспомогательных помещений жилого дома',
                'description' => 'Основная жилищно-коммунальная услуга по санитарной обработке (уборке) вспомогательных помещений жилого дома, их конструктивных элементов, инженерных систем, в том числе мойка или иная обработка поверхностей вспомогательных помещений, включая дезинфекцию, дезинсекцию, дератизацию, для приведения этих помещений в соответствие с установленными санитарными нормами и правилами, гигиеническими нормативами',
                'type' => 'main',
                'calculation_type' => 'fixed',
                'is_active' => true,
            ],
        ];

        // Коммунальные услуги
        $publicUtilities = [
            [
                'code' => 'cold_water',
                'name' => 'Водоснабжение',
                'description' => 'Бесперебойная подача воды.',
                'type' => 'utility',
                'calculation_type' => 'meter',
                'is_active' => true,
            ],
            [
                'code' => 'water_disposal',
                'name' => 'Водоотведение',
                'description' => 'Отведение сточных вод из жилых помещений',
                'type' => 'utility',
                'calculation_type' => 'meter',
                'is_active' => true,
            ],
            [
                'code' => 'hot_water',
                'name' => 'Горячее водоснабжение (подогрев воды)',
                'description' => 'Обеспечение подачи горячей воды в жилые помещения круглосуточно в соответствии с установленными нормами качества и температуры',
                'type' => 'utility',
                'calculation_type' => 'meter',
                'is_active' => true,
            ],
            [
                'code' => 'heating',
                'name' => 'Теплоснабжение (отопление)',
                'description' => 'Обеспечение теплоснабжения жилых помещений в отопительный сезон',
                'type' => 'utility',
                'calculation_type' => 'meter',
                'is_active' => true,
            ],
            [
                'code' => 'electricity',
                'name' => 'Электроснабжение',
                'description' => 'Обеспечение бесперебойной подачи электроэнергии в соответствии с установленными нормами и стандартами',
                'type' => 'utility',
                'calculation_type' => 'meter',
                'is_active' => true,
            ],
            [
                'code' => 'gas',
                'name' => 'Газоснабжение',
                'description' => 'Подача природного газа для бытовых нужд в соответствии с установленными нормами безопасности',
                'type' => 'utility',
                'calculation_type' => 'meter',
                'is_active' => false,
            ],
            [
                'code' => 'waste',
                'name' => 'Обращение с ТКО',
                'description' => 'Вывоз и утилизация твердых коммунальных отходов в соответствии с экологическими нормами',
                'type' => 'utility',
                'calculation_type' => 'meter',
                'is_active' => false,
            ],
        ];

        // Дополнительные услуги
        $additionalUtilities = [
            [
                'code' => 'intercom_maintenance',
                'name' => 'Техническое обслуживание домофонных систем',
                'description' => 'Комплекс работ по обеспечению бесперебойной работы домофонного оборудования, включая диагностику, ремонт и замену компонентов системы контроля доступа.',
                'type' => 'additional',
                'calculation_type' => 'fixed',
                'is_active' => true,
            ],
            // Можно добавить другие дополнительные услуги
        ];

        // Объединяем все услуги
        $allServices = array_merge($mainServices, $publicUtilities, $additionalUtilities);

        foreach ($allServices as $service) {
            // Сохраняем основную информацию об услуге
            $newService = Service::create([
                'code' => $service['code'],
                'name' => $service['name'],
                'type' => $service['type'],
                'description' => $service['description'],
                'calculation_type' => $service['calculation_type'],
                'is_active' => $service['is_active'],
            ]);

            $newService->save();
        }

        $mainCount = count($mainServices);
        $utilityCount = count($publicUtilities);
        $additionalCount = count($additionalUtilities);
        $totalCount = $mainCount + $utilityCount;

        $this->command->info('✅ Услуги успешно созданы!');
        $this->command->info("  - Основные услуги ЖКХ: {$mainCount}");
        $this->command->info("  - Коммунальные услуги: {$utilityCount}");
        $this->command->info("  - Дополнительные услуги: {$additionalCount}");
        $this->command->info("  - Всего услуг: {$totalCount}");
    }
}
