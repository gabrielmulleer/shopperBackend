import { v4 as uuidv4 } from 'uuid'
import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
dotenv.config()
// Função para gerar um URL temporário (mock)
function generateTempUrl(base64Image: string): string {
  // Na prática, você precisaria implementar uma lógica para armazenar
  // a imagem e gerar uma URL temporária real
  return `https://temp-image-storage.com/${uuidv4()}.jpg`
}
//
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
    // Gere um GUID
    const measureUuid = uuidv4()

    // Gere uma URL temporária para a imagem
    const imageUrl = generateTempUrl(base64Image)

    return {
      success: true,
      value: measureValue.value,
      image_url: imageUrl,
      uuid: measureUuid,
    }
  } catch (error: any) {
    console.error('Error calling Google Gemini API:', error)
    return { success: false, error: error.message as string }
  }
}
