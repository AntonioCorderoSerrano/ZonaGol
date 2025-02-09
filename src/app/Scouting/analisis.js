import { useState, useEffect, useRef } from "react";
import { getAnalisisTacticos, getAnalisisTacticoById, createAnalisisTactico, deleteAnalisisTactico, checkEmailInAdmins } from '../api/Analisis Rival/analisisRival';
import { getUser, getUserAdminStatus, signOut } from '../api/supabase/inicioSesion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Analisis_Rival = () => {
  const [analisisTacticos, setAnalisisTacticos] = useState([]);
  const [selectedAnalisis, setSelectedAnalisis] = useState(null);
  const [view, setView] = useState('analisis');
  const [showForm, setShowForm] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();

  const formaciones = [
    { type: 'F11', formaciones: ['4-4-2', '4-3-3', '4-2-3-1', '3-5-2', '3-4-3', '5-3-2', '5-4-1', '4-5-1', '4-1-4-1', '4-2-2-2', '3-6-1', '4-3-2-1'] },
    { type: 'F7', formaciones: ['3-3-3-1', '2-3-1', '3-2-1', '3-1-2', '2-2-2', '1-3-2', '2-1-3', '1-2-3', '3-3', '4-2', '2-4'] }
  ];

  // Verificar autenticación y permisos
  useEffect(() => {
    const verifyAuthentication = async () => {
      const user = await getUser();
      if (user) {
        const emailChecked = await checkEmailInAdmins(user.email);
        setEmailChecked(emailChecked);
      }
    };
    verifyAuthentication();
  }, []);

  // Obtener todos los análisis tácticos
  useEffect(() => {
    const fetchAnalisisTacticos = async () => {
      const data = await getAnalisisTacticos();
      setAnalisisTacticos(data);
    };
    fetchAnalisisTacticos();
  }, []);

  // Obtener un análisis táctico por ID
  const handleAnalisisClick = async (id) => {
    const data = await getAnalisisTacticoById(id);
    setSelectedAnalisis(data);
    setView('detalles');
  };

  // Eliminar un análisis táctico
  const handleDeleteAnalisis = async (id) => {
    const success = await deleteAnalisisTactico(id);
    if (success) {
      setAnalisisTacticos(analisisTacticos.filter((item) => item.id !== id));
      setSelectedAnalisis(null);
    }
  };

  // Crear un nuevo análisis táctico
  const handleCreateAnalisis = async (newAnalisis) => {
    const data = await createAnalisisTactico(newAnalisis);
    if (data) {
      setAnalisisTacticos([...analisisTacticos, data]);
      setShowForm(false);
    }
  };

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  const handleSignOut = async () => {
      await signOut();
      router.push('/');
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

  return (
    <div className="container-fluid p-0 d-flex flex-column min-vh-100" style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundImage: 'url("/Fotos/fondo_scouting.png")',
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
                      <Link className="nav-link" href="../Estadisticas">Estadistícas</Link>
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
      {view === 'analisis' && (
        <>
          <h1 className="text-center text-white">Scouting Táctico</h1>

          {emailChecked && (
            <div className="table-responsive mx-auto" style={{ maxWidth: '800px', width: '90%', overflowX: 'auto' }}>
              <button 
                onClick={() => setShowForm(true)} className="btn btn-outline-info"
                style={{ 
                  margin: '10px auto', 
                  padding: '10px', 
                  borderRadius: '5px', 
                  width: '100%', 
                  maxWidth: '800px', 
                  display: 'block' 
                }}
              >
                Agregar Scouting
              </button>
            
              {showForm && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Nuevo Scouting Táctico</h5>
                        <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
                      </div>
                      <div className="modal-body">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const newAnalisis = {
                              equipo: formData.get('equipo'),
                              modelo_de_juego: formData.get('modelo_de_juego'),
                              sistema_de_juego: selectedFormation || formData.get('sistema_de_juego'),
                              salida_de_balon: formData.get('salida_de_balon'),
                              transiciones_defensa_ataque: formData.get('transiciones_defensa_ataque'),
                              transiciones_ataque_defensa: formData.get('transiciones_ataque_defensa'),
                              comportamientos_en_distintos_espacios: formData.get('comportamientos_en_distintos_espacios'),
                              comportamientos_en_salida_balon_rival: formData.get('comportamientos_en_salida_balon_rival'),
                              tipos_de_presion: formData.get('tipos_de_presion'),
                              repliegue: formData.get('repliegue'),
                              vigilancias: formData.get('vigilancias'),
                              lineas_debiles: formData.get('lineas_debiles'),
                              lineas_fortales: formData.get('lineas_fortales'),
                              zonas_de_superioridad: formData.get('zonas_de_superioridad'),
                              zonas_de_inferioridad: formData.get('zonas_de_inferioridad'),
                              acciones_a_balon_parado_ofensivas: formData.get('acciones_a_balon_parado_ofensivas'),
                              acciones_a_balon_parado_defensivas: formData.get('acciones_a_balon_parado_defensivas'),
                              notas_adicionales: formData.get('notas_adicionales'), // Incluir notas adicionales
                            };
                            handleCreateAnalisis(newAnalisis);
                          }}
                        >
                          <input type="text" name="equipo" className="form-control mb-2" placeholder="Equipo" required />
                          <textarea name="modelo_de_juego" className="form-control mb-2" placeholder="Modelo de Juego" required />
                          <select className="form-select" value={selectedFormation} onChange={(e) => setSelectedFormation(e.target.value)}>
                            <option value="">Selecciona una formación</option>
                            {formaciones.map((group, index) => (
                              <optgroup label={group.type} key={index}>
                                {group.formaciones.map((formation, i) => (
                                  <option key={i} value={formation}>
                                    {formation}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                          <br />
                          <textarea name="salida_de_balon" className="form-control mb-2" placeholder="Salida de Balón" required />
                          <textarea name="transiciones_defensa_ataque" className="form-control mb-2" placeholder="Transiciones Defensa-Ataque" required />
                          <textarea name="transiciones_ataque_defensa" className="form-control mb-2" placeholder="Transiciones Ataque-Defensa" required />
                          <textarea name="comportamientos_en_distintos_espacios" className="form-control mb-2" placeholder="Comportamientos en Distintos Espacios" required />
                          <textarea name="comportamientos_en_salida_balon_rival" className="form-control mb-2" placeholder="Comportamientos en Salida de Balón Rival" required />
                          <textarea name="tipos_de_presion" className="form-control mb-2" placeholder="Tipos de Presión" required />
                          <textarea name="repliegue" className="form-control mb-2" placeholder="Repliegue" required />
                          <textarea name="vigilancias" className="form-control mb-2" placeholder="Vigilancias" required />
                          <textarea name="lineas_debiles" className="form-control mb-2" placeholder="Líneas Débiles" required />
                          <textarea name="lineas_fortales" className="form-control mb-2" placeholder="Líneas Fuertes" required />
                          <textarea name="zonas_de_superioridad" className="form-control mb-2" placeholder="Zonas de Superioridad" required />
                          <textarea name="zonas_de_inferioridad" className="form-control mb-2" placeholder="Zonas de Inferioridad" required />
                          <textarea name="acciones_a_balon_parado_ofensivas" className="form-control mb-2" placeholder="Acciones a Balón Parado Ofensivas" required />
                          <textarea name="acciones_a_balon_parado_defensivas" className="form-control mb-2" placeholder="Acciones a Balón Parado Defensivas" required />
                          <textarea name="notas_adicionales" className="form-control mb-2" placeholder="Notas adicionales" />
                          <div className="modal-footer">
                            <button type="submit" className="btn btn-success">Guardar</button>
                            <button type="button" className="btn btn-danger" onClick={() => setShowForm(false)}>Cancelar</button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            
              <table className="table table-borderless"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '15px',
                  overflow: 'hidden',
                  width: '100%',
                  maxWidth: '100%', // Asegura que la tabla no exceda el ancho del contenedor
                  margin: '0 auto', // Centrar la tabla
                }}>
                <thead className="text-center">
                  <tr>
                    <th style={{ padding: '10px', backgroundColor: '#002c4b', color: '#FFFFFF' }}>Equipo</th>
                    <th style={{ padding: '10px', backgroundColor: '#002c4b', color: '#FFFFFF' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {analisisTacticos.map((analisis) => (
                    <tr key={analisis.id} style={{ cursor: 'pointer', textAlign: 'center' }}>
                      <td style={{ padding: '10px', verticalAlign: 'middle' }}>{analisis.equipo}</td>
                      <td style={{ padding: '5px', verticalAlign: 'middle'}}>
                        <button className="btn btn-outline-primary btn-tamano-uniforme" style={{ marginRight:'2%', marginBottom:'2%'}} onClick={() => handleAnalisisClick(analisis.id)}>Ver</button>
                        <button className="btn btn-outline-danger btn-tamano-uniforme" style={{ marginRight:'2%', marginBottom:'2%'}} onClick={() => handleDeleteAnalisis(analisis.id)}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {view === 'detalles' && selectedAnalisis && (
        <div style={{
          margin: '20px auto',
          padding: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '10px',
          maxWidth: '800px',
          width: '90%',
        }}>
          <h2>Detalles del Análisis</h2>
          <p><strong>Equipo:</strong> {selectedAnalisis.equipo}</p>
          <p><strong>Modelo de Juego:</strong> {selectedAnalisis.modelo_de_juego}</p>
          <p><strong>Sistema de Juego:</strong> {selectedAnalisis.sistema_de_juego}</p>
          <p><strong>Salida de Balón:</strong> {selectedAnalisis.salida_de_balon}</p>
          <p><strong>Transiciones Defensa-Ataque:</strong> {selectedAnalisis.transiciones_defensa_ataque}</p>
          <p><strong>Transiciones Ataque-Defensa:</strong> {selectedAnalisis.transiciones_ataque_defensa}</p>
          <p><strong>Comportamientos en Distintos Espacios:</strong> {selectedAnalisis.comportamientos_en_distintos_espacios}</p>
          <p><strong>Comportamientos en Salida de Balón Rival:</strong> {selectedAnalisis.comportamientos_en_salida_balon_rival}</p>
          <p><strong>Tipos de Presión:</strong> {selectedAnalisis.tipos_de_presion}</p>
          <p><strong>Repliegue:</strong> {selectedAnalisis.repliegue}</p>
          <p><strong>Vigilancias:</strong> {selectedAnalisis.vigilancias}</p>
          <p><strong>Líneas Débiles:</strong> {selectedAnalisis.lineas_debiles}</p>
          <p><strong>Líneas Fuertes:</strong> {selectedAnalisis.lineas_fortales}</p>
          <p><strong>Zonas de Superioridad:</strong> {selectedAnalisis.zonas_de_superioridad}</p>
          <p><strong>Zonas de Inferioridad:</strong> {selectedAnalisis.zonas_de_inferioridad}</p>
          <p><strong>Acciones a Balón Parado Ofensivas:</strong> {selectedAnalisis.acciones_a_balon_parado_ofensivas}</p>
          <p><strong>Acciones a Balón Parado Defensivas:</strong> {selectedAnalisis.acciones_a_balon_parado_defensivas}</p>
          <p><strong>Notas adicionales:</strong> {selectedAnalisis.notas_adicionales}</p>
          <button className="btn btn-outline-warning btn-tamano-uniforme" onClick={() => setView('analisis')} style={{ marginTop: '10px', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}>Volver</button>
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
      <style jsx>{`
        @media (max-width: 768px) {
          .content-container {
            padding-left: 16px;
            padding-right: 16px;
          }
          button {
            margin-left: 16px;
            margin-right: 16px;
          }
          table {
            margin-left: 16px;
            margin-right: 16px;
          }
        }
    `}</style>
    </div>
  );
};

export default Analisis_Rival;