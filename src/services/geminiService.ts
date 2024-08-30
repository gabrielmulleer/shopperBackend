import { v4 as uuidv4 } from 'uuid'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function processImageWithGeminiAPI(
  base64Image: string,
  measureType: string,
) {
  // Inicialize o cliente Gemini

  const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY || 'YOUR_DEFAULT_API_KEY',
  )
  const generationConfig = {
    temperature: 1.45,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: 'application/json',
  }
  // Crie um modelo para processar imagens
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: generationConfig,
  })
  try {
    const prompt = `Analyze the ${measureType.toLowerCase()} meter and return the value found in the following json structure
{value: value found}`
    // Prepare a imagem para o Gemini
    const image = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image,
      },
    }

    // Faça a chamada para o Gemini
    const result = await model.generateContent([prompt, image])

    const response = result.response
    const measureValue = JSON.parse(response.text())
    const floatMeasureValue = parseFloat(measureValue.value)
    // Gere um GUID
    const measureUuid = uuidv4()

    return {
      success: true,
      value: floatMeasureValue,
      uuid: measureUuid,
    }
  } catch (error: any) {
    console.error('Error calling Google Gemini API:', error)
    return { success: false, error: error.message as string }
  }
}
