import { Caret } from '~/icons/caret'
import { PieChart } from '~/icons/chart'
import { GreenPot } from '~/icons/pots'
import { twMerge } from 'tailwind-merge'
import { Container } from '~/components/container'
import { Link } from 'inertia-kaioken-adapter'
import person1 from '~/assets/Person 1.jpg'
import person2 from '~/assets/Person 2.jpg'
import person9 from '~/assets/Person 9.jpg'
import logo8 from '~/assets/Logo 8.jpg'
import logo14 from '~/assets/Logo 14.jpg'

export const PillItem: Kaioken.FC<{ className: string; title: string; price: string }> = (
  props
) => {
  return (
    <div className="flex gap-200 items-center">
      <div className={twMerge('w-50 h-full rounded-lg', props.className)} />
      <div>
        <p className="text-grey-500 text-preset-5">{props.title}</p>
        <p className="text-preset-4 font-bold text-grey-900">{props.price}</p>
      </div>
    </div>
  )
}

export const Pot: Kaioken.FC = () => {
  return (
    <Container className="p-400 flex flex-col gap-250">
      <div className="flex justify-between items-center">
        <h3 className="text-grey-900 text-preset-2 font-bold">Pots</h3>

        <Link
          className="text-preset-4 text-grey-500 flex gap-150 justify-center items-center"
          href="/dashboard/pots/"
        >
          See Details
          <Caret />
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-250">
        <div className="gap-200 rounded-xl bg-beige-100 flex items-center p-200 w-full">
          <GreenPot />
          <div className="flex flex-col gap-[.69rem]">
            <p className="text-grey-500 text-preset-4">Total Saved</p>
            <p className="text-grey-900 font-bold text-preset-1">$850</p>
          </div>
        </div>
        <div className="w-full grid grid-cols-2 grid-rows-2 gap-200">
          <PillItem className="bg-green" title="Savings" price="$159" />
          <PillItem className="bg-cyan" title="Gift" price="$40" />
          <PillItem className="bg-navy" title="Concert Ticket" price="$110" />
          <PillItem className="bg-yellow" title="New Laptop" price="$10" />
        </div>
      </div>
    </Container>
  )
}

export const Budgets: Kaioken.FC = () => {
  return (
    <Container className="p-400 flex flex-col gap-250">
      <div className="flex justify-between items-center">
        <h3 className="text-grey-900 text-preset-2 font-bold">Budgets</h3>

        <Link
          className="text-preset-4 text-grey-500 flex gap-150 items-center"
          href="/dashboard/budgets/"
        >
          See Details
          <Caret />
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-center py-100 gap-250">
        <div className="relative w-max mx-auto">
          <PieChart />

          <div className="w-[188px] h-[188px] rounded-full bg-white/50 p-[0.8rem] absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
            <div className="bg-white w-full h-full rounded-full flex flex-col items-center justify-center gap-100">
              <p className="text-preset-1 text-grey-900 font-bold">$338</p>
              <p className="text-preset-5 text-grey-500">of $975 limit</p>
            </div>
          </div>
        </div>
        <div className="w-full sm:w-max grid grid-cols-2 sm:flex sm:flex-col gap-200">
          <PillItem className="bg-green h-[2.69rem]" title="Entertainment" price="$50.00" />
          <PillItem className="bg-cyan h-[2.69rem]" title="Bills" price="$750.00" />
          <PillItem className="bg-yellow h-[2.69rem]" title="Dining out" price="$75.00" />
          <PillItem className="bg-navy h-[2.69rem]" title="Personal Care" price="$100.00" />
        </div>
      </div>
    </Container>
  )
}

export const RecurringBills: Kaioken.FC = () => {
  return (
    <Container className="p-400 flex flex-col gap-400">
      <div className="flex justify-between items-center">
        <h3 className="text-grey-900 text-preset-2 font-bold">Recurring Bills</h3>

        <Link
          className="text-preset-4 text-grey-500 flex gap-150 items-center"
          href="/dashboard/bills/"
        >
          See Details
          <Caret />
        </Link>
      </div>

      <div className="flex flex-col gap-150">
        <div className="px-200 py-250 bg-beige-100 rounded-lg border-l-4 border-l-green flex justify-between items-center">
          <p className="text-grey-500 text-preset-4">Paid bills</p>
          <p className="text-grey-900 text-preset-4 font-bold">$190.00</p>
        </div>
        <div className="px-200 py-250 bg-beige-100 rounded-lg border-l-4 border-l-yellow flex justify-between items-center">
          <p className="text-grey-500 text-preset-4">Total Upcoming</p>
          <p className="text-grey-900 text-preset-4 font-bold">$194.98</p>
        </div>
        <div className="px-200 py-250 bg-beige-100 rounded-lg border-l-4 border-l-cyan flex justify-between items-center">
          <p className="text-grey-500 text-preset-4">Due Soon</p>
          <p className="text-grey-900 text-preset-4 font-bold">$59.98</p>
        </div>
      </div>
    </Container>
  )
}

export const TransactionsItem: Kaioken.FC<{
  src: string
  name: string
  amount: string
  date: string
}> = (props) => {
  const isNegative = props.amount.includes('-')
  return (
    <div>
      <div className="items-center flex gap-200">
        <img className="w-500 h-500 rounded-full" src={props.src} alt="" />
        <p className="text-preset-4 font-bold text-grey-900">{props.name}</p>
        <div className="ml-auto flex flex-col text-right gap-100">
          <p
            className={twMerge('text-preset-4 font-bold text-green', isNegative && 'text-grey-900')}
          >
            {props.amount}
          </p>
          <p className="text-preset-5 text-grey-500">{props.date}</p>
        </div>
      </div>
    </div>
  )
}

export const Transactions: Kaioken.FC = () => {
  return (
    <Container className="p-400 flex flex-col gap-400">
      <div className="flex justify-between items-center">
        <h3 className="text-grey-900 text-preset-2 font-bold">Transactions</h3>

        <Link
          className="text-preset-4 text-grey-500 flex gap-150 items-center"
          href="/dashboard/transactions/"
        >
          See Details
          <Caret />
        </Link>
      </div>

      <div className="flex flex-col gap-250">
        <TransactionsItem
          src={person1}
          name="Emma Richardson"
          amount="+$75.00"
          date="19 Aug 2024"
        />
        <div className="w-full h-[1px] bg-grey-100" />
        <TransactionsItem
          src={logo8}
          name="Savory Bites Bistro"
          amount="-$55.50"
          date="19 Aug 2024"
        />
        <div className="w-full h-[1px] bg-grey-100" />
        <TransactionsItem src={person9} name="Daniel Carter" amount="-$42.30" date="18 Aug 2024" />
        <div className="w-full h-[1px] bg-grey-100" />
        <TransactionsItem src={person2} name="Sun Park" amount="+$120.00" date="17 Aug 2024" />
        <div className="w-full h-[1px] bg-grey-100" />
        <TransactionsItem
          src={logo14}
          name="Urban Services Hub"
          amount="-$65.00"
          date="17 Aug 2024"
        />
      </div>
    </Container>
  )
}
