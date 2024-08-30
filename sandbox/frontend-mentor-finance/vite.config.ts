import { defineConfig } from 'vite'
import { getDirname } from '@adonisjs/core/helpers'
import adonisjs from '@adonisjs/vite/client'
import inertia from '@adonisjs/inertia/client'
import kaioken from 'vite-plugin-kaioken'

export default defineConfig({
  plugins: [
    adonisjs({
      entrypoints: ['inertia/app/app.tsx'],
      //  reload: ['./inertia/pages/**/*.tsx'],
    }),
    inertia({ ssr: { enabled: true, entrypoint: 'inertia/app/ssr.tsx' } }),
    kaioken(),
  ],
  esbuild: {
    jsxInject: `import * as kaioken from "kaioken"`,
    jsx: 'transform',
    jsxFactory: 'kaioken.createElement',
    jsxFragment: 'kaioken.fragment',
    loader: 'tsx',
    include: ['**/*.tsx', '**/*.ts', '**/*.jsx', '**/*.js'],
  },
  ssr: {
    external: ['kaioken'],
  },
  optimizeDeps: {
    exclude: ['kaioken'],
  },

  /**
   * Define aliases for importing modules from
   * your frontend code
   */
  resolve: {
    alias: {
      '~/': `${getDirname(import.meta.url)}/inertia/`,
    },
  },
})
