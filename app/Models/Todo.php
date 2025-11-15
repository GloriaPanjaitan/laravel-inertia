<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Todo extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'cover',
        'is_finished',
    ];

    protected $casts = [
        'is_finished' => 'boolean',
    ];

    // relasi ke user
    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }
}
