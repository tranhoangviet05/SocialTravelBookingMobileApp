<?php

namespace App\Http\Requests\General;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class LocationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name'        => 'required|string|max:255',
            'parent_id'   => 'nullable|integer|exists:locations,id',
            'image_url'   => 'nullable|string',
            'is_popular'  => 'nullable|boolean',
            'description' => 'nullable|string',
            'country_code' => 'nullable|string|max:5'
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Tên địa điểm không được để trống.',
            'parent_id.exists' => 'Địa điểm cha không tồn tại.',
        ];
    }
}
