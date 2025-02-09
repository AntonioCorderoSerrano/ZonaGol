import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gpbejvkrtdlkpxarqnkc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwYmVqdmtydGRsa3B4YXJxbmtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3NTczNTIsImV4cCI6MjA1MjMzMzM1Mn0.VO9XIzZDgA03_ZdGO4RWyG2yQKPOw0m2HvfyfBWAbh8';
const supabase = createClient(supabaseUrl, supabaseKey);

// Obtener todos los eventos
export const obtenerEventos = async () => {
  try {
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .order('fecha_inicio', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error obteniendo eventos:", error);
    throw error;
  }
};

// Crear un nuevo evento
export const crearEvento = async (evento) => {
  try {
    const { data, error } = await supabase
      .from('eventos')
      .insert([evento])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Error creando evento:", error);
    throw error;
  }
};

// Eliminar un evento
export const eliminarEvento = async (id) => {
  try {
    const { error } = await supabase
      .from('eventos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error eliminando evento:", error);
    throw error;
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

// Verifica si el usuario es administrador
export const getUserAdminStatus = async (email) => {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('is_admin')
      .eq('email', email)
      .single();

    if (error) {
      return null;
    }

    return data?.is_admin || false;
  } catch (err) {
    return null;
  }
};

// Modificar un evento existente
export const modificarEvento = async (id, eventoActualizado) => {
  try {
    const { data, error } = await supabase
      .from('eventos')
      .update(eventoActualizado)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Error modificando evento:", error);
    throw error;
  }
};