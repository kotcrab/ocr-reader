import type {AppProps} from "next/app"
import {ChakraProvider, extendTheme} from "@chakra-ui/react"

const config = {
  initialColorMode: "dark",
  useSystemColorMode: false,
}

export const theme = extendTheme({config})

export default function App({Component, pageProps}: AppProps) {
  return <ChakraProvider theme={theme}>
    <Component {...pageProps} />
  </ChakraProvider>
}
