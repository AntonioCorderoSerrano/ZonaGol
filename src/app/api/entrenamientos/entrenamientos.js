// api/supabase/entrenamientos.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gpbejvkrtdlkpxarqnkc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwYmVqdmtydGRsa3B4YXJxbmtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3NTczNTIsImV4cCI6MjA1MjMzMzM1Mn0.VO9XIzZDgA03_ZdGO4RWyG2yQKPOw0m2HvfyfBWAbh8';
const supabase = createClient(supabaseUrl, supabaseKey);

// Obtener todos los entrenamientos
export const obtenerEntrenamientos = async () => {
  try {
    const { data, error } = await supabase
      .from('entrenamientos')
      .select('*')
      .order('fecha', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error obteniendo entrenamientos:", error);
    throw error;
  }
};

// Crear un nuevo entrenamiento
export const crearEntrenamiento = async (entrenamiento) => {
  try {
    const { data, error } = await supabase
      .from('entrenamientos')
      .insert([entrenamiento])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Error creando entrenamiento:", error);
    throw error;
  }
};

// Eliminar un entrenamiento
export const eliminarEntrenamiento = async (id) => {
  try {
    const { error } = await supabase
      .from('entrenamientos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error eliminando entrenamiento:", error);
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