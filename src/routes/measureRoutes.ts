import { Router } from 'express'
import { uploadMeasure } from '../controllers/measureController'

const router = Router()

router.post('/upload', uploadMeasure)

export default router
