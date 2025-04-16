<?php
$keywords = env('meta_keywords');
if (isset($title)) {
    $keywords = $title . ", " . $keywords;
    $title = $title . " - " . config('app.name', 'Laravel');
} else {
    $title = config('app.name', 'Laravel');
}

$description = substr($description ?? env('VITE_APP_DESCRIPTION'), 0, 170);

?>
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>{{$title}}</title>
    <meta name='description' content='{{$description}}' id="meta-description" />
    <meta name="keywords" content='{{$keywords}}'>
    <meta name="google-site-verification" content="{{env('google_site_verification')}}" />
    <meta name="theme-color" content="#ffffff" />
    <link rel="canonical" href="{{Request::url()}}" />
    <!--  {{($_SERVER['REMOTE_ADDR'] ?? '')}} -->
    <link rel="icon" type="image/x-icon" href="/storage/images/logo.png">
    <!-- Fonts -->
    <link rel='preconnect' href='https://fonts.bunny.net'>
    <link href='https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap' rel='stylesheet' />
    <link rel='stylesheet' href='https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200' />
    <!-- Scripts -->
    @routes

    @viteReactRefresh

    @vite( [ 'resources/js/app.jsx',"resources/js/Pages/{$page['component']}.jsx", 'resources/css/style.css' ] )

    @inertiaHead

</head>

<body class='font-sans antialiased'>
    @inertia
</body>

</html>