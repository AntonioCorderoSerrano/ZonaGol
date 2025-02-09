import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://gpbejvkrtdlkpxarqnkc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwYmVqdmtydGRsa3B4YXJxbmtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3NTczNTIsImV4cCI6MjA1MjMzMzM1Mn0.VO9XIzZDgA03_ZdGO4RWyG2yQKPOw0m2HvfyfBWAbh8';
const supabase = createClient(supabaseUrl, supabaseKey);

// Obtener todas las lesiones
export const obtenerLesiones = async () => {
  try {
    const { data, error } = await supabase
      .from('lesiones') // Nombre de la tabla en Supabase
      .select('*'); // Selecciona todas las columnas

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error obteniendo lesiones:", error);
    return [];
  }
};

// Agregar una nueva lesión
export const agregarLesion = async (nuevaLesion) => {
  try {
    const { data, error } = await supabase
      .from('lesiones')
      .insert([nuevaLesion])
      .select(); // Devuelve la lesión insertada con su ID

    if (error) throw error;
    return data[0]; // Devuelve la lesión con su ID
  } catch (error) {
    console.error("Error agregando lesión:", error);
    return null;
  }
};

// Actualizar una lesión existente
export const actualizarLesion = async (id_lesion, datosActualizados) => {
  try {
    const { data, error } = await supabase
      .from('lesiones')
      .update(datosActualizados) // Actualiza los datos
      .eq('id_lesion', id_lesion) // Filtra por ID de la lesión
      .select(); // Devuelve la lesión actualizada

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error actualizando lesión:", error);
    return null;
  }
};

// Eliminar una lesión
export const eliminarLesion = async (id_lesion) => {
  try {
    const { error } = await supabase
      .from('lesiones')
      .delete() // Elimina la lesión
      .eq('id_lesion', id_lesion); // Filtra por ID de la lesión

    if (error) throw error;
    return true; // Indica que la eliminación fue exitosa
  } catch (error) {
    console.error("Error eliminando lesión:", error);
    return false;
  }
};

export const obtenerJugadores = async () => {
  try {
    const { data, error } = await supabase
      .from('jugadores') 
      .select('*'); 

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error obteniendo lesiones:", error);
    return [];
  }
};

export const checkEmailInAdmins = async (email) => {
  try {
    const { data } = await supabase
      .from('admins') 
      .select('email, is_admin') 
      .eq('email', email) 
      .maybeSingle(); 

    return data && data.is_admin === true;
  } catch (err) {
    return false;
  }
};