'use client';
import { useState, useEffect, useRef } from "react";
import { getUser } from '../api/supabase/inicioSesion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { obtenerEntrenamientos, crearEntrenamiento, eliminarEntrenamiento, checkEmailInAdmins } from '../api/entrenamientos/entrenamientos';

export default function Entrenamientos() {
  const [entrenamientos, setEntrenamientos] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState("");
  const [esAdmin, setEsAdmin] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);
  const [nuevoEntrenamiento, setNuevoEntrenamiento] = useState({
    fecha: "",
    ejercicios: "",
    estado_jugadores: "",
  });
  const router = useRouter();

  // Obtener el usuario actual
  useEffect(() => {
    const fetchUsuario = async () => {
      const user = await getUser();
      if (user) {
        setUsuarioActual(user.email);

        // Verificar si el usuario es admin
        const adminStatus = await checkEmailInAdmins(user.email);
        setEsAdmin(adminStatus);

        fetchEntrenamientos();
        
      } else {
        router.push("/");
      }
    };
    fetchUsuario();
  }, [router]);

  // Obtener entrenamientos
  const fetchEntrenamientos = async () => {
    try {
      const data = await obtenerEntrenamientos();
      setEntrenamientos(data);
    } catch (error) {
      console.error("Error obteniendo entrenamientos:", error);
    }
  };

  // Manejar creación de entrenamiento
  const handleCrearEntrenamiento = async (e) => {
    e.preventDefault();
    try {
      const entrenamiento = {
        ...nuevoEntrenamiento,
        creado_por: usuarioActual,
      };
      await crearEntrenamiento(entrenamiento);
      setModalAbierto(false);
      setNuevoEntrenamiento({
        fecha: "",
        ejercicios: "",
        estado_jugadores: "",
      });
      fetchEntrenamientos(); // Actualizar la lista de entrenamientos
    } catch (error) {
      console.error("Error creando entrenamiento:", error);
    }
  };

  // Manejar eliminación de entrenamiento
  const handleEliminarEntrenamiento = async (id) => {
    const confirmacion = window.confirm("¿Estás seguro de que deseas eliminar este entrenamiento?");
    if (!confirmacion) return;
  
    try {
      await eliminarEntrenamiento(id);
      fetchEntrenamientos(); // Actualizar la lista de entrenamientos
    } catch (error) {
      console.error("Error eliminando entrenamiento:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/'); // Redirige a la página de inicio de sesión
  };

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };
  
  return (
    <div className="container-fluid p-0 d-flex flex-column min-vh-100" style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundImage: 'url("/Fotos/fondo_entrenamientos.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      zIndex: 1,
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: -1,
      }}></div>

      <header>
        <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: 'rgba(70, 130, 180, 0)', paddingLeft: '10px', paddingRight: '10px' }} ref={menuRef}>
          <div className="container-fluid">
            
            <div className="me-auto">
              <Link className="nav-link" href="../Inicio">
                <img src="/Fotos/ZonaGol.png" alt="ZonaGol"
                className="img-fluid" style={{ height: "70px", maxWidth: "150px" }} />
              </Link>
            </div>

            {/* Botón de menú en móviles */}
            <button className="navbar-toggler" type="button" onClick={toggleMenu}>
              <span className="navbar-toggler-icon"></span>
            </button>

            {/* Menú de Navegación */}
            <div className={`collapse navbar-collapse ${menuAbierto ? "show" : ""} justify-content-end`}>
              <ul className="navbar-nav d-flex align-items-center gap-3">  
              <li className="nav-item"><Link className="nav-link" href="../Convocatorias">Convocatorias</Link></li>
                <li className="nav-item"><Link className="nav-link" href="../Goleadores">Goleadores</Link></li>
                <li className="nav-item"><Link className="nav-link" href="../Partidos">Partidos</Link></li>
                <li className="nav-item"><Link className="nav-link" href="../Asistencia">Asistencia</Link></li>
                <li className="nav-item"><Link className="nav-link" href="../Plantilla">Plantilla</Link></li>
                <li className="nav-item"><Link className="nav-link" href="../Galeria">Galería</Link></li>
                <li className="nav-item"><Link className="nav-link" href="../Mensajeria">Mensajería</Link></li>
                <li className="nav-item"><Link className="nav-link" href="../Calendario">Calendario</Link></li>
                <li className="nav-item"><Link className="nav-link" href="../Nutricion">Nutrición y Descanso</Link></li>
                {esAdmin && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" href="../Estadisticas">Estadistícas</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" href="../Scouting">Scouting</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" href="../Lesiones">Lesiones</Link>
                    </li>
                  </>
                )} 
                {/* Botón de Cerrar Sesión dentro del mismo ul */}
                <li className="nav-item">
                  <button className="btn btn-outline-light btn-tamano-uniforme" onClick={handleSignOut}>Cerrar Sesión</button>
                </li>
              </ul>
            </div>

          </div>
        </nav>
      </header>

      <main className="flex-grow-1 d-flex flex-column align-items-center justify-content-center p-3">
        <div className="card p-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '15px', maxWidth: '800px', width: '100%' }}>
          <h1 className="text-center mb-4">Entrenamientos</h1>

          {/* Botón para abrir el modal de creación de entrenamiento */}
          {esAdmin && (
            <button onClick={() => setModalAbierto(true)} className="btn btn-primary mb-4">
              Crear Entrenamiento
            </button>
          )}

          {/* Modal para crear entrenamiento */}
          {modalAbierto && (
            <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Crear Entrenamiento</h5>
                  </div>
                  <div className="modal-body">
                    <form onSubmit={handleCrearEntrenamiento}>
                      <div className="form-group">
                        <label>Fecha y hora:</label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          value={nuevoEntrenamiento.fecha}
                          onChange={(e) => setNuevoEntrenamiento({ ...nuevoEntrenamiento, fecha: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Ejercicios realizados:</label>
                        <textarea
                          className="form-control"
                          value={nuevoEntrenamiento.ejercicios}
                          onChange={(e) => setNuevoEntrenamiento({ ...nuevoEntrenamiento, ejercicios: e.target.value })}
                          required
                        ></textarea>
                      </div>
                      <div className="form-group">
                        <label>Estado de los jugadores:</label>
                        <textarea
                          className="form-control"
                          value={nuevoEntrenamiento.estado_jugadores}
                          onChange={(e) => setNuevoEntrenamiento({ ...nuevoEntrenamiento, estado_jugadores: e.target.value })}
                          required
                        ></textarea>
                      </div>
                      <button type="submit" className="btn btn-primary mt-3">Crear</button>
                      <button className="btn btn-secondary mt-3" onClick={() => setModalAbierto(false)} style={{marginLeft:'1%'}}>
                      Cerrar
                    </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lista de entrenamientos */}
          <div className="mt-4">
            {entrenamientos.map((entrenamiento) => (
              <div key={entrenamiento.id} className="card mb-3">
                <div className="card-body">
                  <h5 className="card-title">Entrenamiento del {new Date(entrenamiento.fecha).toLocaleString()}</h5>
                  <p className="card-text"><strong>Ejercicios:</strong> {entrenamiento.ejercicios}</p>
                  <p className="card-text"><strong>Estado de los jugadores:</strong> {entrenamiento.estado_jugadores}</p>
                  {esAdmin && (
                    <button
                      onClick={() => handleEliminarEntrenamiento(entrenamiento.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

        {/* Footer */}
        <footer className="text-white text-center py-2" style={{ backgroundColor: 'rgba(70, 130, 180, 0)', zIndex: 1, marginTop: '40px' }}>
          {/* Contenedor de iconos */}
          <div className="mb-3 d-flex justify-content-center gap-4">
            <a href="https://www.instagram.com/zonagol_intranet/" target="_blank" rel="noopener noreferrer">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/1200px-Instagram_icon.png" alt="Instagram" style={{ height: "40px" }} />
            </a>
            <a href="https://x.com/ZonaGolIntranet" target="_blank" rel="noopener noreferrer">
              <img src="https://img.freepik.com/free-vector/twitter-new-2023-x-logo-white-background-vector_1017-45422.jpg" alt="X (Twitter)" style={{ height: "40px", borderRadius:'50%' }} />
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