import type DashboardController from '#controllers/dashboard_controller'
import { InferPageProps } from '@adonisjs/inertia/types'
import { useKeyStroke } from '@kaioken-core/hooks'
import { Head, useForm } from 'inertia-kaioken-adapter'
import { signal } from 'kaioken'
import { Button } from '~/components/button'
import { DashboardLayout } from '~/components/dashboard_layout'
import { Input } from '~/components/input'
import { Modal, ModalTitle } from '~/components/modal'
import { Select, SelectHead } from '~/components/select'

type DashboardProps = InferPageProps<DashboardController, 'readPots'>

const Pots: Kaioken.FC<DashboardProps> = (props: DashboardProps) => {
  const isAddNewPotOpen = signal(false)
  const { data, setData } = useForm({
    name: 'boop',
    target: 0,
    theme: 'green',
  })

  useKeyStroke('Escape', () => {
    if (isAddNewPotOpen.value === false) return
    isAddNewPotOpen.value = false
  })

  return (
    <section>
      <Head title="Pots" />

      <header className="w-full flex justify-between items-center px-500 py-400">
        <h2 className="text-preset-1 font-bold text-grey-900">Pots</h2>

        <Button onclick={() => (isAddNewPotOpen.value = !isAddNewPotOpen.value)}>
          + Add new Pot
        </Button>

        <Modal isOpen={isAddNewPotOpen.value}>
          <ModalTitle title="Add New Pot" onclose={() => (isAddNewPotOpen.value = false)} />
          <p className="text-preset-4 text-grey-500 mt-250">
            Create a pot to set savings targets. These can help keep you on track as you save for
            special purchases.
          </p>

          <Input
            className="mt-250"
            value={data.name}
            oninput={(e) => setData('name', e.target.value)}
            placeholder="e.g. Rainy Days"
          >
            Pot Name
          </Input>

          <Input
            className="mt-200"
            type="number"
            value={data.target}
            oninput={(e) => {
              setData('target', e.target.valueAsNumber)
            }}
            placeholder="e.g. Rainy Days"
          >
            Target
          </Input>

          <Button className="w-full mt-250">Add Pot</Button>
        </Modal>
      </header>

      <Select
        containerClassName="w-[123px] bg-[black]"
        value={data.theme}
        setValue={(value) => {
          if (typeof value === 'string') {
            setData('theme', value)
          } else {
            setData('theme', value(data.theme))
          }
        }}
      >
        {{
          head: ({ isSelectOpen, ref }) => {
            return (
              <button
                className="w-full"
                ref={ref}
                onclick={() => {
                  isSelectOpen.value = !isSelectOpen.value
                  debugger
                }}
              >
                Totally legitimate head {`${isSelectOpen.value}`}
              </button>
            )
          },
          itemContainer: () => {
            return (
              <>
                <p className="text-white">Item</p>
              </>
            )
          },
        }}
      </Select>
    </section>
  )
}

Pots.layout = DashboardLayout

export default Pots
