<?php

namespace App\Services;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;
use App\Services\ApiService;
#use Image;
class ImagesService
{
    

    private function disc(){
        return Storage::disk('uploads');
    }

    
    public function createThumbFile($fileName){
       
      #  $contents = $disc->get($fileName);
       # $img = Image::read($contents);
      
       $path=public_path("storage/uploads/".$fileName);
       
       $img = Image::read($path);
       
        $prop=$img->height()/$img->width();
        
        $destinationPathThumbnail = public_path('storage/uploads/thumbs');
       
        $img->resize(200, 200*$prop, function ($constraint) {
          
            $constraint->aspectRatio();
            $constraint->upsize();
        });
        #$img->encode('jpg',100);
      
        $img->save($destinationPathThumbnail.'/'.$fileName);
        return $this->disc()->url("uploads/thumbs/".$fileName);
    }

    public function imageResize($fileName, $width, $height){
        $path=public_path($fileName);
        
        $img = Image::read($path);
       
        $prop=$img->height()/$img->width();
        $img->resize($width, $height*$prop, function ($constraint) {
          
            $constraint->aspectRatio();
            $constraint->upsize();
        });
        $img->save();
       
    }



    public function uploadRemoveImage($item)
    {
       
        $item['image'] = $item['image'] ?? '';
        //upload file
        if(!empty($item['imageFile'])){
            $ext=explode("/",explode(":",explode(";",$item['imageFile'])[0])[1])[1];
            $newPath = Str::upper(Str::random(16)).".{$ext}";
            $item['imageFile']=explode(",",$item['imageFile'])[1];
            
            $item['imageFile']=base64_decode($item['imageFile']);
           
            $this->disc()->put($newPath, $item['imageFile']);
            $item['image'] = Storage::url("uploads/".$newPath);
        }   
        //download file from external url
        if (substr($item['image'], 0, 7) == 'http://' || substr($item['image'], 0, 8) == 'https://') {
            $ext = explode(".", $item['image']);
            $ext = $ext[count($ext) - 1];
            if (!in_array($ext, ['jpg', 'jpeg', 'gif', 'png'])) {
                $ext = "jpeg";
            }
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $item['image']);
            curl_setopt($ch, CURLOPT_VERBOSE, 1);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_AUTOREFERER, false);
            curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);
            curl_setopt($ch, CURLOPT_HEADER, 0);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0); // <-- don't forget this
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0); // <-- and this
            $result = curl_exec($ch);
            if (curl_errno($ch)) {
                print_r(curl_error($ch));
            }

            curl_close($ch);

            
            $newPath = Str::upper(Str::random(16)).".{$ext}";
            $this->disc()->put($newPath, $result);

            #if ($this->disc()->put($newPath, $result)) {
                $item['image'] = Storage::url("uploads/".$newPath);
                $fileName=substr($item['image'],strrpos($item['image'],"/")+1);
                if(!$this->disc()->exists($fileName)){
                    dd("missing file ".$fileName);
                }
            #}
           
        }

        //delete file if path removed        
        if(empty($item['image']) && $item['id']>0){
            $dbItem=(new ApiService())->getItem($item['id']);            
            
           
            if(!empty($dbItem->image)){
                $item['image'] = '';
                $fileName=substr($dbItem->image,strrpos($dbItem->image,"/")+1);
                if($this->disc()->exists($fileName)){
                    $this->disc()->delete($fileName);    
                }
                
            }
            if(!empty($dbItem->image_thumb)){
                $item['image_thumb'] = '';
                $fileName=substr($dbItem->image_thumb,strrpos($dbItem->image,"/")+1);
                if($this->disc()->exists($fileName)){
                    $this->disc()->delete($fileName);    
                }
                
            }
        }
        return $item;
    }

    public function deleteImage($item)
    {
        $disc=$this->disc();
        $image=public_path($item->image);
      
        if($disc->exists($image)){
            $disc->delete($image);
        }
       
        $this->deleteThumb($item);
      
    }

    public function deleteThumb($item){
        if(!empty($item->image_thumb)){
            $disc=$this->disc();
            $imageThumb=public_path($item->image_thumb);
            if($disc->exists($imageThumb)){
                $disc->delete($imageThumb);
            }
        }
    }
}
