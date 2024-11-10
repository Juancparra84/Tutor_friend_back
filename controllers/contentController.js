import Content from '../models/content.js';
import { followUserIds } from '../services/followServices.js';

// Método de prueba del controlador publication
export const testContent = (req, res) => {
  return res.status(200).send({
    message: "Mensaje enviado desde el controlador de Contenido"
  });
};

// Método para hacer (guardar en la BD) una publicación
export const saveContent = async (req, res) => {
  try {
    const params = req.body; // Obtenemos los datos del body

    // Verificar que llegue desde el body el parámetro text con su información
    if (!params.text) {
      return res.status(400).send({
        status: "error",
        message: "Debes enviar el texto de la publicación"
      });
    }

    let newContent = new Content(params); // Crear el objeto del modelo
    newContent.user = req.user.userId;  // Agregar al objeto de la publicación la información del usuario autenticado

    const contentStored = await newContent.save();  // Guardar la nueva publicación en la BD

    // Verificar que se guardó la nueva publicación en la BD (si existe publicationStored)
    if (!contentStored) {
      return res.status(500).send({
        status: "error",
        message: "No se ha guardado la publicación"
      });
    }

    // Devolver respuesta exitosa
    return res.status(200).json({
      status: "success",
      message: "¡Publicación creada con éxito!",
      contentStored
    });

    //Error
  } catch (error) {
    console.log(`Error al crear la publicación: ${error}`);
    return res.status(500).send({
      status: "error",
      message: "Error al crear la publicación"
    });
  }
};

// Método para mostrar la publicación
export const showContent = async (req, res) => {
  try {
    // Obtener el ID de la publicación desde la url (parámetros)
    const contentId = req.params.id;

    // Buscar la publicación en la BD por ID
    const contentStored = await Content.findById(contentId).populate('user', 'name last_name nick image');

    // Verificar si existe la publicación en la BD
    if (!contentStored) {
      return res.status(404).send({
        status: "error",
        message: "No existe la publicación"
      });
    }

    // Devolvemos respuesta exitosa
    return res.status(200).json({
      status: "success",
      message: "Publicación encontrada",
      content: contentStored
    });

  } catch (error) {
    console.log(`Error al mostrar la publicación: ${error}`);
    return res.status(500).send({
      status: "error",
      message: "Error al mostrar la publicación"
    });
  }
};

// Método para eliminar una publicación
export const deleteContent = async (req, res) => {
  try {
    // Obtener el ID de la publicación desde la url (parámetros)
    const contentId = req.params.id;

    // Buscar la publicación en la BD y la eliminamos
    const contentDeleted = await Content.findOneAndDelete({ user: req.user.userId, _id: contentId }).populate('user', 'name last_name');

    // Verificar si existe la publicación en la BD y si se eliminó de la BD
    if (!contentDeleted) {
      return res.status(404).send({
        status: "error",
        message: "No se ha encontrado o no tienes permiso para eliminar esta publicación"
      });
    }

    // Devolvemos respuesta exitosa
    return res.status(200).json({
      status: "success",
      message: "Publicación eliminada con éxito",
      content: contentDeleted
    });

    //Error
  } catch (error) {
    console.log(`Error al eliminar la publicación: ${error}`);
    return res.status(500).send({
      status: "error",
      message: "Error al eliminar la publicación"
    });
  }
};

// Método para listar publicaciones del usuario
export const contentsUser = async (req, res) => {
  try {
    const userId = req.params.id; // Obtener el ID del usuario
    let page = req.params.page ? parseInt(req.params.page, 10) : 1; // Asignar el número de página a mostrar inicialmente
    let itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5;     // Número de publicaciones que queremos mostrar por página

    // Opciones de la consulta
    const options = {
      page: page,
      limit: itemsPerPage,
      sort: { created_at: -1 },
      populate: {
        path: 'user',
        select: '-password -role -__v -email'
      },
      lean: true
    };

    const contents = await Content.paginate({ user: userId }, options); // Buscar las publicaciones del usuario

    // Verificar si existen publicaciones
    if (!contents.docs || contents.docs.length <= 0) {
      return res.status(404).send({
        status: "error",
        message: "No hay pulicaciones para mostrar"
      });
    }

    // Devolver respuesta exitosa
    return res.status(200).json({
      status: "success",
      message: "PContenido del usuario: ",
      publications: contents.docs,
      total: contents.totalDocs,
      pages: contents.totalPages,
      page: contents.page,
      limit_items_ppage: contents.limit
    });


    //Error
  } catch (error) {
    console.log(`Error al mostrar las publicaciones: ${error}`);
    return res.status(500).send({
      status: "error",
      message: "Error al mostrar las publicaciones"
    });
  }
};

// Método para subir imágenes a las publicaciones
export const uploadMedia = async (req, res) => {
  try {
    const contentId = req.params.id; // Obtener el ID de la publicación
    const contentExists = await Content.findById(contentId); // Verificar si la publicación existe en la BD

    if (!contentExists) {
      return res.status(404).send({
        status: "error",
        message: "No existe la publicación"
      });
    }

    // Verificar si se ha recibido en la petición un archivo
    if (!req.file) {
      return res.status(400).send({
        status: "error",
        message: "La petición no incluye la imagen"
      });
    }

    const mediaUrl = req.file.path; // Obtener la URL de Cloudinary

    // Actualizar la publicación con la URL de la imagen
    const contentUpdated = await Content.findByIdAndUpdate(
      contentId,
      { file: mediaUrl },
      { new: true }
    );

    if (!contentUpdated) {
      return res.status(500).send({
        status: "error",
        message: "Error en la subida de la imagen"
      });
    }

    // Devolver respuesta exitosa
    return res.status(200).json({
      status: "success",
      message: "Archivo subido con éxito",
      content: contentUpdated,
      file: mediaUrl
    });

  } catch (error) {
    console.log(`Error al mostrar las publicaciones: ${error}`);
    return res.status(500).send({
      status: "error",
      message: "Error al mostrar las publicaciones"
    });
  }
};

// Método para mostrar el archivo subido a la publicación
export const showMedia = async (req, res) => {
  try {

    const contentId = req.params.id;  // Obtener el id de la publicación
    const content = await Content.findById(contentId).select('file'); // Buscar la publicación en la base de datos

    // Verificar si la publicación existe y tiene un archivo
    if (!content || !content.file) {
      return res.status(404).send({
        status: "error",
        message: "No existe el archivo para esta publicación"
      });
    }
    // Redirigir a la URL de la imagen en Cloudinary
    return res.redirect(content.file);

    //Error
  } catch (error) {
    console.error("Error al mostrar el archivo de la publicación", error);
    return res.status(500).send({
      status: "error",
      message: "Error al mostrar archivo en la publicación"
    });
  }
};

// Método para listar todas las publicaciones de los usuarios que yo sigo (Feed)
export const feed = async (req, res) => {
  try {

    let page = req.params.page ? parseInt(req.params.page, 10) : 1; // Asignar el número de página
    let itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5; // Número de publicaciones que queremos mostrar por página

    // Verificar que el usuario autenticado existe 
    if (!req.user || !req.user.userId) {
      return res.status(404).send({
        status: "error",
        message: "Usuario no autenticado"
      });
    };

    const myFollows = await followUserIds(req);   // Obtener un array de IDs de los usuarios que sigue el usuario autenticado

    // Verificar que la lista de usuarios que sigo no esté vacía
    if (!myFollows.contacting || myFollows.contacting.length === 0) {
      return res.status(404).send({
        status: "error",
        message: "No sigues a ningún usuario, no hay publicaciones que mostrar"
      });
    };
  
    // Configurar las options de la consulta
    const options = {
      page: page,
      limit: itemsPerPage,
      sort: { created_at: -1 },
      populate: {
        path: 'user',
        select: '-password -role -__v -email'
      },
      lean: true
    };

    // Consulta a la base de datos con paginate
    const result = await Content.paginate(
      { user: { $in: myFollows.contacting } },
      options
    ); console.log(result);
    
    // Verificar si se encontraron publicaciones en la BD
    if (!result.docs || result.docs.length <= 0) {
      return res.status(404).send({
        status: "error",
        message: "No hay publicaciones para mostrar"
      });
    }
    // Devolver respuesta exitosa
    return res.status(200).json({
      status: "success",
      message: "Feed de Publicaciones",
      publications: result.docs,
      total: result.totalDocs,
      pages: result.totalPages,
      page: result.page,
      limit: result.limit
    });

    //Error
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error al mostrar las publicaciones en el feed"
    });
  }
};

