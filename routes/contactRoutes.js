import express from 'express';
import { testContact,saveContact, unContact, contacting, contactors  } from "../controllers/contactController.js";
import { ensureAuth } from "../middlewares/auth.js";

const router = express.Router();

// Rutas de  Contact
router.get('/test-contact', testContact);
router.post("/contact", ensureAuth, saveContact);
router.delete("/uncontact/:id", ensureAuth, unContact);
router.get("/contacting/:id?/:page?", ensureAuth, contacting);
router.get("/contactors/:id?/:page?", ensureAuth, contactors);

export default router;