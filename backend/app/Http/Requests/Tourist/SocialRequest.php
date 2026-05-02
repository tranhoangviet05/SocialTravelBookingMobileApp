<?php

namespace App\Http\Requests\Tourist;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SocialRequest extends FormRequest
{
    /**
     * Xác thực đã được xử lý bởi middleware 'firebase.auth'.
     * Không cần kiểm tra lại ở đây.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Quy tắc xác thực cho hồ sơ mạng xã hội.
     */
    public function rules(): array
    {
        // Tìm UUID thực của user từ firebaseUid do middleware gán vào request
        $firebaseUid = $this->attributes->get('firebaseUid');
        $userId = $firebaseUid
            ? User::where('firebase_uid', $firebaseUid)->value('id')
            : null;

        return [
            'username' => [
                'required',
                'string',
                'min:3',
                'max:30',
                'regex:/^\S+$/',
                // Dùng Rule::unique để tránh lỗi UUID rỗng khi không dùng Auth::id()
                Rule::unique('social_profiles', 'username')->ignore($userId, 'user_id'),
            ],
            'bio'         => 'nullable|string|max:160',
            'avatarUrl'   => 'nullable|string|max:2048',
            'avatar_url'  => 'nullable|string|max:2048',
            'displayName' => 'nullable|string|max:50',
        ];
    }

    /**
     * Thông báo lỗi tùy chỉnh.
     */
    public function messages(): array
    {
        return [
            'username.required' => 'Vui lòng nhập tên người dùng.',
            'username.unique'   => 'Tên người dùng này đã tồn tại.',
            'username.regex'    => 'Tên người dùng không được chứa khoảng trắng.',
            'bio.max'           => 'Giới thiệu không được vượt quá 160 ký tự.',
        ];
    }
}