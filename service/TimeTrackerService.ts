import {SettingsService} from "./SettingsService"
import {RequestError} from "../util/RequestError"

const minElapsedTime = 30 * 1000

export class TimeTrackerService {
  private readonly settingsService: SettingsService

  constructor(settingsService: SettingsService) {
    this.settingsService = settingsService
  }

  async addTimeEntry(description: string, startTime: number, elapsedTime: number) {
    const timeTracker = (await this.settingsService.getAppSettings()).timeTracker
    if (!timeTracker.apiKey || !timeTracker.workspaceId) {
      return
    }
    if (elapsedTime < minElapsedTime) {
      console.log(`Ignoring too short time entry: ${elapsedTime} < ${minElapsedTime} ms`)
      return
    }
    const response = await fetch(
      `https://api.track.toggl.com/api/v9/workspaces/${timeTracker.workspaceId}/time_entries`,
      {
        method: "POST",
        headers: {
          "Authorization": "Basic " + Buffer.from(timeTracker.apiKey + ":" + "api_token").toString("base64"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          created_with: "OCR Reader",
          workspace_id: timeTracker.workspaceId,
          project_id: timeTracker.projectId,
          description: description,
          start: new Date(startTime).toISOString(),
          duration: Math.round(elapsedTime / 1000),
        }),
      })
    if (!response.ok) {
      console.log(await response.json())
      throw new RequestError("Could not add time entry")
    }
    console.log(`Added time entry: ${elapsedTime} ms`)
  }
}
