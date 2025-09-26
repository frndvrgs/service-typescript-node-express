import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/main.ts'],
  target: 'node24',
  format: ['esm'],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: false,
  minify: true,
  treeshake: true,
  bundle: true,
  external: ['pg-native'],
  esbuildOptions(options) {
    options.keepNames = true
    options.drop = ['console', 'debugger']
  },
  env: {
    NODE_ENV: 'production'
  },
  outDir: 'dist',
  shims: false,
  platform: 'node'
})
