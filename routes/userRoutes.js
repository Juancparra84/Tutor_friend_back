import express from 'express';
import { testUser, register } from '../controllers/userController.js';


const router = express.Router();


// Definir rutas de user
router.get('/test-user', testUser);
router.post('/register', register);


export default router;
