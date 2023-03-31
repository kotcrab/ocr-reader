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
  Select,
  Text,
  useColorModeValue,
  useToast,
  VStack,
} from "@chakra-ui/react"
import React, {useState} from "react"
import NavBar from "../components/NavBar"
import {services} from "../service/Services"
import {Input} from "@chakra-ui/input"
import {AppSettings} from "../model/AppSettings"
import RestoreDefaultValueButton from "../components/RestoreDefaultValueButton"
import {Api} from "../util/Api"
import JpdbRulesEditModal from "../components/JpdbRulesEditModal"
import PopupPositionSelect from "../components/PopupPositionSelect"
import {FloatingPageTurnAction} from "../model/FloatingPageTurnAction"
import {useImmer} from "use-immer"

interface Props {
  initialAppSettings: AppSettings,
  defaultAppSettings: AppSettings,
}

export default function Settings({initialAppSettings, defaultAppSettings}: Props) {
  const toast = useToast()

  const [appSettings, updateAppSettings] = useImmer(initialAppSettings)

  const [jpdbRulesEditPending, setJpdbRulesEditPending] = useState(false)

  const helperTextColor = useColorModeValue("gray.600", "whiteAlpha.600")

  async function saveSettings() {
    try {
      toast.closeAll()
      await Api.updateAppSettings(appSettings)
      toast({
        description: "Settings saved",
        status: "success",
        duration: 1200,
      })
    } catch (e: any) {
      console.log(e)
      toast({
        description: e.message,
        status: "error",
        duration: 3000,
      })
    }
  }

  return (
    <>
      <PageHead/>
      <main>
        <JpdbRulesEditModal
          rules={appSettings.jpdbRules}
          defaultRules={defaultAppSettings.jpdbRules}
          open={jpdbRulesEditPending}
          onSave={(newJpdbRules) => {
            updateAppSettings(it => {
              it.jpdbRules = newJpdbRules
            })
            setJpdbRulesEditPending(false)
          }}
          onCancel={() => setJpdbRulesEditPending(false)}
        />
        <Flex p={4} align="stretch" direction="column">
          <NavBar/>
          <Container maxW="xl">
            <VStack spacing="8">
              <Text fontSize="2xl">Settings</Text>

              <Text fontSize="xl">General</Text>
              <Checkbox
                alignSelf="start"
                isChecked={appSettings.readingTimerEnabled}
                onChange={e => updateAppSettings(it => {
                  it.readingTimerEnabled = e.target.checked
                })}>
                Enable reading timer
              </Checkbox>

              <Text fontSize="xl">Floating page</Text>
              <Text color={helperTextColor}>Customize reader behavior when using floating page view.</Text>
              <Checkbox
                alignSelf="start"
                isChecked={appSettings.floatingPage.panningVelocity}
                onChange={e => updateAppSettings(it => {
                  it.floatingPage.panningVelocity = e.target.checked
                })}>
                Panning has velocity effect
              </Checkbox>
              <Checkbox
                alignSelf="start"
                isChecked={appSettings.floatingPage.limitToBounds}
                onChange={e => updateAppSettings(it => {
                  it.floatingPage.limitToBounds = e.target.checked
                })}>
                Limit panning to screen bounds
              </Checkbox>
              <VStack alignSelf="stretch" spacing={3}>
                <FormControl>
                  <FormLabel>On page turn</FormLabel>
                  <HStack pb={0}>
                    <Select
                      value={appSettings.floatingPage.turnAction}
                      onChange={e => updateAppSettings(it => {
                        it.floatingPage.turnAction = e.target.value as FloatingPageTurnAction
                      })}>
                      <option value={FloatingPageTurnAction.FitToScreen}>Fit to screen</option>
                      <option value={FloatingPageTurnAction.CenterViewKeepZoom}>Center view, keep current zoom</option>
                      <option value={FloatingPageTurnAction.CenterViewResetZoom}>Center view, reset zoom</option>
                      <option value={FloatingPageTurnAction.KeepCurrentView}>Keep current view</option>
                    </Select>
                    <RestoreDefaultValueButton
                      onClick={() => updateAppSettings(it => {
                        it.floatingPage.turnAction = defaultAppSettings.floatingPage.turnAction
                      })}/>
                  </HStack>
                </FormControl>
                {appSettings.floatingPage.turnAction !== FloatingPageTurnAction.KeepCurrentView &&
                  <Checkbox
                    alignSelf="start"
                    isChecked={appSettings.floatingPage.animateTurn}
                    onChange={e => updateAppSettings(it => {
                      it.floatingPage.animateTurn = e.target.checked
                    })}>
                    Animate this transition
                  </Checkbox>}
              </VStack>

              <Text fontSize="xl">Text hooker</Text>
              <FormControl>
                <FormLabel>WebSocket URL</FormLabel>
                <HStack>
                  <Input
                    value={appSettings.textHookerWebSocketUrl}
                    onChange={e => updateAppSettings(it => {
                      it.textHookerWebSocketUrl = e.target.value
                    })}/>
                  <RestoreDefaultValueButton
                    onClick={() => updateAppSettings(it => {
                      it.textHookerWebSocketUrl = defaultAppSettings.textHookerWebSocketUrl
                    })}/>
                </HStack>
                <FormHelperText>WebSocket URL used for the text hooker page.</FormHelperText>
              </FormControl>

              <Text fontSize="xl">JPDB integration</Text>
              <FormControl>
                <FormLabel>API key</FormLabel>
                <HStack>
                  <Input
                    type="password"
                    value={appSettings.jpdbApiKey}
                    onChange={e => updateAppSettings(it => {
                      it.jpdbApiKey = e.target.value
                    })}/>
                  <RestoreDefaultValueButton
                    onClick={() => updateAppSettings(it => {
                      it.jpdbApiKey = defaultAppSettings.jpdbApiKey
                    })}/>
                </HStack>
                <FormHelperText>JPDB API key used for text parsing and words highlighting.</FormHelperText>
              </FormControl>
              <FormControl>
                <FormLabel>Mining deck ID</FormLabel>
                <HStack>
                  <Input
                    type="number"
                    value={appSettings.jpdbMiningDeckId}
                    onChange={e => updateAppSettings(it => {
                      it.jpdbMiningDeckId = parseInt(e.target.value)
                    })}/>
                  <RestoreDefaultValueButton
                    onClick={() => updateAppSettings(it => {
                      it.jpdbMiningDeckId = defaultAppSettings.jpdbMiningDeckId
                    })}/>
                </HStack>
                <FormHelperText>Mined words will be added to this JPDB deck.</FormHelperText>
              </FormControl>
              <FormControl>
                <FormLabel>Horizontal text popup position</FormLabel>
                <HStack>
                  <PopupPositionSelect
                    value={appSettings.jpdbHorizontalTextPopupPosition}
                    onChange={value => updateAppSettings(it => {
                      it.jpdbHorizontalTextPopupPosition = value
                    })}/>
                  <RestoreDefaultValueButton
                    onClick={() => updateAppSettings(it => {
                      it.jpdbHorizontalTextPopupPosition = defaultAppSettings.jpdbHorizontalTextPopupPosition
                    })}/>
                </HStack>
              </FormControl>
              <FormControl>
                <FormLabel>Vertical text popup position</FormLabel>
                <HStack>
                  <PopupPositionSelect
                    value={appSettings.jpdbVerticalTextPopupPosition}
                    onChange={value => updateAppSettings(it => {
                      it.jpdbVerticalTextPopupPosition = value
                    })}
                  />
                  <RestoreDefaultValueButton
                    onClick={() => updateAppSettings(it => {
                      it.jpdbVerticalTextPopupPosition = defaultAppSettings.jpdbVerticalTextPopupPosition
                    })}
                  />
                </HStack>
              </FormControl>
              <FormControl>
                <FormLabel>Rules</FormLabel>
                <Button onClick={() => setJpdbRulesEditPending(true)}>Edit</Button>
                <FormHelperText>Configure colors and which words should be highlighted.</FormHelperText>
              </FormControl>

              <Box pt={8} pb={12}>
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
      initialAppSettings: appSettings,
      defaultAppSettings: defaultAppSettings,
    },
  }
}
