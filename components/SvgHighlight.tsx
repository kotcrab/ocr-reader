import * as React from "react"
import {useState} from "react"
import {JpdbVocabulary} from "../model/JpdbVocabulary"
import {Rectangle} from "../model/Rectangle"
import {
  Box,
  Button,
  HStack,
  Link,
  ListItem,
  OrderedList,
  Portal,
  Spacer,
  Text,
  useColorModeValue,
  usePopper,
  VStack
} from "@chakra-ui/react"

interface Props {
  bounds: Rectangle,
  color: string,
  vocabulary?: JpdbVocabulary,
  popupOpen: boolean,
}

export default function SvgHighlight({bounds, color, vocabulary, popupOpen}: Props) {
  const {popperRef, referenceRef} = usePopper({placement: "right"})

  const popupBg = useColorModeValue("gray.200", "gray.900")
  const commonColor = useColorModeValue("green.700", "green.500")

  const [mouseOverPopup, setMouseOverPopup] = useState(false)

  return <>
    <rect
      x={bounds.x}
      y={bounds.y}
      width={bounds.w}
      height={bounds.h}
      style={{fill: color}}
      ref={referenceRef}
    />
    {(popupOpen || mouseOverPopup) && vocabulary && <Portal>
      <Box
        ref={popperRef}
        bg={popupBg}
        opacity={0.9}
        p={3}
        maxW="400px"
        boxShadow="dark-lg"
        onMouseEnter={() => setMouseOverPopup(true)}
        onMouseLeave={() => setMouseOverPopup(false)}
      >
        <VStack alignItems="start" spacing={0}>
          <HStack spacing={1} pb={3} alignSelf="stretch">
            <Button colorScheme="blue" size="xs" fontSize="2xs">
              Add
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
          <Text fontSize="sm" color={vocabulary.frequencyRank < 30000 ? commonColor : undefined}>
            Top {vocabulary.frequencyRank}
          </Text>
          <OrderedList pt={3} pl={4}>
            {vocabulary.meanings.map((meaning, index) => <ListItem key={index} fontSize="sm">{meaning}</ListItem>)}
          </OrderedList>
        </VStack>
      </Box>
    </Portal>
    }
  </>
}
