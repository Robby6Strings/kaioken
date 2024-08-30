/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const AuthController = () => import('#controllers/auth_controller')
const DashboardController = () => import('#controllers/dashboard_controller')
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
router.get('/', [AuthController, 'readLogin'])
router.post('/', [AuthController, 'postLogin'])

router.get('/register', [AuthController, 'readRegister'])
router.post('/register', [AuthController, 'postRegister'])

router.get('/dashboard', [DashboardController, 'read']).use(middleware.auth())
router
  .get('/dashboard/transactions', [DashboardController, 'readTransaction'])
  .use(middleware.auth())

router.get('/dashboard/budgets', [DashboardController, 'readBudgets']).use(middleware.auth())

router.get('/dashboard/pots', [DashboardController, 'readPots']).use(middleware.auth())

router.get('/dashboard/bills', [DashboardController, 'readBills']).use(middleware.auth())
