import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const ContactSchema = new Schema({
  follower_id: {
    type: Schema.ObjectId,
    ref: "User",
    required: true
  },
  followed_id: {
    type: Schema.ObjectId,
    ref: "User",
    required: true
  },
  schedule_at: {
    type: Date,
    default: null  // Campo opcional para sesiones de tutoría agendadas
  },
  created_at: {
    type: Date,
    default: Date.now  // Fecha de creación del contacto
  }
});

// Definir un índice único para evitar múltiples relaciones de seguimiento duplicadas
ContactSchema.index({ follower_id: 1, followed_id: 1 }, { unique: true });

// Configurar el plugin de paginación
ContactSchema.plugin(mongoosePaginate);

export default model("Contact", ContactSchema, "contacts");