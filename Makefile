build:
	pnpm --filter !"./sandbox/*" run -r build
devtools-dev:
	pnpm --filter "./packages/devtools-*" run -r --parallel build 
	pnpm --filter "./packages/vite-plugin-kaioken" run build
	pnpm --filter "./sandbox/csr" run dev
test:
	NODE_ENV=development pnpm --filter !"./sandbox/*" run -r --parallel test