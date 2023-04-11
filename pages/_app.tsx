import type {AppProps} from "next/app"
import {ChakraProvider, extendTheme} from "@chakra-ui/react"
import {useEffect} from "react"
import {configureMainLoadingBar} from "../components/MainLoadingBar"

const config = {
  initialColorMode: "dark",
  useSystemColorMode: false,
}

export const theme = extendTheme({config})

export default function App({Component, pageProps}: AppProps) {
  useEffect(() => {
    configureMainLoadingBar()
  }, [])

  return <ChakraProvider theme={theme}>
    <Component {...pageProps} />
  </ChakraProvider>
}
