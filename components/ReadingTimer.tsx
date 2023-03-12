import React, {useEffect, useState} from "react"
import {
  ButtonGroup,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import {MdPause, MdPlayArrow, MdSettingsBackupRestore, MdTimer} from "react-icons/md"
import {TOOLTIP_OPEN_DELAY} from "../util/Util"
import {ReadingUnitType} from "../model/ReadingUnitType"

const SECOND = 1000
const MINUTE = SECOND * 60
const HOUR = MINUTE * 60

interface Props {
  charactersRead: number
  unitsRead: number
  unitType: ReadingUnitType,
  onReset: () => void
}

export default function ReadingTimer({charactersRead, unitsRead, unitType, onReset}: Props) {
  const [startTime, setStartTime] = useState(Date.now())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [committedTime, setCommittedTime] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => setElapsedTime(Date.now() - startTime), 1000)
    return () => clearInterval(interval)
  }, [startTime, elapsedTime])

  function pauseResume() {
    if (paused) {
      setStartTime(Date.now())
      setElapsedTime(0)
      setPaused(false)
    } else {
      setCommittedTime(committedTime + elapsedTime)
      setPaused(true)
    }
  }

  function reset() {
    setStartTime(Date.now())
    setElapsedTime(0)
    setCommittedTime(0)
    setPaused(false)
    onReset()
  }

  const totalElapsedTime = paused ? committedTime : committedTime + elapsedTime
  const totalElapsedTimeSeconds = totalElapsedTime / 1000
  const timerText = getTimerText(totalElapsedTime)
  const charactersPerHour = calculateSpeed(totalElapsedTimeSeconds, charactersRead, 3600)
  const charactersPerMinute = calculateSpeed(totalElapsedTimeSeconds, charactersRead, 60)

  return (
    <Popover>
      <PopoverTrigger>
        <IconButton
          size="md"
          fontSize="lg"
          variant="ghost"
          color="current"
          icon={<MdTimer/>}
          aria-label={"Reading timer"}
        />
      </PopoverTrigger>
      <Portal>
        <PopoverContent width="unset" minWidth="200px">
          <PopoverArrow/>
          <PopoverHeader fontWeight='bold' border="0">Reading timer</PopoverHeader>
          <PopoverBody>
            <Text>{timerText} elapsed</Text>
            <Text>{unitsRead} {getUnitName(unitsRead, unitType)}</Text>
            <Text>{charactersRead} {charactersRead == 1 ? "character" : "characters"}</Text>
            <Text>({charactersPerHour}/h, {charactersPerMinute}/min)</Text>
          </PopoverBody>
          <PopoverFooter border="0">
            <ButtonGroup size='sm'>
              <Tooltip label="Reset" openDelay={TOOLTIP_OPEN_DELAY}>
                <IconButton
                  fontSize="lg"
                  colorScheme="red"
                  icon={<MdSettingsBackupRestore/>}
                  onClick={reset}
                  aria-label={"Reset"}
                />
              </Tooltip>
              <Tooltip label={paused ? "Resume" : "Pause"} openDelay={TOOLTIP_OPEN_DELAY}>
                <IconButton
                  fontSize="lg"
                  colorScheme={paused ? "green" : "blue"}
                  icon={paused ? <MdPlayArrow/> : <MdPause/>}
                  onClick={pauseResume}
                  aria-label={"Pause/Resume"}
                />
              </Tooltip>
            </ButtonGroup>
          </PopoverFooter>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}

function calculateSpeed(elapsedTimeSeconds: number, charactersRead: number, secondsInTimeUnit: number) {
  if (elapsedTimeSeconds == 0) {
    return 0
  }
  return Math.round(charactersRead * secondsInTimeUnit / (elapsedTimeSeconds))
}

function getTimerText(time: number) {
  return [
    (time / HOUR),
    (time / MINUTE) % 60,
    (time / SECOND) % 60,
  ]
    .map(it => Math.floor(it).toString().padStart(2, "0"))
    .join(":")
}

function getUnitName(units: number, type: ReadingUnitType) {
  switch (type) {
    case ReadingUnitType.Pages:
      return units === 1 ? "page" : "pages"
    case ReadingUnitType.Entries:
      return units === 1 ? "entry" : "entries"
  }
  throw new Error("Unhandled timer unit name")
}
