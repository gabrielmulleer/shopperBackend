import { Request, Response } from 'express'
import Measure from '../models/Measure'
import { processImageWithGeminiAPI } from '../services/geminiService'

export const uploadMeasure = async (req: Request, res: Response) => {
  try {
    const { customer_code, image_base64, measure_type } = req.body

    if (!customer_code || !image_base64 || !measure_type) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Chama o serviço para processar a imagem usando a API do Google Gemini
    const geminiResult = await processImageWithGeminiAPI(image_base64)

    if (!geminiResult.success) {
      return res
        .status(500)
        .json({ message: 'Failed to process image', error: geminiResult.error })
    }

    // Salva a leitura no banco de dados
    const measure = new Measure({
      customer_code,
      measure_datetime: new Date(),
      measure_type,
      measure_value: geminiResult.value,
      has_confirmed: false,
      image_url: geminiResult.image_url,
      measure_uuid: geminiResult.uuid,
    })

    await measure.save()

    return res
      .status(201)
      .json({ message: 'Measure uploaded successfully', data: measure })
  } catch (error) {
    console.error('Error uploading measure:', error)
    res.status(500).json({ message: 'Server error', error })
  }
}
