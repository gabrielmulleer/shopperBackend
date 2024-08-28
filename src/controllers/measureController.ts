import { Request, Response } from 'express'
import Measure from '../models/Measure'
import { processImageWithGeminiAPI } from '../services/geminiService'
import moment from 'moment'
import { generateTempUrl, saveBase64Image } from '../utils/generate-image'
import { v4 as uuidv4 } from 'uuid'

// Função para validar se a string é base64
const isBase64 = (str: string) => {
  try {
    return Buffer.from(str, 'base64').toString('base64') === str
  } catch {
    return false
  }
}

export const uploadMeasure = async (req: Request, res: Response) => {
  try {
    const { customer_code, image, measure_datetime, measure_type } = req.body

    // Validações
    if (!customer_code || typeof customer_code !== 'string') {
      return res.status(400).json({
        error_code: 'INVALID_DATA',
        error_description: 'Customer code is required and must be a string',
      })
    }

    if (!image || typeof image !== 'string' || !isBase64(image)) {
      return res.status(400).json({
        error_code: 'INVALID_DATA',
        error_description:
          'Image is required and must be a valid base64 string',
      })
    }

    if (!measure_datetime || isNaN(Date.parse(measure_datetime))) {
      return res.status(400).json({
        error_code: 'INVALID_DATA',
        error_description:
          'Measure datetime is required and must be a valid date',
      })
    }

    if (!measure_type || !['WATER', 'GAS'].includes(measure_type)) {
      return res.status(400).json({
        error_code: 'INVALID_DATA',
        error_description:
          'Measure type is required and must be either WATER or GAS',
      })
    }

    // Verifica se já existe uma leitura no mês para o tipo especificado
    const startOfMonth = moment(measure_datetime).startOf('month').toDate()
    const endOfMonth = moment(measure_datetime).endOf('month').toDate()

    const existingMeasure = await Measure.findOne({
      customer_code,
      measure_type,
      measure_datetime: { $gte: startOfMonth, $lte: endOfMonth },
    })

    if (existingMeasure) {
      return res.status(409).json({
        error_code: 'DOUBLE_REPORT',
        error_description: 'Leitura do mês já realizada',
      })
    }

    // Chama o serviço para processar a imagem usando a API do Google Gemini
    const geminiResult = await processImageWithGeminiAPI(image, measure_type)
    const fileName = `${geminiResult.uuid || uuidv4()}.jpg`

    await saveBase64Image(fileName, image)
    // Gere uma URL temporária para a imagem
    const imageUrl = generateTempUrl(req, fileName)

    if (!geminiResult.success) {
      return res
        .status(500)
        .json({ message: 'Failed to process image', error: geminiResult.error })
    }
    const measure = new Measure({
      customer_code,
      measure_datetime,
      measure_type,
      measure_value: geminiResult.value,
      has_confirmed: false,
      image_url: imageUrl,
      measure_uuid: geminiResult.uuid,
    })

    await measure.save()

    return res.status(200).json({
      image_url: imageUrl,
      measure_value: measure.measure_value,
      measure_uuid: measure.measure_uuid,
    })
  } catch (error) {
    console.error('Error uploading measure:', error)
    res.status(500).json({ message: 'Server error', error })
  }
}

export const confirmMeasure = async (req: Request, res: Response) => {
  try {
    const { measure_uuid, confirmed_value } = req.body

    // Validar o tipo de dados dos parâmetros
    if (!measure_uuid || typeof measure_uuid !== 'string') {
      return res.status(400).json({
        error_code: 'INVALID_DATA',
        error_description: 'Measure UUID is required and must be a string.',
      })
    }

    if (
      typeof confirmed_value !== 'string' ||
      !/^\d+(\.\d+)?$/.test(confirmed_value)
    ) {
      return res.status(400).json({
        error_code: 'INVALID_DATA',
        error_description:
          'Confirmed value must be a string representing a decimal number.',
      })
    }

    // Verificar se o código de leitura informado existe
    const measure = await Measure.findOne({ measure_uuid })

    if (!measure) {
      return res.status(404).json({
        error_code: 'MEASURE_NOT_FOUND',
        error_description: 'Measure not found for the provided UUID.',
      })
    }

    // Verificar se o código de leitura já foi confirmado
    if (measure.has_confirmed) {
      return res.status(409).json({
        error_code: 'CONFIRMATION_DUPLICATE',
        error_description: 'The measure has already been confirmed.',
      })
    }

    // Atualizar o valor confirmado e marcar como confirmado
    measure.measure_value = confirmed_value
    measure.has_confirmed = true
    await measure.save()

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error confirming measure:', error)
    res.status(500).json({ message: 'Server error', error })
  }
}
