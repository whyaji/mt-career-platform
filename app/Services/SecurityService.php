<?php

namespace App\Services;

class SecurityService
{
    private $suspiciousPatterns = [
        '/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i',
        '/javascript:/i',
        '/on\w+\s*=/i',
        '/data:text\/html/i',
        '/vbscript:/i',
        '/<iframe/i',
        '/<object/i',
        '/<embed/i',
        '/<form[^>]*>/i',
        '/\beval\s*\(/i',
        '/\bdocument\s*\.\s*(?:write|writeln|createElement|getElementById)/i',
        '/\bwindow\s*\.\s*(?:location|open|eval)/i',
        '/\balert\s*\(/i',
        '/\bconfirm\s*\(/i',
        '/\bprompt\s*\(/i',
        '/\bconsole\s*\.\s*(?:log|error|warn)/i',
        '/\bsetTimeout\s*\(/i',
        '/\bsetInterval\s*\(/i',
        '/\bnew\s+Function\s*\(/i',
        '/\bFunction\s*\(/i',
        '/\b(?:select|insert|update|delete|drop|create|alter|exec|execute|union)\s+(?:from|into|table|database)/i',
        '/\\\x[0-9a-f]{2}/i',
        '/\\\u[0-9a-f]{4}/i',
        '/&#x?[0-9a-f]+;/i',
        // More specific dangerous patterns
        '/<script[^>]*>.*?<\/script>/is',
        '/style\s*=\s*["\'][^"\']*expression\s*\(/i',
        '/href\s*=\s*["\']javascript:/i',
        '/src\s*=\s*["\']javascript:/i',
    ];

    public function containsSuspiciousPatterns(string $input): bool
    {
        foreach ($this->suspiciousPatterns as $pattern) {
            if (preg_match($pattern, $input)) {
                return true;
            }
        }
        return false;
    }

    public function sanitizeText(string $input): string
    {
        // Remove null bytes
        $input = str_replace(chr(0), '', $input);

        // Remove control characters except newlines and tabs
        $input = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $input);

        // Normalize whitespace
        $input = preg_replace('/\s+/', ' ', $input);

        // Trim whitespace
        $input = trim($input);

        // Basic HTML entity encoding for safety
        $input = htmlspecialchars($input, ENT_QUOTES | ENT_HTML5, 'UTF-8');

        return $input;
    }
}
