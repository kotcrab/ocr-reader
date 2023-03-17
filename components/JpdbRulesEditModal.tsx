import React, {useRef, useState} from "react"
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay} from "@chakra-ui/modal"
import {Button, Spacer, Text, Textarea, useToast, VStack} from "@chakra-ui/react"
import {JpdbRule, jpdbRuleSchema} from "../model/JpdbRule"
import {array} from "yup"


interface Props {
  rules: JpdbRule[],
  defaultRules: JpdbRule[],
  open: boolean,
  onSave: (newRules: JpdbRule[]) => void,
  onCancel: () => void,
}

export default function JpdbRulesEditModal({rules, defaultRules, open, onSave, onCancel}: Props) {
  const toast = useToast()

  const initialRef = useRef(null)

  const [newRules, setNewRules] = useState(stringifyRules(rules))
  const [validationError, setValidationError] = useState("")

  function closeComplete() {
    setNewRules(stringifyRules(rules))
    setValidationError("")
  }

  function finish() {
    try {
      onSave(array(jpdbRuleSchema).validateSync(JSON.parse(newRules)) as JpdbRule[])
      toast({
        description: "Don't forget to save your settings",
        status: "info",
        duration: 2000,
        isClosable: true,
      })
    } catch (e: any) {
      console.log(e)
      if (e instanceof Error) {
        setValidationError("Validation error: " + e.message)
      } else {
        setValidationError("Unknown error")
      }
    }
  }

  return (
    <Modal
      initialFocusRef={initialRef}
      isOpen={open}
      onClose={onCancel}
      onCloseComplete={closeComplete}
      closeOnOverlayClick={false}
      closeOnEsc={false}
      size="2xl">
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>Editing JPDB rules</ModalHeader>
        <ModalBody pb={6}>
          <VStack alignItems="start">
            <Textarea
              fontFamily="monospace"
              rows={30}
              ref={initialRef}
              value={newRules}
              onChange={(e) => {
                setNewRules(e.target.value)
                setValidationError("")
              }}/>
            {validationError && <Text color="tomato">{validationError}</Text>}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" variant="link" onClick={() => setNewRules(stringifyRules(defaultRules))}>
            Restore defaults
          </Button>
          <Spacer/>
          <Button colorScheme="blue" mr={3} onClick={finish}>Finish</Button>
          <Button onClick={onCancel}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

function stringifyRules(rules: JpdbRule[]): string {
  return JSON.stringify(rules, null, 2)
}
