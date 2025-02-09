import { useState, useEffect, useRef } from "react";
import { getJugadores, getAsistenciaByJugador, getGolesByJugador, checkEmailInAdmins } from '../api/estadisticas/estadisticas';
import { getUser, getUserAdminStatus, signOut } from '../api/supabase/inicioSesion';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const COLORS = ['#28a745', '#FFBB28', '#ff0000']; 

const Estadisticas = () => {
  const [jugadores, setJugadores] = useState([]);
  const [selectedJugador, setSelectedJugador] = useState(null);
  const [asistencia, setAsistencia] = useState([]);
  const [goles, setGoles] = useState([]);
  const [asistenciaResumen, setAsistenciaResumen] = useState([]);
  const [view, setView] = useState('jugadores');  // Estado para controlar la vista
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [chartWidth, setChartWidth] = useState(500);  // Estado para el ancho del gráfico
  const [isAdmin, setIsAdmin] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();

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

  useEffect(() => {
    const fetchJugadores = async () => {
      const data = await getJugadores();
      setJugadores(data);
    };

    fetchJugadores();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setChartWidth(300);  // Tamaño para móviles
      } else {
        setChartWidth(500);  // Tamaño para pantallas más grandes
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleJugadorClick = async (nombreJugador) => {
    if (selectedJugador === nombreJugador) {
      setSelectedJugador(null);
      setAsistencia([]);
      setGoles([]);
      setAsistenciaResumen([]);
      setView('jugadores');
      return;
    }
  
    setSelectedJugador(nombreJugador);
    setView('estadisticas');
  
    const asistenciaData = await getAsistenciaByJugador(nombreJugador);
    const golesData = await getGolesByJugador(nombreJugador);
  
    const asistenciaResumenData = [
      { name: 'Asiste', value: asistenciaData.filter(a => a.asistencia === 'Asiste').length },
      { name: 'Retraso', value: asistenciaData.filter(a => a.asistencia === 'Retraso').length },
      { name: 'Falta', value: asistenciaData.filter(a => a.asistencia === 'Falta').length }
    ];
  
    const asistenciaResumenCompleto = ['Asiste', 'Retraso', 'Falta'].map((type) => {
      const existing = asistenciaResumenData.find(item => item.name === type);
      if (existing) return existing;
      return { name: type, value: 0 };
    });
  
    const golesPorPartido = golesData.map(g => ({
      partido: g.id_partido,
      goles: g.goles
    }));
  
    setAsistencia(asistenciaData);
    setGoles(golesPorPartido);
    setAsistenciaResumen(asistenciaResumenCompleto);
  };
  
  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  

  if (!isAdmin) {
    return null; // No renderiza nada si el usuario no es administrador
  }

  return (
    <div className="container-fluid p-0 d-flex flex-column min-vh-100" style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundImage: 'url("/Fotos/fondo_estadisticas.jpg")',
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
                <li className="nav-item">
                  <button className="btn btn-outline-light btn-tamano-uniforme" onClick={handleSignOut}>Cerrar Sesión</button>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      {view === 'jugadores' && (
        <div className="table-responsive mx-auto" style={{ maxWidth: '800px', width: '90%', overflowX: 'auto' }}>
        <h1 className="text-center text-white">Lista de Jugadores</h1>
      
        {emailChecked && ( // Solo muestra la tabla si el email está en admins
          <table className="table table-borderless"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '15px',
              overflow: 'hidden',
              width: '100%',
              maxWidth: '100%', 
              margin: '0 auto', // Centrar la tabla
            }}>
            <thead className="text-center">
              <tr>
                <th style={{backgroundColor:"#002c4b", color:"#FFFFFF"}}>Nombre</th>
                <th style={{backgroundColor:"#002c4b", color:"#FFFFFF"}}>Dorsal</th>
              </tr>
            </thead>
            <tbody>
              {jugadores.map((jugador) => (
                <tr key={jugador.dorsal} onClick={() => handleJugadorClick(jugador.nombre)} style={{ cursor: 'pointer', textAlign: 'center' }}>
                  <td style={{ padding: '10px', verticalAlign: 'middle' }}>{jugador.nombre}</td>
                  <td style={{ padding: '10px', verticalAlign: 'middle' }}>{jugador.dorsal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      )}

      {view === 'estadisticas' && selectedJugador && (
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '10px', margin: '20px auto', maxWidth: '800px' }}>
          <button onClick={() => setView('jugadores')} style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}>
            Volver a la lista de jugadores
          </button>

          <h2 className="text-center">Estadísticas de {selectedJugador}</h2>

          <h3 className="text-center">Resumen de Asistencia</h3>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <PieChart width={300} height={250}>
              <Pie
                data={asistenciaResumen}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ percent }) => `${(percent * 100).toFixed(2)}%`}
              >
                {asistenciaResumen.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>

          <h3 className="text-center">Goles por Partido</h3>
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <LineChart width={chartWidth} height={300} data={goles}>
              <XAxis dataKey="partido" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="goles" stroke="#002c4b" dot />
            </LineChart>
          </div>
        </div>
      )}

      <footer className="text-white text-center py-2 mt-auto" style={{ backgroundColor: 'rgba(70, 130, 180, 0)', zIndex: 2 }}>
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
        <p>&copy; 2025 ZonaGol. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Estadisticas;