import { Logo } from '~/icons/logo'
import authGuySrc from '~/assets/auth_guy.png'

export const AuthLayout: Kaioken.FC = (props) => {
  return (
    <main className="w-full min-h-screen bg-beige-100 grid grid-cols-1 grid-rows-[4.36rem,1fr] lg:grid-rows-1 lg:grid-cols-[minmax(0,35rem),1fr]">
      <aside className="p-250 hidden lg:flex">
        <section
          style={{ '--url': `url(${authGuySrc})` } as any}
          className={`[background-image:var(--url)] flex bg-contain bg-grey-900 bg-no-repeat w-full h-full rounded-xl p-500 flex-col justify-between`}
        >
          <Logo />

          <div className="text-white flex flex-col gap-300">
            <h2 className="text-preset-1 font-bold">
              Keep track of your money and save for your future
            </h2>
            <p className="text-preset-4">
              Personal finance app puts you in control of your spending. Track transactions, set
              budgets, and add to savings pots easily.
            </p>
          </div>
        </section>
      </aside>

      <div className="w-full rounded-b-lg bg-grey-900 grid lg:hidden place-items-center px-500 py-300">
        <Logo />
      </div>

      <aside className="p-400 grid place-items-center">{props.children}</aside>
    </main>
  )
}
