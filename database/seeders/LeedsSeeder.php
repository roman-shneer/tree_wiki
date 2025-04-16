<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
class LeedsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data=[];
        
        for($i=time();$i>strtotime("-30 days");$i-=3600*24){
            $c=rand(1,20);
            for($s=0;$s<$c;$s++){
                $data[]=['id'=>Str::upper(Str::random(16)), 'date'=>date('Y-m-d',$i)];                
            }            
        }        
       DB::table( 'leads' )->insert($data);
    }
}
