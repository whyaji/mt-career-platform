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
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MT Career Platform</title>
        <link rel="icon" type="image/png" href="/favicon.png">
        <link rel="stylesheet" href="/assets/index.css">
    </head>

    <body>
        <div id="root"></div>
        <script type="module" src="/assets/index.js"></script>
    </body>

    </html>
<?php endif; ?>