import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ],
  // Removed path aliases to fix Vercel build issues
  // Using relative imports only for maximum compatibility
  // Ensure proper handling of client-side routing
  appType: 'spa',
  // Exclude API directory completely from Vite processing
  publicDir: 'public',
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: [],
    exclude: [
      // Server-side only packages
      '@vercel/node', 
      '@octokit/rest', 
      'formidable',
      // Markdown processing (now done at build time)
      'gray-matter', 
      'remark', 
      'remark-html',
      // Utilities moved to build time
      'slugify', 
      'uuid',
      // Node.js built-in modules
      'fs',
      'path',
      'crypto',
      'os',
      'util'
    ],
    entries: [
      // Explicitly exclude API directory from dependency scanning
      '!**/api/**/*',
      '!./api/**/*',
      '!api/**/*'
    ]
  },
  assetsInclude: ['**/*.md'], // Include markdown files as assets
  server: {
    host: '0.0.0.0', // Explicitly bind to all network interfaces
    port: 5173, // Default Vite port
    strictPort: false, // Allow fallback to other ports if 5173 is busy
    open: false, // Don't auto-open browser
    fs: {
      // Allow serving files from outside the project root
      allow: ['..'],
      // Completely deny access to API directory to prevent bundling
      deny: ['**/api/**', 'api/**', './api/**', '/api/**']
    },
    middlewareMode: false,
    proxy: {
      // Proxy ALL /api requests to Vercel dev server
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true,
        // Force proxy to take precedence over static files
        bypass: (req, res, options) => {
          // Never bypass API requests - always proxy them
          if (req.url?.startsWith('/api')) {
            console.log('🔄 Forcing proxy for API request:', req.url);
            return false; // Don't bypass, always proxy
          }
        },
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.error('❌ Proxy error:', err.message);
            if (!res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ 
                error: 'Proxy error', 
                details: err.message,
                hint: 'Make sure Vercel dev server is running on port 3000'
              }));
            }
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🔄 Proxying API request:', req.method, req.url, '→ localhost:3000');
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            const contentType = proxyRes.headers['content-type'];
            console.log('✅ Proxy response:', proxyRes.statusCode, req.url, 'Content-Type:', contentType);
            
            // Ensure the response maintains JSON content type
            if (contentType?.includes('application/json')) {
              res.setHeader('Content-Type', 'application/json');
            }
          });
        },
      },
    },
  },
  // Source map configuration
  css: {
    devSourcemap: true
  },
  esbuild: {
    sourcemap: 'inline' // Use inline source maps for better compatibility
  },
  build: {
    sourcemap: false, // Disable source maps in production builds
    chunkSizeWarningLimit: 500, // Reduce warning limit to catch large chunks
    rollupOptions: {
      // Ensure markdown files are included in the build
      external: [
        // Exclude Node.js built-in modules from bundling
        'fs',
        'path',
        'crypto',
        'os',
        'util',
        // Exclude API directory from build to prevent bundling serverless functions
        /^\/api\/.*/,
        /^api\/.*/,
        /.*\/api\/.*/,
        // Exclude any imports that start with api/
        (id) => id.includes('/api/') || id.startsWith('api/') || id.includes('\\api\\'),
        // Exclude specific API files
        /^\.\/api\//,
        /^api\//,
        /\/api\//
      ],
      output: {
        // Aggressive chunking strategy for better performance
        manualChunks: (id: string) => {
          // React core (smallest possible)
          if (id.includes('react/') && !id.includes('react-dom')) {
            return 'react-core';
          }
          // React DOM (separate chunk)
          if (id.includes('react-dom')) {
            return 'react-dom';
          }
          // React Router (separate chunk)
          if (id.includes('react-router')) {
            return 'react-router';
          }
          // Phosphor icons (large library)
          if (id.includes('@phosphor-icons')) {
            return 'icons';
          }
          // Analytics (low priority)
          if (id.includes('@vercel/analytics')) {
            return 'analytics';
          }
          // Large utility libraries
          if (id.includes('node_modules')) {
            // Split large libraries
            if (id.includes('gray-matter') || id.includes('remark')) {
              return 'markdown';
            }
            if (id.includes('slugify') || id.includes('uuid')) {
              return 'utils';
            }
            return 'vendor';
          }
          // Admin pages (low traffic)
          if (id.includes('/pages/Admin') || id.includes('/pages/AdminLogin')) {
            return 'admin';
          }
          // Demo pages (development only)
          if (id.includes('/pages/Debug') || id.includes('/pages/ButtonDemo') || id.includes('/pages/ResponsiveTest')) {
            return 'demo';
          }
        },
        chunkFileNames: '[name]-[hash].js',
        // Optimize asset naming
        assetFileNames: (assetInfo: any) => {
          if (!assetInfo.name) return 'assets/[name]-[hash].[ext]';
          
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name)) {
            return `assets/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        }
      },
    },
  },
})
