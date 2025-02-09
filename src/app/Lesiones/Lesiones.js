'use client';
import React from "react";
import { useState, useEffect, useRef } from "react";
import { agregarLesion, obtenerLesiones, eliminarLesion, actualizarLesion, obtenerJugadores, checkEmailInAdmins } from '../api/lesiones/lesiones';
import { getUser, getUserAdminStatus, signOut } from '../api/supabase/inicioSesion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function GestionLesiones() {
  const [lesiones, setLesiones] = useState([]);
  const [jugadores, setJugadores] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoLesion, setEditandoLesion] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [lesionSeleccionada, setLesionSeleccionada] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();

  // Estados para el formulario de añadir
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoDorsal, setNuevoDorsal] = useState("");
  const [nuevoTipoLesion, setNuevoTipoLesion] = useState("");
  const [nuevoFechaLesion, setNuevoFechaLesion] = useState("");
  const [nuevoDescripcion, setNuevoDescripcion] = useState("");
  const [nuevoTiempoBaja, setNuevoTiempoBaja] = useState("");
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [nuevoFechaAlta, setNuevoFechaAlta] = useState("");

  // Estados para el formulario de editar
  const [editNombre, setEditNombre] = useState("");
  const [editDorsal, setEditDorsal] = useState("");
  const [editTipoLesion, setEditTipoLesion] = useState("");
  const [editFechaLesion, setEditFechaLesion] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editTiempoBaja, setEditTiempoBaja] = useState("");
  const [editEstado, setEditEstado] = useState("");
  const [editFechaAlta, setEditFechaAlta] = useState("");

  useEffect(() => {
    const handleBeforeUnload = async () => {
      await signOut();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Obtener las lesiones al cargar la página
  useEffect(() => {
    const fetchLesiones = async () => {
      const data = await obtenerLesiones();
      setLesiones(data);
    };
    fetchLesiones();
  }, []);

  // Obtener los jugadores al cargar la página
  useEffect(() => {
    const fetchJugadores = async () => {
      const data = await obtenerJugadores();
      setJugadores(data);
    };
    fetchJugadores();
  }, []);

  useEffect(() => {
        const verifyAuthentication = async () => {
          const user = await getUser();
          if (!user) {
            router.push("/");
          } else {
            const adminStatus = await getUserAdminStatus(user.email);
            setIsAdmin(adminStatus);
            const emailChecked = await checkEmailInAdmins(user.email);
            setEmailChecked(emailChecked);
          }
        };
    
        verifyAuthentication();
      }, [router]);

  // Manejar el envío del formulario de añadir
  const handleSubmitAgregar = async (e) => {
    e.preventDefault();
    const nuevaLesion = {
      nombre: nuevoNombre,
      dorsal: parseInt(nuevoDorsal),
      tipo_lesion: nuevoTipoLesion,
      fecha_lesion: nuevoFechaLesion,
      descripcion: nuevoDescripcion,
      tiempo_baja: parseInt(nuevoTiempoBaja),
      estado: nuevoEstado,
      fecha_alta: nuevoFechaAlta || null,
    };

    await agregarLesion(nuevaLesion);

    // Limpiar el formulario y actualizar la lista de lesiones
    setNuevoNombre("");
    setNuevoDorsal("");
    setNuevoTipoLesion("");
    setNuevoFechaLesion("");
    setNuevoDescripcion("");
    setNuevoTiempoBaja("");
    setNuevoEstado("");
    setNuevoFechaAlta("");
    const data = await obtenerLesiones();
    setLesiones(data);
    setMostrarFormulario(false);
  };

  // Manejar el envío del formulario de editar
  const handleSubmitEditar = async (e) => {
    e.preventDefault();
    const lesionActualizada = {
      nombre: editNombre,
      dorsal: parseInt(editDorsal),
      tipo_lesion: editTipoLesion,
      fecha_lesion: editFechaLesion,
      descripcion: editDescripcion,
      tiempo_baja: parseInt(editTiempoBaja),
      estado: editEstado,
      fecha_alta: editFechaAlta || null,
    };

    await actualizarLesion(editandoLesion.id_lesion, lesionActualizada);

    // Limpiar el formulario y actualizar la lista de lesiones
    setEditNombre("");
    setEditDorsal("");
    setEditTipoLesion("");
    setEditFechaLesion("");
    setEditDescripcion("");
    setEditTiempoBaja("");
    setEditEstado("");
    setEditFechaAlta("");
    setEditandoLesion(null);
    const data = await obtenerLesiones();
    setLesiones(data);
    setMostrarFormulario(false);
  };

  // Manejar la edición de una lesión
  const handleEditarLesion = (lesion) => {
    setEditandoLesion(lesion);
    setEditNombre(lesion.nombre);
    setEditDorsal(lesion.dorsal);
    setEditTipoLesion(lesion.tipo_lesion);
    setEditFechaLesion(lesion.fecha_lesion);
    setEditDescripcion(lesion.descripcion);
    setEditTiempoBaja(lesion.tiempo_baja);
    setEditEstado(lesion.estado);
    setEditFechaAlta(lesion.fecha_alta || "");
    setMostrarFormulario(true);
  };

  // Manejar la eliminación de una lesión
  const handleEliminarLesion = async (id_lesion) => {
    const confirmacion = window.confirm("¿Estás seguro de que deseas eliminar esta lesión?");
    if (confirmacion) {
      await eliminarLesion(id_lesion);
      const data = await obtenerLesiones();
      setLesiones(data);
    }
  };

  // Cerrar sesión
  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Alternar el menú en dispositivos móviles
  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  // Abrir detalles de una lesión
  const abrirDetalles = (lesion) => {
    setLesionSeleccionada(lesion);
  };

  // Cerrar detalles de una lesión
  const cerrarDetalles = () => {
    setLesionSeleccionada(null);
  };

  // Manejar el cambio de jugador seleccionado en el formulario de añadir
  const handleJugadorChangeAgregar = (e) => {
    const jugadorSeleccionado = jugadores.find(jugador => jugador.id === parseInt(e.target.value));
    setNuevoNombre(jugadorSeleccionado.nombre);
    setNuevoDorsal(jugadorSeleccionado.dorsal);
  };

  // Manejar el cambio de jugador seleccionado en el formulario de editar
  const handleJugadorChangeEditar = (e) => {
    const jugadorSeleccionado = jugadores.find(jugador => jugador.id === parseInt(e.target.value));
    setEditNombre(jugadorSeleccionado.nombre);
    setEditDorsal(jugadorSeleccionado.dorsal);
  };

  const abrirFormularioAgregar = () => {
    // Restablecer los estados de los campos del formulario de añadir
    setNuevoNombre("");
    setNuevoDorsal("");
    setNuevoTipoLesion("");
    setNuevoFechaLesion("");
    setNuevoDescripcion("");
    setNuevoTiempoBaja("");
    setNuevoEstado("");
    setNuevoFechaAlta("");
    setEditandoLesion(null); // Asegurarse de que no esté en modo de edición
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    // Restablecer los estados de los campos del formulario de añadir
    setNuevoNombre("");
    setNuevoDorsal("");
    setNuevoTipoLesion("");
    setNuevoFechaLesion("");
    setNuevoDescripcion("");
    setNuevoTiempoBaja("");
    setNuevoEstado("");
    setNuevoFechaAlta("");
    setEditandoLesion(null);
  };

  return (
    <div className="container-fluid p-0 d-flex flex-column min-vh-100" style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundImage: 'url("/Fotos/fondo_lesiones.webp")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      zIndex: 1,
    }}>
      {/* Capa semitransparente */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: -1,
      }}></div>

      {/* Navbar */}
      <header>
        <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: 'rgba(70, 130, 180, 0)', paddingLeft: '10px', paddingRight: '10px' }} ref={menuRef}>
          <div className="container-fluid">
            <div className="me-auto">
              <Link className="nav-link" href="../Inicio">
                <img src="/Fotos/ZonaGol.png" alt="ZonaGol"
                className="img-fluid" style={{ height: "70px", maxWidth: "150px" }} />
              </Link>
            </div>
            <button className="navbar-toggler" type="button" onClick={toggleMenu}>
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className={`collapse navbar-collapse ${menuAbierto ? "show" : ""} justify-content-end`}>
              <ul className="navbar-nav d-flex align-items-center gap-3">  
                <li className="nav-item"><Link className="nav-link text-center" href="../Convocatorias">Convocatorias</Link></li>
                <li className="nav-item"><Link className="nav-link text-center" href="../Goleadores">Goleadores</Link></li>
                <li className="nav-item"><Link className="nav-link text-center" href="../Partidos">Partidos</Link></li>
                <li className="nav-item"><Link className="nav-link text-center" href="../Asistencia">Asistencia</Link></li>
                <li className="nav-item"><Link className="nav-link text-center" href="../Plantilla">Plantilla</Link></li>
                <li className="nav-item"><Link className="nav-link text-center" href="../Galeria">Galería</Link></li>
                <li className="nav-item"><Link className="nav-link" href="../Mensajeria">Mensajería</Link></li>
                <li className="nav-item"><Link className="nav-link" href="../Calendario">Calendario</Link></li>
                <li className="nav-item"><Link className="nav-link" href="../Nutricion">Nutrición y Descanso</Link></li>
                {isAdmin && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" href="../Estadisticas">Estadísticas</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" href="../Scouting">Scouting</Link>
                    </li>
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

      {/* Contenido principal */}
      <main className="container mt-4" style={{ zIndex: 1 }}>
        <h1 className="text-center text-white">Gestión de Lesiones</h1>

        {/* Botón para abrir el formulario flotante */}
        <button className="btn btn-outline-info mb-3 w-100" onClick={abrirFormularioAgregar}>
          Agregar Lesión
        </button>

        {/* Formulario flotante para agregar/editar lesiones */}
        {mostrarFormulario && (
          <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editandoLesion ? "Editar Lesión" : "Agregar Lesión"}</h5>
                  <button type="button" className="btn-close" onClick={cerrarFormulario}></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={editandoLesion ? handleSubmitEditar : handleSubmitAgregar}>
                    <div className="row">
                      <div className="col-md-6">
                        <label>Jugador</label>
                        <select
                          className="form-control"
                          onChange={editandoLesion ? handleJugadorChangeEditar : handleJugadorChangeAgregar}
                          value={editandoLesion ? jugadores.find(jugador => jugador.nombre === editNombre)?.id || "" : jugadores.find(jugador => jugador.nombre === nuevoNombre)?.id || ""}
                          required
                        >
                          <option value="">Selecciona un jugador</option>
                          {jugadores.map(jugador => (
                            <option key={jugador.id} value={jugador.id}>
                              {jugador.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label>Dorsal</label>
                        <input
                          type="number"
                          className="form-control"
                          value={editandoLesion ? editDorsal : nuevoDorsal}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="row mt-3">
                      <div className="col-md-6">
                        <label>Tipo de Lesión</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editandoLesion ? editTipoLesion : nuevoTipoLesion}
                          onChange={editandoLesion ? (e) => setEditTipoLesion(e.target.value) : (e) => setNuevoTipoLesion(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label>Fecha de Lesión</label>
                        <input
                          type="date"
                          className="form-control"
                          value={editandoLesion ? editFechaLesion : nuevoFechaLesion}
                          onChange={editandoLesion ? (e) => setEditFechaLesion(e.target.value) : (e) => setNuevoFechaLesion(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="row mt-3">
                      <div className="col-md-6">
                        <label>Descripción</label>
                        <textarea
                          className="form-control"
                          value={editandoLesion ? editDescripcion : nuevoDescripcion}
                          onChange={editandoLesion ? (e) => setEditDescripcion(e.target.value) : (e) => setNuevoDescripcion(e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label>Tiempo de Baja (días)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={editandoLesion ? editTiempoBaja : nuevoTiempoBaja}
                          onChange={editandoLesion ? (e) => setEditTiempoBaja(e.target.value) : (e) => setNuevoTiempoBaja(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="row mt-3">
                      <div className="col-md-6">
                        <label>Estado</label>
                        <select
                          className="form-control"
                          value={editandoLesion ? editEstado : nuevoEstado}
                          onChange={editandoLesion ? (e) => setEditEstado(e.target.value) : (e) => setNuevoEstado(e.target.value)}
                        >
                          <option value="En tratamiento">En tratamiento</option>
                          <option value="En rehabilitación">En rehabilitación</option>
                          <option value="Recuperado">Recuperado</option>
                          <option value="Recaída">Recaída</option>
                          <option value="Crónica">Crónica</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label>Fecha de Alta</label>
                        <input
                          type="date"
                          className="form-control"
                          value={editandoLesion ? editFechaAlta || "" : nuevoFechaAlta || ""}
                          onChange={editandoLesion ? (e) => setEditFechaAlta(e.target.value) : (e) => setNuevoFechaAlta(e.target.value)}
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary mt-3 w-100">
                      {editandoLesion ? "Actualizar Lesión" : "Agregar Lesión"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de lesiones */}
        <div className="table-responsive">
          <table className="table table-borderless"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '15px',
              overflow: 'hidden',
              minWidth: "600px", // Establece un ancho mínimo para la tabla
            }}>
            <thead className="text-center">
              <tr>
                <th style={{backgroundColor:"#002c4b", color:"#FFFFFF"}}>Nombre</th>
                <th style={{backgroundColor:"#002c4b", color:"#FFFFFF"}}>Dorsal</th>
                <th style={{backgroundColor:"#002c4b", color:"#FFFFFF"}}>Fecha de Lesión</th>
                <th style={{backgroundColor:"#002c4b", color:"#FFFFFF"}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lesiones.map((lesion) => (
                <React.Fragment key={lesion.id_lesion}>
                  <tr 
                    onClick={() => abrirDetalles(lesion)} 
                    style={{ cursor: 'pointer', textAlign: 'center' }}
                  >
                    <td style={{ verticalAlign: 'middle' }}>{lesion.nombre}</td>
                    <td style={{ verticalAlign: 'middle' }}>{lesion.dorsal}</td>
                    <td style={{ verticalAlign: 'middle' }}>{lesion.fecha_lesion}</td>
                    <td style={{ verticalAlign: 'middle' }}>
                      <button
                        className="btn btn-outline-warning btn-sm me-2"
                        onClick={(e) => { e.stopPropagation(); handleEditarLesion(lesion); }}
                      >
                        Modificar
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={(e) => { e.stopPropagation(); handleEliminarLesion(lesion.id_lesion); }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal para mostrar detalles de la lesión */}
        {lesionSeleccionada && (
          <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Detalles de la Lesión</h5>
                  <button type="button" className="btn-close" onClick={cerrarDetalles}></button>
                </div>
                <div className="modal-body">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">{lesionSeleccionada.nombre}</h5>
                      <p><strong>Dorsal:</strong> {lesionSeleccionada.dorsal}</p>
                      <p><strong>Tipo de Lesión:</strong> {lesionSeleccionada.tipo_lesion}</p>
                      <p><strong>Fecha de Lesión:</strong> {lesionSeleccionada.fecha_lesion}</p>
                      <p><strong>Descripción:</strong> {lesionSeleccionada.descripcion}</p>
                      <p><strong>Tiempo de Baja:</strong> {lesionSeleccionada.tiempo_baja} días</p>
                      <p><strong>Estado:</strong> {lesionSeleccionada.estado}</p>
                      <p><strong>Fecha de Alta:</strong> {lesionSeleccionada.fecha_alta}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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