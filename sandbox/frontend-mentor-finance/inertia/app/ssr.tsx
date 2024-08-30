import { createInertiaApp } from 'inertia-kaioken-adapter'

export default function render(page: any) {
  return createInertiaApp({
    page,
    resolve: (name: string) => {
      const pages = import.meta.glob(`../pages/**/*.tsx`, { eager: true })
      return pages[`../pages/${name}.tsx`]
    },
    setup({ App, props }) {
      return <App {...props} />
    },
  })
}
