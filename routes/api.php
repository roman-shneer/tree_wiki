<?php

use App\Http\Controllers\ApiController;
use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\EnsureIpIsValid;

Route::get('/', [HomeController::class, 'main'])->name('main');
Route::get('/strain/{name}', [HomeController::class, 'item'])->name('item');
Route::get('/sitemap.xml',[ApiController::class, 'sitemap'])->name('sitemap');
Route::get('/about', [HomeController::class, 'about'])->name('about');

//Route::post('/api/init', [ApiController::class, 'init'])->name('api.init');
Route::get('/api/report/{id}', [ApiController::class, 'report'])->name('api.report');
Route::post('/api/edit', [ApiController::class, 'edit'])->name('api.edit');
Route::post('/api/match', [ApiController::class, 'match'])->name('api.match');

Route::post('/api/suggest', [ApiController::class, 'suggest'])->name('api.suggest');

Route::middleware('auth')->group(function () {
    if(EnsureIpIsValid::check()){
    Route::get('/dashboard', [HomeController::class, 'dashboard'])->name('dashboard')->middleware(EnsureIpIsValid::class);
    Route::post('/api/images/thumb', [ApiController::class, 'adminImagesThumb'])->name('admin.images.thumb');
    Route::post('/api/images/thumb/delete', [ApiController::class, 'adminImagesThumbDelete'])->name('admin.images.thumb.delete');
    Route::post('/api/images/resize', [ApiController::class, 'adminImageResize'])->name('admin.images.resize');
        
    Route::get('/images', [HomeController::class, 'adminImages'])->name('admin.images');
    
    Route::post('/api/delete', [ApiController::class, 'delete'])->name('api.delete')->middleware(EnsureIpIsValid::class);    
    Route::post('/api/save', [ApiController::class, 'save'])->name('api.save');

    Route::post('/api/suggestions', [ApiController::class, 'suggestions'])->name('api.suggestions');
    Route::post('/api/suggestions/update', [ApiController::class, 'suggestionUpdate'])->name('api.suggestions.update')->middleware(EnsureIpIsValid::class);    
    }
});
if(EnsureIpIsValid::check()){
    Route::get('/api/test', [ApiController::class, 'test'])->name('api.test');
}
Route::get('/404', [HomeController::class, 'page404'])->name('page404');
Route::get('/{var}', [HomeController::class, 'whatever'])->name('whatever');