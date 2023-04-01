import {useEffect, useState} from "react"

export function useKeyPress(key: string) {
  const [keyPressed, setKeyPressed] = useState<boolean>(false)

  useEffect(() => {
    function keyDown(e: KeyboardEvent) {
      if (e.key === key) {
        setKeyPressed(true)
      }
    }

    function keyUp(e: KeyboardEvent) {
      if (e.key === key) {
        setKeyPressed(false)
      }
    }

    window.addEventListener("keydown", keyDown)
    window.addEventListener("keyup", keyUp)
    return () => {
      window.removeEventListener("keydown", keyDown)
      window.removeEventListener("keyup", keyUp)
    }
  }, [key])

  return keyPressed
}
