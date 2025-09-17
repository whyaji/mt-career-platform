<?php

namespace App\Helpers;

class AssetHelper
{
    private static $manifest = null;

    /**
     * Get versioned asset path
     *
     * @param string $asset
     * @return string
     */
    public static function asset($asset)
    {
        if (self::$manifest === null) {
            self::loadManifest();
        }

        // If manifest exists and has the asset, return versioned path
        if (self::$manifest && isset(self::$manifest[$asset])) {
            return url('assets/' . self::$manifest[$asset]);
        }

        // Fallback to original asset path
        return url('assets/' . $asset);
    }

    /**
     * Load asset manifest file
     */
    private static function loadManifest()
    {
        $manifestPath = __DIR__ . '/../../public/assets/manifest.json';

        if (file_exists($manifestPath)) {
            $content = file_get_contents($manifestPath);
            self::$manifest = json_decode($content, true);
        } else {
            self::$manifest = [];
        }
    }

    /**
     * Get CSS asset with version
     *
     * @return string
     */
    public static function css()
    {
        return self::asset('index.css');
    }

    /**
     * Get JS asset with version
     *
     * @return string
     */
    public static function js()
    {
        return self::asset('index.js');
    }
}
