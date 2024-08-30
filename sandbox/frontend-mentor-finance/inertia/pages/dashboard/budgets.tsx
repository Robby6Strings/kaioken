import type DashboardController from '#controllers/dashboard_controller'
import { InferPageProps } from '@adonisjs/inertia/types'
import { DashboardLayout } from '~/components/dashboard_layout'

type DashboardProps = InferPageProps<DashboardController, 'read'>

const Budgets: Kaioken.FC<DashboardProps> = (props: DashboardProps) => {
  return <p>Hello world</p>
}

Budgets.layout = DashboardLayout

export default Budgets
