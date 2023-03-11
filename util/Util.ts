export const TOOLTIP_OPEN_DELAY = 500

export function isChromiumBased() {
  // @ts-ignore
  return !!window.chrome
}
