import Contact from "../models/contact.js";

// Obtenemos un array de IDs de usuarios que yo sigo y que me siguen
export const followUserIds = async (req, res) => {
  try {
    const identityUserId = req.user.userId; // Obtener el ID del usuario autenticado

    // En caso de no llegar el userID
    if (!identityUserId) {
      return res.status(400).send({
        status: "error",
        message: "Usuario no recibido"
      });
    }

    // Obtener el array con la información de los usuarios que estoy siguiendo
    let following = await Contact.find({ "follower_id": identityUserId })
      .select({ "followed_id": 1, "_id": 0 })
      .exec();

    // Obtener el array con la información de los usuarios que me siguen a mí
    let followers = await Contact.find({ "followed_id": identityUserId })
      .select({ "follower_id": 1, "_id": 0 });

    // Procesar array de identificadores: convertirlos en un array de solo IDs
    const user_following = following.map(follow => follow.followed_id);
    const user_follow_me = followers.map(follow => follow.follower_id);
    return {
      contacting: user_following,
      contact_me: user_follow_me
    };

  } catch (error) {
    console.log("Error al obtener los IDs de seguimiento.", error);
    // devuelve un objeto vacío
    return {
      contacting: [],
      contact_me: []
    };
  }
}

// Obtenemos los datos de UN usuario que me está siguiendo a mí o que yo sigo
export const followThisUser = async (identityUserId, profileUserId) => {
  try {
    // Verificar si los IDs son válidos
    if (!identityUserId || !profileUserId)
      throw new Error("IDs de los usuarios son inválidos");

    // Consultar si yo como usuario identificado (identityUserId) sigo al otro usuario (profileUserId)
    const contacting = await Contact.findOne({ "follower_id": identityUserId, "followed_id": profileUserId });

    // Consultar si el otro usuario (profileUserId) me sigue a mí (identityUserId)
    const contact_me = await Contact.findOne({ "follower_id": profileUserId, "followed_id": identityUserId });

    return {
      contacting,
      contact_me
    };

//Error
  } catch (error) {
    console.log("Error al obtener la información del usuario.", error);
    // devuelve null si no se siguen
    return {
      contacting: null,
      contact_me: null
    };
  }
};
