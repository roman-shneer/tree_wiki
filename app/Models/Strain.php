<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Strain extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'description',
        'image',
        'name_alter',
        'potencyMin',
        'potencyMax',
        'cultivation',
        'updated'
    ];
    public $timestamps = false;
}
