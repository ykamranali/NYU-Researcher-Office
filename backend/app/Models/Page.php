<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    protected $guarded = ['id'];

    public function blocks()
    {
        return $this->hasMany(PageBlock::class)->orderBy('order');
    }
}
