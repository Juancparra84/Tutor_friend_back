import jwt from "jwt-simple";
import moment from "moment";
import dotenv from "dotenv";

dotenv.config();

const secret = process.env.SECRET_KEY;

// Generar el Token
const createToken = (user) => {
    const payload = {
        userId: user._id,
        role: user.role,
        iat: moment().unix(), // fecha de emisión
        exp: moment().add(2, "days").unix(), // fecha de expiración
    };

    // Codificar y devolver el token JWT
    return jwt.encode(payload, secret);
};

export { secret, createToken };
