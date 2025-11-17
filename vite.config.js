import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    // Ensure proper handling of client-side routing
    appType: 'spa',
    define: {
        global: 'globalThis',
    },
    optimizeDeps: {
        include: ['buffer'],
    },
    assetsInclude: ['**/*.md'], // Include markdown files as assets
    build: {
        chunkSizeWarningLimit: 600, // Increase from default 500kb to 600kb
        rollupOptions: {
            // Ensure markdown files are included in the build
            external: [],
            output: {
                manualChunks: undefined, // Better for SPAs
            },
        },
    },
});
