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
import {appSettingsUrl, isValidWebSocketUrl} from "../util/Url"
import RestoreDefaultValueButton from "../components/RestoreDefaultValueButton"

interface Props {
  appSettings: AppSettings,
  defaultAppSettings: AppSettings,
}

export default function TextHooker({appSettings, defaultAppSettings}: Props) {
  const [readingTimerEnabled, setReadingTimerEnabled] = useState(appSettings.readingTimerEnabled)
  const [jpdbSid, setJpdbSid] = useState(appSettings.jpdbSid)
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
    const newAppSettings: AppSettings = {
      readingTimerEnabled: readingTimerEnabled,
      jpdbSid: jpdbSid,
      textHookerWebSocketUrl: textHookerWebSocketUrl,
    }
    await fetch(appSettingsUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({appSettings: newAppSettings}),
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
                <FormLabel>JPDB SID</FormLabel>
                <HStack>
                  <Input value={jpdbSid} onChange={event => setJpdbSid(event.target.value)}/>
                  <RestoreDefaultValueButton onClick={() => setJpdbSid(defaultAppSettings.jpdbSid)}/>
                </HStack>
                <FormHelperText>Value of the JPDB SID cookie, used for words highlighting.</FormHelperText>
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
