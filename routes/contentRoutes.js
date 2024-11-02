import { Router } from "express";
import { testContent, saveContent, showContent, deleteContent, contentsUser, uploadMedia, showMedia, feed} from "../controllers/contentController.js";
import { ensureAuth } from '../middlewares/auth.js';
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import pkg from 'cloudinary';
const { v2: cloudinary } = pkg;

// Configuración de subida de archivos en Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'publications',
    allowedFormats: ['jpg', 'png', 'jpeg', 'gif'],  // formatos permitidos
    public_id: (req, file) => 'publication-' + Date.now()
  }
});

// Configurar multer con límites de tamaño de archivos
const uploads = multer({
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1024 } // Limitar tamaño a 1 MB
});

const router = Router();

// Rutas de  Content
router.get('/test-content', testContent );
router.post('/new-content', ensureAuth, saveContent);
router.get('/show-content/:id', ensureAuth, showContent);
router.delete('/delete-content/:id', ensureAuth, deleteContent);
router.get('/contents-user/:id/:page?', ensureAuth, contentsUser);
router.post('/upload-media/:id', [ensureAuth, uploads.single("file0")], uploadMedia);
router.get('/media/:id', showMedia);
router.get('/feed/:page?', ensureAuth, feed);

//Exportar el Router
export default router;