import {defineConfig} from 'rolldown';

export default defineConfig({
  input: 'src/index.ts',
  external: ['@nicolawealth/ioc'],
  platform: 'browser',
  tsconfig: 'tsconfig.json',
  output: [
    {
      file: 'dist/index.modern.mjs',
      format: 'es',
      minify: true,
      sourcemap: true,
    },
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      globals: {
        '@nicolawealth/ioc': 'ioc',
      },
      minify: true,
      name: 'rateLimit',
      sourcemap: true,
    },
  ],
});
