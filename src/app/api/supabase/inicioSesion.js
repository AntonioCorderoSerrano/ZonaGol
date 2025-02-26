import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://gpbejvkrtdlkpxarqnkc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwYmVqdmtydGRsa3B4YXJxbmtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3NTczNTIsImV4cCI6MjA1MjMzMzM1Mn0.VO9XIzZDgA03_ZdGO4RWyG2yQKPOw0m2HvfyfBWAbh8';
const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: true, // Persiste la sesión en el almacenamiento local
      autoRefreshToken: true, // Habilita la renovación automática del token
      detectSessionInUrl: false, // Evita manejar sesiones en URLs
    },
  }
);

// Verifica si hay una sesión activa
export async function checkSession() {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data?.session) {
      return null;
    }

    return data.session;
  } catch (err) {
    return null;
  }
}

// Inicia sesión con correo y contraseña
export async function signInSupabase(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return null;
    }

    return data;
  } catch (err) {
    return null;
  }
}

// Cierra la sesión
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return null;
    }
  } catch (err) {
    return null;
  }
}

// Registra un nuevo usuario
export async function signUpSupabase(email, password) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return null;
    }

    return data;
  } catch (err) {
    return null;
  }
}

// Obtiene el usuario autenticado
export const getUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
      return null;
    }

    return data.user;
  } catch (err) {
    return null;
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

// Envía un correo para restablecer la contraseña
export async function sendPasswordResetEmail(email) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      return null;
    }
  } catch (err) {
    return null;
  }
}