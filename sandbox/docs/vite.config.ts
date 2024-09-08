import path from "node:path"
import { defineConfig } from "vite"
import ssr from "vike/plugin"
import kaioken from "vite-plugin-kaioken"
import mdx from "@mdx-js/rollup"
import shiki, { type RehypeShikiOptions } from "@shikijs/rehype"
import { transformerTwoslash, rendererRich } from "@shikijs/twoslash"

const hoverHighlight = rendererRich({
  hast: {
    popupTypes: {
      properties: {
        popover: "manual",
      },
    },
  },
})

export default defineConfig({
  resolve: {
    alias: {
      $: path.join(__dirname, "src"),
    },
  },

  ssr: {
    external: ["kaioken"],
  },
  optimizeDeps: {
    exclude: ["kaioken"],
  },

  build: {
    minify: false,
    sourcemap: false,
  },

  esbuild: {
    sourcemap: false,
    // @ts-ignore
    minify: false,
  },

  plugins: [
    {
      enforce: "pre",
      ...mdx({
        jsx: false,
        jsxImportSource: "kaioken",
        jsxRuntime: "automatic",
        rehypePlugins: [
          [
            shiki,
            {
              theme: "github-dark",
              transformers: [
                transformerTwoslash({
                  explicitTrigger: true,
                  renderer: hoverHighlight,
                }),
              ],
            } as RehypeShikiOptions,
          ],
        ],
      }),
    },
    ssr({
      prerender: {
        noExtraDir: true,
      },
    }),
    kaioken(),
  ],
})
