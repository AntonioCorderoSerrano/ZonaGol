import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gpbejvkrtdlkpxarqnkc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwYmVqdmtydGRsa3B4YXJxbmtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3NTczNTIsImV4cCI6MjA1MjMzMzM1Mn0.VO9XIzZDgA03_ZdGO4RWyG2yQKPOw0m2HvfyfBWAbh8';
const supabase = createClient(supabaseUrl, supabaseKey);

export const getUser = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return null;
  }

  return data.user;
};

// Obtener registros de asistencia
export const getAsistencia = async () => {
  try {
    // Obtener el usuario autenticado
    const user = await getUser();

    if (!user) {
      return null; // No hacer nada si no hay usuario autenticado
    }

    // Verificar si el correo del usuario está en la tabla "admins"
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', user.email)
      .single();

    if (adminError || !adminData) {
      return null; // No hacer nada si el correo no está en la tabla "admins"
    }

    // Extraer el estado del usuario y su futbolista asociado
    const { is_admin, futbolista } = adminData;

    if (is_admin) {
      // Si es admin, devolver todos los registros de "Goleadores" y sus fotos
      const { data: jugadores, error } = await supabase.from('Goleadores').select('nombre, dorsal');
      if (error) {
        return null; // No hacer nada si hay un error al obtener jugadores
      }

      // Ahora buscamos las fotos de los jugadores en la tabla "jugadores"
      const { data: jugadoresConFotos, error: fotoError } = await supabase.from('jugadores').select('nombre, foto_url, fecha_nacimiento, posicion');

      if (fotoError) {
        return null; // No hacer nada si hay un error al obtener las fotos
      }

      // Asignar la foto de cada jugador en los registros
      const jugadoresConFoto = jugadores.map((jugador) => {
        const foto = jugadoresConFotos.find((j) => j.nombre === jugador.nombre);
        return {
          ...jugador,
          foto_url: foto ? foto.foto_url : null,
          fecha_nacimiento: foto ? foto.fecha_nacimiento : null,
          posicion: foto ? foto.posicion : null
        };
      });

      return { data: jugadoresConFoto, isAdmin: true };
    } else {
      // Si no es admin, devolver registros de asistencia del futbolista asociado
      const { data: asistencias, error } = await supabase
        .from('asistencia')
        .select('*')
        .eq('nombre', futbolista) // Limitar por el nombre del futbolista asociado
        .order('fecha', { ascending: false });

      // Ahora buscamos las fotos de los jugadores en la tabla "jugadores"
      const { data: jugadoresConFotos, error: fotoError } = await supabase.from('jugadores').select('nombre, foto_url, fecha_nacimiento, posicion');

      if (fotoError) {
        return null; // No hacer nada si hay un error al obtener las fotos
      }

      // Obtener la foto del futbolista
      const futbolistaConFoto = jugadoresConFotos.find((j) => j.nombre === futbolista);

      // Asignar la foto a las asistencias
      const asistenciasConFotos = asistencias.map((asistencia) => {
        const jugador = jugadoresConFotos.find((j) => j.nombre === asistencia.nombre);
        return {
          ...asistencia,
          foto_url: jugador ? jugador.foto_url : null,
          fecha_nacimiento: jugador ? jugador.fecha_nacimiento : null,
          posicion: jugador ? jugador.posicion : null
        };
      });

      return { 
        data: asistenciasConFotos, 
        isAdmin: false, 
        futbolistaFoto: futbolistaConFoto ? futbolistaConFoto.foto_url : null,
        futbolistaNombre: futbolistaConFoto ? futbolistaConFoto.nombre : null,
        futbolistaNacimiento: futbolistaConFoto ? futbolistaConFoto.fecha_nacimiento : null,
        futbolistaPosicion: futbolistaConFoto ? futbolistaConFoto.posicion : null
      };
    }
  } catch (error) {
    return null; // No hacer nada si ocurre un error inesperado
  }
};

// Registrar asistencia o actualizar registro existente
export const registrarAsistencia = async (nombre, dorsal, asistencia, fecha) => {
  try {
    // Verificar si el registro ya existe
    const { data: registroExistente, error: errorExistente } = await supabase
      .from('asistencia')
      .select('*')
      .eq('nombre', nombre)
      .eq('dorsal', dorsal)
      .eq('fecha', fecha)
      .single();

    if (errorExistente && errorExistente.code !== 'PGRST116') {
      // Error distinto de "No rows found"
      throw errorExistente;
    }

    if (registroExistente) {
      // Si el registro ya existe, actualizarlo
      const { error: errorActualizacion } = await supabase
        .from('asistencia')
        .update({ asistencia })
        .eq('id', registroExistente.id);

      if (errorActualizacion) {
        throw errorActualizacion;
      }

    } else {
      // Si el registro no existe, insertarlo
      const { error: errorInsercion } = await supabase.from('asistencia').insert([
        {
          nombre,
          dorsal,
          fecha,
          asistencia,
        },
      ]);

      if (errorInsercion) {
        throw errorInsercion;
      }

    }
  } catch (err) {
  }
};

// Actualizar motivo de ausencia para un registro en la tabla asistencia
export const actualizarMotivoAusencia = async (id, motivo) => {
  try {
    const { error } = await supabase
      .from('asistencia')
      .update({ motivo_ausencia: motivo }) // Asegúrate de que se actualice 'motivo_ausencia'
      .eq('id', id);

    if (error) throw error;
  } catch (err) {
    return null;
  }
};

// Obtener todos los registros de la tabla asistencia
export const getAsistenciaCompleta = async () => {
  try {
    const { data, error } = await supabase
      .from('asistencia')
      .select('*')
      .order('fecha', { ascending: false });

    return data;
  } catch (err) {
    throw err;
  }
};

// Añadir un nuevo usuario admin
export const añadirUsuarioAdmin = async (email, isAdmin, futbolista) => {
  try {
    // Convertir isAdmin a un booleano
    const isAdminBoolean = String(isAdmin).toLowerCase() === "sí";

    // Si es admin, futbolista será null
    const futbolistaValue = isAdminBoolean ? null : futbolista;

    // Insertar datos en la tabla "admins"
    const { data, error } = await supabase.from('admins').insert([
      {
        email: email,
        is_admin: isAdminBoolean,
        futbolista: futbolistaValue,
      },
    ]);

    return data;
  } catch (err) {
    throw err;
  }
};

export const fetchEmails = async () => {
  try {
    const { data, error } = await supabase.from('admins').select('email');
    if (error) throw error;
    return data.map(admin => admin.email); // Devuelve la lista de emails
  } catch (err) {
    return [];
  }
};

export const eliminarUsuarioAdmin = async (email) => {
  try {
    const { data, error } = await supabase
      .from('admins')
      .delete()
      .eq('email', email);

    if (error) throw error;

    return data;
  } catch (err) {
    return null;
  }
};

// Obtener la lista de jugadores
export const fetchJugadores = async () => {
  try {
    const { data, error } = await supabase.from("jugadores").select("nombre, dorsal");

    return data;
  } catch (err) {
    return null
  }
};

// Obtener el email del admin asociado al futbolista
export const getAdminEmailByFutbolista = async (futbolista) => {
  try {
    console.log('Consultando email para futbolista:', futbolista); // Verificación del futbolista
    const { data, error } = await supabase
      .from('admins')
      .select('email')
      .eq('futbolista', futbolista)
      .maybeSingle(); // Cambié a maybeSingle() para manejar la falta de registros.

    if (error) {
      return null;
    }

    if (!data?.email) {
      console.log('No se encontró el email para el futbolista:', futbolista);
      return { email: null };  // Si no se encuentra email, se maneja con null
    }

    console.log('Email obtenido:', data?.email);
    return { email: data?.email };  // Retorna el email encontrado
  } catch (err) {
    return null
  }
};