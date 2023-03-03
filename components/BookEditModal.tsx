import React, {useRef, useState} from "react"
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay} from "@chakra-ui/modal"
import {Button, FormControl, FormLabel, Text, Textarea} from "@chakra-ui/react"
import {Input} from "@chakra-ui/input"

interface Props {
  title: string,
  description: string,
  notes: string,
  source: string,
  open: boolean,
  onSave: (newDescription: string, newNotes: string, newSource: string) => void,
  onCancel: () => void,
}

export default function BookEditModal({title, description, notes, source, open, onSave, onCancel}: Props) {
  const initialRef = useRef(null)

  const [newDescription, setNewDescription] = useState(description)
  const [newNotes, setNewNotes] = useState(notes)
  const [newSource, setNewSource] = useState(source)

  function closeComplete() {
    setNewDescription(description)
    setNewNotes(notes)
    setNewSource(source)
  }

  return (
    <Modal
      initialFocusRef={initialRef}
      isOpen={open}
      onClose={onCancel}
      onCloseComplete={closeComplete}
      closeOnOverlayClick={false}
      size="2xl"
    >
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>Editing {title}</ModalHeader>
        <ModalBody pb={6}>
          <Text>Book title and author can only be changed by editing contents of your data directory.</Text>

          <FormControl mt={4}>
            <FormLabel>Description</FormLabel>
            <Textarea ref={initialRef} value={newDescription} onChange={(e) => setNewDescription(e.target.value)}/>
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Notes</FormLabel>
            <Textarea value={newNotes} onChange={(e) => setNewNotes(e.target.value)}/>
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Source</FormLabel>
            <Input value={newSource} onChange={(e) => setNewSource(e.target.value)}/>
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme='blue'
            mr={3}
            onClick={() => onSave(newDescription, newNotes, newSource)}
          >
            Save
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
