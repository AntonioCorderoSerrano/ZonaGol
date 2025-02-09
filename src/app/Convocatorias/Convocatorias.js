import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import { getConvocatorias, getPartidoDetalles, desconvocarJugador, modificarPartido, restablecerPartido, convocarJugador, checkEmailInAdmins } from '../api/convocatorias/convocatorias';
import { getUser, getUserAdminStatus, signOut } from '../api/supabase/inicioSesion';
import Link from 'next/link';
import "bootstrap/dist/css/bootstrap.min.css";

const Convocatorias = () => {
  const [detalles, setDetalles] = useState({
    rival: '',
    fecha: '',
    hora: '',
    lugar: '',
    equipacion: '',
  });
  const [convocatorias, setConvocatorias] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);
  const [nuevoPartido, setNuevoPartido] = useState({
    rival: '',
    fecha: '',
    hora: '',
    lugar: '',
    equipacion: '',
  });
  const [fotosCargadas, setFotosCargadas] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleBeforeUnload = async () => {
      await signOut();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener el usuario actual
        const user = await getUser();
        if (!user) {
          router.push('/'); // Redirige a la página de inicio de sesión si no hay usuario
          return; 
        }
  
        // Guardar el email del usuario en el estado
        setUserEmail(user.email);
  
        // Verificar si el email está en la tabla `admins`
        const emailExistsInAdmins = await checkEmailInAdmins(user.email);
        if (!emailExistsInAdmins) {
          return; // Si el email no está en la tabla, no cargar nada
        }
  
        // Verificar si el usuario es administrador
        const adminStatus = await getUserAdminStatus(user.email);
        setIsAdmin(adminStatus); // Actualiza el estado isAdmin
  
        // Si el email está en la tabla y el usuario es administrador, cargar los datos
        if (emailExistsInAdmins) {
          // Obtener convocatorias
          const convocatoriasData = await getConvocatorias();
  
          // Solo actualizar el estado si hay datos válidos
          if (convocatoriasData) {
            const jugadores = convocatoriasData
              .map((item) => ({
                nombre: item.nombre || '',
                dorsal: item.dorsal || '',
                convocatoria: item.convocatoria || '',
                Foto: item.Foto || null,
              }))
              .sort((a, b) => a.dorsal - b.dorsal);
  
            setConvocatorias(jugadores); // Actualiza el estado con las convocatorias
            setFotosCargadas(true); // Indica que las fotos se han cargado
          }
  
          // Obtener detalles del partido
          const partidoData = await getPartidoDetalles();
          if (partidoData) {
            setDetalles({
              rival: partidoData.Rival || '',
              fecha: partidoData.Fecha || '',
              hora: partidoData.Hora || '',
              lugar: partidoData.Lugar || '',
              equipacion: partidoData.Equipación || '',
            });
          }
        }
      } catch (error) {
        return null;
      }
    };
  
    fetchData();
  }, [router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/'); // Redirige a la página de inicio de sesión
  };

  const handleConvocar = async (jugadorId) => {
    try {
      // Convocar jugador
      await convocarJugador(jugadorId);

      // Obtener las convocatorias actualizadas
      const convocatoriasData = await getConvocatorias();
      if (convocatoriasData && convocatoriasData.length > 0) {
        const jugadores = convocatoriasData
          .map((item) => ({
            nombre: item.nombre || '', // Si es null, se reemplaza por ''
            dorsal: item.dorsal || '', // Si es null, se reemplaza por ''
            convocatoria: item.convocatoria || '', // Si es null, se reemplaza por ''
            Foto: item.Foto || null, // Incluir el atributo Foto
          }))
          .sort((a, b) => a.dorsal - b.dorsal); // Orden de menor a mayor
        setConvocatorias(jugadores);
      }
    } catch (error) {
    }
  };

  const handleDesconvocar = async (jugadorId) => {
    try {
      // Desconvocar jugador
      await desconvocarJugador(jugadorId);

      // Obtener las convocatorias actualizadas
      const convocatoriasData = await getConvocatorias();
      if (convocatoriasData && convocatoriasData.length > 0) {
        const jugadores = convocatoriasData
          .map((item) => ({
            nombre: item.nombre || '', // Si es null, se reemplaza por ''
            dorsal: item.dorsal || '', // Si es null, se reemplaza por ''
            convocatoria: item.convocatoria || '', // Si es null, se reemplaza por ''
            Foto: item.Foto || null, // Incluir el atributo Foto
          }))
          .sort((a, b) => a.dorsal - b.dorsal); // Orden de menor a mayor
        setConvocatorias(jugadores);
      }
    } catch (error) {
    }
  };

  const handleModificarPartido = () => {
    setEditMode(true);
    setNuevoPartido({
      rival: detalles.rival || '',
      fecha: detalles.fecha || '',
      hora: detalles.hora || '',
      lugar: detalles.lugar || '',
      equipacion: detalles.equipacion || '',
    });
  };

  const handleSubmitModificarPartido = async (e) => {
    e.preventDefault(); // Prevenir la recarga de la página
    try {
      // Modificar el partido en la base de datos
      await modificarPartido(nuevoPartido);
      alert('Partido modificado');
      setEditMode(false);
  
      // Obtener los nuevos detalles del partido
      const partidoData = await getPartidoDetalles();
      if (partidoData) {
        setDetalles({
          rival: partidoData.Rival || '',
          fecha: partidoData.Fecha || '',
          hora: partidoData.Hora || '',
          lugar: partidoData.Lugar || '',
          equipacion: partidoData.Equipación || '',
        });
      }
  
      // Obtener las convocatorias actualizadas
      const convocatoriasData = await getConvocatorias();
      if (convocatoriasData && convocatoriasData.length > 0) {
        const jugadores = convocatoriasData
          .map((item) => ({
            nombre: item.nombre || '', // Si es null, se reemplaza por ''
            dorsal: item.dorsal || '', // Si es null, se reemplaza por ''
            convocatoria: item.convocatoria || '', // Si es null, se reemplaza por ''
            Foto: item.Foto
          }))
          .sort((a, b) => a.dorsal - b.dorsal); // Orden de menor a mayor
        setConvocatorias(jugadores);
      }
    } catch (error) {
      return null;
    }
  };

  const handleRestablecerPartido = async () => {
    try {
      // Restablecer el partido en la base de datos
      await restablecerPartido();
      alert('Partido restablecido');

      // Obtener los nuevos detalles del partido
      const partidoData = await getPartidoDetalles();
      if (partidoData) {
        setDetalles({
          rival: partidoData.Rival || '',
          fecha: partidoData.Fecha || '',
          hora: partidoData.Hora || '',
          lugar: partidoData.Lugar || '',
          equipacion: partidoData.Equipación || '',
        });
      }

      // Obtener las convocatorias actualizadas
      const convocatoriasData = await getConvocatorias();
      if (convocatoriasData && convocatoriasData.length > 0) {
        const jugadores = convocatoriasData
          .map((item) => ({
            nombre: item.nombre || '', // Si es null, se reemplaza por ''
            dorsal: item.dorsal || '', // Si es null, se reemplaza por ''
            convocatoria: item.convocatoria || '', // Si es null, se reemplaza por ''
            Foto: item.Foto
          }))
          .sort((a, b) => a.dorsal - b.dorsal); // Orden de menor a mayor
        setConvocatorias(jugadores);
      }
    } catch (error) {
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoPartido((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Función para cancelar la edición
  const handleCancelarModificacion = () => {
    setEditMode(false); // Salir del modo de edición
    setNuevoPartido({
      rival: '', // Restablecer los valores a vacíos
      fecha: '',
      hora: '',
      lugar: '',
      equipacion: '',
    });
  };

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundImage: 'url("/Fotos/fondo_convocatorias.jpg")',
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
                <li className="nav-item"><Link className="nav-link" href="../Goleadores">Goleadores</Link></li>
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
                {/* Botón de Cerrar Sesión dentro del mismo ul */}
                <li className="nav-item">
                  <button className="btn btn-outline-light btn-tamano-uniforme" onClick={handleSignOut}>Cerrar Sesión</button>
                </li>
              </ul>
            </div>

          </div>
        </nav>
      </header>

      {/* Contenido principal */}
      <div style={{ flex: 1, zIndex: 2 }}>
        <h1 className="text-center mt-3" style={{ color: 'white', zIndex: 2 }}>Detalles del partido</h1>

        {/* Tarjeta para los detalles del partido */}
        <div className="container mt-3" style={{ zIndex: 2 }}>
          {isAdmin && (
                <div className="container mt-3 text-center">
                  <button className="btn btn-outline-warning mb-2 me-2 btn-tamano-uniforme" onClick={handleModificarPartido}>Modificar Partido</button>
                  <button className="btn btn-outline-info mb-2 me-2 btn-tamano-uniforme" onClick={handleRestablecerPartido}>Restablecer Partido</button>
                </div>
              )}
          <div className="card shadow-lg" style={{ borderRadius: '15px', backgroundColor: 'rgba(0,44,75,0.6)' }}>
            <div className="card-body">
              <p style={{ color: 'white' }}><strong style={{ color: '#c7e4ac' }}>Rival:</strong> {detalles.rival}</p>
              <p style={{ color: 'white' }}><strong style={{ color: '#c7e4ac' }}>Fecha:</strong> {detalles.fecha ? new Date(detalles.fecha).toLocaleDateString() : ''}</p>
              <p style={{ color: 'white' }}><strong style={{ color: '#c7e4ac' }}>Hora:</strong> {detalles.hora}</p>
              <p style={{ color: 'white' }}><strong style={{ color: '#c7e4ac' }}>Lugar:</strong> {detalles.lugar}</p>
              <p style={{ color: 'white' }}><strong style={{ color: '#c7e4ac' }}>Equipación:</strong> {detalles.equipacion}</p>
            </div>
          </div>
        </div>

        {editMode && (
          <div
            className="container mt-4"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#ffffff',  // Fondo blanco sólido
              color: '#002c4b',  // Texto en azul oscuro
              padding: '20px',
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
              zIndex: '9999',
              width: '90%',  // Ajusta el ancho para dispositivos móviles
              maxWidth: '600px',  // Limita el ancho máximo para pantallas grandes
              borderRadius: '10px',  // Bordes redondeados
              boxSizing: 'border-box',  // Asegura que el padding no afecte el ancho total
            }}
          >
            <h2 className="text-center">Modificar Partido</h2>
            <form className="formulario" onSubmit={handleSubmitModificarPartido}>
              <div className="mb-3">
                <label className="form-label">Rival:</label>
                <input
                  type="text"
                  className="form-control"
                  name="rival"
                  value={nuevoPartido.rival || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Fecha:</label>
                <input
                  type="date"
                  className="form-control"
                  name="fecha"
                  value={nuevoPartido.fecha || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Hora:</label>
                <input
                  type="time"
                  className="form-control"
                  name="hora"
                  value={nuevoPartido.hora || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Lugar:</label>
                <input
                  type="text"
                  className="form-control"
                  name="lugar"
                  value={nuevoPartido.lugar || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Equipación:</label>
                <input
                  type="text"
                  className="form-control"
                  name="equipacion"
                  value={nuevoPartido.equipacion || ''}
                  onChange={handleInputChange}
                />
              </div>
              <button type="submit" className="btn btn-success me-2">Enviar Cambios</button>
              <button type="button" className="btn btn-secondary" onClick={handleCancelarModificacion}>Cancelar</button>
            </form>
          </div>
        )}

        {/* Tabla de futbolistas */}
        <div className="container mt-3" style={{ zIndex: 2 }}>
          <h2 className='text-center mt-3' style={{ color: 'white' }}>Futbolistas</h2>
          <div className="table-responsive">
            <table className="table table-borderless" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '15px', overflow: 'hidden' }}>
              <thead style={{ backgroundColor: '#002c4b', color: 'white' }}>
                <tr>
                  <th className="text-center align-middle" style={{ backgroundColor: '#002c4b', color: 'white' }}>Foto</th>
                  <th className="text-center align-middle" style={{ backgroundColor: '#002c4b', color: 'white' }}>Nombre</th>
                  <th className="text-center align-middle" style={{ backgroundColor: '#002c4b', color: 'white' }}>Dorsal</th>
                  <th className="text-center align-middle" style={{ backgroundColor: '#002c4b', color: 'white' }}>Convocatoria</th>
                  {isAdmin && <th className="text-center align-middle" style={{ width: '150px', backgroundColor: '#002c4b', color: 'white' }}>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {convocatorias.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center align-middle">No hay datos disponibles</td>
                  </tr>
                ) : (
                  convocatorias.map((jugador, index) => (
                    <tr key={index} className="text-center">
                      <td className="d-flex justify-content-center align-items-center align-middle">
                        <img
                          src={jugador.Foto || "https://cdn-icons-png.flaticon.com/512/63/63699.png"}
                          alt={`Foto de ${jugador.nombre}`}
                          style={{
                            width: "70px",
                            height: "70px",
                            objectFit: "cover",
                            borderRadius: "50%",
                            filter: 'brightness(0.8)' // Oscurece la foto
                          }}
                        />
                      </td>
                      <td className="align-middle">{jugador.nombre}</td>
                      <td className="align-middle">{jugador.dorsal}</td>
                      <td className="align-middle" style={{ color: jugador.convocatoria ? 'green' : 'red' }}>
                        {jugador.convocatoria ? 'Convocado' : 'No Convocado'}
                      </td>
                      {isAdmin && (
                        <td className="align-middle" style={{ width: '150px' }}>
                          {jugador.convocatoria ? (
                            <button className="btn btn-danger w-100" onClick={() => handleDesconvocar(jugador.dorsal)}>Desconvocar</button>
                          ) : (
                            <button className="btn btn-success w-100" onClick={() => handleConvocar(jugador.dorsal)}>Convocar</button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
export default Convocatorias;