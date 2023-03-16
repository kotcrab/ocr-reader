import React, {useRef, useState} from "react"
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay} from "@chakra-ui/modal"
import {Button, Text, Textarea, VStack} from "@chakra-ui/react"
import {JpdbRule, jpdbRuleSchema} from "../model/JpdbRule"
import {array} from "yup"


interface Props {
  rules: JpdbRule[],
  open: boolean,
  onSave: (newRules: JpdbRule[]) => void,
  onCancel: () => void,
}

export default function JpdbRulesEditModal({rules, open, onSave, onCancel}: Props) {
  const initialRef = useRef(null)

  const [newRules, setNewRules] = useState(JSON.stringify(rules, null, 2))
  const [validationError, setValidationError] = useState("")

  function closeComplete() {
    setNewRules(JSON.stringify(rules, null, 2))
    setValidationError("")
  }

  function finish() {
    try {
      onSave(array(jpdbRuleSchema).validateSync(JSON.parse(newRules)) as JpdbRule[])
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
          <Button colorScheme="blue" mr={3} onClick={finish}>Finish</Button>
          <Button onClick={onCancel}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
