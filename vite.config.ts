import path from 'path'
import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const analyzeBundle = mode === 'analyze'

  const plugins: PluginOption[] = [
    react(),
  ]

  if (analyzeBundle) {
    plugins.push(
      visualizer({
        filename: 'dist/stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      })
    )
  }

  return {
    plugins,
    appType: 'spa',
    publicDir: 'public',
    resolve: {
      alias: {},
    },
    define: {
      global: 'globalThis',
    },
    assetsInclude: ['src/data/**/*.md'],
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: false,
      open: false,
      fs: {
        allow: ['..'],
        deny: ['api/**', './api/**']
      },
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
          ws: true,
          bypass: (req) => {
            if (req.url?.startsWith('/api')) {
              return false;
            }
          },
          configure: (proxy) => {
            proxy.on('error', (err, _req, res) => {
              console.error('Proxy error:', err.message);
              if (!res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  error: 'Proxy error',
                  details: err.message,
                  hint: 'Make sure the API dev server is running on port 3001'
                }));
              }
            });
          },
        },
      },
    },
    css: {
      devSourcemap: true,
    },
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        external(id: string) {
          const backendApi = path.resolve(__dirname, 'api').replace(/\\/g, '/');
          const normalized = id.replace(/\\/g, '/');
          return normalized.startsWith(backendApi + '/') || normalized === backendApi;
        },
        output: {
          manualChunks: (id: string) => {
            if (id.includes('react/') && !id.includes('react-dom')) {
              return 'react-core';
            }
            if (id.includes('react-dom')) {
              return 'react-dom';
            }
            if (id.includes('react-router')) {
              return 'react-router';
            }
            if (id.includes('@phosphor-icons')) {
              return 'icons';
            }
            if (id.includes('@vercel/analytics')) {
              return 'analytics';
            }
            if (id.includes('node_modules')) {
              return 'vendor';
            }
            if (id.includes('/pages/Admin') || id.includes('/pages/AdminLogin')) {
              return 'admin';
            }
            if (id.includes('/pages/Debug') || id.includes('/pages/ButtonDemo') || id.includes('/pages/ResponsiveTest')) {
              return 'demo';
            }
          },
          chunkFileNames: '[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
    },
  }
})
