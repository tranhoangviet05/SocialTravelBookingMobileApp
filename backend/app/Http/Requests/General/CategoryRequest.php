<?php

namespace App\Http\Requests\General;

use Illuminate\Foundation\Http\FormRequest;

class CategoryRequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [
            'name'     => 'required|string|max:100',
            'slug'     => 'nullable|string|max:100|unique:categories,slug,' . $this->route('id'),
            'icon'     => 'nullable|string|max:50',
            'description' => 'nullable|string'
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Tên danh mục không được để trống.',
            'slug.unique'   => 'Slug danh mục đã tồn tại.',
        ];
    }
}
