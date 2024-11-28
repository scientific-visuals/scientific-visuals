import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import aurelia from '@aurelia/vite-plugin';
import babel from 'vite-plugin-babel';

export default defineConfig({
  server: {
    open: !process.env.CI,
    port: 9000,
  },
  esbuild: {
    target: 'es2022'
  },
  plugins: [
    aurelia({
      useDev: true,
    }),
    babel(),
    nodePolyfills(),
  ],
  build: {
    lib: {
      entry: './src/webcomponents.js', // Entry point for the web components
      name: 'SVComponents', // Global name for the library
      fileName: (format) => `sv-components.${format}.js`, // Output file name
    },
    rollupOptions: {
      external: [], // Add external dependencies here if needed
      output: {
        globals: {}, // Define global variables for external libraries if any
      },
    },
    outDir: './dist-webcomponents', // Output directory for the web components
  },
});
/*
import { defineConfig } from 'vite';
import aurelia from '@aurelia/vite';

export default defineConfig({
  plugins: [aurelia()],
  build: {
    lib: {
      entry: './src/webcomponents.js', // Entry point for the web components
      name: 'SVComponents', // Global name for the library
      fileName: (format) => `sv-components.${format}.js`, // Output file name
    },
    rollupOptions: {
      external: [], // Add external dependencies here if needed
      output: {
        globals: {}, // Define global variables for external libraries if any
      },
    },
    outDir: './dist-webcomponents', // Output directory for the web components
  },
});
*/