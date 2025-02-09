import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import 'bootstrap/dist/css/bootstrap.min.css';
import { signInSupabase, checkSession } from '../api/supabase/inicioSesion';

export default function Inicio() {
  const router = useRouter();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const session = await checkSession();
        if (session) {
          router.push('/Inicio'); // Redirige si hay sesión activa
        }
      } catch (err) {
        console.error("Error checking active session:", err); // Opcional: Log para depuración
      }
    };
  
    checkActiveSession();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const user = await signInSupabase(correo, password);
  
      if (user) {
        router.push('/Inicio'); // Redirige si el inicio de sesión es exitoso
      } else {
        setError('Usuario o contraseña incorrectos.'); // Mensaje genérico
      }
    } catch (err) {
      console.error("Login error:", err); // Opcional: Log para depuración
      setError('Ocurrió un error al iniciar sesión. Inténtalo de nuevo.'); // Mensaje genérico
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundImage: 'url("/Fotos/fondo_inicioSesion.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    }}>
      {/* Capa semitransparente sobre la imagen */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 0,
      }}></div>

      <div className="container d-flex flex-column justify-content-center align-items-center" style={{
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
      }}>
        {/* Imagen de ZonaGol en el inicio */}
        <div className="text-center mb-2">
          <img src="/Fotos/ZonaGol.png" alt="ZonaGol" className="img-fluid" style={{
            maxWidth: '200px',
            height: 'auto',
          }} />
        </div>

        {/* Formulario más grande */}
        <form onSubmit={handleSubmit} className="p-5 rounded shadow-sm" style={{
          maxWidth: '700px',
          width: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          marginBottom: '10%',
          zIndex: 2,
        }}>
          <h1 className="text-center" style={{ color: '#000', fontSize: '2rem' }}>Inicio de Sesión</h1>

          <div className="mb-4">
            <label htmlFor="usuario" className="form-label">Usuario:</label>
            <input
              type="email"
              id="usuario"
              name="usuario"
              placeholder="Ingresa tu usuario"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="form-control form-control-lg"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label">Contraseña:</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Ingresa tu contraseña"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control form-control-lg"
            />
          </div>

          {/* Botón con color azul oscuro y ligeramente transparente */}
          <button type="submit" className="btn" style={{
            backgroundColor: 'rgba(204,231,162,255)',
            color: '#002c4b',
            width: '100%',
            fontSize: '1.25rem',
            borderRadius: '50px',
          }}>
            Iniciar Sesión
          </button>

          {/* Mostrar el error debajo del botón */}
          {error && (
            <div className="alert alert-danger" style={{
              fontSize: '1rem',
              marginTop: '10px',
              color: '#721c24',
            }}>
              {error}
            </div>
          )}

          {/* Botón para el registro de nuevo usuario */}
          <div className="text-center mt-4">
            <p style={{
              color: 'rgba(0, 0, 0, 0.8)',
              fontSize: '1.1rem',
              fontWeight: '500',
            }}>
              ¿Eres nuevo usuario?
            </p>

            <Link href="../Registro">
              <button className="btn" style={{
                backgroundColor: 'rgba(255,237,215,255)',
                color: '#002c4b',
                fontSize: '1rem',
                fontWeight: '600',
                padding: '10px 20px',
                borderRadius: '50px',
                border: 'none',
                transition: 'background-color 0.3s ease',
              }}>
                Regístrate aquí
              </button>
            </Link>
          </div>
        </form>
      </div>

      {/* Footer */}
      <footer className="text-white text-center py-2" style={{ backgroundColor: 'rgba(70, 130, 180, 0)', zIndex: 2, marginTop: '40px' }}>
        {/* Contenedor de iconos */}
        <div className="mb-3 d-flex justify-content-center gap-4">
          <a href="https://www.instagram.com/zonagol_intranet/" target="_blank" rel="noopener noreferrer">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/1200px-Instagram_icon.png" alt="Instagram" style={{ height: "40px" }} />
          </a>
          <a href="https://x.com/ZonaGolIntranet" target="_blank" rel="noopener noreferrer">
            <img src="https://img.freepik.com/free-vector/twitter-new-2023-x-logo-white-background-vector_1017-45422.jpg" alt="X (Twitter)" style={{ height: "40px", borderRadius: '50%' }} />
          </a>
          <a href="https://www.facebook.com/zonagolintranet/" target="_blank" rel="noopener noreferrer">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1200px-Facebook_Logo_%282019%29.png" alt="Facebook" style={{ height: "40px" }} />
          </a>
        </div>

        {/* Texto de derechos reservados */}
        <p>&copy; 2025 ZonaGol. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}