import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const ContentSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: "User",
    required: true
  },
  text: {
    type: String,
    required: true
  },
  file: {
    type: String,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Configurar plugin de paginación
ContentSchema.plugin(mongoosePaginate);

export default model("Content", ContentSchema, "contents");