<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PageBlock extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'content' => 'json',
    ];

    public function page()
    {
        return $this->belongsTo(Page::class);
    }
}
