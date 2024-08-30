import { Head, Link, useForm } from 'inertia-kaioken-adapter'
import { ElementProps, signal, useCallback } from 'kaioken'
import { AuthLayout } from '~/components/auth_layout'
import { Button } from '~/components/button'
import { Input } from '~/components/input'
import { EyeOpen } from '~/icons/eye'

export default function Login() {
  const passwordShow = signal(false)

  const { data, setData, errors, post } = useForm({
    email: '',
    password: '',
  })

  const onSubmit = useCallback<NonNullable<ElementProps<'form'>['onsubmit']>>(
    (e) => {
      e.preventDefault()
      post('/')
    },
    [post]
  )

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>

      <AuthLayout>
        <form
          className="p-400 bg-white rounded-xl flex flex-col items-center gap-400 w-full max-w-[540px]"
          onsubmit={onSubmit}
        >
          <h2 className="text-preset-1 font-bold text-grey-900 w-full">Login</h2>

          <div className="flex flex-col gap-200 w-full">
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
              oninput={(e) => setData('password', e.target.value)}
              helperText={errors.password?.[0]}
              postInput={() => (
                <button type="button" onclick={() => (passwordShow.value = !passwordShow.value)}>
                  <EyeOpen />
                </button>
              )}
            >
              Password
            </Input>

            <p className=""></p>
          </div>

          <Button className="w-full">Login</Button>
          <p className="text-grey-500 text-preset-4 mt-400">
            Need to create an account?{' '}
            <Link className="font-bold text-grey-900 underline" as="a" href="/register">
              Sign up
            </Link>{' '}
          </p>
        </form>
      </AuthLayout>
    </>
  )
}
