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
import {JpdbDeckId} from "../model/Jpdb"
import {JpdbCardState} from "../model/JpdbCardState"

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
  }: Props, ref: ForwardedRef<HTMLDivElement>) {
  const toast = useToast()

  const [expanded, setExpanded] = useState(!compact)

  const popupBgColor = useColorModeValue("gray.200", "gray.900")
  const commonVocabularyColor = useColorModeValue("green.700", "green.500")

  async function addToDeck(deckId: JpdbDeckId, friendlyName: string) {
    try {
      await Api.modifyDeck(deckId, vocabulary.vid, vocabulary.sid, "add")
      toast({
        description: `Added ${vocabulary.spelling} to the ${friendlyName} deck`,
        status: "success",
        duration: TOAST_DURATION,
      })
    } catch (e) {
      console.log(e)
      toast({
        description: `Could not add ${vocabulary.spelling} to the ${friendlyName} deck`,
        status: "error",
        duration: TOAST_DURATION,
      })
    }
  }

  async function removeFromDeck(deckId: JpdbDeckId, friendlyName: string) {
    try {
      await Api.modifyDeck(deckId, vocabulary.vid, vocabulary.sid, "remove")
      toast({
        description: `Removed ${vocabulary.spelling} from the ${friendlyName} deck`,
        status: "success",
        duration: TOAST_DURATION,
      })
    } catch (e) {
      console.log(e)
      toast({
        description: `Could not remove ${vocabulary.spelling} from the ${friendlyName} deck`,
        status: "error",
        duration: TOAST_DURATION,
      })
    }
  }

  const isInBlacklist = vocabulary.cardStates.includes(JpdbCardState.Blacklisted)
  const isInNeverForget = vocabulary.cardStates.includes(JpdbCardState.NeverForget)

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
        <Button colorScheme="blue" size="xs" fontSize="2xs" disabled={miningDeckId <= 0}
                onClick={async () => await addToDeck(miningDeckId, "mining")}>
          Mine
        </Button>
        {isInBlacklist ?
          <Button colorScheme="red" size="xs" fontSize="2xs"
                  onClick={async () => await removeFromDeck("blacklist", "blacklist")}>
            Remove from blacklist
          </Button> :
          <Button colorScheme="red" size="xs" fontSize="2xs"
                  onClick={async () => await addToDeck("blacklist", "blacklist")}>
            Blacklist
          </Button>
        }
        {isInNeverForget ?
          <Button colorScheme="green" size="xs" fontSize="2xs"
                  onClick={async () => await removeFromDeck("never-forget", "never forget")}>
            Unmark as never forget
          </Button> :
          <Button colorScheme="green" size="xs" fontSize="2xs"
                  onClick={async () => await addToDeck("never-forget", "never forget")}>
            Never forget
          </Button>
        }
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
      <Text fontSize="sm" color={vocabulary.frequencyRank < 30000 ? commonVocabularyColor : undefined}>
        Top {vocabulary.frequencyRank}
      </Text>
      {expanded ?
        <OrderedList pt={3} pl={4}>
          {vocabulary.meanings.map((meaning, index) => <ListItem key={index} fontSize="sm">{meaning}</ListItem>)}
        </OrderedList> :
        <Button pt={3} variant="link" size="sm" onClick={() => setExpanded(true)}>Show definitions</Button>
      }
    </VStack>
  </Box>
}
