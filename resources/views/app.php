<?php if (app()->environment('local')): ?>
    <!-- Development mode - Redirect to Vite dev server -->
    <script>
        // Check if Vite dev server is running
        fetch('http://localhost:5193/')
            .then(() => {
                // Vite server is running, redirect
                if (window.location.port !== '5193') {
                    window.location.href = 'http://localhost:5193' + window.location.pathname + window.location.search;
                }
            })
            .catch(() => {
                // Vite server not running, show message
                document.body.innerHTML = `
                    <div style="font-family: Arial, sans-serif; padding: 40px; text-align: center; background: #f5f5f5; min-height: 100vh;">
                        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto;">
                            <h1 style="color: #e74c3c; margin-bottom: 20px;">⚠️ Development Server Not Running</h1>
                            <p style="color: #666; margin-bottom: 30px; line-height: 1.6;">
                                To run the application in development mode, you need to start the Vite development server.
                            </p>
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: left;">
                                <h3 style="margin-top: 0; color: #333;">Quick Start:</h3>
                                <ol style="color: #666; line-height: 1.8;">
                                    <li>Open terminal in the <code>frontend</code> directory</li>
                                    <li>Run: <code style="background: #e9ecef; padding: 2px 6px; border-radius: 3px;">npm run dev</code></li>
                                    <li>Or use the convenience script: <code style="background: #e9ecef; padding: 2px 6px; border-radius: 3px;">dev-start.bat</code></li>
                                </ol>
                            </div>
                            <p style="color: #666; font-size: 14px;">
                                API Server (this): <strong>http://localhost:8000</strong><br>
                                Frontend Dev Server: <strong>http://localhost:5193</strong>
                            </p>
                        </div>
                    </div>
                `;
            });
    </script>
<?php else: ?>
    <!-- Production mode -->
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <!-- Primary Meta Tags -->
        <title>MT - CBI Career | Program Kepemimpinan Perkebunan Pratama</title>
        <meta
            name="title"
            content="MT - CBI Career | Program Kepemimpinan Perkebunan Pratama" />
        <meta
            name="description"
            content="PT. Sawit Sumbermas Sarana, Tbk. / CBI GROUP membuka kesempatan berkarir bagi fresh graduate untuk mengikuti Program Kepemimpinan Perkebunan Pratama (PKPP). Program Estate, KTU, dan Mill tersedia untuk lulusan D3-S1." />
        <meta
            name="keywords"
            content="CBI Career, SSMS, Sawit Sumbermas Sarana, PKPP, Program Kepemimpinan Perkebunan Pratama, fresh graduate, career, plantation, estate, mill, KTU, Kalimantan Tengah, campus hiring" />
        <meta name="author" content="PT. Sawit Sumbermas Sarana, Tbk." />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="Indonesian" />

        <!-- Canonical URL -->
        <link rel="canonical" href="https://mt.cbicareer.com/" />

        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mt.cbicareer.com/" />
        <meta
            property="og:title"
            content="MT - CBI Career | Program Kepemimpinan Perkebunan Pratama" />
        <meta
            property="og:description"
            content="PT. Sawit Sumbermas Sarana, Tbk. / CBI GROUP membuka kesempatan berkarir bagi fresh graduate untuk mengikuti Program Kepemimpinan Perkebunan Pratama (PKPP). Program Estate, KTU, dan Mill tersedia untuk lulusan D3-S1." />
        <meta
            property="og:image"
            content="https://mt.cbicareer.com/mt-cbicareer-social-share.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
            property="og:image:alt"
            content="MT - CBI Career Program Kepemimpinan Perkebunan Pratama" />
        <meta property="og:site_name" content="MT - CBI Career" />
        <meta property="og:locale" content="id_ID" />

        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://mt.cbicareer.com/" />
        <meta
            property="twitter:title"
            content="MT - CBI Career | Program Kepemimpinan Perkebunan Pratama" />
        <meta
            property="twitter:description"
            content="PT. Sawit Sumbermas Sarana, Tbk. / CBI GROUP membuka kesempatan berkarir bagi fresh graduate untuk mengikuti Program Kepemimpinan Perkebunan Pratama (PKPP). Program Estate, KTU, dan Mill tersedia untuk lulusan D3-S1." />
        <meta
            property="twitter:image"
            content="https://mt.cbicareer.com/mt-cbicareer-social-share.jpg" />
        <meta
            property="twitter:image:alt"
            content="MT - CBI Career Program Kepemimpinan Perkebunan Pratama" />

        <!-- Additional Meta Tags -->
        <meta name="theme-color" content="#228be6" />
        <meta name="msapplication-TileColor" content="#228be6" />
        <meta name="application-name" content="MT - CBI Career" />
        <meta name="apple-mobile-web-app-title" content="MT - CBI Career" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        <!-- Security Headers -->
        <meta http-equiv="X-Content-Type-Options" content="nosniff" />
        <meta http-equiv="X-XSS-Protection" content="1; mode=block" />

        <!-- Favicon and Icons -->
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/logo192.png" />
        <link rel="manifest" href="/manifest.json" />

        <!-- CSS -->
        <link rel="stylesheet" href="/assets/index.css">
    </head>

    <body>
        <div id="root"></div>
        <script type="module" src="/assets/index.js"></script>
    </body>

    </html>
<?php endif; ?>