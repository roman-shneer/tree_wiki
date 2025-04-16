<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Suggestions extends Model
{
    use HasFactory;
    protected $fillable = [
        'data',
    ];
    public $timestamps = false;
}
