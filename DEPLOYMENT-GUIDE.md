# Deployment Guide - Asset Cache Busting

## Masalah yang Diselesaikan

Asset frontend (CSS/JS) tidak terupdate di browser meskipun file sudah diupdate di server. Hal ini disebabkan oleh:

1. **Browser Cache** - Browser menyimpan versi lama file CSS/JS
2. **Server Cache** - Web server atau CDN cache file static
3. **Tidak ada versioning** - File selalu memiliki nama yang sama

## Solusi yang Diimplementasikan

### 1. Hash-based Cache Busting

-   File CSS: `index-[hash].css`
-   File JS: `index-[hash].js`
-   Hash berubah setiap build, memaksa browser download versi terbaru

### 2. Asset Manifest System

-   File `manifest.json` menyimpan mapping nama file ke versi hash
-   Helper PHP otomatis load versi terbaru

### 3. Proper Cache Headers

-   Asset dengan hash: cache 1 tahun (aman karena hash berubah)
-   Asset tanpa hash: cache 1 hari
-   Manifest: cache 1 jam

## Cara Deployment

### Development

```bash
cd frontend
npm run dev
```

### Production Build

```bash
# Metode 1: Script otomatis
./build-production.bat

# Metode 2: Manual
cd frontend
npm run build:prod
cd ..
```

### Deployment ke Server

```bash
# Upload assets ke server
./deploy-assets.bat

# Atau manual:
# 1. Upload folder public/assets/ ke server
# 2. Upload file public/manifest.json ke server
# 3. Pastikan .htaccess sudah terupload
```

## File yang Berubah

### Frontend Configuration

-   `frontend/vite.config.ts` - Tambah hash pada output files
-   `frontend/package.json` - Tambah script build:prod
-   `frontend/generate-manifest.js` - Generate asset manifest

### Backend Changes

-   `app/Helpers/AssetHelper.php` - Helper untuk load asset berversioning
-   `resources/views/app.php` - Gunakan helper untuk load CSS/JS
-   `public/.htaccess` - Cache headers yang optimal

### Scripts

-   `build-production.bat` - Build untuk production
-   `deploy-assets.bat` - Deploy assets ke server

## Cara Kerja

1. **Build Process:**

    ```
    npm run build:prod → Vite build dengan hash → Generate manifest.json
    ```

2. **Runtime:**

    ```
    PHP load manifest.json → Helper return asset URL dengan hash → Browser load versi terbaru
    ```

3. **Cache Strategy:**
    ```
    File dengan hash: Cache 1 tahun
    File tanpa hash: Cache 1 hari
    Manifest: Cache 1 jam
    ```

## Troubleshooting

### Asset Tidak Terupdate

1. Pastikan `npm run build:prod` berhasil
2. Check file `public/manifest.json` sudah terupdate
3. Clear browser cache manual (Ctrl+F5)

### Error 404 pada Asset

1. Pastikan folder `public/assets/` ter-upload
2. Check file permission (755 untuk folder, 644 untuk file)
3. Pastikan .htaccess ter-upload

### Performance Issues

1. Enable Gzip compression di server
2. Set proper cache headers (.htaccess sudah include)
3. Gunakan CDN untuk static assets

## Monitoring

### Check Asset Loading

```bash
# Check manifest
curl https://domain.com/manifest.json

# Check CSS dengan hash
curl -I https://domain.com/assets/index-abc123.css

# Check response headers
curl -I https://domain.com/assets/index-abc123.css | grep -i cache
```

### Browser DevTools

1. Network tab - check response headers
2. Application tab - check cache storage
3. Lighthouse - performance audit

## Best Practices

1. **Selalu run build sebelum deploy**
2. **Upload manifest.json bersamaan dengan assets**
3. **Monitor cache hit ratio di server**
4. **Test di multiple browser setelah deploy**
5. **Keep backup manifest.json untuk rollback**
