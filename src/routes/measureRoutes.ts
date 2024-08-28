import { Router } from 'express'
import {
  confirmMeasure,
  listMeasuresByCustomer,
  uploadMeasure,
} from '../controllers/measureController'

const router = Router()

router.post('/upload', uploadMeasure)
router.patch('/confirm', confirmMeasure)
router.get('/:customerCode/list', listMeasuresByCustomer)

export default router
