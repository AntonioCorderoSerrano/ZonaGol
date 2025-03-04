import { supabase } from '../supabase/supabaseClient';

// Función para registrar un usuario
export const registerUser = async (email, password) => {
  try {
    // Validar que la contraseña tenga al menos 6 caracteres
    if (password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres.');
    }

    // Intentar registrar el usuario
    const { user, error } = await supabase.auth.signUp({
      email, 
      password,
    });

    if (error) {
      if (error.message.includes('already registered')) {
        throw new Error('Este correo ya está registrado');
      }
      throw error;  // Si el error no es uno de los casos conocidos, lo ignoramos
    }

    return user; // Retorna el usuario registrado
  } catch (error) {
    // Solo lanzamos errores de contraseña o usuario ya registrado
    if (error.message !== 'La contraseña debe tener al menos 6 caracteres.' && !error.message.includes('already registered')) {
      return null;  // No mostramos otros errores
    }
    throw error;  // Lanzamos solo los errores específicos
  }
};