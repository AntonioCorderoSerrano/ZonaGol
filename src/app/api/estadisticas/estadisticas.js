import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gpbejvkrtdlkpxarqnkc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwYmVqdmtydGRsa3B4YXJxbmtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3NTczNTIsImV4cCI6MjA1MjMzMzM1Mn0.VO9XIzZDgA03_ZdGO4RWyG2yQKPOw0m2HvfyfBWAbh8';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Obtiene la lista de jugadores.
 * @returns {Promise<Array>} Lista de jugadores.
 */
export const getJugadores = async () => {
  try {
    const { data, error } = await supabase
      .from('jugadores')
      .select('*');

    if (error) throw error;

    return data;
  } catch (err) {
    return [];
  }
};

/**
 * Obtiene la asistencia de un jugador específico.
 * @param {string} nombreJugador Nombre del jugador.
 * @returns {Promise<Array>} Lista de asistencias del jugador.
 */
export const getAsistenciaByJugador = async (nombreJugador) => {
  try {
    const { data, error } = await supabase
      .from('asistencia')
      .select('*')
      .eq('nombre', nombreJugador);

    if (error) throw error;

    return data;
  } catch (err) {
    return [];
  }
};

/**
 * Obtiene los goles por partido de un jugador específico.
 * @param {string} nombreJugador Nombre del jugador.
 * @returns {Promise<Array>} Lista de goles por partido del jugador.
 */
export const getGolesByJugador = async (nombreJugador) => {
  try {
    const { data, error } = await supabase
      .from('golesporpartido')
      .select('*')
      .eq('nombre_goleador', nombreJugador); // O el nombre correcto de la columna

    if (error) throw error;

    return data;
  } catch (err) {
    console.error(err);
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
