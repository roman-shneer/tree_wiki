<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Strain;

class StrainsSeeder extends Seeder {
    /**
    * Run the database seeds.
    */

    public function run(): void {

        $strain = Strain::factory()->make( [
            'id' => 1,
            'name' => 'My test strain',
            'description' => 'My test strain description.',
            'image'=>'',
            'name_alter'=>'',
            'potencyMin'=> 0.47,
            'potencyMax'=>0.84,
            'cultivation'=>0,
            'updated'=>now()
          
        ] );

        DB::table( 'strains' )->insert( $strain->getAttributes() );

    }
}
