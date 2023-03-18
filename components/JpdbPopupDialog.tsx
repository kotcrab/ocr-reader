import {
  Box,
  Button,
  HStack,
  Link,
  ListItem,
  OrderedList,
  Spacer,
  Text,
  useColorModeValue,
  useToast,
  VStack,
} from "@chakra-ui/react"
import * as React from "react"
import {ForwardedRef, forwardRef, useState} from "react"
import {JpdbVocabulary} from "../model/JpdbVocabulary"
import {JPDB_BASE} from "../util/JpdbUitl"
import {Api} from "../util/Api"
import {JpdbDeckId, JpdbStandardDeckId} from "../model/JpdbDeckId"
import {JpdbCardState} from "../model/JpdbCardState"
import {JpdbDeckUpdateMode} from "../model/JpdbDeckUpdateMode"

interface Props {
  vocabulary: JpdbVocabulary,
  miningDeckId: number,
  compact: boolean,
  onMouseOver: (over: boolean) => void,
}

export const JpdbPopupDialog = forwardRef<HTMLDivElement, Props>(JpdbPopupDialogInternal)

const TOAST_DURATION = 1200

function JpdbPopupDialogInternal(
  {
    vocabulary,
    miningDeckId,
    compact,
    onMouseOver,
  }: Props, ref: ForwardedRef<HTMLDivElement>
) {
  const toast = useToast()

  const [expanded, setExpanded] = useState(!compact)

  const popupBgColor = useColorModeValue("gray.200", "gray.900")
  const commonVocabularyColor = useColorModeValue("green.700", "green.500")

  const isInBlacklist = vocabulary.cardStates.includes(JpdbCardState.Blacklisted)
  const isInNeverForget = vocabulary.cardStates.includes(JpdbCardState.NeverForget)

  function showSuccessToast(message: string) {
    toast({
      description: message,
      status: "success",
      duration: TOAST_DURATION,
    })
  }

  function showErrorToast(message: string) {
    toast({
      description: message,
      status: "error",
      duration: TOAST_DURATION,
    })
  }

  async function addToDeck(deckId: JpdbDeckId, friendlyName: string) {
    try {
      await Api.modifyDeck(deckId, vocabulary.vid, vocabulary.sid, JpdbDeckUpdateMode.Add)
      showSuccessToast(`Added ${vocabulary.spelling} to the ${friendlyName} deck`)
    } catch (e) {
      console.log(e)
      showErrorToast(`Could not add ${vocabulary.spelling} to the ${friendlyName} deck`)
    }
  }

  async function removeFromDeck(deckId: JpdbDeckId, friendlyName: string) {
    try {
      await Api.modifyDeck(deckId, vocabulary.vid, vocabulary.sid, JpdbDeckUpdateMode.Remove)
      showSuccessToast(`Removed ${vocabulary.spelling} from the ${friendlyName} deck`)
    } catch (e) {
      console.log(e)
      showErrorToast(`Could not remove ${vocabulary.spelling} from the ${friendlyName} deck`)
    }
  }

  async function toggleInDeck(isInDeck: boolean, deckId: JpdbDeckId, friendlyName: string) {
    if (isInDeck) {
      await removeFromDeck(deckId, friendlyName)
    } else {
      await addToDeck(deckId, friendlyName)
    }
  }

  return <Box
    ref={ref}
    bg={popupBgColor}
    opacity={0.9}
    p={3}
    maxW="400px"
    boxShadow="dark-lg"
    onMouseEnter={() => onMouseOver(true)}
    onMouseLeave={() => onMouseOver(false)}
  >
    <VStack alignItems="start" spacing={0}>
      <HStack spacing={1} pb={3} alignSelf="stretch">
        <Button
          colorScheme="blue" size="xs" fontSize="2xs"
          disabled={miningDeckId <= 0}
          onClick={async () => await addToDeck(miningDeckId, "mining")}>
          Mine
        </Button>
        <Button
          colorScheme="red" size="xs" fontSize="2xs"
          onClick={async () => toggleInDeck(isInBlacklist, JpdbStandardDeckId.Blacklist, "blacklist")}>
          {isInBlacklist ? "Remove from blacklist" : "Blacklist"}
        </Button>
        <Button
          colorScheme="green" size="xs" fontSize="2xs"
          onClick={async () => toggleInDeck(isInNeverForget, JpdbStandardDeckId.NeverForget, "never forget")}>
          {isInNeverForget ? "Unmark as never forget" : "Never forget"}
        </Button>
      </HStack>
      <HStack alignSelf="stretch">
        <Text fontSize="2xl">
          <Link
            href={`${JPDB_BASE}/vocabulary/${vocabulary.vid}/${encodeURIComponent(vocabulary.spelling)}/${encodeURIComponent(vocabulary.reading)}`}
            isExternal>
            <ruby>{vocabulary.spelling}
              <rt>{vocabulary.reading !== vocabulary.spelling ? vocabulary.reading : ""}</rt>
            </ruby>
          </Link>
        </Text>
        <Spacer/>
        <VStack spacing={0} pl={3}>
          {vocabulary.cardStates.map((state, index) => <Text key={index} fontSize="sm">{state}</Text>)}
        </VStack>
      </HStack>
      {vocabulary.frequencyRank &&
        <Text fontSize="sm" color={vocabulary.frequencyRank < 30000 ? commonVocabularyColor : undefined}>
          Top {vocabulary.frequencyRank}
        </Text>}
      {expanded ?
        <OrderedList pt={3} pl={4}>
          {vocabulary.meanings.map((meaning, index) => <ListItem key={index} fontSize="sm">{meaning}</ListItem>)}
        </OrderedList> :
        <Button pt={3} variant="link" size="sm" onClick={() => setExpanded(true)}>Show definitions</Button>
      }
    </VStack>
  </Box>
}
