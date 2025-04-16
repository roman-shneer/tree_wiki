<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Database\Seeders\StrainsSeeder;
use Database\Seeders\StrainCategoriesSeeder;
use Database\Seeders\CategoriesSeeder;
use Database\Seeders\SuggestionsSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;

use App\Models\Strain;
use App\Models\Suggest;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
#use App\Services\ApiService;

class ApiTest extends TestCase {
    use DatabaseTransactions;

    private function run_seeds() {
        $this->seed( CategoriesSeeder::class );
        $this->seed( StrainsSeeder::class );
        $this->seed( StrainCategoriesSeeder::class );
    }
    /**
    * A basic feature test init.
    */

    public function test_init(): void {
        $this->run_seeds();
        $response = $this->post( '/api/init' );
        $json = json_decode( $response->getContent() );
        $response->assertStatus( 200 );

        $this->assertTrue( $json->list[ 0 ]->id == 1 && count( $json->categories )>1 );

    }

    public function test_report(): void {
        $this->run_seeds();

        $response = $this->get( '/api/report/1', [ 'id'=>1 ] );
        $json = json_decode( $response->getContent() );

        $response->assertStatus( 200 );
        $this->assertTrue( ( $json->report->item->id??0 ) == 1 );

    }

    public function test_edit(): void {
        $this->run_seeds();

        $response = $this->post( '/api/edit', [ 'id'=>1 ] );
        $response->assertStatus( 200 );
        $json = json_decode( $response->getContent() );

        $this->assertTrue( $json->item->id == 1 );
    }

    public function test_save(): void {

        #$this->run_seeds();
        $item = Strain::factory()->make( [
            'id'=>-1,
            'image'=>'https://plus.unsplash.com/premium_photo-1668487827156-7aa259d7ffa3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dGVzdGluZ3xlbnwwfHwwfHx8MA%3D%3D',
            'cats'=>[ 1 ]
        ] )->getAttributes();

        #$item[ 'cats' ] = [ 1 ];

        $item[ 'name' ] .= ' Test';
        #
        $params = [
            'item'=>$item,
            'parents'=>[]
        ];
        $user = User::factory()->create();
        $response = $this->actingAs( $user )->post( '/api/save', $params );
        $response->assertStatus( 200 );

        $json = json_decode( $response->getContent() );
        $listItem = $json->list[ 0 ];
        $fileName = substr( $listItem->image, strrpos( $listItem->image, '/' )+1 );

        $this->assertTrue( strstr( $listItem->name, 'Test' ) != false && Storage::disk( 'uploads' )->exists( $fileName ) );
        Storage::disk( 'uploads' )->delete( $fileName );

    }

    public function test_delete(): void {
        $this->run_seeds();

        $user = User::factory()->create();

        $response = $this->actingAs( $user )->post( '/api/delete', [ 'id'=>1 ] );

        $response->assertStatus( 200 );
        $json = json_decode( $response->getContent() );
        $this->assertTrue( count( $json->list ) == 0 );

    }

    public function test_match():void {
        $this->run_seeds();
        $response = $this->post( '/api/match', [ 'term'=>'gold' ] );
        $response->assertStatus( 200 );
        $json = json_decode( $response->getContent() );

        $this->assertTrue( stripos( $json->list[ 0 ]->name, 'gold' ) !== false );

    }

    public function test_suggest():void {

        $suggest = Suggest::factory()->make();

        $response = $this->post( '/api/suggest', $suggest->getAttributes    () );
        $response->assertStatus( 200 );

        $json = json_decode( $response->getContent() );
        $this->assertTrue( isset( $json->message ) );

    }

    public function test_suggestions():void {
        $this->seed( SuggestionsSeeder::class );
        $user = User::factory()->create();

        $response = $this->actingAs( $user )->post( '/api/suggestions' );
        $response->assertStatus( 200 );

        $json = json_decode( $response->getContent() );

        $this->assertTrue( count( $json->list )>0 );
    }

    public function test_suggestions_update_approve():void {
        $this->seed( SuggestionsSeeder::class );
        $user = User::factory()->create();

        $response = $this->actingAs( $user )->post( '/api/suggestions/update', [ 'id'=>1, 'com'=>'approve' ] );
        $response->assertStatus( 200 );

        $json = json_decode( $response->getContent() );

        $response = $this->post( '/api/init' );
        $jsonItems = json_decode( $response->getContent() );
        $this->assertTrue( count( $json->list ) == 0 && count( $jsonItems->list ) > 0 );
        //$response->assertStatus( 200 );

    }

    public function test_suggestions_update_delete():void {
        $this->seed( SuggestionsSeeder::class );
        $user = User::factory()->create();

        $response = $this->actingAs( $user )->post( '/api/suggestions/update', [ 'id'=>1, 'com'=>'delete' ] );
        $response->assertStatus( 200 );

        $json = json_decode( $response->getContent() );
        $this->assertTrue( count( $json->list ) == 0 );
    }

    public function test_dashboard() {
        $user = User::factory()->create();
        $response = $this->actingAs( $user )->get( '/dashboard' );
        $response->assertStatus( 200 );
    }

    public function test_sitemap(){
        $this->run_seeds();
        $response = $this->get( '/sitemap.xml' );
        
        $response->assertStatus( 200 );
        $xml_string =  $response->getContent();
        $xml = simplexml_load_string($xml_string);

        $json = json_encode($xml);

        $array = json_decode($json,TRUE);
        foreach($array['url'] as $item){
         $response = $this->get($item['loc']);   
         $response->assertStatus( 200 );
        }
    }

}
