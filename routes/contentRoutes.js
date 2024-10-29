import express from 'express';

const router = express.Router();

// Ruta de prueba
router.get('/test', (req, res) => {
  res.send('Conexión exitosa con contentRoutes');
});

export default router;