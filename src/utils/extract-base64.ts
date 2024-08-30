export const extractBase64FromDataUri = (dataUri: string): string | null => {
  const matches = dataUri.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
  if (matches && matches.length === 3) {
    return matches[2]
  }
  return null
}
