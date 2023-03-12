import PageHead from "../components/PageHead"
import {
  Alert,
  AlertIcon,
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

interface Props {
  appSettings: AppSettings,
  defaultAppSettings: AppSettings,
}

export default function Settings({appSettings, defaultAppSettings}: Props) {
  const [readingTimerEnabled, setReadingTimerEnabled] = useState(appSettings.readingTimerEnabled)
  const [jpdbApiKey, setJpdbApiKey] = useState(appSettings.jpdbApiKey)
  const [textHookerWebSocketUrl, setTextHookerWebSocketUrl] = useState(appSettings.textHookerWebSocketUrl)

  const [settingsSaved, setSettingsSaved] = useState(false)
  const [settingsInvalid, setSettingsInvalid] = useState(false)
  const [settingsInvalidMessage, setSettingsInvalidMessage] = useState("")

  async function saveSettings() {
    if (!isValidWebSocketUrl(textHookerWebSocketUrl)) {
      setSettingsSaved(false)
      setSettingsInvalid(true)
      setSettingsInvalidMessage("WebSocket URL is not valid")
      return
    }
    await Api.updateAppSettings({
      readingTimerEnabled: readingTimerEnabled,
      jpdbApiKey: jpdbApiKey,
      textHookerWebSocketUrl: textHookerWebSocketUrl,
    })
    setSettingsSaved(true)
    setSettingsInvalid(false)
  }

  return (
    <>
      <PageHead/>
      <main>
        <Flex p={4} align="stretch" direction="column">
          <NavBar/>
          <Container maxW='xl'>
            <VStack alignItems="center" spacing="8">
              {settingsSaved ? <Alert status="success">
                <AlertIcon/>
                Settings saved
              </Alert> : null}
              {settingsInvalid ? <Alert status="error">
                <AlertIcon/>
                {settingsInvalidMessage}
              </Alert> : null}
              <Text fontSize="2xl">Settings</Text>
              <Text fontSize="xl">General</Text>
              <VStack alignSelf="start">
                <Checkbox isChecked={readingTimerEnabled}
                          onChange={event => setReadingTimerEnabled(event.target.checked)}>
                  Enable reading timer
                </Checkbox>
              </VStack>
              <Text fontSize="xl">Integrations</Text>
              <FormControl>
                <FormLabel>JPDB API key</FormLabel>
                <HStack>
                  <Input value={jpdbApiKey} onChange={event => setJpdbApiKey(event.target.value)}/>
                  <RestoreDefaultValueButton onClick={() => setJpdbApiKey(defaultAppSettings.jpdbApiKey)}/>
                </HStack>
                <FormHelperText>Value of the JPDB API key, used for text parsing and words highlighting.</FormHelperText>
              </FormControl>
              <FormControl>
                <FormLabel>Text hooker WebSocket URL</FormLabel>
                <HStack>
                  <Input value={textHookerWebSocketUrl}
                         onChange={event => setTextHookerWebSocketUrl(event.target.value)}/>
                  <RestoreDefaultValueButton
                    onClick={() => setTextHookerWebSocketUrl(defaultAppSettings.textHookerWebSocketUrl)}/>
                </HStack>
                <FormHelperText>WebSocket URL used for the text hooker page.</FormHelperText>
              </FormControl>
              <Box pt={4}>
                <Button variant='solid' colorScheme='blue' onClick={saveSettings}>
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
