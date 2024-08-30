import { Request, Response } from 'express'
import Measure from '../models/Measure'
import { processImageWithGeminiAPI } from '../services/geminiService'
import moment from 'moment'
import { generateTempUrl, saveBase64Image } from '../utils/generate-image'
import { v4 as uuidv4 } from 'uuid'
import { extractBase64FromDataUri } from '../utils/extract-base64'

export const uploadMeasure = async (req: Request, res: Response) => {
  try {
    const { customer_code, image, measure_datetime, measure_type } = req.body
    const base64Image = extractBase64FromDataUri(image) as string

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
        error_description: 'Reading for the month already completed',
      })
    }

    // Chama o serviço para processar a imagem usando a API do Google Gemini
    const geminiResult = await processImageWithGeminiAPI(
      base64Image,
      measure_type,
    )
    const fileName = `${geminiResult.uuid || uuidv4()}.jpg`

    await saveBase64Image(fileName, base64Image)
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

    const measure = await Measure.findOne({ measure_uuid })

    if (!measure) {
      return res.status(404).json({
        error_code: 'MEASURE_NOT_FOUND',
        error_description: 'Measure not found for the provided UUID.',
      })
    }

    if (measure.has_confirmed) {
      return res.status(409).json({
        error_code: 'CONFIRMATION_DUPLICATE',
        error_description: 'The measure has already been confirmed.',
      })
    }

    measure.measure_value = confirmed_value
    measure.has_confirmed = true
    await measure.save()

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error confirming measure:', error)
    res.status(500).json({ message: 'Server error', error })
  }
}

export const listMeasuresByCustomer = async (req: Request, res: Response) => {
  try {
    const { customerCode } = req.params
    const { measure_type } = req.query

    let query: any = { customer_code: customerCode }

    if (measure_type) {
      query.measure_type = measure_type.toString().toUpperCase()
    }

    const measures = await Measure.find(query).select(
      'measure_uuid measure_datetime measure_type has_confirmed image_url -_id',
    )

    if (measures.length === 0) {
      return res.status(404).json({
        error_code: 'MEASURES_NOT_FOUND',
        error_description: 'No readings found',
      })
    }

    return res.status(200).json({
      customer_code: customerCode,
      measures,
    })
  } catch (error) {
    console.error('Error listing measures:', error)
    res.status(500).json({ message: 'Server error', error })
  }
}
