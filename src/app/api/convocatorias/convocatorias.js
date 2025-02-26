import { supabase } from '../supabase/supabaseClient';

// Obtener las convocatorias desde la base de datos
export const getConvocatorias = async () => {
  try {
    console.log("Iniciando la obtención de convocatorias...");

    // Obtener datos de Convocatorias
    const { data: convocatorias, error: convocatoriasError } = await supabase
      .from('Convocatorias')
      .select('*');

    if (convocatoriasError) throw convocatoriasError;
    console.log("Convocatorias obtenidas:", convocatorias);

    // Obtener datos de Jugadores (solo dorsal y foto_url)
    const { data: jugadores, error: jugadoresError } = await supabase
      .from('jugadores')
      .select('dorsal, foto_url');

    if (jugadoresError) throw jugadoresError;
    console.log("Jugadores obtenidos:", jugadores);

    // Crear un mapa de jugadores para optimizar la búsqueda
    const jugadoresMap = jugadores.reduce((map, jugador) => {
      map[jugador.dorsal] = jugador;
      return map;
    }, {});

    // Definir URL de imagen por defecto
    const imagenPorDefecto = "https://cdn-icons-png.flaticon.com/512/63/63699.png";

    // Relacionar convocatorias con las fotos de los jugadores
    const convocatoriasConFotos = convocatorias.map(convocatoria => {
      const jugador = jugadoresMap[convocatoria.dorsal];
      console.log(`Procesando convocatoria de ${convocatoria.nombre}, dorsal: ${convocatoria.dorsal}`);
      console.log("Jugador encontrado:", jugador);

      // Usar la foto_url directamente si existe, o la imagen por defecto si no
      const fotoUrl = jugador?.foto_url ? jugador.foto_url : imagenPorDefecto;

      console.log(`Foto URL para ${convocatoria.nombre}:`, fotoUrl);

      return {
        ...convocatoria,
        Foto: fotoUrl, // Foto final asignada al jugador
      };
    });

    console.log("Convocatorias finales con fotos:", convocatoriasConFotos);
    return convocatoriasConFotos;
  } catch (err) {
    return [];
  }
};

// Obtener los detalles del partido desde la tabla Datos_partidos donde id = 1
export const getPartidoDetalles = async () => {
  const { data, error } = await supabase
    .from('Datos_partidos')
    .select('*')
    .eq('id', 1)
    .single();  // Obtener solo el registro con id = 1

  if (error) {
    throw error;
  }

  return data;
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

// Modificar los detalles del partido
export const modificarPartido = async (nuevoPartido) => {
  try {
    const { error } = await supabase
      .from('Datos_partidos')
      .update({
        Rival: nuevoPartido.rival,
        Fecha: nuevoPartido.fecha,
        Hora: nuevoPartido.hora,
        Lugar: nuevoPartido.lugar,
        Equipación: nuevoPartido.equipacion,
      })
      .eq('id', 1);

    if (error) {
      throw error;
    }
  } catch (error) {
    return null;
  }
};

// Convocar a un jugador
export const convocarJugador = async (jugadorId) => {
  try {
    // Actualizar convocatoria a true en la tabla Convocatorias
    const { error: convocarError } = await supabase
      .from('Convocatorias')
      .update({ convocatoria: true })
      .eq('dorsal', jugadorId);

    if (convocarError) {
      throw convocarError;
    }

    // Obtener los partidos actuales del jugador
    const { data, error: selectError } = await supabase
      .from('Goleadores')
      .select('partidos')
      .eq('dorsal', jugadorId)
      .single();

    if (selectError) {
      throw selectError;
    }

    // Si no tiene partidos (es null), inicializamos en 0
    const partidosActuales = data.partidos ?? 0;

    // Actualizar el número de partidos, sumando 1
    const { error: updateError } = await supabase
      .from('Goleadores')
      .update({ partidos: partidosActuales + 1 })
      .eq('dorsal', jugadorId);

    if (updateError) {
      throw updateError;
    }

    // Obtener las convocatorias actualizadas
    const convocatorias = await getConvocatorias(); // Asegúrate de que esta función esté definida correctamente
  } catch (error) {
    throw error;
  }
};

// Desconvocar a un jugador
export const desconvocarJugador = async (jugadorId) => {
  try {
    // Verificar si el jugador estaba convocado
    const { data: convocatoriaData, error: checkConvocatoriaError } = await supabase
      .from('Convocatorias')
      .select('convocatoria')
      .eq('dorsal', jugadorId)
      .single();

    if (checkConvocatoriaError) throw checkConvocatoriaError;

    // Si el jugador está convocado
    if (convocatoriaData?.convocatoria === true) {
      // Actualizar convocatoria a false
      const { error: desconvocarError } = await supabase
        .from('Convocatorias')
        .update({ convocatoria: false })
        .eq('dorsal', jugadorId);

      if (desconvocarError) throw desconvocarError;

      // Obtener partidos actuales del jugador en Goleadores
      const { data: goleadorData, error: selectError } = await supabase
        .from('Goleadores')
        .select('partidos')
        .eq('dorsal', jugadorId)
        .single();

      if (selectError) throw selectError;

      const partidosActuales = goleadorData?.partidos ?? 0;

      // Restar 1 a partidos solo si es mayor a 0
      if (partidosActuales > 0) {
        const { error: updateError } = await supabase
          .from('Goleadores')
          .update({ partidos: partidosActuales - 1 })
          .eq('dorsal', jugadorId);

        if (updateError) throw updateError;
      }

      // Obtener las convocatorias actualizadas (si necesitas actualizarlas en la UI o mostrar)
      const convocatorias = await getConvocatorias(); // Define esta función si aún no lo has hecho
    }
  } catch (error) {
  }
};


export const restablecerPartido = async () => {
  try {
    // Restablecer los detalles del partido
    const { error: partidoError } = await supabase
      .from('Datos_partidos')
      .update({
        Rival: '',  // Ajusta los valores por defecto según corresponda
        Fecha: null, // Establecer la fecha a null
        Hora: null,  // Establecer la hora a null
        Lugar: '',
        Equipación: '',
      })
      .eq('id', 1);

    if (partidoError) {
      throw partidoError;
    }

    // Actualizar las convocatorias para poner todas las columnas con true en false
    const { error: convocatoriasError } = await supabase
      .from('Convocatorias')
      .update({ convocatoria: false }) // Cambiar a false
      .eq('convocatoria', true); // Solo afecta las filas donde convocatoria es true

    if (convocatoriasError) {
      throw convocatoriasError;
    }

  } catch (error) {
  }
};