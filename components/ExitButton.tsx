import {homeRoute} from "../util/Route"
import {ImExit} from "react-icons/im"
import {IconButton} from "@chakra-ui/react"
import React from "react"
import {useRouter} from "next/router"

export default function ExitButton() {
  const router = useRouter()

  return <IconButton
    size="md"
    fontSize="lg"
    variant="ghost"
    color="current"
    marginLeft="2"
    onClick={() => router.push(homeRoute())}
    icon={<ImExit/>}
    aria-label="Exit"
  />
}
