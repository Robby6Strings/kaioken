import { Button } from "$/components/Button"
import { Pages } from "$/utils/meta"
import { navigate } from "kaioken"
import Bash from "./bash.mdx"

export { Page }

function Page() {
  const goToFirstPage = () => {
    const firstPage = [...Pages.keys()].at(0)
    if (!firstPage) return
    navigate(firstPage)
  }

  return (
    <>
      <div className="w-full grid grid-cols-1 md:grid-cols-[1fr,400px] items-center">
        <div className="flex flex-col">
          <h2 className="font-cabin text-[4rem] font-semibold leading-[80%]">
            Kaioken core Hooks
          </h2>
          <p className="font-cabin font-medium text-white/80 text-[1.2rem]">
            All the hooks you need to build an interactive application
          </p>
          <div className="flex gap-4 items-center mt-4">
            <Button onclick={goToFirstPage}>Get Started</Button>
            <a>View on Github</a>
          </div>
        </div>
        <img className="hidden md:block" src="/kaioken-hook.svg" alt="" />
      </div>

      <div className="flex flex-col gap-4 mt-8 md:mt-0">
        <h3 className="font-cabin text-[2rem] font-semibold">Try it out now</h3>
        <Bash />
      </div>
    </>
  )
}
