import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPartidos, addPartido, getGoleadores, getGoleadoresPorPartido, checkEmailInAdmins, deletePartido  } from "../api/partidos/partidos";
import { getUser, getUserAdminStatus, signOut } from "../api/supabase/inicioSesion";
import Link from 'next/link';

export default function Partidos() {
  const [partidos, setPartidos] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [equipoLocal, setEquipoLocal] = useState("");
  const [resultadoLocal, setResultadoLocal] = useState("");
  const [resultadoVisitante, setResultadoVisitante] = useState("");
  const [equipoVisitante, setEquipoVisitante] = useState("");
  const [goleadores, setGoleadores] = useState([]);
  const [goles, setGoles] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [partidoAbierto, setPartidoAbierto] = useState(null);
  const [fecha, setFecha] = useState("");
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

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

  const fetchPartidos = async () => {
    try{
      const user = await getUser();
      const data = await getPartidos();
      const isEmailInAdmins = await checkEmailInAdmins(user.email);

      if (isEmailInAdmins) {
        const partidosConEventos = await Promise.all(data.map(async (partido) => {
          const goleadoresDelPartido = await getGoleadoresPorPartido(partido.id_partidos);
          return {
            ...partido,
            eventos: goleadoresDelPartido ? goleadoresDelPartido.map((goleador) => ({
              nombre: goleador.nombre_goleador,
              goles: goleador.goles,
              t_amarilla: goleador.t_amarilla || 0,
              t_roja: goleador.t_roja || 0,
            })) : [], // Inicializa eventos como un array vacío si no hay datos
          };
        }));
        setPartidos(partidosConEventos);
      }
    } catch {
      return null;
    }
  };

  useEffect(() => {
    fetchPartidos();
  }, []);

  useEffect(() => {
    const fetchGoleadores = async () => {
      const data = await getGoleadores();
      setGoleadores(data);

      const golesInit = data.reduce((acc, goleador) => {
        acc[goleador.nombre] = 0;
        return acc;
      }, {});
      setGoles(golesInit);
    };

    fetchGoleadores();
  }, []);

  const handleAddPartido = async () => {
    if (
      !equipoLocal.trim() ||
      !equipoVisitante.trim() ||
      isNaN(parseInt(resultadoLocal)) ||
      isNaN(parseInt(resultadoVisitante)) ||
      !fecha
    ) {
      alert("Por favor, llena todos los campos correctamente.");
      return;
    }
  
    const partido = {
      equipo_local: equipoLocal,
      resultado_local: parseInt(resultadoLocal),
      resultado_visitante: parseInt(resultadoVisitante),
      equipo_visitante: equipoVisitante,
      fecha: new Date(fecha).toISOString(), // Asegúrate de que la fecha esté en el formato correcto
    };
  
    const eventos = goleadores.map((goleador) => ({
      nombre: goleador.nombre,
      goles: goles[goleador.nombre] || 0,
      t_amarilla: goleador.t_amarilla || 0,
      t_roja: goleador.t_roja || 0,
    }));
  
    try {
      setIsLoading(true);
      const success = await addPartido(partido, eventos);
  
      if (success) {
        alert("Partido agregado exitosamente.");
        setEquipoLocal("");
        setResultadoLocal("");
        setResultadoVisitante("");
        setEquipoVisitante("");
        setFecha(""); // Limpiar el campo de fecha
        setGoles({});
        setGoleadores((prev) =>
          prev.map((goleador) => ({
            ...goleador,
            t_amarilla: 0,
            t_roja: 0,
          }))
        );
        setIsAdding(false);
  
        // Llamar a fetchPartidos para actualizar la lista de partidos
        await fetchPartidos();
      } else {
        alert("Error al agregar el partido.");
      }
    } catch (err) {
        return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePartido = async (id_partido) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este partido?");
    if (confirmDelete) {
      const success = await deletePartido(id_partido);
      if (success) {
        alert("Partido eliminado exitosamente.");
        await fetchPartidos(); // Recargar la lista de partidos
      } else {
        alert("Error al eliminar el partido.");
      }
    }
  };

  const handleGolesChange = (nombre, value) => {
    const parsedValue = value === "" ? 0 : parseInt(value, 10);
    if (isNaN(parsedValue) || parsedValue < 0) return;

    setGoles((prev) => ({
      ...prev,
      [nombre]: parsedValue,
    }));
  };

  const handleTarjetasChange = (nombre, value, tipoTarjeta) => {
    const parsedValue = value === "" ? 0 : parseInt(value, 10);
    if (isNaN(parsedValue) || parsedValue < 0) return;

    setGoleadores((prev) =>
      prev.map((goleador) =>
        goleador.nombre === nombre
          ? {
              ...goleador,
              [tipoTarjeta === "amarilla" ? "t_amarilla" : "t_roja"]: parsedValue,
            }
          : goleador
      )
    );
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
      backgroundImage: 'url("/Fotos/fondo_partidos.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      zIndex: 1,
    }}>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 0,
      }}></div>

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
                <li className="nav-item"><Link className="nav-link" href="../Asistencia">Asistencia</Link></li>
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

      <div className="flex-grow-1" style={{ zIndex: 1 }}>
        <div className="container">
          <h1 className="text-center my-4 text-white">Partidos</h1>
          {isAdmin && (
            <div className="nav-item me-2">
              <button className="btn btn-outline-info w-100 my-1" onClick={() => setIsAdding(true)}>
                Agregar Partido
              </button>
            </div>
          )}
          <div className="row justify-content-center">
            {partidos
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .map((partido, index) => (
              <div key={index} className="col-12 col-md-6 col-lg-4 mb-3">
                <div
                  className="card shadow mx-auto hover-effect"
                  style={{
                    cursor: "pointer",
                    backgroundColor: "rgba(255,237,215, 0.7)",
                    minHeight: "150px",
                    textAlign: 'center',
                    alignContent: 'center',
                    transition: 'transform 0.3s ease-in-out',
                  }}
                  onClick={() =>
                    setPartidoAbierto(partidoAbierto === partido.id_partidos ? null : partido.id_partidos)
                  }
                >
                  <div className="card-body text-center" style={{ backgroundColor: "rgba(255, 206, 146, 0.27)" }}>
                    <h5>
                      {new Date(partido.fecha).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </h5>
                    <br />
                    <strong>{partido.equipo_local}</strong>
                    <p>{partido.resultado_local}</p>
                    <p>{partido.resultado_visitante}</p>
                    <strong>{partido.equipo_visitante}</strong>
                  </div>
                  {partidoAbierto === partido.id_partidos && (
                    <div className="card-footer text-center" style={{ backgroundColor: "rgba(255, 255, 255, 0.46)" }}>
                      <h5>Eventos del Partido</h5>
                      {partido.eventos && partido.eventos.map((evento, i) => (
                        <div key={i}>
                          {evento.goles > 0 && (
                            <p>
                              {Array.from({ length: evento.goles }).map((_, i) => "⚽ ")}
                              {evento.nombre}
                            </p>
                          )}
                          {evento.t_amarilla > 0 && (
                            <p>
                              {Array.from({ length: evento.t_amarilla }).map((_, i) => "🟨 ")}
                              {evento.nombre}
                            </p>
                          )}
                          {evento.t_roja > 0 && (
                            <p>
                              {Array.from({ length: evento.t_roja }).map((_, i) => "🟥 ")}
                              {evento.nombre}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {isAdmin && (
                    <button
                      className="btn btn-danger w-100 mt-2"
                      onClick={(e) => {
                        e.stopPropagation(); // Evita que el evento de clic en la tarjeta se dispare
                        handleDeletePartido(partido.id_partidos);
                      }}
                    >
                      Eliminar Partido
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isAdmin && isAdding && (
        <div className="position-fixed top-50 start-50 translate-middle bg-white shadow-lg p-4 rounded d-flex flex-column"
          style={{ zIndex: 1050, width: "400px", maxHeight: "70vh", overflowY: "auto" }}>
          <h3 className="text-center">Agregar Partido</h3>
          <input type="date" className="form-control mb-2" placeholder="Fecha del Partido"
            value={fecha} onChange={(e) => setFecha(e.target.value)} />
          <input type="text" className="form-control mb-2" placeholder="Equipo Local"
            value={equipoLocal} onChange={(e) => setEquipoLocal(e.target.value)} />
          <input type="number" className="form-control mb-2" placeholder="Resultado Local"
            value={resultadoLocal} onChange={(e) => setResultadoLocal(e.target.value)} />
          <input type="number" className="form-control mb-2" placeholder="Resultado Visitante"
            value={resultadoVisitante} onChange={(e) => setResultadoVisitante(e.target.value)} />
          <input type="text" className="form-control mb-2" placeholder="Equipo Visitante"
            value={equipoVisitante} onChange={(e) => setEquipoVisitante(e.target.value)} />
          <h4 className="text-center mt-3">Jugadores</h4>
          <div className="flex-grow-1" style={{ overflowY: "auto", maxHeight: "200px" }}>
            {goleadores.map((goleador) => (
              <div key={goleador.nombre} className="mb-2">
                <span className="fw-bold">{goleador.nombre}</span>
                <input type="number" className="form-control mb-1" placeholder="Goles"
                  value={goles[goleador.nombre] || ""} onChange={(e) => handleGolesChange(goleador.nombre, e.target.value)} />
                <input type="number" className="form-control mb-1" placeholder="Amarillas"
                  value={goleador.t_amarilla || ""} onChange={(e) => handleTarjetasChange(goleador.nombre, e.target.value, "amarilla")} />
                <input type="number" className="form-control mb-1" placeholder="Rojas"
                  value={goleador.t_roja || ""} onChange={(e) => handleTarjetasChange(goleador.nombre, e.target.value, "roja")} />
              </div>
            ))}
          </div>
          <div className="d-flex justify-content-between mt-3">
            <button className="btn btn-success" onClick={handleAddPartido} disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar"}
            </button>
            <button className="btn btn-secondary" onClick={() => setIsAdding(false)}>Cancelar</button>
          </div>
        </div>
      )}

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

      <style jsx>{`
        .hover-effect:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}