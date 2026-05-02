<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PostMedia extends Model
{
    use HasUuids;

    public $timestamps = false;
    protected $guarded = [];
    protected $table = 'post_media';

    public function post()
    {
        return $this->belongsTo(Post::class);
    }
}
