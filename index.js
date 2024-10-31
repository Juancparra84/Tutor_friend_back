import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

console.log("API Node en ejecución"); //Mensaje Inicial

connectDB(); //BDD

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Configurar análisis del cuerpo de las solicitudes en formato JSON
app.use(bodyParser.json()); // Middleware para analizar JSON en el cuerpo de las solicitudes
app.use(bodyParser.urlencoded({ extended: true })); // Middleware para analizar datos en formato URL-encoded

// Rutas
app.use("/api/user", userRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/contact", contactRoutes);

// Servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

export default app;
