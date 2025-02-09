import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gpbejvkrtdlkpxarqnkc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwYmVqdmtydGRsa3B4YXJxbmtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3NTczNTIsImV4cCI6MjA1MjMzMzM1Mn0.VO9XIzZDgA03_ZdGO4RWyG2yQKPOw0m2HvfyfBWAbh8';
const supabase = createClient(supabaseUrl, supabaseKey);

// Obtener todas las recomendaciones
export const obtenerRecomendaciones = async () => {
  try {
    const { data, error } = await supabase
      .from('recomendaciones')
      .select('*')
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error obteniendo recomendaciones:", error);
    throw error;
  }
};

// Crear una nueva recomendación
export const crearRecomendacion = async (recomendacion) => {
  try {
    const { data, error } = await supabase
      .from('recomendaciones')
      .insert([recomendacion])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Error creando recomendación:", error);
    throw error;
  }
};

// Eliminar una recomendación
export const eliminarRecomendacion = async (id) => {
  try {
    const { error } = await supabase
      .from('recomendaciones')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error eliminando recomendación:", error);
    throw error;
  }
};

export const checkEmailInAdmins = async (email) => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('is_admin')
        .eq('email', email)
        .single();
  
      return data ? data.is_admin : false; // Devuelve `true` si es admin, `false` si no
    } catch (error) {
      return null;
    }
  };