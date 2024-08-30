/// <reference path="../../adonisrc.ts" />
/// <reference path="../../config/inertia.ts" />

import '../css/test.css'
import '@fontsource-variable/public-sans'
import { hydrate } from 'kaioken/ssr/client'
import { createInertiaApp } from 'inertia-kaioken-adapter'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'

createInertiaApp({
  progress: { color: '#5468FF' },

  resolve: (name: string) => {
    return resolvePageComponent(`../pages/${name}.tsx`, import.meta.glob('../pages/**/*.tsx'))
  },

  setup({ el, App, props }) {
    if (!el) return

    hydrate(() => {
      return <App {...props} />
    }, el)
  },
})
