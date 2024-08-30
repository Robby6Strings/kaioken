import { Link, usePage } from 'inertia-kaioken-adapter'
import { ElementProps, signal } from 'kaioken'
import { twMerge } from 'tailwind-merge'
import { Arrow } from '~/icons/arrow'
import Bill from '~/icons/bill'
import { Chart } from '~/icons/chart'
import { Home } from '~/icons/home'
import { Logo, SingleLetterLogo } from '~/icons/logo'
import Pot from '~/icons/pots'
import { UpAndDown } from '~/icons/up_and_down'
import { useWindowSize } from '@kaioken-core/hooks'

type NavLink = {
  className?: string
  icon?: JSX.Element
  href: string
}

const isOpen = signal(true)

export const NavLink: Kaioken.FC<NavLink> = (props) => {
  const route = usePage()
  const isActive = route.url === props.href
  const { width } = useWindowSize()
  const isMobile = width <= 1024
  return (
    <Link
      className={twMerge(
        'py-200 px-400 bg-grey-900 lg:border-l-[4px] lg:border-l-grey-900 rounded-t-lg lg:rounded-t-none lg:!rounded-r-xl text-preset-5 lg:text-preset-3 font-bold text-grey-300 flex flex-col lg:flex-row  items-center gap-50 lg:gap-200 min-w-max whitespace-nowrap w-full',
        isActive && 'bg-beige-100 text-grey-900 lg:border-l-green',
        props.className
      )}
      href={props.href}
    >
      <span className={isActive ? 'text-green' : ''}>{props.icon && props.icon}</span>
      {isMobile ? (
        <span className="hidden md:inline">{props.children}</span>
      ) : (
        isOpen.value && props.children
      )}
    </Link>
  )
}

type NavButton = {
  className?: string
  icon?: JSX.Element
  onclick?: ElementProps<'input'>['onclick']
}

export const NavButton: Kaioken.FC<NavButton> = (props) => {
  return (
    <button
      className={twMerge(
        'py-200 px-400 bg-grey-900 border-l-[4px] border-l-grey-900  rounded-r-xl w-full text-preset-3 font-bold text-grey-300 flex items-center gap-200 min-w-max whitespace-nowrap',
        props.className
      )}
      onclick={props.onclick}
    >
      <span>{props.icon && props.icon}</span>
      {isOpen.value && props.children}
    </button>
  )
}

export const DashboardLayout: Kaioken.FC = (props) => {
  return (
    <main
      className={twMerge(
        'w-full min-h-screen grid grid-cols-1 grid-rows-[1fr,max-content] lg:grid-rows-1 lg:grid-cols-[88px,1fr] bg-beige-100 transition-[grid-template-columns]',
        isOpen.value && 'lg:grid-cols-[300px,1fr]'
      )}
    >
      <nav className="w-full h-full bg-grey-900 hidden lg:flex flex-col gap-300 rounded-r-2xl overflow-hidden">
        <div className="p-500">{isOpen.value ? <Logo /> : <SingleLetterLogo />}</div>

        <div className="flex flex-col gap-50 pr-300">
          <NavLink icon={<Home />} href="/dashboard/">
            Overview
          </NavLink>
          <NavLink icon={<UpAndDown />} href="/dashboard/transactions/">
            Transactions
          </NavLink>
          <NavLink icon={<Chart />} href="/dashboard/budgets/">
            Budgets
          </NavLink>
          <NavLink icon={<Pot />} href="/dashboard/pots/">
            Pots
          </NavLink>
          <NavLink icon={<Bill />} href="/dashboard/bills/">
            Recurring Bills
          </NavLink>
        </div>

        <NavButton
          icon={
            <Arrow
              className={isOpen.value ? 'transition-transform' : 'rotate-180 transition-transform'}
            />
          }
          className="mt-auto mb-[3.6rem]"
          onclick={() => (isOpen.value = !isOpen.value)}
        >
          Minimize Menu
        </NavButton>
      </nav>

      {props.children}

      <nav className="w-full px-500 pt-100 rounded-t-lg bg-grey-900 grid grid-cols-5 lg:hidden">
        <NavLink icon={<Home />} href="/dashboard/">
          Overview
        </NavLink>
        <NavLink icon={<UpAndDown />} href="/dashboard/transactions/">
          Transactions
        </NavLink>
        <NavLink icon={<Chart />} href="/dashboard/budgets/">
          Budgets
        </NavLink>
        <NavLink icon={<Pot />} href="/dashboard/pots/">
          Pots
        </NavLink>
        <NavLink icon={<Bill />} href="/dashboard/bills/">
          Recurring Bills
        </NavLink>
      </nav>
    </main>
  )
}
