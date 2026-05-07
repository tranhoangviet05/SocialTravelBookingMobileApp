<?php

namespace App\Http\Requests\General;

use Illuminate\Foundation\Http\FormRequest;

class ServiceSearchRequest extends FormRequest
{
    /**
     * Xác định xem người dùng có quyền thực hiện yêu cầu này không.
     */
    public function authorize(): bool
    {
        return true; // Ai cũng có thể tìm kiếm
    }

    /**
     * Các quy tắc kiểm tra (Validation Rules)
     */
    public function rules(): array
    {
        return [
            'keyword'   => 'nullable|string|max:255',
            'location_id' => 'nullable|integer|exists:locations,id',
            'type'      => 'nullable|string', // hotel, homestay, tour, vehicle (có thể là chuỗi csv)
            'sort'      => 'nullable|string|in:newest,price_asc,price_desc,rating',
            'price_min' => 'nullable|numeric|min:0',
            'price_max' => 'nullable|numeric|min:0', // Bỏ gt:price_min vì price_min có thể null
            'limit'     => 'nullable|integer|min:1|max:50',
        ];
    }

    /**
     * Tùy chỉnh thông báo lỗi (Tùy chọn)
     */
    public function messages(): array
    {
        return [
            'price_max.gt' => 'Giá tối đa phải lớn hơn giá tối thiểu.',
            'location_id.exists' => 'Địa điểm bạn chọn không tồn tại.',
        ];
    }
}
