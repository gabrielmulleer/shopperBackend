import { Request, Response, NextFunction } from 'express'

const isBase64 = (str: string) => {
  try {
    return Buffer.from(str, 'base64').toString('base64') === str
  } catch {
    return false
  }
}

export const validateUploadMeasure = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { customer_code, image, measure_datetime, measure_type } = req.body

  if (!customer_code || typeof customer_code !== 'string') {
    return res.status(400).json({
      error_code: 'INVALID_DATA',
      error_description: 'Customer code is required and must be a string',
    })
  }

  if (!image || typeof image !== 'string' || !isBase64(image.split(',')[1])) {
    return res.status(400).json({
      error_code: 'INVALID_DATA',
      error_description: 'Image is required and must be a valid base64 string',
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

  next()
}

export const validateConfirmMeasure = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { measure_uuid, confirmed_value } = req.body

  if (!measure_uuid || typeof measure_uuid !== 'string') {
    return res.status(400).json({
      error_code: 'INVALID_DATA',
      error_description: 'Measure UUID is required and must be a string.',
    })
  }

  if (isNaN(confirmed_value) || typeof confirmed_value !== 'number') {
    return res.status(400).json({
      error_code: 'INVALID_DATA',
      error_description:
        'The confirmed value is required and must be a number.',
    })
  }

  next()
}

export const validateListMeasuresByCustomer = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { customerCode } = req.params
  const { measure_type } = req.query

  if (!customerCode || typeof customerCode !== 'string') {
    return res.status(400).json({
      error_code: 'INVALID_DATA',
      error_description: 'Customer code is required and must be a string.',
    })
  }

  if (
    measure_type &&
    !['WATER', 'GAS'].includes(measure_type.toString().toUpperCase())
  ) {
    return res.status(400).json({
      error_code: 'INVALID_TYPE',
      error_description: 'Measurement type not allowed',
    })
  }

  next()
}
