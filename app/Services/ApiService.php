<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;
use App\Services\ImagesService;
use App\Models\Strain;
use App\Models\Suggestions;
use App\Models\Parents;
use App\Models\StrainCategories;
use PhpParser\Node\Expr\Cast\Object_;

class ApiService
{

    private $parentsRecords = null;
    private $sitemapKey = "sitemap";
    private $foundIds = null;

    public function getSitemap()
    {

        $cache = Cache::get($this->sitemapKey);
        if ($cache != null) {
            return $cache;
        }

        $list = $this->getAllWithChildrens();
        $maxTime = 0;
        foreach ($list as $item) {
            $maxTime = max($maxTime, strtotime($item->updated));
            $items[] = '<url>'
                . "<loc>" . route('item', ['name' => $this->encodeURL($item->name)]) . "</loc>"
                . '<changefreq>daily</changefreq>'
                . '<lastmod>' . date('c', strtotime($item->updated)) . '</lastmod>'
                . '<priority>0.8</priority>'
                . '</url>';
        }

        $content = '<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            <url>
                <loc>' . route('main') . '</loc>
                <lastmod>' . date('c', $maxTime) . '</lastmod>
                <changefreq>daily</changefreq>
                <priority>0.9</priority>
            </url>
            <url>
                <loc>' . route('about') . '</loc>
                <lastmod>' . date('c', $maxTime) . '</lastmod>
                <changefreq>daily</changefreq>
                <priority>0.9</priority>
            </url>
            ' . implode('', $items) . '
        </urlset>';
        Cache::set($this->sitemapKey, $content, 3600 * 24);
        return $content;
    }

    public function getAllWithChildrens()
    {

        $list = DB::table("strains as s")
            ->leftJoin('parents as p', 'p.mId', '=', 's.id')
            ->leftJoin('strain_categories as sc', 'sc.mId', '=', 's.id')
            ->groupBy('s.id', 's.name', 's.name_alter', 's.image', 's.image_thumb', 's.updated')
            ->select('s.id', 's.name', 's.name_alter', 's.image', 's.image_thumb', 's.updated')
            ->selectRaw("group_concat(sc.cId) as cats")
            ->selectRaw("group_concat(p.parentId) as parents")
            ->orderBy('name', 'asc')
            ->get();
        $list = $list->toArray();


        array_walk($list, function ($s) {
            $s->parents = !is_null($s->parents) ? explode(",", $s->parents) : [];
            $s->url = route('item', ['name' => $this->encodeURL($s->name)]);
        });


        return $list;
    }

    public function getItemMatch(string $term)
    {
        return Strain::where('name', 'LIKE', "{$term}%")
            ->orWhere('name_alter', 'LIKE', "{$term}%")
            ->take(10)->get();
    }

    public function decodeURL($url)
    {
        return str_replace("|", "/", $url);
    }

    public function encodeURL($url)
    {
        return str_replace("/", "%7C", $url);
    }

    public function getByName(string $name)
    {
        return (object)Strain::where('name', '=', $name)->first(['id', 'name', 'description'])->getAttributes();
    }

    public function getItem($id)
    {
        $item = Strain::find($id);
        $cats = StrainCategories::where('mId', $id)->select('cId')->get()->toArray();
        $item->cats = is_null($cats) ? [] : array_map(fn($s) => $s['cId'], $cats);
        $item->url = route('item', ['name' => $this->encodeURL($item->name)]);
        return $item;
    }

    public function getCategories()
    {
        return DB::table('categories')->get();
    }

    public function getParents($id)
    {

        $res = DB::table('parents as p')
            ->leftJoin('strains as s', 's.id', 'p.parentId')
            ->where('mId', $id)->select('s.id', 's.name')
            ->get()
            ->toArray();

        return $res;
    }

    public function getParentsTree2($id)
    {
        $this->loadParents();
        $this->foundIds = [];
        return $this->findParents($id);
    }


    private function findChildParents($id)
    {
        $parents = array_map(fn($s) => ['id' => $s['parentId']], array_filter($this->parentsRecords, fn($s) => $s['mId'] == $id));
        sort($parents);
        return $parents;
    }


    private function findParents($id)
    {
        if (isset($this->foundIds[$id])) {
            return [];
        }
        $records = array_map(fn($s) => ['id' => $s['parentId'], 'c' => []], array_filter($this->parentsRecords, fn($s) => $s['mId'] == $id && !isset($this->foundIds[$s['mId']])));
        $children = [];
        foreach ($records as $r) {
            $children[$r['id']] = $r;
        }
        if (!empty($children)) {
            foreach ($children as $k => $c) {
                $children[$k]['c'] = $this->findParents($c['id']);
                $this->foundIds[$c['id']] = 0;
            }
        }
        return $children;
    }


    private function findChild($id)
    {
        if (isset($this->foundIds[$id])) {
            return [];
        }
        $records = array_map(fn($s) => ['id' => $s['mId'], 'c' => []], array_filter($this->parentsRecords, fn($s) => $s['parentId'] == $id && !isset($this->foundIds[$s['mId']])));
        $children = [];
        foreach ($records as $r) {
            $children[$r['id']] = $r;
        }
        if (!empty($children)) {
            foreach ($children as $k => $c) {

                $children[$k]['c'] = $this->findChild($c['id']);
                $children[$k]['parents'] = $this->findChildParents($c['id']);
                $this->foundIds[$c['id']] = 0;
            }
        }
        return $children;
    }


    private function loadParents()
    {
        if ($this->parentsRecords != null) {
            return $this->parentsRecords;
        }
        $this->parentsRecords = Parents::all()->toArray();

        return $this->parentsRecords;
    }

    public function getChildrenTree2($id)
    {
        $this->loadParents();
        return $this->findChild($id);
    }

    private function convertObjectsToArray(&$arrayObjects)
    {
        for ($i = 0; $i < count($arrayObjects); $i++) {
            $arrayObjects[$i] = (array) $arrayObjects[$i];
        }
    }

    private function getParentKey($item, $parents)
    {
        $parentKey = null;
        foreach ($parents as $key => $parent) {
            if ($parent['name'] == $item['name']) {
                $parentKey = $key;
            }
        }
        return $parentKey;
    }

    private function insertNewParents($parents)
    {
        $newParents = array_filter($parents, fn($s) => $s['id'] < 0);

        foreach ($newParents as $parent) {
            $parentKey = $this->getParentKey($parent, $parents);
            $strain = Strain::create([
                'name' => $parent['name'],
            ]);
            $parents[$parentKey]['id'] = $strain->id;
        }

        return $parents;
    }

    private function connectParents($item, $parentIds)
    {
        foreach ($parentIds as $p) {
            Parents::create([
                'mId' => $item['id'],
                'parentId' => $p,
            ]);
        }
    }

    public function save($item, $parents)
    {

        $parents = $this->insertNewParents($parents);

        $saveData = [
            'name' => $item['name'],
            'name_alter' => $item['name_alter'] ?? '',
            'description' => $item['description'] ?? '',
            'potencyMin' => $item['potencyMin'] ?? 0,
            'potencyMax' => $item['potencyMax'] ?? 0,
            'cultivation' => $item['cultivation'] ?? 0,

        ];

        if ($item['id'] > 0) {
            $strain = Strain::find($item['id']);
            $item = (new ImagesService())->uploadRemoveImage($item);
            $strain->name = $saveData['name'];
            $strain->name_alter = $saveData['name_alter'];
            $strain->description = $saveData['description'];
            $strain->potencyMin = $saveData['potencyMin'];
            $strain->potencyMax = $saveData['potencyMax'];
            $strain->cultivation = $saveData['cultivation'];
            $strain->image = $item['image'] ?? '';
            $strain->image_thumb = $item['image_thumb'] ?? '';
            $strain->save();
        } else {

            $strain = Strain::create($saveData);
            $item['id'] = $strain->getOriginal('id');
            $item = (new ImagesService())->uploadRemoveImage($item);
            $strain->image = $item['image'] ?? '';
            $strain->image_thumb = $item['image_thumb'] ?? '';
            $strain->save();
        }

        $this->deleteParents($item['id']);
        $parentsIds = array_map(fn($p) => $p['id'], $parents);
        $this->connectParents($item, $parentsIds);
        StrainCategories::where('mId', $item['id'])->delete();
        if (count($item['cats']) > 0) {

            foreach ($item['cats'] as $cId) {
                StrainCategories::create([
                    'mId' => $item['id'],
                    'cId' => $cId,
                ]);
            }
        }
    }


    public function deleteParents($id)
    {
        return Parents::where('mId', $id)->delete();
    }


    public function deleteItem($id)
    {
        return Strain::find($id)->delete();
    }

    //Suggestions
    public function suggestionApprove($id)
    {
        $suggestion = Suggestions::find($id);
        $suggestion = $this->prepareSuggestion($suggestion);

        $item = $suggestion->item;
        $parents = $this->insertNewParents($suggestion->parents);

        if ($item['id'] < 0) {
            $strain = Strain::create([
                'name' => $item['name'],
                'description' => $item['note'],
                'potencyMin' => 0,
                'potencyMax' => 0,
                'cultivation' => 0
            ]);
            $item['id'] = $strain->id;
        }
        $this->deleteParents($item['id']);
        $parentsIds = array_map(fn($p) => $p['id'], $parents);
        $this->connectParents($item, $parentsIds);
    }

    public function countSuggested()
    {
        return Suggestions::count();
    }

    private function prepareSuggestion($suggestion)
    {
        $data = json_decode($suggestion->data, true);
        $suggestion->item = $data['item'];
        $suggestion->parents = $data['parents'];
        unset($suggestion->data);
        return $suggestion;
    }

    public function getSuggestions()
    {
        $suggestions = Suggestions::all();

        for ($i = 0; $i < count($suggestions); $i++) {
            $suggestions[$i] = $this->prepareSuggestion($suggestions[$i]);
        }
        return $suggestions;
    }

    public function suggestionDelete($id)
    {
        return Suggestions::find($id)->delete();
    }

    public function saveStatistic($request)
    {
        if (env('APP_ENV') == 'testing') {
            return;
        }
        if (substr($request->ip(), 0, 7) == '66.249.') {
            return;
        }
        DB::table("leads")->insertOrIgnore([
            'id' => $request->session()->id(),
            'ip' => $request->ip(),
            'date' => now(),
        ]);
    }

    public function getSessionStats()
    {
        $result = DB::table("leads")
            ->whereRaw("date >= DATE_SUB(NOW(), INTERVAL 31 DAY)")
            ->selectRaw("date(date) as date, count(DISTINCT id) as count")
            ->groupBy("date")
            ->orderBy("date", 'desc')
            ->get()
            ->toArray();
        return $result;
    }

    public function suggest($input)
    {
        //check suggestion
        $validatorItem = Validator::make($input['item'], [
            'name' => 'required|string|max:255',
            'id'  => 'required|integer',
            'cats'      => 'array',
            'note'   => 'required|string',

        ]);
        if ($validatorItem->fails()) {
            return $validatorItem->errors();
        }


        if ($input['item']['id'] > 0) {
            $oldParents = $this->getParents($input['item']['id']);
            $this->convertObjectsToArray($oldParents);

            if ($input['parents'] != $oldParents) {
                //save suggestions
                return Suggestions::create([
                    'data' => json_encode($input),
                    'updated' => now(),
                ]);
            }
        } else {
            //TODO checking if suggestions exists
            return Suggestions::create([
                'data' => json_encode($input),
                'updated' => now()
            ]);
        }
    }

    public function test()
    {

        die("test");
    }
}
