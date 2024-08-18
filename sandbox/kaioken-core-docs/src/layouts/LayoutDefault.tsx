import { Navbar } from "$/components/Navbar"
import { SideBar } from "$/components/SideBar"
import '@fontsource-variable/cabin';
import '../css/shiki.css'
import '../css/mdx.css'
import { BottomNav } from "$/components/BottomNav";
import { usePageContext } from "$/context/pageContext";

export function LayoutDefault({ children }: { children: JSX.Children }) {
  const context = usePageContext()
  return (
    <div className="grid grid-cols-[300px,1fr] gap-8 grid-rows-[max-content,1fr] items-center m-auto w-full min-h-screen">
      <Navbar />
      <SideBar />
      <div className="max-w-[1100px] justify-self-center w-full h-full p-5">
        {children}
        <BottomNav currRoute={context!.urlPathname} />
      </div>
    </div>
  )
}
