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
  VStack,
} from "@chakra-ui/react"
import * as React from "react"
import {ForwardedRef, forwardRef, useState} from "react"
import {JpdbVocabulary} from "../model/JpdbVocabulary"

interface Props {
  vocabulary: JpdbVocabulary,
  compact: boolean,
  onMouseOver: (over: boolean) => void,
}

export const JpdbPopupDialog = forwardRef<HTMLDivElement, Props>(JpdbPopupDialogInternal)

function JpdbPopupDialogInternal({vocabulary, compact, onMouseOver}: Props, ref: ForwardedRef<HTMLDivElement>) {
  const [expanded, setExpanded] = useState(!compact)

  const popupBgColor = useColorModeValue("gray.200", "gray.900")
  const commonVocabularyColor = useColorModeValue("green.700", "green.500")

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
        <Button colorScheme="blue" size="xs" fontSize="2xs">
          Mine
        </Button>
        <Button colorScheme="red" size="xs" fontSize="2xs">
          Blacklist
        </Button>
        <Button colorScheme="green" size="xs" fontSize="2xs">
          Never forget
        </Button>
      </HStack>
      <HStack alignSelf="stretch">
        <Text fontSize="2xl">
          <Link
            href={`https://jpdb.io/vocabulary/${vocabulary.vid}/${encodeURIComponent(vocabulary.spelling)}/${encodeURIComponent(vocabulary.reading)}`}
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
        <Button pt={3} variant='link' size='sm' onClick={() => setExpanded(true)}>Show definitions</Button>
      }
    </VStack>
  </Box>
}
