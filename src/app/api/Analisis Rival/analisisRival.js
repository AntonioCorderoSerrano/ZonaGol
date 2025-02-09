import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gpbejvkrtdlkpxarqnkc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwYmVqdmtydGRsa3B4YXJxbmtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3NTczNTIsImV4cCI6MjA1MjMzMzM1Mn0.VO9XIzZDgA03_ZdGO4RWyG2yQKPOw0m2HvfyfBWAbh8';
const supabase = createClient(supabaseUrl, supabaseKey);

export const getAnalisisTacticos = async () => {
  try {
    const { data, error } = await supabase
      .from('analisistactico')
      .select('*');
    if (error) throw new Error(`Error al obtener análisis tácticos: ${error.message}`);
    return data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getAnalisisTacticoById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('analisistactico')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(`Error al obtener el análisis táctico: ${error.message}`);
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const createAnalisisTactico = async (analisis) => {
  if (!analisis.equipo || !analisis.modelo_de_juego) {
    throw new Error('Equipo y Modelo de Juego son campos obligatorios');
  }
  try {
    const { data, error } = await supabase
      .from('analisistactico')
      .insert([analisis])
      .select()
      .single();
    if (error) throw new Error(`Error al crear el análisis táctico: ${error.message}`);
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const deleteAnalisisTactico = async (id) => {
  try {
    const { error } = await supabase
      .from('analisistactico')
      .delete()
      .eq('id', id);
    if (error) throw new Error(`Error al eliminar el análisis táctico: ${error.message}`);
    return true;
  } catch (err) {
    console.error(err);
    return false;
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