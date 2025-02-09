import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getGoleadores, checkEmailInAdmins } from "../api/goleadores/goleadores";
import { getUser, signOut, getUserAdminStatus } from "../api/supabase/inicioSesion";
import Link from 'next/link';

export default function Goleadores() {
  const [goleadores, setGoleadores] = useState([]);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [loading, setLoading] = useState(true); // Estado para manejar la carga
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
    const fetchData = async () => {
      try {
        // Obtener el usuario actual
        const user = await getUser();
        if (!user) {
          setLoading(false); // Finaliza la carga
          return; // Si no hay usuario, no hacer nada
        }

        // Verificar si el email está en la tabla `admins`
        const emailExistsInAdmins = await checkEmailInAdmins(user.email);
        if (!emailExistsInAdmins) {
          setLoading(false); // Finaliza la carga
          return; // Si el email no está en la tabla, no cargar nada
        }

        // Si el email está en la tabla, cargar los goleadores
        const data = await getGoleadores();
        setGoleadores(data);
      } catch (err) {
        setError("Hubo un problema al cargar los goleadores: " + err.message);
      } finally {
        setLoading(false); // Finaliza la carga
      }
    };

    fetchData();
  }, []);

  const ordenarGoleadores = (lista) => {
    return [...lista].sort((a, b) => {
      if (b.Goles !== a.Goles) return b.Goles - a.Goles; // Mayor a menor por goles
      if (a.Partidos !== b.Partidos) return a.Partidos - b.Partidos; // Menor a mayor por partidos
      return a.Dorsal - b.Dorsal; // Menor a mayor por dorsal
    });
  };

  const goleadoresOrdenados = ordenarGoleadores(goleadores);

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  return (
    <div style={{
      position: 'relative', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundImage: 'url("/Fotos/fondo_goleadores.avif")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      zIndex: 1 // Asegura que el contenido esté sobre la capa oscura
    }}>
      {/* Capa semitransparente directamente sobre la imagen */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Oscurece solo la imagen de fondo
        zIndex: 0
      }}></div>
    
      {/* Contenido */}
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
                <li className="nav-item"><Link className="nav-link" href="../Partidos">Partidos</Link></li>
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
    
      <h1 className="text-center mt-4" style={{ color: 'white', zIndex: 2 }}>Goleadores</h1>
    
      <div 
        className="container my-5" 
        style={{ 
          zIndex: 2, 
          padding: '20px', 
          borderRadius: '15px', 
          flex: 1, // Esto hace que el contenido principal ocupe el espacio restante
        }}
      >
        <div 
          className="table-responsive rounded" 
          style={{ 
            borderRadius: '15px', 
            overflowX: 'auto' 
          }}
        >
          <table 
            className="table table-borderless text-center align-middle" 
            style={{ 
              fontFamily: 'Arial, sans-serif',
              borderRadius: '15px', 
              overflow: 'hidden' 
            }}
          >
            <thead style={{ fontSize: '1.1em' }}>
              <tr>
                <th style={{ padding: '15px', borderTopLeftRadius: '15px', backgroundColor: '#002c4b', color:'white' }}>Foto</th>
                <th style={{ padding: '15px', backgroundColor: '#002c4b', color:'white' }}>Nombre</th>
                <th style={{ padding: '15px', backgroundColor: '#002c4b', color:'white' }}>Dorsal</th>
                <th style={{ padding: '15px', backgroundColor: '#002c4b', color:'white' }}>Goles</th>
                <th style={{ padding: '15px', backgroundColor: '#002c4b', color:'white' }}>Partidos</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#333' }}>
                    Cargando goleadores...
                  </td>
                </tr>
              ) : goleadoresOrdenados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center align-middle">No hay datos disponibles</td>
                </tr>
              ) : (
                goleadoresOrdenados.map((goleador, index) => {
                  const celdaColor = (index) => {
                    if (index === 0) return '#ffd700'; // Oro para el primer lugar
                    if (index === 1) return '#c0c0c0'; // Plata para el segundo lugar
                    if (index === 2) return '#cd7f32'; // Bronce para el tercer lugar
                    return '#ffffff'; // Fondo blanco para los demás lugares
                  };

                  return (
                    <tr 
                      key={index} 
                    >
                      <td style={{ padding: '10px', backgroundColor: celdaColor(index) }}>
                        <img 
                          src={goleador.Foto || "https://cdn-icons-png.flaticon.com/512/63/63699.png"} 
                          alt={`Foto de ${goleador.Nombre}`} 
                          style={{
                            width: "70px", 
                            height: "70px", 
                            objectFit: "cover", 
                            borderRadius: "50%", 
                            maxWidth: '100%', 
                            height: '70px'
                          }}
                        />
                      </td>
                      <td style={{ padding: '10px', color: '#333', fontWeight: '500', backgroundColor: celdaColor(index) }}>
                        {goleador.Nombre}
                      </td>
                      <td style={{ padding: '10px', color: '#555', backgroundColor: celdaColor(index) }}>
                        {goleador.Dorsal}
                      </td>
                      <td style={{ padding: '10px', color: '#555', backgroundColor: celdaColor(index) }}>
                        {goleador.Goles}
                      </td>
                      <td style={{ padding: '10px', color: '#555', backgroundColor: celdaColor(index) }}>
                        {goleador.Partidos}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
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
}