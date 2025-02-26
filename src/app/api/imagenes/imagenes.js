import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gpbejvkrtdlkpxarqnkc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwYmVqdmtydGRsa3B4YXJxbmtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3NTczNTIsImV4cCI6MjA1MjMzMzM1Mn0.VO9XIzZDgA03_ZdGO4RWyG2yQKPOw0m2HvfyfBWAbh8';
const supabase = createClient(supabaseUrl, supabaseKey);

// Subir una imagen al bucket y guardar su URL en la tabla "imagenes"
export const subirImagen = async (file) => {
  try {
    // Subir la imagen al bucket "Fotos" en la carpeta "imagenes"
    const filePath = `imagenes/${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('Fotos')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    // Obtener la URL pública de la imagen
    const { data: urlData } = supabase
      .storage
      .from('Fotos')
      .getPublicUrl(filePath);

    // Guardar la URL en la tabla "imagenes"
    const { data: dbData, error: dbError } = await supabase
      .from('imagenes')
      .insert([{ url_imagen: urlData.publicUrl }]);

    if (dbError) {
      throw dbError;
    }

    return dbData;
  } catch (err) {
    return null;
  }
};

// Obtener todas las imágenes de la tabla "imagenes"
export const obtenerImagenes = async () => {
  try {
    const { data, error } = await supabase
      .from('imagenes')
      .select('url_imagen')

    if (error) {
      throw error;
    }

    return data;
  } catch (err) {
    return null;
  }
};

// Eliminar una imagen de la tabla "imagenes" y del bucket
export const eliminarImagen = async (url_imagen) => {
  try {
    // Extraer el nombre del archivo de la URL
    const filePath = url_imagen.split('/').pop();

    // Eliminar la imagen del bucket
    const { data: deleteData, error: deleteError } = await supabase
      .storage
      .from('Fotos')
      .remove([`imagenes/${filePath}`]);

    if (deleteError) {
      throw deleteError;
    }

    // Eliminar la URL de la tabla "imagenes"
    const { data: dbData, error: dbError } = await supabase
      .from('imagenes')
      .delete()
      .eq('url_imagen', url_imagen);

    if (dbError) {
      throw dbError;
    }

    return dbData;
  } catch (err) {
    throw err;
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

export const getUser = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return null;
  }

  return data.user;
};

/**
 * Verifica si el usuario actual es administrador.
 * @returns {Promise<boolean>} `true` si el usuario es administrador, de lo contrario `false`.
 */
export const isAdmin = async () => {
  const user = await getUser();

  if (!user || !user.email) {
    return false;
  }


  try {
    const { data, error } = await supabase
      .from('admins')
      .select('is_admin')
      .eq('email', user.email)
      .single();

    if (error || !data) {
      return false;
    }

    return data.is_admin === true;
  } catch (err) {
    return false;
  }
};