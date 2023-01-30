import PageHead from "../components/PageHead"
import {
  Alert,
  AlertIcon,
  Button,
  Container,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Text,
  VStack,
} from "@chakra-ui/react"
import React from "react"
import NavBar from "../components/NavBar"
import {services} from "../service/Services"
import {Input} from "@chakra-ui/input"
import {AppSettings} from "../model/AppSettings"
import {appSettingsUrl} from "../util/Url"

interface Props {
  appSettings: AppSettings,
}

export default function TextHooker({appSettings}: Props) {
  const [jpdbSid, setJpdbSid] = React.useState(appSettings.jpdbSid)
  const [settingsSaved, setSettingsSaved] = React.useState(false)

  async function saveSettings() {
    const newAppSettings: AppSettings = {
      jpdbSid: jpdbSid,
    }
    await fetch(appSettingsUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({appSettings: newAppSettings}),
    })
    setSettingsSaved(true)
  }

  return (
    <>
      <PageHead/>
      <main>
        <Flex p={4} align="stretch" direction="column">
          <NavBar/>
          <Container maxW='xl'>
            <VStack alignItems="center" spacing="8">
              <Alert status='success' hidden={!settingsSaved}>
                <AlertIcon/>
                Settings saved
              </Alert>
              <Text fontSize="2xl">Settings</Text>
              <FormControl>
                <FormLabel>JPDB SID</FormLabel>
                <Input value={jpdbSid} onChange={event => setJpdbSid(event.target.value)}/>
                <FormHelperText>Value of the JPDB SID cookie, used for words highlighting.</FormHelperText>
              </FormControl>
              <Button variant='solid' colorScheme='blue' onClick={saveSettings}>
                Save settings
              </Button>
            </VStack>
          </Container>
        </Flex>
      </main>
    </>
  )
}

export async function getServerSideProps() {
  const appSettings = await services.storageService.readAppSettings()
  return {
    props: {
      appSettings: appSettings,
    },
  }
}
