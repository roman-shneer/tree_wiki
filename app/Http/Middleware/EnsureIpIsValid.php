<?php

namespace App\Http\Middleware;

use Inertia\Middleware;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureIpIsValid
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {

        if (env('APP_ENV') != 'testing' && env('ALLOWED_REMOTE_ADDR') != $request->ip()) {
            return redirect('/404');
        }


        return $next($request);
    }

    static function check()
    {
        return (env('APP_ENV') != 'testing' && env('ALLOWED_REMOTE_ADDR') != ($_SERVER['REMOTE_ADDR'] ?? '')) ? false : true;
    }
}
