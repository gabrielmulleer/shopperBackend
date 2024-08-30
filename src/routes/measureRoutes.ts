import { Router } from 'express'
import {
  confirmMeasure,
  listMeasuresByCustomer,
  uploadMeasure,
} from '../controllers/measureController'
import {
  validateConfirmMeasure,
  validateListMeasuresByCustomer,
  validateUploadMeasure,
} from '../middleware/validation'

const router = Router()

router.post('/upload', validateUploadMeasure, uploadMeasure)
router.patch('/confirm', validateConfirmMeasure, confirmMeasure)
router.get(
  '/:customerCode/list',
  validateListMeasuresByCustomer,
  listMeasuresByCustomer,
)
export default router
