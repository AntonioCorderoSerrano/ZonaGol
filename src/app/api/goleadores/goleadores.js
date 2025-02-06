import Partidos from '@/app/Partidos/Partidos';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gpbejvkrtdlkpxarqnkc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwYmVqdmtydGRsa3B4YXJxbmtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3NTczNTIsImV4cCI6MjA1MjMzMzM1Mn0.VO9XIzZDgA03_ZdGO4RWyG2yQKPOw0m2HvfyfBWAbh8';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Obtiene el usuario autenticado.
 * @returns {Promise<object|null>} El usuario autenticado o `null` si no hay sesión activa.
 */
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

/**
 * Obtiene los datos de la tabla `Goleadores`.
 * @returns {Promise<Array>} Lista de goleadores o un array vacío si hay errores.
 */
export const getGoleadores = async () => {
  try {
    // Obtener datos de Goleadores
    const { data: goleadores, error: goleadoresError } = await supabase
      .from('Goleadores')
      .select('*');

    if (goleadoresError) throw goleadoresError;

    // Obtener datos de Jugadores
    const { data: jugadores, error: jugadoresError } = await supabase
      .from('jugadores')
      .select('dorsal, foto_url');

    if (jugadoresError) throw jugadoresError;

    // Relacionar manualmente los datos
    const goleadoresConFotos = goleadores.map(goleador => {
      const jugador = jugadores.find(j => j.dorsal === goleador.dorsal);
      return {
        Nombre: goleador.nombre?.trim() || 'Desconocido',
        Dorsal: goleador.dorsal || '-',
        Goles: goleador.goles || 0,
        Partidos: goleador.partidos || 0,
        Foto: jugador?.foto_url || null, // Asignar la foto si existe
      };
    });

    return goleadoresConFotos;
  } catch (err) {
    return [];
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

/**
 * Actualiza los goles de un jugador.
 * @param {string} nombreJugador Nombre del jugador.
 * @param {number} nuevosGoles Nuevos goles a asignar.
 * @returns {Promise<object|null>} Los datos actualizados o `null` si ocurre un error.
 */
export const updateGoles = async (nombreJugador, nuevosGoles) => {
  if (!nombreJugador || !nuevosGoles) {
    throw new Error('Datos incompletos para actualizar los goles.');
  }

  try {
    const { data, error, count } = await supabase
      .from('Goleadores')
      .update({ goles: nuevosGoles })
      .eq('nombre', nombreJugador);

    if (count === 0) {
      console.warn(
        'No se actualizó ningún registro. Verifica que el nombre del jugador sea correcto.'
      );
    }

    return data;
  } catch (err) {
  }
};