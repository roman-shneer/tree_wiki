<?php

namespace App\Http\Controllers;

use App\Services\ApiService;
use App\Services\ImagesService;
use Illuminate\Http\Request;
use App\Models\Strain;

class ApiController extends Controller
{


    public function adminImagesThumbDelete(ImagesService $ImagesService, ApiService $ApiService, Request $request)
    {
        $id = $request->get('id');
        $item = $ApiService->getItem($id);

        if (!empty($item->image_thumb)) {
            $ImagesService->deleteThumb($item);
            $strain = Strain::find($item->id);
            $strain->image_thumb = '';
            $strain->save();
        }
        return ['result' => true];
    }

    public function adminImagesThumb(ImagesService $ImagesService, ApiService $ApiService, Request $request)
    {
        $id = $request->get('id');

        //1.get strain
        $item = $ApiService->getItem($id);

        //2.create thumb
        $pathParts = explode("/", $item->image);
        $fileName = $pathParts[count($pathParts) - 1];
        $path = $ImagesService->createThumbFile($fileName);
        //3. update strain
        $strain = Strain::find($item->id);
        $strain->image_thumb = $path;
        $strain->save();

        return ['result' => true];
    }

    public function adminImageResize(ImagesService $ImagesService, ApiService $ApiService, Request $request)
    {
        $id = $request->get('id');
        $item = $ApiService->getItem($id);
        $ImagesService->imageResize($item->image, 400, 400);
        return ['item' => $item];
    }

    public function sitemap(ApiService $ApiService)
    {

        $sitemap = $ApiService->getSitemap();

        return response($sitemap)->header('Content-Type', 'text/xml');
    }

    public function suggestions(ApiService $ApiService)
    {
        return ['list' => $ApiService->getSuggestions()];
    }

    public function edit(ApiService $ApiService, Request $request)
    {
        $id = $request->input('id');
        return [
            'item' => $ApiService->getItem($id),
            'parents' => $ApiService->getParents($id),
        ];
    }

    public function suggest(ApiService $ApiService, Request $request)
    {
        $input = $request->input();
        $res = $ApiService->suggest($input);
        if (method_exists($res, 'getMessages')) {
            $error = $res->getMessages();
            return ['message' => implode("\n", $error['note'])];
        }

        return ['message' => 'Thank you, your suggestion will be checked and added to site soon.'];
    }

    public function save(ApiService $ApiService, Request $request)
    {

        $input = $request->input();

        $ApiService->save($input['item'], $input['parents']);

        return ['list' => $ApiService->getAllWithChildrens()];
    }

    public function delete(ImagesService $ImagesService, ApiService $ApiService, Request $request)
    {
        $id = $request->input('id');
        $item = $ApiService->getItem($id);
        $ImagesService->deleteImage($item);

        $ApiService->deleteParents($id);
        $ApiService->deleteItem($id);

        return ['list' => $ApiService->getAllWithChildrens()];
    }

    public function report($id, ApiService $ApiService)
    {

        return [
            'report' => [
                'item' => $ApiService->getItem($id),
                'children' => $ApiService->getChildrenTree2($id),
                'parents' => $ApiService->getParentsTree2($id),
            ],
        ];
    }


    public function match(ApiService $ApiService, Request $request)
    {
        $term = $request->input('term');

        return ['list' => $ApiService->getItemMatch($term)];
    }


    public function suggestionUpdate(ApiService $ApiService, Request $request)
    {
        $com = $request->input('com');
        $id = $request->input('id');

        if ($com == 'delete') {
            $status = $ApiService->suggestionDelete($id);
        } elseif ($com == 'approve') {
            $status = $ApiService->suggestionApprove($id);
            $ApiService->suggestionDelete($id);
        }
        return ['status' => $status, 'list' => $ApiService->getSuggestions()];
    }

    public function test(ApiService $ApiService)
    {
        $ApiService->test();
    }
}
