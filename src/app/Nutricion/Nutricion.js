import React, { useState, useEffect, useRef } from "react";
import { getUser } from '../api/supabase/inicioSesion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { obtenerRecomendaciones, crearRecomendacion, eliminarRecomendacion, checkEmailInAdmins } from '../api/nutricion_descanso/nutricion_descanso';

export default function NutricionDescanso() {
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState("");
  const [esAdmin, setEsAdmin] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);
  const [nuevaRecomendacion, setNuevaRecomendacion] = useState({
    titulo: "",
    descripcion: "",
    tipo: "nutricion",
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

        fetchRecomendaciones();
      } else {
        router.push("/");
      }
    };
    fetchUsuario();
  }, [router]);

  // Obtener recomendaciones
  const fetchRecomendaciones = async () => {
    try {
      const data = await obtenerRecomendaciones();
      setRecomendaciones(data);
    } catch (error) {
      console.error("Error obteniendo recomendaciones:", error);
    }
  };

  // Manejar creación de recomendación
  const handleCrearRecomendacion = async (e) => {
    e.preventDefault();
    try {
      const recomendacion = {
        ...nuevaRecomendacion,
        creado_por: usuarioActual,
        fecha_creacion: new Date().toISOString(),
      };
      await crearRecomendacion(recomendacion);
      setModalAbierto(false);
      setNuevaRecomendacion({
        titulo: "",
        descripcion: "",
        tipo: "nutricion",
      });
      fetchRecomendaciones(); // Actualizar la lista de recomendaciones
    } catch (error) {
      console.error("Error creando recomendación:", error);
    }
  };

  // Manejar eliminación de recomendación
  const handleEliminarRecomendacion = async (id) => {
    try {
      await eliminarRecomendacion(id);
      fetchRecomendaciones(); // Actualizar la lista de recomendaciones
    } catch (error) {
      console.error("Error eliminando recomendación:", error);
    }
  };

  // Alternar el menú en dispositivos móviles
  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  // Cerrar sesión
    const handleSignOut = async () => {
      await signOut();
      router.push('/');
    };

  return (
    <div className="container-fluid p-0 d-flex flex-column min-vh-100" style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundImage: 'url("/Fotos/fondo_nutricion.jpg")',
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
              <img src="/Fotos/ZonaGol.png" alt="ZonaGol" className="img-fluid" style={{ height: "70px", maxWidth: "150px" }} />
            </Link>
          </div>
  
          <button className="navbar-toggler" type="button" onClick={toggleMenu}>
            <span className="navbar-toggler-icon"></span>
          </button>
  
          <div className={`collapse navbar-collapse ${menuAbierto ? "show" : ""} justify-content-end`}>
            <ul className="navbar-nav d-flex align-items-center gap-3">
              <li className="nav-item"><Link className="nav-link" href="../Conocatorias">Convocatorias</Link></li>
              <li className="nav-item"><Link className="nav-link" href="../Goleadores">Goleadores</Link></li>
              <li className="nav-item"><Link className="nav-link" href="../Partidos">Partidos</Link></li>
              <li className="nav-item"><Link className="nav-link" href="../Asistencia">Asistencia</Link></li>
              <li className="nav-item"><Link className="nav-link" href="../Plantilla">Plantilla</Link></li>
              <li className="nav-item"><Link className="nav-link" href="../Galeria">Galería</Link></li>
              <li className="nav-item"><Link className="nav-link" href="../Mensajeria">Mensajería</Link></li>
              <li className="nav-item"><Link className="nav-link" href="../Calendario">Calendario</Link></li>
              {esAdmin && (
                <>
                  <li className="nav-item"><Link className="nav-link" href="../Estadisticas">Estadistícas</Link></li>
                  <li className="nav-item"><Link className="nav-link" href="../Scouting">Scouting</Link></li>
                  <li className="nav-item"><Link className="nav-link" href="../Lesiones">Lesiones</Link></li>
                  <li className="nav-item">
                      <Link className="nav-link" href="../Entrenamientos">Entrenamientos</Link>
                    </li>
                </>
              )}
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
          <h1 className="text-center mb-4">Nutrición y Descanso</h1>

          {/* Botón para abrir el modal de creación de recomendación */}
          {esAdmin && (
            <button onClick={() => setModalAbierto(true)} className="btn btn-outline-primary mb-4">
              Crear Recomendación
            </button>
          )}

          {/* Modal para crear recomendación */}
          {modalAbierto && (
            <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Crear Recomendación</h5>
                  </div>
                  <div className="modal-body">
                    <form onSubmit={handleCrearRecomendacion}>
                      <div className="form-group">
                        <label>Título:</label>
                        <input
                          type="text"
                          className="form-control"
                          value={nuevaRecomendacion.titulo}
                          onChange={(e) => setNuevaRecomendacion({ ...nuevaRecomendacion, titulo: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Descripción:</label>
                        <textarea
                          className="form-control"
                          value={nuevaRecomendacion.descripcion}
                          onChange={(e) => setNuevaRecomendacion({ ...nuevaRecomendacion, descripcion: e.target.value })}
                          required
                        ></textarea>
                      </div>
                      <div className="form-group">
                        <label>Tipo de recomendación:</label>
                        <select
                          className="form-control"
                          value={nuevaRecomendacion.tipo}
                          onChange={(e) => setNuevaRecomendacion({ ...nuevaRecomendacion, tipo: e.target.value })}
                        >
                          <option value="nutricion">Nutrición</option>
                          <option value="descanso">Descanso</option>
                        </select>
                      </div>
                      <button type="submit" className="btn btn-primary mt-3">Crear</button>
                      <button className="btn btn-secondary mt-3" style={{ marginLeft: '1%'}} onClick={() => setModalAbierto(false)}>
                        Cerrar
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lista de recomendaciones */}
          <div className="mt-4">
            {recomendaciones.map((recomendacion) => (
              <div key={recomendacion.id} className="card mb-3">
                <div className="card-body">
                  <h5 className="card-title">{recomendacion.titulo}</h5>
                  <p className="card-text">{recomendacion.descripcion}</p>
                  <p className="card-text">
                    <small className="text-muted">
                      {recomendacion.tipo === "nutricion" ? "🍎 Nutrición" : "😴 Descanso"}
                    </small>
                  </p>
                  {esAdmin && (
                    <button
                      onClick={() => handleEliminarRecomendacion(recomendacion.id)}
                      className="btn btn-outline-danger btn-sm"
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
      <footer className="text-white text-center py-2 mt-auto" style={{ backgroundColor: 'rgba(70, 130, 180, 0)', zIndex: 2 }}>
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
        <p>&copy; 2025 ZonaGol. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}