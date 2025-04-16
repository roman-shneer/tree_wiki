<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Suggest;

class SuggestionsSeeder extends Seeder {
    /**
    * Run the database seeds.
    */

    public function run(): void {
        $suggest = Suggest::factory()->make();
       
        DB::table( 'suggestions' )->insert( [
            'id'=>1,
            'data'=> json_encode( $suggest->getAttributes() ),
            'updated'=>now()
        ] );
    }
}
