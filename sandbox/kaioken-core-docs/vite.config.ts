import path from "node:path"
import { defineConfig } from "vite"
import ssr from "vike/plugin"
import kaioken from "vite-plugin-kaioken"
import mdx from "@mdx-js/rollup"
import shiki, { type RehypeShikiOptions } from "@shikijs/rehype";
import {
    rendererClassic,
  transformerTwoslash,
} from '@shikijs/twoslash'

export default defineConfig({
  resolve: {
    alias: {
      $: path.join(__dirname, "src"),
    },
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
              transformers: [transformerTwoslash({
                explicitTrigger: true,
              })],
            } as RehypeShikiOptions,
          ],
        ],
      }),
    },
		ssr(), 
		kaioken()
	],
})
