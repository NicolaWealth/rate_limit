import {defineConfig} from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'rateLimit',
      formats: ['es', 'umd'],
      fileName: format => format === 'es' ? 'index.modern.js' : 'index.umd.js',
    },
    rollupOptions: {
      external: ['@nicolawealth/ioc'],
      output: {
        globals: {
          '@nicolawealth/ioc': 'ioc',
        },
      },
    },
    sourcemap: true,
  },
});
