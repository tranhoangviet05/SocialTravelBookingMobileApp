<?php
namespace App\Http\Controllers\Social;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\Request;

class TagController extends Controller
{
    /**
     * Gợi ý hashtag cho người dùng
     */
    public function suggestions(Request $request)
    {
        $query = $request->get('q');
        
        $tags = Tag::query()
            ->when($query, function($q) use ($query) {
                return $q->where('name', 'like', '%' . strtolower($query) . '%');
            })
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $tags
        ]);
    }
}
