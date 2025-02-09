import React, { useState, useEffect, useRef } from "react";
import { getUser, getUserAdminStatus, signOut } from '../api/supabase/inicioSesion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { obtenerMensajesRecibidos, enviarMensaje, obtenerUsuariosPorRol, checkEmailInAdmins } from '../api/mensajes/mensajes';

export default function Mensajeria() {
  const [mensaje, setMensaje] = useState("");
  const [mensajesRecibidos, setMensajesRecibidos] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState("");
  const [esAdmin, setEsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [opcionEnvio, setOpcionEnvio] = useState("cuerpo_tecnico");
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioEspecifico, setUsuarioEspecifico] = useState("");
  const [mensajeSeleccionado, setMensajeSeleccionado] = useState(null);
  const router = useRouter();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleBeforeUnload = async () => {
      await signOut();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Obtener el usuario actual y verificar si es admin
  useEffect(() => {
    const fetchUsuario = async () => {
      const user = await getUser();
      if (user) {
        setUsuarioActual(user.email);

        // Verificar si el usuario es admin
        const adminStatus = await checkEmailInAdmins(user.email);
        setEsAdmin(adminStatus);

        // Obtener mensajes recibidos
        fetchMensajesRecibidos(user.email);
      } else {
        router.push("/");
      }
    };
    fetchUsuario();
  }, [router]);

  // Obtener mensajes recibidos
  const fetchMensajesRecibidos = async (email) => {
    try {
      const data = await obtenerMensajesRecibidos(email);
      setMensajesRecibidos(data);
    } catch (error) {
      console.error("Error al obtener mensajes:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/'); // Redirige a la página de inicio de sesión
  };

  // Abrir el modal y cargar usuarios
  const handleAbrirModal = async () => {
    if (esAdmin) {
      // Si es admin, cargamos todos los usuarios
      const usuariosNoAdmin = await obtenerUsuariosPorRol(false);
      const usuariosAdmin = await obtenerUsuariosPorRol(true);
      setUsuarios([...usuariosNoAdmin, ...usuariosAdmin]);
    } else {
      // Si no es admin, solo cargamos el cuerpo técnico
      const usuariosAdmin = await obtenerUsuariosPorRol(true);
      setUsuarios(usuariosAdmin);
    }
    setIsModalOpen(true);
  };

  // Enviar mensaje desde el modal
  const handleEnviarMensajeModal = async () => {
    let destinatarios = [];

    if (opcionEnvio === "global" && esAdmin) {
      destinatarios = await obtenerUsuariosPorRol(false); // Todos los no admin
    } else if (opcionEnvio === "cuerpo_tecnico") {
      destinatarios = await obtenerUsuariosPorRol(true); // Todos los admin
    } else if (opcionEnvio === "usuario" && usuarioEspecifico) {
      destinatarios = [usuarioEspecifico]; // Usuario específico
    }

    if (destinatarios.length === 0) {
      alert("No hay destinatarios seleccionados");
      return;
    }

    if (!mensaje.trim()) {
      alert('El mensaje no puede estar vacío.');
      return; // No enviar el mensaje si está vacío
    }

    try {
      for (const destinatario of destinatarios) {
        await enviarMensaje(usuarioActual, destinatario, mensaje);
      }
      alert("Mensaje(s) enviado(s) correctamente");
      setMensaje("");
      setUsuarioEspecifico("");
      setIsModalOpen(false);
      fetchMensajesRecibidos(usuarioActual); // Actualizar la lista de mensajes
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      alert("Error al enviar el mensaje");
    }
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
      backgroundImage: 'url("/Fotos/fondo_mensajeria.png")',
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
              <li className="nav-item"><Link className="nav-link" href="../Calendario">Calendario</Link></li>
              <li className="nav-item"><Link className="nav-link" href="../Nutricion">Nutrición y Descanso</Link></li>
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
        <h1 className="text-center mb-4">Mensajería Interna</h1>
  
        <button onClick={handleAbrirModal} className="btn btn-outline-primary mb-4">
          Enviar Mensaje
        </button>
  
        {isModalOpen && (
          <div className="modal d-flex align-items-center justify-content-center" style={{
            display: 'block',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}>
            <div className="modal-dialog modal-dialog-centered" style={{ margin: '0 auto' }}>
              <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="modal-header">
                  <h5 className="modal-title">Enviar Mensaje</h5>
                </div>
                <div className="modal-body" style={{ padding: '20px' }}>
                  <div className="form-group">
                    <label>Opción de envío:</label>
                    <select className="form-control" value={opcionEnvio} onChange={(e) => setOpcionEnvio(e.target.value)}>
                      {esAdmin && <option value="global">Global (todos los jugadores)</option>}
                      <option value="cuerpo_tecnico">Cuerpo técnico</option>
                      {esAdmin && <option value="usuario">Usuario específico</option>}
                    </select>
                  </div>
                  {opcionEnvio === 'usuario' && (
                    <div className="form-group">
                      <label>Usuario específico:</label>
                      <input type="email" className="form-control" value={usuarioEspecifico} onChange={(e) => setUsuarioEspecifico(e.target.value)} placeholder="Ingrese el correo del usuario" />
                    </div>
                  )}
                  <div className="form-group">
                    <label>Mensaje:</label>
                    <textarea className="form-control" rows="3" value={mensaje} onChange={(e) => setMensaje(e.target.value)} required></textarea>
                  </div>
                </div>
                <div className="modal-footer" style={{ padding: '20px' }}>
                  <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cerrar</button>
                  <button onClick={handleEnviarMensajeModal} className="btn btn-primary">Enviar</button>
                </div>
              </div>
            </div>
          </div>
        )}
  
        <h2 className="text-center mb-3">Mensajes Recibidos</h2>
        <div className="table-responsive">
          <table className="table table-borderless table-auto w-100" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '15px', overflow: 'hidden' }}>
            <thead>
              <tr>
                <th className="text-center align-middle" style={{ backgroundColor: '#002c4b', color: 'white' }}>Remitente</th>
                <th className="text-center align-middle" style={{ backgroundColor: '#002c4b', color: 'white' }}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {/* Ordenar los mensajes de manera descendente por fecha */}
              {mensajesRecibidos
                .sort((a, b) => new Date(b.fecha_envio) - new Date(a.fecha_envio)) // Orden descendente
                .map((msg) => (
                  <tr key={msg.id} onClick={() => setMensajeSeleccionado(msg)} style={{ cursor: "pointer" }}>
                    <td>{msg.remitente}</td>
                    <td>{new Date(msg.fecha_envio).toLocaleString()}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  
    {mensajeSeleccionado && (
      <div className="modal" style={{
        display: 'block',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div className="modal-dialog modal-dialog-centered" style={{ margin: '0 auto' }}>
          <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header" style={{ textAlign: 'center' }}>
              <h5 className="modal-title">Mensaje</h5>
            </div>
            <div className="modal-body" style={{ padding: '20px', textAlign: 'center' }}>
              <p><strong>Remitente</strong><br />
                <span style={{ textAlign: 'center', display: 'block' }}>{mensajeSeleccionado.remitente}</span>
              </p>
              <p><strong>Fecha</strong><br />
                <span style={{ textAlign: 'center', display: 'block' }}>
                  {new Date(mensajeSeleccionado.fecha_envio).toLocaleString()}
                </span>
              </p>
              <p><strong>Mensaje</strong><br />
                <span style={{ textAlign: 'justify', display: 'block' }}>
                  {mensajeSeleccionado.mensaje}
                </span>
              </p>
            </div>
            <div className="modal-footer" style={{ padding: '20px' }}>
              <button onClick={() => setMensajeSeleccionado(null)} className="btn btn-secondary">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    )}

      <style jsx>{`
        .modal-dialog {
          max-width: 90%;  // En móviles ocupa el 90% del ancho
          width: 500px;  // Ancho fijo en pantallas grandes
        }

        @media (max-width: 768px) {
          .modal-dialog {
            width: 90%;  // En pantallas de tabletas y móviles ocupa el 90% del ancho
          }
        }

        @media (min-width: 1024px) {
          .modal-dialog {
            max-width: 90%;
            width: 500px;  // En pantallas más grandes, se mantiene el ancho fijo
          }
        }

        .modal-dialog {
          max-width: 90%;  // En móviles ocupa el 90% del ancho
          width: 500px;  // Ancho fijo en pantallas grandes
        }

        @media (max-width: 768px) {
          .modal-dialog {
            width: 90%;  // En pantallas de tabletas y móviles ocupa el 90% del ancho
          }
        }

        @media (min-width: 1024px) {
          .modal-dialog {
            width: 500px;  // En pantallas más grandes, se mantiene el ancho fijo
          }
        }
      `}</style>
    </div>
  );
}