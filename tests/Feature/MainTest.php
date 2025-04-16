<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class MainTest extends TestCase
{
    /**
     * A basic feature test main.
     */
    public function test_main(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

   

    /**
     * A basic feature test about.
     */
    public function test_about(): void
    {
        $response = $this->get('/about');

        $response->assertStatus(200);
    }
}
