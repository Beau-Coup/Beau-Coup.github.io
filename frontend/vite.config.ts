import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    build: {
        outDir: '../static/js',
        emptyOutDir: true,
        rollupOptions: {
            input: './src/main.ts',
            output: {
                entryFileNames: 'main.js', // <== force a fixed output name
                assetFileNames: 'assets/[name][extname]',
            },
        },
    },
    plugins: [
        tailwindcss(),
    ],
})
