import PageHead from "../components/PageHead"
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react"
import React from "react"
import NavBar from "../components/NavBar"
import {services} from "../service/Services"
import {Input} from "@chakra-ui/input"
import {AppSettings} from "../model/AppSettings"
import {appSettingsUrl, isValidWebSocketUrl} from "../util/Url"
import RestoreDefaultValueButton from "../components/RestoreDefaultValueButton";

interface Props {
  appSettings: AppSettings,
  defaultAppSettings: AppSettings,
}

export default function TextHooker({appSettings, defaultAppSettings}: Props) {
  const [jpdbSid, setJpdbSid] = React.useState(appSettings.jpdbSid)
  const [textHookerWebSocketUrl, setTextHookerWebSocketUrl] = React.useState(appSettings.textHookerWebSocketUrl)
  const [settingsSaved, setSettingsSaved] = React.useState(false)
  const [settingsInvalid, setSettingsInvalid] = React.useState(false)
  const [settingsInvalidMessage, setSettingsInvalidMessage] = React.useState("")

  async function saveSettings() {
    if (!isValidWebSocketUrl(textHookerWebSocketUrl)) {
      setSettingsSaved(false)
      setSettingsInvalid(true)
      setSettingsInvalidMessage("WebSocket URL is not valid")
      return
    }
    const newAppSettings: AppSettings = {
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
  const appSettings = await services.storageService.readAppSettings()
  const defaultAppSettings = await services.storageService.defaultAppSettings()
  return {
    props: {
      appSettings: appSettings,
      defaultAppSettings: defaultAppSettings,
    },
  }
}
