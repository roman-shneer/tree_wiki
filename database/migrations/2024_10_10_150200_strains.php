<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
         Schema::create('strains', function (Blueprint $table) {
            $table->id();
            $table->string('name',100);
            $table->text('description')->default('');
            $table->string('image', 100, '')->default('');
            $table->string('name_alter',100)->default('');
            $table->float('potencyMin')->default(0);
            $table->float('potencyMax')->default(0);
            $table->integer('cultivation')->default(0);
            $table->datetime('updated')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('strains');
    }
};
