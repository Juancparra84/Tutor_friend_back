import { connect } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    await connect(process.env.MONGODB_URI);
    console.log("Conectado correctamente a DB_Tutor_Friend");
  } catch (error) {
    console.log("Error al conectar la BD", error);
    throw new Error("¡No se ha podido conectar a la base de datos!");
  }
};

export default connectDB;
