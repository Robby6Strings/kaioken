import { Head, Link, useForm } from 'inertia-kaioken-adapter'
import { ElementProps, signal, useCallback } from 'kaioken'
import { AuthLayout } from '~/components/auth_layout'
import { Button } from '~/components/button'
import { Input } from '~/components/input'
import { EyeOpen } from '~/icons/eye'

export default function Register() {
  const passwordShow = signal(false)

  const { data, setData, post, errors } = useForm({
    name: '',
    email: '',
    password: '',
  })

  const onSubmit = useCallback<NonNullable<ElementProps<'form'>['onsubmit']>>(
    (e) => {
      e.preventDefault()
      post('/register')
    },
    [post]
  )

  return (
    <>
      <Head>
        <title>Sign up</title>
      </Head>

      <AuthLayout>
        <form
          className="p-400 bg-white rounded-xl flex flex-col items-center gap-400 w-full max-w-[540px]"
          onsubmit={onSubmit}
        >
          <h2 className="text-preset-1 font-bold text-grey-900 w-full">Sign up</h2>

          <div className="flex flex-col gap-200 w-full">
            <Input
              placeholder=""
              value={data.name}
              helperText={errors.name?.[0]}
              oninput={(e) => setData('name', e.target.value)}
            >
              Name
            </Input>

            <Input
              placeholder=""
              value={data.email}
              helperText={errors.email?.[0]}
              oninput={(e) => setData('email', e.target.value)}
            >
              Email
            </Input>
            <Input
              placeholder=""
              type={passwordShow.value ? 'text' : 'password'}
              value={data.password}
              helperText={errors.password?.[0]}
              oninput={(e) => setData('password', e.target.value)}
              postInput={() => (
                <button type="button" onclick={() => (passwordShow.value = !passwordShow.value)}>
                  <EyeOpen />
                </button>
              )}
            >
              Create Password
            </Input>
          </div>

          <Button className="w-full">Register</Button>
          <p className="text-grey-500 text-preset-4 mt-400">
            Already have an account?{' '}
            <Link className="font-bold text-grey-900 underline" as="a" href="/">
              Login
            </Link>{' '}
          </p>
        </form>
      </AuthLayout>
    </>
  )
}
