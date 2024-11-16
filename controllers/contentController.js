import Content from '../models/content.js';
import { followUserIds } from '../services/followServices.js';

// Método de prueba del controlador Content
export const testContent = (req, res) => {
  return res.status(200).send({
    message: "Mensaje enviado desde el controlador de Contenido"
  });
};

// Método para Crear (guardar en la BD) un contenido
export const saveContent = async (req, res) => {
  try {
    // Obtenemos los datos del body
    const params = req.body;

    // Verificar que llegue desde el body el parámetro text con su información
    if(!params.text){
      return res.status(400).send({
        status: "error",
        message: "Debes enviar el texto de la publicación"
      });
    }

    // Crear el objeto del modelo
    let newContent = new Content(params);

    // Agregar al objeto de la publicación la información del usuario autenticado quien crea el contenido
    newContent.user = req.user.userId;

    // Guardar el nuevo contenido en la BD
    const contentStored = await newContent.save();

    // Verificar que se guardó la nueva publicación en la BD (si existe contentStored)
    if(!contentStored){
      return res.status(500).send({
        status: "error",
        message: "No se ha guardado el contenido"
      });
    }

    // Devolver respuesta exitosa
    return res.status(200).json({
      status: "success",
      message: "¡Contenido creado con éxito!",
      contentStored
    });

  } catch (error) {
    console.log(`Error al crear el contenido: ${ error }`);
    return res.status(500).send({
      status: "error",
      message: "Error al crear el contenido"
    });
  }
};

// Método para mostrar el contenido
export const showContent = async (req, res) => {
  try {
    // Obtener el ID del contenido desde la url (parámetros)
    const contentId = req.params.id;

    // Buscar el contenido en la BD por ID
    const contentStored = await Content.findById(contentId).populate('user', 'name last_name nick image');

    // Verificar si existe el contenido en la BD
    if(!contentStored){
      return res.status(404).send({
        status: "error",
        message: "No existe el contenido"
      });
    }

    // Devolvemos respuesta exitosa
    return res.status(200).json({
      status: "success",
      message: "Contenido encontrado",
      content: contentStored
    });

  } catch (error) {
    console.log(`Error al mostrar el contenido: ${ error }`);
    return res.status(500).send({
      status: "error",
      message: "Error al mostrar el contenido"
    });
  }
};

// Método para eliminar una publicación
export const deleteContent = async (req, res) => {
  try {
    // Obtener el ID deel contenido desde la url (parámetros)
    const contentId = req.params.id;

    // Buscar el contenido en la BD y la eliminamos
    const contentDeleted = await Content.findOneAndDelete({ user: req.user.userId, _id: contentId}).populate('user', 'name last_name');

    // Verificar si existe el contenido en la BD y si se eliminó de la BD
    if(!contentDeleted){
      return res.status(404).send({
        status: "error",
        message: "No se ha encontrado o no tienes permiso para eliminar este contenido"
      });
    }

    // Devolvemos respuesta exitosa
    return res.status(200).json({
      status: "success",
      message: "Contenido eliminada con éxito",
      content: contentDeleted
    });

  } catch (error) {
    console.log(`Error al eliminar el contenido: ${ error }`);
    return res.status(500).send({
      status: "error",
      message: "Error al eliminar el contenido"
    });
  }
};

// Método para listar el contenido del usuario
export const contentsUser = async (req, res) => {
  try {
    // Obtener el ID del usuario
    const userId = req.params.id;

    // Asignar el número de página a mostrar inicialmente
    let page = req.params.page ? parseInt(req.params.page, 10) : 1;

    // Número de publicaciones de contenido que queremos mostrar por página
    let itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5;

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

    // Buscar las publicaciones de contenido del usuario
    const contents = await Content.paginate({ user: userId }, options);

    // Verificar si existen publicaciones de contenido
    if(!contents.docs || contents.docs.length <= 0){
      return res.status(404).send({
        status: "error",
        message: "No hay contenido para mostrar"
      });
    }

    // Devolver respuesta exitosa
    return res.status(200).json({
      status: "success",
      message: "Contenido del usuario: ",
      contents: contents.docs,
      total: contents.totalDocs,
      pages: contents.totalPages,
      page: contents.page,
      limit_items_ppage: contents.limit
    });

  } catch (error) {
    console.log(`Error al mostrar el contenido: ${ error }`);
    return res.status(500).send({
      status: "error",
      message: "Error al mostrar el contenido"
    });
  }
};

// Método para subir imágenes a las publicaciones de contenido
export const uploadMedia = async (req, res) => {
  try {
    // Obtener el ID de la publicación
    const contentId = req.params.id;

    // Verificar si la publicación existe en la BD
    const contentExists = await Content.findById(contentId);

    if(!contentExists){
      return res.status(404).send({
        status: "error",
        message: "No existe la publicación"
      });
    }

    // Verificar si se ha recibido en la petición un archivo
    if(!req.file){
      return res.status(400).send({
        status: "error",
        message: "La petición no incluye la imagen"
      });
    }

    // Obtener la URL de Cloudinary
    const mediaUrl = req.file.path;

    // Actualizar la publicación con la URL de la imagen
    const contentUpdated = await Content.findByIdAndUpdate(
      contentId,
      { file: mediaUrl },
      { new: true}
    );

    if(!contentUpdated){
      return res.status(500).send({
        status: "error",
        message: "Error en la subida de la imagen"
      });
    }

    // Devolver respuesta exitosa
    return res.status(200).json({
      status: "success",
      message: "Archivo subido con éxito",
      contents: contentUpdated,
      file: mediaUrl
    });

  } catch (error) {
    console.log(`Error al mostrar el contenido: ${ error }`);
    return res.status(500).send({
      status: "error",
      message: "Error al mostrar el contenido"
    });
  }
};

// Método para mostrar el archivo subido a la publicación
export const showMedia = async (req, res) => {
  try {
    // Obtener el id de la publicación
    const contentId = req.params.id;

    // Buscar la publicación de contenido en la base de datos
    const content = await Content.findById(contentId).select('file');

    // Verificar si la publicación existe y tiene un archivo
    if (!content || !content.file) {
      return res.status(404).send({
        status: "error",
        message: "No existe el archivo para esta publicación"
      });
    }

    // Redirigir a la URL de la imagen en Cloudinary
    return res.redirect(content.file);

  } catch (error) {
    console.error("Error al mostrar el archivo de la publicación", error);
    return res.status(500).send({
      status: "error",
      message: "Error al mostrar archivo en la publicación"
    });
  }
}

// Método para listar todas las publicaciones de los usuarios que yo sigo (Feed)
export const feed = async (req, res) => {
  try {
    // Asignar el número de página
    let page = req.params.page ? parseInt(req.params.page, 10) : 1;

    // Número de publicaciones que queremos mostrar por página
    let itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5;

    // Verificar que el usuario autenticado existe y tiene un userId
    if(!req.user || !req.user.userId) {
      return res.status(404).send({
        status: "error",
        message: "Usuario no autenticado"
      });
    }

    // Obtener un array de IDs de los usuarios que sigue el usuario autenticado
    const mycontacts = await followUserIds(req);

    // Verificar que la lista de usuarios que sigo no esté vacía
    if (!mycontacts.contacting || mycontacts.contacting.length === 0){
      return res.status(404).send({
        status: "error",
        message: "No sigues a ningún usuario, no hay publicaciones que mostrar"
      });
    }

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
      { user: { $in: mycontacts.contacting }},
      options
    );

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
      contents: result.docs,
      total: result.totalDocs,
      pages: result.totalPages,
      page: result.page,
      limit: result.limit
    });

  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error al mostrar las publicaciones en el feed"
    });
  }
}