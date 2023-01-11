import Head from "next/head"

interface Props {
  title?: string
}

export const defaultPageTitle = "Reader"

export default function PageHead({title}: Props) {
  return <Head>
    <title>{title || defaultPageTitle}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <link rel="icon" href="/favicon.ico"/>
  </Head>
}
