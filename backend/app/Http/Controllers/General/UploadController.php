<?php

namespace App\Http\Controllers\General;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * Tải lên một hoặc nhiều tệp tin
     */
    public function upload(Request $request)
    {
        $request->validate([
            'files' => 'required|array',
            'files.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120', // Tối đa 5MB/ảnh
            'folder' => 'nullable|string'
        ]);

        $uploadedUrls = [];
        $folder = $request->input('folder', 'uploads');

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                // Tạo tên file ngẫu nhiên để tránh trùng
                $filename = Str::random(20) . '.' . $file->getClientOriginalExtension();
                
                // Lưu vào directory public
                $path = $file->storeAs('public/' . $folder, $filename);
                
                // Trả về URL có thể truy cập được
                $url = asset(Storage::url($path));
                $uploadedUrls[] = $url;
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Tải lên thành công ' . count($uploadedUrls) . ' tệp tin.',
            'urls' => $uploadedUrls
        ]);
    }
}
