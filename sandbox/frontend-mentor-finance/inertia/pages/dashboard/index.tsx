import type DashboardController from '#controllers/dashboard_controller'
import { InferPageProps } from '@adonisjs/inertia/types'
import { Head } from 'inertia-kaioken-adapter'
import { Container } from '~/components/container'
import { DashboardLayout } from '~/components/dashboard_layout'
import { Budgets, Pot, RecurringBills, Transactions } from '~/sections/overview'

type DashboardProps = InferPageProps<DashboardController, 'read'>

const Overview: Kaioken.FC<DashboardProps> = (props: DashboardProps) => {
  return (
    <section className="p-400 flex flex-col gap-400">
      <h2 className="text-preset-1 font-bold text-grey-900">Overview</h2>
      <Head title="Overview" />

      <div className="flex flex-col md:flex-row gap-300">
        <Container className="bg-grey-900 flex flex-col gap-150 w-full">
          <p className="text-white text-preset-4">Current Balance</p>
          <p className="text-preset-1 text-white font-bold">$4,836.00</p>
        </Container>

        <Container className="flex flex-col gap-150 w-full">
          <p className="text-grey-500 text-preset-4">Current Balance</p>
          <p className="text-preset-1 text-grey-900 font-bold">$1,270.50</p>
        </Container>

        <Container className="flex flex-col gap-150 w-full">
          <p className="text-grey-500 text-preset-4">Expenses</p>
          <p className="text-preset-1 text-grey-900 font-bold">$3,167.25</p>
        </Container>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr,428px] gap-300">
        <div className="flex flex-col gap-300">
          <Pot />
          <Transactions />
        </div>

        <div className="flex flex-col gap-300">
          <Budgets />
          <RecurringBills />
        </div>
      </div>
    </section>
  )
}

Overview.layout = DashboardLayout

export default Overview
