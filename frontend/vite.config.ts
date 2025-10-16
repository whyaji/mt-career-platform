import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development' || process.env.VITE_ENV === 'development';

  return {
    base: '/assets/',
    plugins: [
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
      }),
      react(),
      ...(isDevelopment
        ? [
            viteStaticCopy({
              targets: [
                {
                  src: '../public/*',
                  dest: './',
                },
              ],
            }),
          ]
        : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      watch: {
        usePolling: true,
      },
      host: true,
      port: 5193,
    },
    build: {
      outDir: '../public/assets',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          entryFileNames: 'index-[hash].js',
          chunkFileNames: 'chunks/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.names?.[0]?.endsWith('.css')) {
              return 'index-[hash].css';
            }
            return 'assets/[name]-[hash].[ext]';
          },
        },
      },
    },
  };
});
