import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gpbejvkrtdlkpxarqnkc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwYmVqdmtydGRsa3B4YXJxbmtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3NTczNTIsImV4cCI6MjA1MjMzMzM1Mn0.VO9XIzZDgA03_ZdGO4RWyG2yQKPOw0m2HvfyfBWAbh8';  // Asegúrate de reemplazarlo con tu API Key
const supabase = createClient(supabaseUrl, supabaseKey);

// Obtener todos los partidos
export const getPartidos = async () => {
  try {
    const { data, error } = await supabase.from('Partidos').select('*');
    if (error) throw error;
    return data || [];
  } catch (error) {
    return [];
  }
};

// Comprobar emails para mostrar los datos
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
    return null;
  }
};

// Añadir partido
export const addPartido = async (partido, eventos) => {
  try {
    // Insertar el partido en la tabla "Partidos"
    const { data: partidoData, error: insertError } = await supabase
      .from("Partidos")
      .insert([partido])
      .select("id_partidos")
      .single();

    if (insertError) throw insertError;

    const partidoId = partidoData.id_partidos;

    // Insertar los eventos (goles, tarjetas amarillas y rojas) en la tabla "golesporpartido"
    const eventosUpdates = eventos.map(async (evento) => {
      const { nombre, goles, t_amarilla, t_roja } = evento;

      // Obtener el goleador por su nombre
      const { data: goleadorData, error: goleadorError } = await supabase
        .from("Goleadores")
        .select("nombre, dorsal")
        .eq("nombre", nombre)
        .single();

      if (goleadorError || !goleadorData) {
        return null;
      }

      const { nombre: goleadorNombre, dorsal } = goleadorData;

      // Insertar el evento en la tabla "golesporpartido"
      const { error: golesError } = await supabase.from("golesporpartido").insert([
        {
          id_partido: partidoId,
          nombre_goleador: goleadorNombre,
          dorsal,
          goles,
          t_amarilla,
          t_roja,
        },
      ]);

      if (golesError) {
        throw golesError;
      }
    });

    // Esperar a que todas las inserciones de eventos se completen
    await Promise.all(eventosUpdates);

    // Actualizar los goles de los jugadores en la tabla "Goleadores"
    const golesPorJugador = eventos.reduce((acc, evento) => {
      acc[evento.nombre] = evento.goles;
      return acc;
    }, {});

    const updateSuccess = await updateGoleadores(golesPorJugador);

    if (!updateSuccess) {
      throw new Error("Error al actualizar los goles de los jugadores.");
    }

    return true;
  } catch (error) {
    console.error("Error en addPartido:", error);
    return false;
  }
};

// Verifica si el usuario actual es administrador
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

// Obtener todos los goleadores
export const getGoleadores = async () => {
  try {
    const { data, error } = await supabase.from('Goleadores').select('*');
    if (error) throw error;
    return data || [];
  } catch (error) {
    return [];
  }
};

// Ajusta la consulta aquí para que utilice `id_partidos` de la tabla `Partidos`
export const getGoleadoresPorPartido = async (id_partido) => {
  const { data, error } = await supabase
    .from('golesporpartido')  // Tabla donde están los goleadores
    .select('*')
    .eq('id_partido', id_partido);  // Aquí usas `id_partido` de `golesporpartido`

  if (error) {
    throw error;
  }

  return data;
};

// Actualizar los goles de los jugadores de una vez
export const updateGoleadores = async (golesPorJugador) => {
  try {
    if (!golesPorJugador || typeof golesPorJugador !== 'object') {
      throw new Error('El parámetro goles debe ser un objeto válido.');
    }

    // Usamos un array de promesas para actualizar los goles de todos los jugadores de una sola vez
    const updates = Object.entries(golesPorJugador).map(async ([nombre, nuevosGoles]) => {
      if (nuevosGoles == null) {
        console.warn(`Datos inválidos para nombre ${nombre}: ${nuevosGoles}`);
        return;
      }

      // Obtener los goles actuales del jugador por su nombre
      const { data, error: fetchError } = await supabase
        .from('Goleadores')
        .select('goles')
        .eq('nombre', nombre)
        .single();

      if (fetchError || !data) {
        return;
      }

      // Sumamos los goles actuales con los nuevos goles
      const golesTotales = (data.goles || 0) + nuevosGoles;

      // Actualizar los goles del jugador en la base de datos
      const { error } = await supabase
        .from('Goleadores')
        .update({ goles: golesTotales })
        .eq('nombre', nombre);

      if (error) {
        throw error;
      }
    });

    // Esperamos que todas las actualizaciones se completen
    await Promise.all(updates);
    return true;
  } catch (error) {
    console.error("Error en updateGoleadores:", error);
    return false;
  }
};

// Eliminar partido
export const deletePartido = async (id_partido) => {
  try {
    // Primero, eliminar los eventos asociados al partido
    const { error: deleteEventosError } = await supabase
      .from('golesporpartido')
      .delete()
      .eq('id_partido', id_partido);

    if (deleteEventosError) {
      throw deleteEventosError;
    }

    // Luego, eliminar el partido
    const { error: deletePartidoError } = await supabase
      .from('Partidos')
      .delete()
      .eq('id_partidos', id_partido);

    if (deletePartidoError) {
      throw deletePartidoError;
    }

    return true;
  } catch (error) {
    return false;
  }
};