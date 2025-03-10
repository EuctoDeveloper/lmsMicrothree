
import express from 'express';
import validateInput from '../middlewares/validate.js';
import { getMyWebinarsSchema, getWebinarByIdSchema } from '../validations/WebinarValidation.js';
import verifyToken from '../middlewares/verifyToken.js';
import WebinarController from '../controllers/WebinarController.js';

const webinarRouter = express.Router();
webinarRouter.get('/JwTToken', verifyToken, WebinarController.getJwtToken);
webinarRouter.post('/getJwtToken', verifyToken, WebinarController.getJwtTokenV2);
webinarRouter.get('/myWebinars', verifyToken, validateInput(getMyWebinarsSchema), WebinarController.getMyWebinars);
webinarRouter.get('/upcoming', verifyToken, WebinarController.getUpcomingWebinar);
webinarRouter.get('/:id', verifyToken, validateInput(getWebinarByIdSchema), WebinarController.getWebinarById);
export default webinarRouter;