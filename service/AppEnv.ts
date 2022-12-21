export class AppEnv {
  readonly dataDirectory = getEnvOrThrow("DATA_DIRECTORY")
  // noinspection JSUnusedLocalSymbols
  private googleApplicationCredentials = getEnvOrThrow("GOOGLE_APPLICATION_CREDENTIALS")
}

function getEnvOrThrow(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Environment variable '${name}' is missing!`)
  }
  return value
}

function getEnvOrElse(name: string, fallback: string): string {
  const value = process.env[name]
  if (!value) {
    return fallback
  }
  return value
}
