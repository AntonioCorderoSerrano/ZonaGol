import { supabase } from '../supabase/supabaseClient';

// Función para obtener al usuario actual
export const getUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (err) {
    return null;
  }
};

export const checkEmailInAdmins = async (email) => {
  try {
    const { data, error } = await supabase
      .from('admins') // Nombre de la tabla de administradores
      .select('email')
      .eq('email', email); // Busca el email en la tabla

    if (error) throw error;

    // Si hay datos, el email existe en la tabla
    return data && data.length > 0;
  } catch (err) {
    return false;
  }
};

// Función para obtener todos los jugadores
export const fetchJugadores = async () => {
  try {
    const { data, error } = await supabase.from('jugadores').select('*');
    if (error) throw error;
    return data;
  } catch (err) {
  }
};

// Función para verificar si el usuario es admin
export const isAdmin = async (email) => {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('is_admin')
      .eq('email', email)
      .single();
    if (error) throw error;
    return data?.is_admin || false;
  } catch (err) {
    return false;
  }
};

// Función para agregar un nuevo jugador
export const addJugador = async (nombre, dorsal, posicion, pieDominante, fechaNacimiento, archivoFoto) => {
  try {
    // Verificar que el usuario sea admin
    const user = await getUser();
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', user?.email)
      .single();

    if (adminError || !adminData || !adminData.is_admin) {
      throw new Error('No tienes permisos para agregar jugadores');
    }

    // Subir la foto al bucket si existe un archivo
    let fotoUrl = null;
    if (archivoFoto) {
      const fileName = `${Date.now()}_${archivoFoto.name}`; // Nombre único para evitar conflictos
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('Fotos')
        .upload(`jugadores/${fileName}`, archivoFoto);

      if (uploadError) {
        throw new Error('Error al subir la foto');
      }

      // Obtener la URL pública de la foto subida
      const { data: publicUrlData } = supabase.storage
        .from('Fotos')
        .getPublicUrl(`jugadores/${fileName}`);

      fotoUrl = publicUrlData.publicUrl; // URL pública
    }

    // Insertar jugador en la tabla
    const { error: insertError } = await supabase
      .from('jugadores')
      .insert([{
        nombre,
        dorsal,
        posicion,
        pie_dominante: pieDominante,
        fecha_nacimiento: fechaNacimiento,
        foto_url: fotoUrl, // Insertar la URL de la foto
      }]);

    if (insertError) {
      throw new Error('Error al insertar el jugador');
    }

  } catch (err) {
    return null;
  }
};

// Función para actualizar los datos de un jugador en el backend
export const updateJugadorBackend = async (id, updates) => {
  try {
    const user = await getUser();

    // Verificar si el usuario es admin
    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("*")
      .eq("email", user?.email)
      .single();

    if (adminError || !adminData || !adminData.is_admin) {
      alert("No tienes permisos para realizar esta acción.");
      return; // Detener el flujo de la función
    }

    // Verificar si hay campos para actualizar
    if (Object.keys(updates).length === 0) {
      alert("No hay campos para actualizar.");
      return; // Detener el flujo de la función
    }

    // Si se está actualizando la foto, gestionar la subida y la URL pública
    if (updates.foto) {
      const fotoFile = updates.foto;
      const fotoPath = `jugadores/${Date.now()}_${fotoFile.name}`; // Nombre único para evitar conflictos


      // Intentar subir la foto al almacenamiento
      const { error: uploadError } = await supabase.storage
        .from("Fotos")
        .upload(fotoPath, fotoFile);

      if (uploadError) {
        // Manejar el caso en que el archivo ya existe
        if (uploadError.message.includes("already exists")) {
          alert("El archivo ya existe. Por favor, usa un nombre diferente.");
        } else {
          alert("Hubo un problema al subir la foto. Inténtalo nuevamente.");
        }
        return; // Detener el flujo de la función
      }


      // Obtener la URL pública de la foto
      const { data: publicUrlData, error: urlError } = await supabase.storage
        .from("Fotos")
        .getPublicUrl(fotoPath);

      if (urlError) {
        alert("Hubo un problema al obtener la URL de la foto.");
        return; // Detener el flujo de la función
      }

      const fotoUrl = publicUrlData.publicUrl;

      // Asignar la URL de la foto al objeto updates
      updates.foto_url = fotoUrl; // Asignar la URL a 'foto_url'
      delete updates.foto; // Eliminar la propiedad 'foto' para evitar errores al actualizar
    }

    // Actualizar el jugador con los nuevos datos
    const { error: updateJugadorError } = await supabase
      .from("jugadores")
      .update(updates)
      .eq("id", id);

    if (updateJugadorError) {
      alert("Hubo un problema al actualizar el jugador. Inténtalo nuevamente.");
      return; // Detener el flujo de la función
    }

    alert("Jugador actualizado correctamente.");
  } catch (err) {
    alert("Ocurrió un error inesperado. Inténtalo nuevamente.");
  }
};

// Función para eliminar un jugador
export const deleteJugador = async (id) => {
  try {
    const user = await getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const admin = await isAdmin(user.email);
    if (!admin) throw new Error('No tienes permisos para eliminar jugadores');

    const { data, error } = await supabase
      .from('jugadores')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return data; // Retornar los datos de eliminación si es exitoso
  } catch (err) {
    alert("Ocurrió un error al intentar eliminar el jugador.");
  }
};

// Función para modificar los datos del cuerpo técnico
export const updateCuerpoTecnico = async (id, updates) => {
  try {
    if (!id || !updates || Object.keys(updates).length === 0) {
      throw new Error("ID o campos de actualización inválidos.");
    }

    const user = await getUser();

    // Verificar si el usuario es admin
    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("*")
      .eq("email", user?.email)
      .single();

    if (adminError || !adminData || !adminData.is_admin) {
      throw new Error("No tienes permisos para modificar el cuerpo técnico.");
    }

    // Manejar la actualización de la foto
    if (updates.fotoFile) {
      // Obtener la URL actual de la foto
      const { data: miembroData, error: miembroError } = await supabase
        .from("cuerpo_tecnico")
        .select("foto_url")
        .eq("id", id)
        .single();

      if (miembroError) throw new Error("Error al obtener datos del miembro.");

      const fotoActual = miembroData.foto_url;

      // Eliminar la foto antigua si existe
      if (fotoActual) {
        const rutaAntigua = new URL(fotoActual).pathname.split("/").slice(2).join("/");
        await supabase.storage.from("Fotos").remove([rutaAntigua]);
      }

      // Subir la nueva foto
      const fileName = `${Date.now()}_${updates.fotoFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("Fotos")
        .upload(`cuerpo_tecnico/${fileName}`, updates.fotoFile);

      if (uploadError) throw new Error("Error al subir la foto.");

      const { data: publicUrlData } = supabase.storage
        .from("Fotos")
        .getPublicUrl(`cuerpo_tecnico/${fileName}`);

      updates.foto_url = publicUrlData.publicUrl; // Actualizar la URL en la base de datos
      delete updates.fotoFile; // Eliminar el archivo del objeto de actualizaciones
    }

    // Actualizar los campos en la base de datos
    const { error } = await supabase
      .from("cuerpo_tecnico")
      .update(updates)
      .eq("id", id);

    if (error) throw error;

    return { success: true };
  } catch (err) {
    return null;
  }
};

// Función para eliminar un miembro del cuerpo técnico
export const deleteCuerpoTecnico = async (id) => {
  try {
    const user = await getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const admin = await isAdmin(user.email);
    if (!admin) throw new Error('No tienes permisos para eliminar miembros del cuerpo técnico');

    // Obtener la URL de la foto antes de eliminar el miembro
    const { data: miembroData, error: miembroError } = await supabase
      .from('cuerpo_tecnico')
      .select('foto_url')
      .eq('id', id)
      .single();

    if (miembroError) throw new Error("Error al obtener datos del miembro.");

    const fotoUrl = miembroData?.foto_url;

    // Eliminar la foto si existe
    if (fotoUrl) {
      // Extraer la ruta relativa dentro del bucket
      const rutaFoto = new URL(fotoUrl).pathname.replace('/storage/v1/object/public/Fotos/', '');

      // Eliminar la foto del bucket
      const { error: removeError } = await supabase.storage
        .from('Fotos')
        .remove([rutaFoto]);

    }

    // Eliminar el miembro del cuerpo técnico
    const { error } = await supabase
      .from('cuerpo_tecnico')
      .delete()
      .eq('id', id);

    if (error) throw error;

  } catch (err) {
    return null;
  }
};

// Función para agregar un nuevo miembro al cuerpo técnico
export const addCuerpoTecnico = async (nombre, fechaNacimiento, puesto, archivoFoto) => {
  try {
    // Verificar que el usuario sea admin
    const user = await getUser();
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', user?.email)
      .single();

    if (adminError || !adminData || !adminData.is_admin) {
      throw new Error('No tienes permisos para agregar miembros al cuerpo técnico');
    }

    // Subir la foto al bucket si existe un archivo
    let fotoUrl = null;
    if (archivoFoto) {
      // Generar un nombre único para el archivo
      const fileName = `${Date.now()}_${archivoFoto.name}`;

      // Subir el archivo al bucket de Supabase
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('Fotos') // Verifica que el bucket sea 'Fotos'
        .upload(`cuerpo_tecnico/${fileName}`, archivoFoto);

      // Obtener la URL pública del archivo subido
      const { data: publicUrlData, error: publicUrlError } = supabase.storage
        .from('Fotos')
        .getPublicUrl(`cuerpo_tecnico/${fileName}`);


      fotoUrl = publicUrlData.publicUrl;
    }

    // Insertar el nuevo miembro en la base de datos
    const { error: insertError } = await supabase
      .from('cuerpo_tecnico')
      .insert([{
        nombre,
        fecha_nacimiento: fechaNacimiento,
        puesto,
        foto_url: fotoUrl, // Se guarda la URL pública
      }]);

  } catch (err) {
    return null;
  }
};

export const fetchCuerpoTecnico = async () => {
  try {
    const { data, error } = await supabase.from('cuerpo_tecnico').select('*');
    return data;
  } catch (err) {
    return [];
  }
};