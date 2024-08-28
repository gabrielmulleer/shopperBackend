import { Router } from 'express'
import { confirmMeasure, uploadMeasure } from '../controllers/measureController'

const router = Router()

router.post('/upload', uploadMeasure)
router.patch('/confirm', confirmMeasure)

export default router
