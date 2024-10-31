import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio']
  },
  last_name: {
    type: String,
    required: [true, 'El apellido es obligatorio']
  },
  nick: {
    type: String,
    required: [true, 'El nombre de usuario es obligatorio'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El correo electrónico es obligatorio'],
    unique: true,
    lowercase: true,
    validate: {
      validator: (email) => validator.isEmail(email),
      message: 'Por favor, proporciona un correo electrónico válido'
    }
  },
  bio: {
    type: String,
    maxlength: [300, 'La biografía no puede exceder los 300 caracteres'],
    default: ''
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria']
  },
  role: {
    type: String,
    enum: ['role_user', 'role_admin'],
    default: 'role_user'
  },
  image: {
    type: String,
    default: 'default_user.png'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Configuración del plugin de paginación
UserSchema.plugin(mongoosePaginate);

export default model("User", UserSchema, "users");