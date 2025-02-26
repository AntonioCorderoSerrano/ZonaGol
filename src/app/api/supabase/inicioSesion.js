import { supabase } from './supabaseClient';

// Verifica si hay una sesión activa
export async function checkSession() {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data?.session) {
      return null; // No hay sesión activa, pero no mostramos el error
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

export const checkEmailInAdmins = async (email) => {
  try {
    const { data } = await supabase
      .from('admins') 
      .select('email, is_admin') 
      .eq('email', email) 
      .maybeSingle(); 

    return data && data.is_admin === true;
  } catch (err) {
    return null;
  }
};