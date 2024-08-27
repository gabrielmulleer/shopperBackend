import axios from 'axios'

export const processImageWithGeminiAPI = async (image_base64: string) => {
  try {
    const response = await axios.post('https://api.google.com/gemini', {
      image: image_base64,
      apiKey: process.env.GEMINI_API_KEY,
    })

    const { data } = response

    if (data.success) {
      return {
        success: true,
        value: data.measure_value,
        image_url: data.image_url,
        uuid: data.measure_uuid,
      }
    } else {
      return { success: false, error: data.error }
    }
  } catch (error: any) {
    console.error('Error calling Google Gemini API:', error)
    return { success: false, error: error.message as string }
  }
}
