<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Carbon\Carbon;

class UpdateTariffRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'rate' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date'
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $startDate = $this->input('start_date');
            $endDate = $this->input('end_date');

            // Проверка реалистичности дат
            if ($startDate && Carbon::parse($startDate)->gt(Carbon::today()->addYears(10))) {
                $validator->errors()->add(
                    'start_date',
                    'Дата начала не может быть более чем на 10 лет в будущем'
                );
            }

            if ($endDate && Carbon::parse($endDate)->gt(Carbon::today()->addYears(10))) {
                $validator->errors()->add(
                    'end_date',
                    'Дата окончания не может быть более чем на 10 лет в будущем'
                );
            }
        });
    }
}
