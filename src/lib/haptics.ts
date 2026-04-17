function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}

export const haptics = {
  light: () => vibrate(10),
  medium: () => vibrate(25),
  success: () => vibrate([10, 50, 10]),
  error: () => vibrate([50, 30, 50]),
  notification: () => vibrate([10, 100, 10]),
}
