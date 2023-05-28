import * as React from "react"
import {useEffect} from "react"
import {useRouter} from "next/router"
import NProgress from "nprogress"
import "nprogress/nprogress.css"

export default function MainLoadingBar() {
  const router = useRouter()

  useEffect(() => {
    const handleStart = () => {
      NProgress.start()
    }

    const handleStop = () => {
      NProgress.done()
    }

    router.events.on("routeChangeStart", handleStart)
    router.events.on("routeChangeComplete", handleStop)
    router.events.on("routeChangeError", handleStop)

    return () => {
      NProgress.done()
      router.events.off("routeChangeStart", handleStart)
      router.events.off("routeChangeComplete", handleStop)
      router.events.off("routeChangeError", handleStop)
    }
  }, [router])

  return null
}

export function configureMainLoadingBar() {
  NProgress.configure({trickleSpeed: 100, showSpinner: false})
}
