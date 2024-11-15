import Contact from '../models/contact.js';
import User from "../models/user.js";
import { followUserIds } from "../services/followServices.js";



// Método de prueba del controlador follow
export const testContact = (req, res) => {
  return res.status(200).send({
    message: "Mensaje enviado desde el controlador de Contacto"
  });
};

// Método para guardar un follow (seguir a otro usuario)
export const saveContact = async (req, res) => {
  try {
    // Obtener datos desde el body del usuario que se quiere seguir
    const { contact_user } = req.body;

    // Obtener el ID del usuario autenticado que va a buscar a otro usuario para seguir
    const identity = req.user; 

    // Verificar si identity contiene al usuario autenticado
    if(!identity || !identity.userId){
      return res.status(400).send({
        status: "error",
        message: "No se ha proporcionado el usuario para realizar el following"
      });
    }

    // Verificar si el usuario está intentando seguirse a sí mismo
    if(identity.userId === contact_user){
      return res.status(400).send({
        status: "error",
        message: "No puedes seguirte a ti mismo"
      });
    }

    // Verificar si usuario a seguir existe
    const contactedUser = await User.findById(contact_user);

    if(!contactedUser){
      return res.status(404).send({
        status: "error",
        message: "El usuario que intentas seguir no existe"
      });
    }

    // Verificar si ya existe un seguimiento con los mismos usuarios
    const existingContact = await Contact.findOne({
        follower_id: identity.userId,
        followed_id: contact_user
    });

    if (existingContact) {
        return res.status(400).send({
            status: "error",
            message: "Ya estás siguiendo a este usuario"
        });
    }



    // Crear el objeto con el modelo contact
    const newContact = new Contact({
        follower_id: identity.userId,
        followed_id: contact_user
    });

   // Guardar objeto en la BD}
   const contactStored = await newContact.save();

    // Verificar si se guardó correctamente en la BD
    if (!contactStored) {
        return res.status(500).send({
            status: "error",
            message: "No se ha podido seguir al usuario"
        });
    }

     // Obtener el nombre y apellido del usuario seguido
     const contactedUserDetails = await User.findById(contact_user).select('name last_name');

     if (!contactedUserDetails) {
        return res.status(404).send({
            status: "error",
            message: "Usuario no encontrado"
        });
    }

  // Combinar datos de follow y followedUser
  const combinedContactData = {
    ...contactStored.toObject(),
    contactedUser: {
        name: contactedUserDetails.name,
        last_name: contactedUserDetails.last_name
    }
};
// Devolver respuesta
return res.status(200).json({
    status: "success",
    identity: req.user,
    contact: combinedContactData
});

//Error
} catch (error) {
if (error.code === 11000) {
    return res.status(400).send({
        status: "error",
        message: "Ya estás siguiendo a este usuario"
    });
};
return res.status(500).send({
    status: "error",
    message: "Error al seguir al usuario"
});
}
};

// Método para eliminar un contact (dejar de seguir)
export const unContact = async (req, res) => {
    try {
        const userId = req.user.userId;  // Obtener el Id del usuario identificado       
        const followedId = req.params.id;  // Obtener el Id del usuario que sigo y quiero dejar de seguir

        // Búsqueda de las coincidencias de ambos usuarios y elimina
        const contactDeleted = await Contact.findOneAndDelete({
            follower_id: userId,       // quien realiza el seguimiento
            followed_id: followedId    // a quien se quiere dejar de seguir
        });

        // Verificar si se encontró el documento y lo eliminó
        if (!contactDeleted) {
            return res.status(404).send({
                status: "error",
                message: "No se encontró el Usuario para dejar de seguir."
            });
        }

        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "Dejaste de seguir al usuario correctamente."
        });

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al dejar de seguir al usuario."
        });
    }
};

// Método para listar usuarios que estoy siguiendo
export const contacting = async (req, res) => {
    try {
        let userId = req.user && req.user.userId ? req.user.userId : undefined;  // Obtener el ID del usuario identificado
        if (req.params.id) userId = req.params.id; // Comprobar si llega el ID por parámetro en la URL (este tiene prioridad)

        let page = req.params.page ? parseInt(req.params.page, 10) : 1;        // Asignar el número de página
        let itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5; // Número de usuarios que queremos mostrar por página

        // Configurar las opciones de la consulta
        const options = {
            page: page,
            limit: itemsPerPage,
            populate: {
                path: 'followed_id',
                select: '-password -role -__v -email' // Excluir campos sensibles
            },
            lean: true
        };
        // Buscar en la BD los usuarios seguidos y popular los datos de los usuarios
        const contacts = await Contact.paginate({ follower_id: userId }, options); 
        let contactsl = await followUserIds(req); // Listar los seguidores de un usuario, obtener el array de IDs de los usuarios que sigo

        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "Listado de usuarios que estoy siguiendo",
            contacts: contacts.docs,
            total: contacts.totalDocs,
            pages: contacts.totalPages,
            page: contacts.page,
            limit: contacts.limit,
            users_contacting: contactsl.contacting,
            user_contact_me: contactsl.contact_me,
        });

        //Error
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al listar los usuarios que estás siguiendo."
        });
    }
};

// Método para listar los usuarios que me siguen
export const contacts = async (req, res) => {
  try {
    // Obtener el ID del usuario identificado
    let userId = req.user && req.user.userId ? req.user.userId : undefined;

    // Comprobar si llega el ID por parámetro en la url (este tiene prioridad)
    if (req.params.id) userId = req.params.id;

    // Asignar el número de página
    let page = req.params.page ? parseInt(req.params.page, 10) : 1;

    // Número de usuarios que queremos mostrar por página
    let itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5;

    // Configurar las opciones de la consulta
    const options = {
      page: page,
      limit: itemsPerPage,
      populate: {
        path: 'follower_id',
        select: '-password -role -__v -email'
      },
      lean: true
    }

    // Buscar en la BD los seguidores y popular los datos de los usuarios
    const contacs = await Contact.paginate({ followed_id: userId }, options);

    // Listar los seguidores de un usuario, obtener el array de IDs de los usuarios que sigo
    let followUsers = await followUserIds(req);

    let contacts = await followUserIds(req);

        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "Listado de usuarios que me siguen",
            follows: contacs.docs,
            total: contacs.totalDocs,
            pages: contacs.totalPages,
            page: contacs.page,
            limit: contacs.limit,
            users_contacting: contacts.contacting,
            user_contact_me: contacts.contact_me
        });

  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error al listar los usuarios que me siguen."
    });
  }
}