import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gpbejvkrtdlkpxarqnkc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwYmVqdmtydGRsa3B4YXJxbmtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3NTczNTIsImV4cCI6MjA1MjMzMzM1Mn0.VO9XIzZDgA03_ZdGO4RWyG2yQKPOw0m2HvfyfBWAbh8';
const supabase = createClient(supabaseUrl, supabaseKey);

// Obtener mensajes recibidos
export const obtenerMensajesRecibidos = async (usuario) => {
  try {
    const { data, error } = await supabase
      .from('mensajes')
      .select('*')
      .eq('destinatario', usuario);

    if (error) throw error;
    return data;
  } catch (error) {
    return null;
  }
};

// Enviar mensaje
export const enviarMensaje = async (remitente, destinatario, mensaje) => {
  try {
    const { data, error } = await supabase
      .from('mensajes')
      .insert([{ remitente, destinatario, mensaje }])
      .select();

    return data[0];
  } catch (error) {
    return null;
  }
};

// Obtener usuarios por rol (admin o no admin)
export const obtenerUsuariosPorRol = async (isAdmin) => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('email')
        .eq('is_admin', isAdmin);
  
      return data.map((user) => user.email); // Devuelve un array de correos
    } catch (error) {
        return null;
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