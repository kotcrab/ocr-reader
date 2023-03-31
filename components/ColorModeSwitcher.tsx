import * as React from "react"
import {IconButton, IconButtonProps, Tooltip, useColorMode, useColorModeValue} from "@chakra-ui/react"
import {FaMoon, FaSun} from "react-icons/fa"
import {TOOLTIP_OPEN_DELAY} from "../util/Util"

type ColorModeSwitcherProps = Omit<IconButtonProps, "aria-label">

export const ColorModeSwitcher: React.FC<ColorModeSwitcherProps> = (props) => {
  const {toggleColorMode} = useColorMode()
  const text = useColorModeValue("dark", "light")
  const SwitchIcon = useColorModeValue(FaMoon, FaSun)
  const helperText = `Switch to ${text} mode`
  return (
    <Tooltip label={helperText} openDelay={TOOLTIP_OPEN_DELAY}>
      <IconButton
        size="md"
        fontSize="lg"
        variant="ghost"
        color="current"
        marginLeft="2"
        onClick={toggleColorMode}
        icon={<SwitchIcon/>}
        aria-label={helperText}
        {...props}
      />
    </Tooltip>
  )
}
