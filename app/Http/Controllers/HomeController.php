<?php

namespace App\Http\Controllers;

use App\Services\ApiService;
use App\Services\ImagesService;
use Illuminate\Http\Request;
use Inertia\Inertia;

#use SEOMeta;
class HomeController extends Controller
{
   
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
    }

    private function getDefaultVariables($request)
    {
        return [
            'token' => $request->session()->token(),
            'user' => $request->user(),
            'app_name' => env('APP_NAME'),
            'app_description' => env('VITE_APP_DESCRIPTION'),
            'meta_keywords' => env('META_KEYWORDS')
        ];
    }

    public function main(ApiService $ApiService, Request $request)
    {
        $ApiService->saveStatistic($request);
        $vars = $this->getDefaultVariables($request);
        $vars['suggestedCount'] = $ApiService->countSuggested();
        $vars['list'] = $ApiService->getAllWithChildrens();
        $vars['categories'] = $ApiService->getCategories();
        return Inertia::render('Main', $vars);
    }
    
    public function item($name, ApiService $ApiService, Request $request)
    {        
        $ApiService->saveStatistic($request);
        $name=$ApiService->decodeURL($name);
        $item=$ApiService->getByName($name);
        if($item == null){
            return redirect("404");            
        }
        $vars = $this->getDefaultVariables($request);
        $vars['suggestedCount'] = $ApiService->countSuggested();
        $vars['list'] = $ApiService->getAllWithChildrens();
        $vars['categories'] = $ApiService->getCategories();
        $vars['reportId'] = $item->id;
        $vars['report'] = [
            'item' => $ApiService->getItem($item->id),
            'children' => $ApiService->getChildrenTree2($item->id),
            'parents' => $ApiService->getParentsTree2($item->id),
        ];
        return Inertia::render('Main', $vars)->withViewData(['title' => $item->name, 'description' => $item->description]);
    }

    public function dashboard(ApiService $ApiService, Request $request)
    {
        if ($request->user() == null) {
            return redirect(route('login'));
        }
        $vars = $this->getDefaultVariables($request);
        $vars['stats'] = $ApiService->getSessionStats();
        return Inertia::render('Dashboard', $vars);

    }

    public function adminImages(ImagesService $ImagesService, ApiService $ApiService, Request $request)
    {
        if ($request->user() == null) {
            return redirect(route('login'));
        }

        $items=$ApiService->getAllWithChildrens();
        $items=array_filter($items,fn($s)=>!empty($s->image) || !empty($s->image_thumb));
        sort($items);

        $vars = $this->getDefaultVariables($request);
        $vars['items'] = $items;
        return Inertia::render('AdminImages', $vars);
    }

    public function about(Request $request)
    {
        $vars = $this->getDefaultVariables($request);
        $vars['about_text'] = env('ABOUT_US_TEXT');
        $vars['about_link'] = env('ABOUT_US_TELEGRAM_LINK');

        return Inertia::render('About', $vars);
    }

    public function page404(){                
        return abort(404);
    }

    public function whatever(){
        
        return redirect(route('page404'));
    }
}
