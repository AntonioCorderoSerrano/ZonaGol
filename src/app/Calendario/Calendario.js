'use client';
import React, { useState, useEffect, useRef } from "react";
import { getUser, signOut } from '../api/supabase/inicioSesion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { obtenerEventos, crearEvento, eliminarEvento, getUserAdminStatus, checkEmailInAdmins } from '../api/calendario/calendario';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

export default function Calendario() {
  const [eventos, setEventos] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);
  const [nuevoEvento, setNuevoEvento] = useState({
    titulo: "",
    descripcion: "",
    fecha_inicio: "",
    fecha_fin: "",
    tipo: "partido",
  });
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUsuario = async () => {
      const user = await getUser();
      if (user) {
        setUsuarioActual(user.email);
        setIsAdmin(user.is_admin);
        fetchEventos();
      } else {
        router.push("/");
      }
    };
    fetchUsuario();
  }, [router]);

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

  const fetchEventos = async () => {
    try {
      const data = await obtenerEventos();
      setEventos(data);
    } catch (error) {
      console.error("Error obteniendo eventos:", error);
    }
  };

  const handleCrearEvento = async (e) => {
    e.preventDefault();
    try {
      const evento = {
        ...nuevoEvento,
        creado_por: usuarioActual,
      };
      await crearEvento(evento);
      setModalAbierto(false);
      setNuevoEvento({
        titulo: "",
        descripcion: "",
        fecha_inicio: "",
        fecha_fin: "",
        tipo: "partido",
      });
      fetchEventos();
    } catch (error) {
      console.error("Error creando evento:", error);
    }
  };

  const handleEliminarEvento = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este evento?")) {
      try {
        await eliminarEvento(id);
        fetchEventos();
        setEventoSeleccionado(null); // Cerrar el modal después de eliminar
      } catch (error) {
        console.error("Error eliminando evento:", error);
      }
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
      backgroundImage: 'url("/Fotos/fondo_calendario.png")',
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
                <li className="nav-item"><Link className="nav-link" href="../Nutricion">Nutrición y Descanso</Link></li>
                {isAdmin && (
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
                    <li className="nav-item">
                      <Link className="nav-link" href="../Entrenamientos">Entrenamientos</Link>
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
        <div className="card p-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '15px', maxWidth: '1200px', width: '100%' }}>
          <h1 className="text-center mb-4">Calendario de Eventos</h1>

          {isAdmin && (
            <button onClick={() => setModalAbierto(true)} className="btn btn-outline-primary mb-4">
              Crear Evento
            </button>
          )}

          {modalAbierto && (
            <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Crear Evento</h5>
                  </div>
                  <div className="modal-body">
                    <form onSubmit={handleCrearEvento}>
                      <div className="form-group">
                        <label>Título:</label>
                        <input
                          type="text"
                          className="form-control"
                          value={nuevoEvento.titulo}
                          onChange={(e) => setNuevoEvento({ ...nuevoEvento, titulo: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Descripción:</label>
                        <textarea
                          className="form-control"
                          value={nuevoEvento.descripcion}
                          onChange={(e) => setNuevoEvento({ ...nuevoEvento, descripcion: e.target.value })}
                          required
                        ></textarea>
                      </div>
                      <div className="form-group">
                        <label>Fecha de inicio:</label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          value={nuevoEvento.fecha_inicio}
                          onChange={(e) => setNuevoEvento({ ...nuevoEvento, fecha_inicio: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Fecha de fin:</label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          value={nuevoEvento.fecha_fin}
                          onChange={(e) => setNuevoEvento({ ...nuevoEvento, fecha_fin: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Tipo de evento:</label>
                        <select
                          className="form-control"
                          value={nuevoEvento.tipo}
                          onChange={(e) => setNuevoEvento({ ...nuevoEvento, tipo: e.target.value })}
                        >
                          <option value="partido">Partido</option>
                          <option value="entrenamiento">Entrenamiento</option>
                          <option value="reunion">Reunión</option>
                          <option value="evento">Evento</option>
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

          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={eventos.map((evento) => ({
              id: evento.id,
              title: evento.titulo,
              start: evento.fecha_inicio,
              end: evento.fecha_fin,
              description: evento.descripcion,
              tipo: evento.tipo,
              color: evento.tipo === "partido" ? "#FF0000" : evento.tipo === "entrenamiento" ? "#00FF00" : "#0000FF",
            }))}
            locale={esLocale}
            eventClick={(info) => {
              setEventoSeleccionado({
                id: info.event.id,
                titulo: info.event.title,
                descripcion: info.event.extendedProps.description,
                fecha_inicio: info.event.start,
                fecha_fin: info.event.end,
                tipo: info.event.extendedProps.tipo,
              });
            }}
          />
        </div>
      </main>

      {eventoSeleccionado && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{eventoSeleccionado.titulo}</h5>
              </div>
              <div className="modal-body">
                <p><strong>Descripción:</strong> {eventoSeleccionado.descripcion}</p>
                <p><strong>Fecha de inicio:</strong> {new Date(eventoSeleccionado.fecha_inicio).toLocaleString()}</p>
                <p><strong>Fecha de fin:</strong> {new Date(eventoSeleccionado.fecha_fin).toLocaleString()}</p>
                <p><strong>Tipo:</strong> {eventoSeleccionado.tipo}</p>
              </div>
              <div className="modal-footer">
                {isAdmin && (
                  <>
                    <button className="btn btn-danger" onClick={() => handleEliminarEvento(eventoSeleccionado.id)}>
                      Eliminar
                    </button>
                  </>
                )}
                <button className="btn btn-secondary" onClick={() => setEventoSeleccionado(null)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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