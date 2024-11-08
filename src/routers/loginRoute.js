// this is login route file

import express from 'express';
import validateInput from '../middlewares/validate.js';
import Logincontroller from '../controllers/LoginController.js';
import { loginSchema, registerSchema } from '../validations/LoginValidation.js';


const authRouter = express.Router();

authRouter.post('/login', validateInput(loginSchema), Logincontroller.login);
authRouter.post('/register', validateInput(registerSchema), Logincontroller.register);

export default authRouter;