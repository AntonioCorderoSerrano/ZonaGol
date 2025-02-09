import React, { useEffect, useState } from "react";
import emailjs from 'emailjs-com';
import { useRouter } from "next/navigation";
import { getUser, getUserAdminStatus, signOut } from "../api/supabase/inicioSesion";
import { 
  getAsistencia, 
  registrarAsistencia, 
  actualizarMotivoAusencia, 
  getAsistenciaCompleta, 
  añadirUsuarioAdmin,
  fetchJugadores, 
  getAdminEmailByFutbolista,
  eliminarUsuarioAdmin,
  fetchEmails
} from "../api/asistencia/asistencia";
import Link from 'next/link';

const AsistenciaPage = () => {
  const [registros, setRegistros] = useState([]);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [fecha, setFecha] = useState("");
  const [verCompleta, setVerCompleta] = useState(false);
  const [botonAccionVisible, setBotonAccionVisible] = useState(false);
  const [jugadores, setJugadores] = useState([]);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", isAdmin: "", futbolista: "" });
  const router = useRouter();
  const [perfilJugador, setPerfilJugador] = useState(null);
  const [futbolistaFoto, setFutbolistaFoto] = useState(null);
  const [motivoInput, setMotivoInput] = useState("");
  const [motivos, setMotivos] = useState({});
  const [emailToDelete, setEmailToDelete] = useState("");
  const [botonEliminarVisible, setBotonEliminarVisible] = useState(false);
  const [filtroJugador, setFiltroJugador] = useState("");
  const [mostrarModalFiltro, setMostrarModalFiltro] = useState(false);
  const [emails, setEmails] = useState([]);


  useEffect(() => {
    emailjs.init("xBoPpglWAp-Lwst5S");
  }, []);

  useEffect(() => {
    fetchEmails();
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      const futbolista = newUser.futbolista || "";
      if (futbolista) {
        const jugador = jugadores.find((j) => j.nombre === futbolista);
        
        if (jugador) {
          setPerfilJugador({
            nombre: jugador.nombre,
            dorsal: jugador.dorsal,
            foto_url: jugador.foto_url || "https://cdn-icons-png.flaticon.com/512/63/63699.png",
          });
        }
  
        const registrosFiltrados = registros.filter(
          (registro) => registro.nombre === futbolista
        );
        setRegistros(registrosFiltrados);
      }
    }
  }, [isAdmin, newUser.futbolista, jugadores, registros]);
  
  useEffect(() => {
    const fetchData = async () => {
      const result = await getAsistencia();

      // Solo actualizar el estado si la respuesta es válida
      if (result) {
        setRegistros(result.data);
        setIsAdmin(result.isAdmin);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fechaActual = new Date().toISOString().split("T")[0];
    setFecha(fechaActual);
    setRegistros((prevRegistros) =>
      prevRegistros.map((registro) => ({ ...registro, fecha: fechaActual }))
    );
  }, []);

  useEffect(() => {
      const verifyAuthentication = async () => {
        const user = await getUser();
        if (!user) {
          router.push("/");
        } else {
          const adminStatus = await getUserAdminStatus(user.email);
          setIsAdmin(adminStatus);
        }
      };
  
      verifyAuthentication();
    }, [router]);

  const handleLogout = async () => {
      await signOut();
      router.push("/");
  };

  useEffect(() => {
    const handleBeforeUnload = async () => {
      await signOut();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const obtenerJugadores = async () => {
      try {
        const jugadores = await fetchJugadores();
        setJugadores(jugadores);
      } catch (err) {
        return null;
      }
    };

    obtenerJugadores();
  }, []);





  

  const handleFechaChange = (e) => {
    const nuevaFecha = e.target.value;
    setFecha(nuevaFecha);
    setRegistros((prevRegistros) =>
      prevRegistros.map((registro) => ({ ...registro, fecha: nuevaFecha }))
    );
  };

  const handleMotivoChange = (e, id) => {
    setMotivos((prevMotivos) => ({
      ...prevMotivos,
      [id]: e.target.value,
    }));
  };

  const handleEnviarMotivo = async (id) => {
    const motivo = motivos[id];
  
    try {
      await actualizarMotivoAusencia(id, motivo);
  
      setMotivos((prevMotivos) => ({
        ...prevMotivos,
        [id]: "",
      }));
  
      const { data, error } = await getAsistencia();
      if (error) {
        return null;
      } else {
        setRegistros(data);
      }
  
    } catch (err) {
      return null;
    }
  };   

  const handleAsistencia = async (nombre, dorsal, estado) => {
    if (!fecha) {
      alert("Por favor, establece la fecha primero.");
      return;
    }

    try {
      await registrarAsistencia(nombre, dorsal, estado, fecha);

      setRegistros((prevRegistros) =>
        prevRegistros.map((registro) =>
          registro.nombre === nombre && registro.dorsal === dorsal
            ? { ...registro, asistencia: estado, botonVisible: estado }
            : { ...registro, botonVisible: null }
        )
      );

      if (estado === "Falta") {
        try {
          const response = await getAdminEmailByFutbolista(nombre);

          if (!response || !response.email) {
            return null;
          }

          const adminEmail = response.email;

          const templateParams = {
            to_email: adminEmail,
            name: nombre,  
            match_date: fecha,  
            player_name: nombre  
          };

          const sendResponse = await emailjs.send("service_scwfboc","template_rj7zejl", templateParams);

        } catch (error) {
          return null;
        }
      }

    } catch (err) {
      return null;
    }
  };

  const handleCancelarAñadirUsuario = () => {
    setBotonAccionVisible(false);
    setNewUser({ email: "", isAdmin: "", futbolista: "" });
  };

  const handleRestablecerAsistencia = async () => {
    try {
      setRegistros((prevRegistros) =>
        prevRegistros.map((registro) => ({
          ...registro,
          fecha: "",
          asistencia: "",
          motivo_ausencia: "",
          motivoInput: "",
        }))
      );
      setFecha("");
      setVerCompleta(false);
    } catch (err) {
      setError("Hubo un problema al restablecer la asistencia.");
    }
  };

  const handleVerAsistenciaCompleta = async () => {
    if (verCompleta) {
      const { data } = await getAsistencia();
      setRegistros(data);
      setVerCompleta(false);
    } else {
      try {
        const data = await getAsistenciaCompleta();
        setRegistros(data);
        setVerCompleta(true);
      } catch (err) {
        setError("No se pudo cargar la asistencia completa.");
      }
    }
  };

  const handleNuevoUsuarioChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleAñadirUsuario = async () => {
  try {
    const { email, isAdmin, futbolista } = newUser;

    // Llamar a la función para añadir el usuario
    const resultado = await añadirUsuarioAdmin(email, isAdmin, futbolista);

    // Restablecer los datos del formulario
    setNewUser({ email: "", isAdmin: "", futbolista: "" });
    // Cerrar el formulario flotante
    setBotonAccionVisible(false);

  } catch (error) {
    return null;
  }
};

  const handleEliminarUsuarioClick = async () => {
    try {
      const emails = await fetchEmails(); // Obtener la lista de emails
      setEmails(emails); // Actualizar el estado
      setBotonEliminarVisible(true); // Mostrar el modal
    } catch (error) {
      return null;
    }
  };

  const handleEliminarUsuario = async () => {
    if (!emailToDelete) {
      alert("Por favor, selecciona un email para eliminar.");
      return;
    }
  
    try {
      const resultado = await eliminarUsuarioAdmin(emailToDelete);
        alert("Usuario eliminado correctamente.");
  
        // Restablecer los datos del formulario
        setEmailToDelete("");

        // Cerrar el formulario flotante
        setBotonEliminarVisible(false);
  
        // Recargar la lista de emails después de eliminar
        await fetchEmails();

    } catch (error) {
      return null;
    }
  };
  
  const handleCancelarEliminarUsuario = () => {
    // Cerrar el formulario flotante
    setBotonEliminarVisible(false);
  
    // Restablecer los datos del formulario
    setEmailToDelete("");
  };

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  const getAsistenciaBackgroundColor = (asistencia) => {
    switch (asistencia) {
      case "Asiste":
        return "bg-success";
      case "Retraso":
        return "bg-warning";
      case "Falta":
        return "bg-danger";
      default:
        return "";
    }
  };

  const registrosFiltrados = filtroJugador
    ? registros.filter((registro) => registro.nombre === filtroJugador)
    : registros;

  return (
    <div style={{
      position: 'relative', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      zIndex: 1
    }}>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        backgroundImage: 'url("/Fotos/fondo_asistencia.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        zIndex: -1,
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
        }}></div>
      </div>
  
      <header>
        <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: 'rgba(70, 130, 180, 0)', paddingLeft: '10px', paddingRight: '10px' }}>
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

            {/* Menú de navegación */}
            <div className={`collapse navbar-collapse ${menuAbierto ? "show" : ""}`} id="navbarNav">
              <ul className="navbar-nav ms-auto d-flex align-items-center gap-3">  
                <li className="nav-item"><Link className="nav-link" href="../Convocatorias">Convocatorias</Link></li>
                <li className="nav-item"><Link className="nav-link" href="../Goleadores">Goleadores</Link></li>
                <li className="nav-item"><Link className="nav-link" href="../Partidos">Partidos</Link></li>
                <li className="nav-item"><Link className="nav-link" href="../Plantilla">Plantilla</Link></li>
                <li className="nav-item"><Link className="nav-link" href="../Galeria">Galería</Link></li>
                <li className="nav-item"><Link className="nav-link" href="../Mensajeria">Mensajería</Link></li>
                <li className="nav-item"><Link className="nav-link" href="../Calendario">Calendario</Link></li>
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
                {/* Botón de Cerrar Sesión */}
                <li className="nav-item">
                  <button className="btn btn-outline-light px-3" onClick={handleLogout}>Cerrar Sesión</button>
                </li>
              </ul>
            </div>

          </div>
        </nav>
      </header>

      {mostrarModalFiltro && (
        <div
          className="modal"
          style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Filtrar por Jugador</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setMostrarModalFiltro(false)}
                ></button>
              </div>
              <div className="modal-body">
                <label className="form-label">Selecciona un jugador:</label>
                <select
                  value={filtroJugador}
                  onChange={(e) => setFiltroJugador(e.target.value)}
                  className="form-select"
                >
                  <option value="">Todos los jugadores</option>
                  {jugadores.map((jugador) => (
                    <option key={`${jugador.nombre}-${jugador.dorsal}`} value={jugador.nombre}>
                      {jugador.nombre} (Dorsal: {jugador.dorsal})
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setMostrarModalFiltro(false); // Cierra el modal
                  }}
                >
                  Aplicar Filtro
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setFiltroJugador(""); // Limpia el filtro
                    setMostrarModalFiltro(false); // Cierra el modal
                  }}
                >
                  Limpiar Filtro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {botonEliminarVisible && (
        <div
          className="modal"
          style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Eliminar Usuario</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setBotonEliminarVisible(false)}
                ></button>
              </div>
              <div className="modal-body">
                <label className="form-label">Selecciona un email para eliminar:</label>
                <select
                  value={emailToDelete}
                  onChange={(e) => setEmailToDelete(e.target.value)}
                  className="form-select mb-2"
                >
                  <option value="">Selecciona un email</option>
                  {emails.map((email) => (
                    <option key={email} value={email}>
                      {email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-danger"
                  onClick={handleEliminarUsuario}
                >
                  Eliminar
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setBotonEliminarVisible(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
  
      <div className="container mt-4 flex-grow-1">
        {isAdmin ? (
          <div>
            {botonAccionVisible && (
              <div
                className="modal"
                style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
              >
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Añadir Nuevo Usuario</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setBotonAccionVisible(false)}
                      ></button>
                    </div>
                    <div className="modal-body">
                      <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={newUser.email}
                        onChange={handleNuevoUsuarioChange}
                        className="form-control mb-2"
                      />
                      <select
                        name="isAdmin"
                        value={newUser.isAdmin}
                        onChange={(e) => {
                          handleNuevoUsuarioChange(e);
                          if (e.target.value === "sí") {
                            setNewUser((prev) => ({ ...prev, futbolista: null }));
                          }
                        }}
                        className="form-select mb-2"
                      >
                        <option value="">¿Es Admin?</option>
                        <option value="sí">Sí</option>
                        <option value="no">No</option>
                      </select>
                      <select
                        name="futbolista"
                        value={newUser.futbolista || ""}
                        onChange={handleNuevoUsuarioChange}
                        disabled={newUser.isAdmin === "sí"}
                        className="form-select mb-2"
                      >
                        <option value="">Selecciona un jugador</option>
                        {jugadores.map((jugador) => (
                          <option key={`${jugador.nombre}-${jugador.dorsal}`} value={jugador.nombre}>
                            {jugador.nombre} (Dorsal: {jugador.dorsal})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="modal-footer">
                      <button
                        className="btn btn-primary"
                        onClick={handleAñadirUsuario}
                      >
                        Añadir
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={handleCancelarAñadirUsuario}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
  
            <label className="d-flex align-items-center justify-content-center mb-4">
              <span className="text-white me-2">Fecha:</span>
              <input
                type="date"
                value={fecha}
                onChange={handleFechaChange}
                className="form-control"
                style={{ width: "auto" }}
              />
            </label>
  
            {isAdmin && (
                <div className="container mt-3">
                  <div className="row">
                    <div className="col">
                      <button className="btn btn-outline-primary w-100 my-1" onClick={() => setBotonAccionVisible(true)}>Añadir Usuario</button>
                    </div>
                    <div className="col">
                      <button className="btn btn-outline-success w-100 my-1" onClick={handleRestablecerAsistencia}>Restablecer Asistencia</button>
                    </div>
                    <div className="col">
                      <button className="btn btn-outline-warning w-100 my-1" onClick={handleVerAsistenciaCompleta}>
                        {verCompleta ? "Mostrar Asistencia" : "Ver Asistencia Completa"}
                      </button>
                    </div>
                    <div className="col">
                      <button className="btn btn-outline-info w-100 my-1" onClick={() => setMostrarModalFiltro(true)}>
                        Filtrar por Jugador
                      </button>
                    </div>
                    <div className="col">
                      <button className="btn btn-outline-danger w-100 my-1" onClick={handleEliminarUsuarioClick}>Eliminar Usuario</button>
                    </div>
                  </div>
                </div>
              )}
            <div
              className="table-responsive"
              style={{
                overflowX: "auto",
                borderRadius: "15px",
                maxWidth: "100%",
              }}
            >

              <table
                className="table table-borderless"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '15px',
                  overflow: 'hidden',
                  minWidth: "600px",
                }}
              >
                <thead style={{ backgroundColor: '#002c4b', color: 'white' }}>
                  <tr>
                    <th className="text-center align-middle" style={{ backgroundColor: '#002c4b', color: 'white' }}>Foto</th>
                    <th className="text-center align-middle" style={{ backgroundColor: '#002c4b', color: 'white' }}>Nombre</th>
                    <th className="text-center align-middle" style={{ backgroundColor: '#002c4b', color: 'white' }}>Dorsal</th>
                    {!verCompleta &&<th className="text-center align-middle"  style={{ backgroundColor: '#002c4b', color: 'white' }}>Asistencia</th>}
                    {verCompleta && <th className="text-center align-middle" style={{ backgroundColor: '#002c4b', color: 'white' }}>Fecha</th>}
                    {verCompleta && <th className="text-center align-middle" style={{ backgroundColor: '#002c4b', color: 'white' }}>Asistencia</th>}
                    {!verCompleta && <th className="text-center align-middle" style={{ backgroundColor: '#002c4b', color: 'white' }}>Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {registrosFiltrados.map((jugador, index) => (
                    <tr key={`${jugador.nombre}-${jugador.dorsal}-${index}`}>
                      <td className="text-center align-middle">
                        <img
                          src={jugador.foto_url || "https://cdn-icons-png.flaticon.com/512/63/63699.png"}
                          alt={jugador.nombre}
                          style={{ width: "70px", height: "70px", borderRadius: "50%" }}
                        />
                      </td>
                      <td className="text-center align-middle">{jugador.nombre}</td>
                      <td className="text-center align-middle">{jugador.dorsal}</td>
                      {verCompleta && <td className="text-center align-middle">{jugador.fecha}</td>}
                      <td
                        className={`text-center align-middle ${getAsistenciaBackgroundColor(jugador.asistencia)}`}
                      >
                        {jugador.asistencia || ""}
                      </td>
                      {!verCompleta && (
                        <td className="text-center align-middle">
                          <button className="btn btn-success btn-sm me-2" onClick={() => handleAsistencia(jugador.nombre, jugador.dorsal, "Asiste")}>
                            Asiste
                          </button>
                          <button className="btn btn-warning btn-sm me-2" onClick={() => handleAsistencia(jugador.nombre, jugador.dorsal, "Retraso")}>
                            Retraso
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleAsistencia(jugador.nombre, jugador.dorsal, "Falta")}>
                            Falta
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            {!isAdmin && registros.length > 0 && (
              <div className="card mb-4" style={{ 
                maxWidth: '300px', 
                margin: '0 auto', 
                backgroundColor: 'rgba(0, 44, 75, 0.6)', 
                borderRadius: '15px', 
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
              }}>
                <div className="card-body">
                  <div className="text-center">
                    <img
                      src={registros[0].foto_url || "https://cdn-icons-png.flaticon.com/512/63/63699.png"}
                      alt="Foto del futbolista"
                      className="card-img-top mb-3"
                      style={{ 
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '50%' 
                      }}
                    />
                  </div>

                  <h5 className="card-title text-center" style={{ color: '#fff' }}>{registros[0].nombre}</h5>

                  <p className="card-text text-left" style={{ color: '#fff' }}>
                    <b style={{ color: '#c7e4ac' }}>Dorsal:</b> {registros[0].dorsal}
                  </p>
                  <p className="card-text text-left" style={{ color: '#fff' }}>
                    <b style={{ color: '#c7e4ac' }}>Fecha de nacimiento:</b> {registros[0].fecha_nacimiento}
                  </p>
                  <p className="card-text text-left" style={{ color: '#fff' }}>
                    <b style={{ color: '#c7e4ac' }}>Posición:</b> {registros[0].posicion}
                  </p>
                </div>
              </div>
            )}
  
              <div
                className="table-responsive"
                style={{
                  overflowX: "auto",
                  borderRadius: "15px",
                  maxWidth: "100%",
                }}
              >
              <h1 className="text-center text-white">Asistencia</h1>
              <table
                className="table table-borderless"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '15px',
                  overflow: 'hidden',
                  minWidth: "600px",
                }}
              >
                <thead style={{ backgroundColor: '#002c4b', color: 'white' }}>
                  <tr>
                    <th className="text-center align-middle" style={{ backgroundColor: '#002c4b', color: 'white' }}>Fecha</th>
                    <th className="text-center align-middle" style={{ backgroundColor: '#002c4b', color: 'white' }}>Asistencia</th>
                    <th className="text-center align-middle" style={{ backgroundColor: '#002c4b', color: 'white' }}>Motivo</th>
                    {registros.some(registro => registro.asistencia === "Falta" && !registro.motivo_ausencia) && (
                      <th className="text-center align-middle">Enviar</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {registros.map((registro) => (
                    <tr key={registro.id}>
                      <td className="text-center align-middle">{registro.fecha}</td>
                      <td
                        className={`text-center align-middle ${getAsistenciaBackgroundColor(registro.asistencia)}`}
                      >
                        {registro.asistencia}
                      </td>
                      <td className="text-center align-middle">
                        {registro.asistencia === "Falta" && !registro.motivo_ausencia ? (
                          <input
                            type="text"
                            value={motivos[registro.id] || ""}
                            onChange={(e) => handleMotivoChange(e, registro.id)}
                            className="form-control"
                          />
                        ) : (
                          <span>{registro.motivo_ausencia}</span>
                        )}
                      </td>
                      {registros.some(registro => registro.asistencia === "Falta" && !registro.motivo_ausencia) && (
                        <td className="text-center align-middle">
                          {registro.asistencia === "Falta" && !registro.motivo_ausencia && (
                            <button className="btn btn-primary btn-sm" onClick={() => handleEnviarMotivo(registro.id)}>
                              Enviar
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
  
        {/* Footer */}
        <footer className="text-white text-center py-2" style={{ backgroundColor: 'rgba(70, 130, 180, 0)', zIndex: 2, marginTop: '40px' }}>
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
};

export default AsistenciaPage;