<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class TurnstileService
{
    private $client;
    private $secretKey;

    public function __construct()
    {
        $this->client = new Client();
        $this->secretKey = env('TURNSTILE_SECRET_KEY');
    }

    public function verify(string $token, string $clientIP): bool
    {
        if (!$this->secretKey) {
            Log::warning('Turnstile secret key not configured');
            return false;
        }

        try {
            $response = $this->client->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
                'form_params' => [
                    'secret' => $this->secretKey,
                    'response' => $token,
                    'remoteip' => $clientIP,
                ],
                'timeout' => 10,
            ]);

            $result = json_decode($response->getBody()->getContents(), true);
            
            return isset($result['success']) && $result['success'] === true;

        } catch (\Exception $e) {
            Log::error("Turnstile verification error: {$e->getMessage()}");
            return false;
        }
    }
}
