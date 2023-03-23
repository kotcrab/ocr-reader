import PageHead from "../components/PageHead"
import {
  Box,
  Button,
  Checkbox,
  Container,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react"
import React, {useState} from "react"
import NavBar from "../components/NavBar"
import {services} from "../service/Services"
import {Input} from "@chakra-ui/input"
import {AppSettings} from "../model/AppSettings"
import {isValidWebSocketUrl} from "../util/Url"
import RestoreDefaultValueButton from "../components/RestoreDefaultValueButton"
import {Api} from "../util/Api"
import JpdbRulesEditModal from "../components/JpdbRulesEditModal"
import PopupPositionSelect from "../components/PopupPositionSelect"

interface Props {
  appSettings: AppSettings,
  defaultAppSettings: AppSettings,
}

export default function Settings({appSettings, defaultAppSettings}: Props) {
  const toast = useToast()

  const [readingTimerEnabled, setReadingTimerEnabled] = useState(appSettings.readingTimerEnabled)
  const [textHookerWebSocketUrl, setTextHookerWebSocketUrl] = useState(appSettings.textHookerWebSocketUrl)
  const [jpdbApiKey, setJpdbApiKey] = useState(appSettings.jpdbApiKey)
  const [jpdbMiningDeckId, setJpdbMiningDeckId] = useState(appSettings.jpdbMiningDeckId)
  const [jpdbRules, setJpdbRules] = useState(appSettings.jpdbRules)
  const [jpdbHorizontalTextPopupPosition, setJpdbHorizontalTextPopupPosition] = useState(appSettings.jpdbHorizontalTextPopupPosition)
  const [jpdbVerticalTextPopupPosition, setJpdbVerticalTextPopupPosition] = useState(appSettings.jpdbVerticalTextPopupPosition)

  const [jpdbRulesEditPending, setJpdbRulesEditPending] = useState(false)

  async function saveSettings() {
    if (!isValidWebSocketUrl(textHookerWebSocketUrl)) {
      toast({
        description: "WebSocket URL is not valid",
        status: "error",
        duration: 3000,
      })
      return
    }
    await Api.updateAppSettings({
      readingTimerEnabled: readingTimerEnabled,
      textHookerWebSocketUrl: textHookerWebSocketUrl,
      jpdbApiKey: jpdbApiKey,
      jpdbMiningDeckId: jpdbMiningDeckId,
      jpdbRules: jpdbRules,
      jpdbHorizontalTextPopupPosition: jpdbHorizontalTextPopupPosition,
      jpdbVerticalTextPopupPosition: jpdbVerticalTextPopupPosition,
    })
    toast({
      description: "Settings saved",
      status: "success",
      duration: 1200,
    })
  }

  return (
    <>
      <PageHead/>
      <main>
        <JpdbRulesEditModal
          rules={jpdbRules}
          defaultRules={defaultAppSettings.jpdbRules}
          open={jpdbRulesEditPending}
          onSave={(newJpdbRules) => {
            setJpdbRules(newJpdbRules)
            setJpdbRulesEditPending(false)
          }}
          onCancel={() => setJpdbRulesEditPending(false)}
        />
        <Flex p={4} align="stretch" direction="column">
          <NavBar/>
          <Container maxW="xl">
            <VStack alignItems="center" spacing="8">
              <Text fontSize="2xl">Settings</Text>

              <Text fontSize="xl">General</Text>
              <VStack alignSelf="start">
                <Checkbox isChecked={readingTimerEnabled}
                          onChange={event => setReadingTimerEnabled(event.target.checked)}>
                  Enable reading timer
                </Checkbox>
              </VStack>

              <Text fontSize="xl">Text hooker</Text>
              <FormControl>
                <FormLabel>WebSocket URL</FormLabel>
                <HStack>
                  <Input value={textHookerWebSocketUrl}
                         onChange={event => setTextHookerWebSocketUrl(event.target.value)}/>
                  <RestoreDefaultValueButton
                    onClick={() => setTextHookerWebSocketUrl(defaultAppSettings.textHookerWebSocketUrl)}/>
                </HStack>
                <FormHelperText>WebSocket URL used for the text hooker page.</FormHelperText>
              </FormControl>

              <Text fontSize="xl">JPDB integration</Text>
              <FormControl>
                <FormLabel>API key</FormLabel>
                <HStack>
                  <Input type="password" value={jpdbApiKey} onChange={event => setJpdbApiKey(event.target.value)}/>
                  <RestoreDefaultValueButton onClick={() => setJpdbApiKey(defaultAppSettings.jpdbApiKey)}/>
                </HStack>
                <FormHelperText>JPDB API key used for text parsing and words highlighting.</FormHelperText>
              </FormControl>
              <FormControl>
                <FormLabel>Mining deck ID</FormLabel>
                <HStack>
                  <Input type="number" value={jpdbMiningDeckId}
                         onChange={event => setJpdbMiningDeckId(parseInt(event.target.value))}/>
                  <RestoreDefaultValueButton onClick={() => setJpdbMiningDeckId(defaultAppSettings.jpdbMiningDeckId)}/>
                </HStack>
                <FormHelperText>Mined words will be added to this JPDB deck.</FormHelperText>
              </FormControl>
              <FormControl>
                <FormLabel>Horizontal text popup position</FormLabel>
                <HStack>
                  <PopupPositionSelect
                    value={jpdbHorizontalTextPopupPosition}
                    onChange={setJpdbHorizontalTextPopupPosition}/>
                  <RestoreDefaultValueButton
                    onClick={() => setJpdbHorizontalTextPopupPosition(defaultAppSettings.jpdbHorizontalTextPopupPosition)}/>
                </HStack>
              </FormControl>
              <FormControl>
                <FormLabel>Vertical text popup position</FormLabel>
                <HStack>
                  <PopupPositionSelect
                    value={jpdbVerticalTextPopupPosition}
                    onChange={setJpdbVerticalTextPopupPosition}/>
                  <RestoreDefaultValueButton
                    onClick={() => setJpdbVerticalTextPopupPosition(defaultAppSettings.jpdbVerticalTextPopupPosition)}/>
                </HStack>
              </FormControl>
              <FormControl>
                <FormLabel>Rules</FormLabel>
                <Button onClick={() => setJpdbRulesEditPending(true)}>Edit</Button>
                <FormHelperText>Configure colors and which words should be highlighted.</FormHelperText>
              </FormControl>

              <Box pt={8}>
                <Button variant="solid" colorScheme="blue" onClick={saveSettings}>
                  Save settings
                </Button>
              </Box>
            </VStack>
          </Container>
        </Flex>
      </main>
    </>
  )
}

export async function getServerSideProps() {
  const appSettings = await services.settingsService.getAppSettings()
  const defaultAppSettings = await services.settingsService.getDefaultAppSettings()
  return {
    props: {
      appSettings: appSettings,
      defaultAppSettings: defaultAppSettings,
    },
  }
}
