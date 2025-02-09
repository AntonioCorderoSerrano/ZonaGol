import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { fetchJugadores, updateJugadorBackend, deleteJugador, addJugador, fetchCuerpoTecnico, addCuerpoTecnico, updateCuerpoTecnico, deleteCuerpoTecnico, checkEmailInAdmins } from "../api/jugadores/jugadores"; // Funciones de API

import { getUser, getUserAdminStatus, signOut } from "../api/supabase/inicioSesion";
import Link from 'next/link';

export default function Jugadores() {
  const [jugadores, setJugadores] = useState([]);
  const [cuerpoTecnico, setCuerpoTecnico] = useState([]);
  const [error, setError] = useState(null);
  const [selectedJugador, setSelectedJugador] = useState("");
  const [selectedJugadorModificar, setSelectedJugadorModificar] = useState("");
  const [selectedCuerpoTecnico, setSelectedCuerpoTecnico] = useState(""); // Asegurarse de que está definida
  const [newNombre, setNewNombre] = useState("");
  const [newDorsal, setNewDorsal] = useState("");
  const [newPieDominante, setNewPieDominante] = useState("");
  const [newPosicion, setNewPosicion] = useState("");
  const [newFechaNacimiento, setNewFechaNacimiento] = useState("");
  const [newNombreCuerpoTecnico, setNewNombreCuerpoTecnico] = useState(""); // Asegurarse de que está definida
  const [newFechaNacimientoCuerpoTecnico, setNewFechaNacimientoCuerpoTecnico] = useState(""); // Asegurarse de que está definida
  const [newRolCuerpoTecnico, setNewRolCuerpoTecnico] = useState(""); // Asegurarse de que está definida
  const [newDorsalModificar, setNewDorsalModificar] = useState("");
  const [newPosicionModificar, setNewPosicionModificar] = useState("");
  const [newFotoModificar, setNewFotoModificar] = useState(null);
  const [isAdding, setIsAdding] = useState(false); 
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [newPuesto, setNewPuesto] = useState("");
  const [updateOption, setUpdateOption] = useState(""); 
  const [isAddingCuerpoTecnico, setIsAddingCuerpoTecnico] = useState(false);
  const [isUpdatingCuerpoTecnico, setIsUpdatingCuerpoTecnico] = useState(false);
  const [isDeletingCuerpoTecnico, setIsDeletingCuerpoTecnico] = useState(false);
  const [newFotoFile, setNewFotoFile] = useState(null); // Para la foto al actualizar
  const [fotoFileCuerpoTecnico, setFotoFileCuerpoTecnico] = useState(null); // Para la foto al añadir
  const [fotoFile, setFotoFile] = useState(null); // Estado para la foto
  const [campoSeleccionado, setCampoSeleccionado] = useState(""); // Campo seleccionado por el usuario
  const menuRef = useRef(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Estado para manejar la carga
  const [isUserAdmin, setIsUserAdmin] = useState(false);

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
    const checkAdminStatus = async () => {
      const user = await getUser();
      if (user) {
        const adminStatus = await getUserAdminStatus(user.email);
        setIsUserAdmin(adminStatus);
      }
    };
  
    checkAdminStatus();
  }, []); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener el usuario actual
        const user = await getUser();
        if (!user) {
          setLoading(false); // Finaliza la carga
          router.push("/"); // Redirige al usuario a la página de inicio de sesión
          return; // Si no hay usuario, no hacer nada
        }

        // Verificar si el usuario está en la tabla `admins`
        const isUserAdmin = await checkEmailInAdmins(user.email);
        setIsAdmin(isUserAdmin); // Actualiza el estado isAdmin

        // Si el usuario no es admin, no cargar los datos
        if (!isUserAdmin) {
          setLoading(false); // Finaliza la carga
          return;
        }

        // Si el usuario es admin, cargar los datos
        const jugadoresData = await fetchJugadores();
        const cuerpoTecnicoData = await fetchCuerpoTecnico();

        setJugadores(jugadoresData);
        setCuerpoTecnico(cuerpoTecnicoData);
      } catch (err) {
        setError("Hubo un problema al cargar los datos: " + err.message);
      } finally {
        setLoading(false); // Finaliza la carga
      }
    };

    fetchData();
  }, [router]);

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




  // Función para manejar la actualización del jugador
  const handleUpdateJugador = async () => {
    if (!selectedJugadorModificar || !updateOption) {
      alert("Por favor, selecciona un jugador y qué deseas modificar.");
      return;
    }
  
    try {
      const updates = {};
  
      if (updateOption === "dorsal") {
        const dorsalInt = parseInt(newDorsalModificar, 10);
        if (isNaN(dorsalInt)) {
          alert("El dorsal debe ser un número válido.");
          return;
        }
  
        // Validación: Comprobar si el dorsal ya existe
        const jugadorExistente = jugadores.find((jugador) => jugador.dorsal === dorsalInt);
        if (jugadorExistente && jugadorExistente.id !== selectedJugadorModificar) {
          alert("El dorsal ya está asignado a otro jugador.");
          return;
        }
  
        updates.dorsal = dorsalInt;
      } else if (updateOption === "posicion") {
        if (!newPosicionModificar) {
          alert("Por favor, proporciona una posición válida.");
          return;
        }
        updates.posicion = newPosicionModificar;
      } else if (updateOption === "foto" && newFotoModificar) {
        const fotoFile = newFotoModificar;
        updates.foto = fotoFile; // Enviar el archivo de foto al backend
      } else {
        alert("Opción no válida.");
        return;
      }
  
      // Actualizar jugador con los datos en el backend
      await updateJugadorBackend(selectedJugadorModificar, updates);
      setNewDorsalModificar("");
      setNewPosicionModificar("");
      setUpdateOption("");
      setSelectedJugadorModificar("");
      setNewFotoModificar(null);  // Limpiar foto
      setIsUpdating(false);
  
      const data = await fetchJugadores();
      setJugadores(data); // Actualizar la lista de jugadores
    } catch (err) {
      alert("Error al actualizar el jugador: " + err.message);
    }
  };
  
  const handleDeleteJugador = async () => {
    if (!selectedJugador) {
      alert("Por favor, selecciona un jugador para eliminar.");
      return;
    }

    try {
      // Llamada a la función de eliminación
      await deleteJugador(selectedJugador);
      alert("Jugador eliminado correctamente");

      // Traer los jugadores actualizados después de la eliminación
      const data = await fetchJugadores();
      setJugadores(data); // Actualizar el estado con los nuevos datos
      setIsDeleting(false); // Cerrar el formulario de eliminación
    } catch (err) {
      alert("Error al eliminar el jugador.");
    }
  };

  const handleAddJugador = async () => {
    // Validación: Comprobar que los campos obligatorios estén completos
    if (!newNombre || newDorsal === "" || !newFechaNacimiento || !newPosicion || !newPieDominante) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }
  
    try {
      // Validación: Comprobar si el dorsal ya existe
      const dorsalInt = parseInt(newDorsal, 10);
      if (isNaN(dorsalInt)) {
        alert("El dorsal debe ser un número válido.");
        return;
      }
  
      const jugadorExistente = jugadores.find((jugador) => jugador.dorsal === dorsalInt);
      if (jugadorExistente) {
        alert("El dorsal ya está asignado a otro jugador.");
        return;
      }
  
      // Si todo está correcto, agregar el jugador
      await addJugador(newNombre, newDorsal, newPosicion, newPieDominante, newFechaNacimiento, fotoFile);
      alert(`Jugador añadido: ${newNombre}, Dorsal: ${newDorsal}, Posición: ${newPosicion}`);
  
      // Restablecer los campos
      setNewNombre("");
      setNewDorsal("");
      setNewPosicion("");
      setNewPieDominante("");
      setNewFechaNacimiento("");
      setFotoFile(null); // Restablecer la foto
  
      setIsAdding(false);
  
      // Recargar la lista de jugadores
      const data = await fetchJugadores();
      setJugadores(data);
    } catch (err) {
      alert("Error al añadir el jugador.");
    }
  };

  const cancelarAñadir = () => {
    setNewNombre("");
    setNewDorsal("");
    setNewPosicion("");
    setNewPieDominante("");
    setIsAdding(false);
  };

  const cancelarModificar = () => {
    setNewDorsalModificar("");
    setNewPosicionModificar("");
    setIsUpdating(false);
  };

  const ordenarJugadores = (lista) => {
    return [...lista].sort((a, b) => a.dorsal - b.dorsal); // Ordena por dorsal (menor a mayor)
  };
  const jugadoresOrdenados = ordenarJugadores(jugadores);

  // Función para añadir un nuevo miembro al cuerpo técnico
  const handleAddCuerpoTecnico = async () => {
    // Validación: Comprobar que los campos obligatorios estén completos
    if (!newNombreCuerpoTecnico || !newFechaNacimientoCuerpoTecnico || !newRolCuerpoTecnico) {
      alert("Por favor, completa todos los campos obligatorios (nombre, fecha de nacimiento, puesto).");
      return;
    }
  
    try {
      // Validación adicional (opcional): Comprobar formato de fecha
      const fechaValida = new Date(newFechaNacimientoCuerpoTecnico).toString() !== "Invalid Date";
      if (!fechaValida) {
        alert("Por favor, ingresa una fecha de nacimiento válida.");
        return;
      }
  
      // Llamar a la función para añadir al cuerpo técnico con los campos completos, incluyendo la foto
      await addCuerpoTecnico(
        newNombreCuerpoTecnico,
        newFechaNacimientoCuerpoTecnico,
        newRolCuerpoTecnico,
        fotoFileCuerpoTecnico
      );
      alert(`${newRolCuerpoTecnico} añadido: ${newNombreCuerpoTecnico}`);
  
      // Restablecer los campos después de añadir
      setNewNombreCuerpoTecnico("");
      setNewFechaNacimientoCuerpoTecnico("");
      setNewRolCuerpoTecnico("");
      setFotoFileCuerpoTecnico(null); // Limpiar la foto
  
      // Cambiar el estado para cerrar el formulario
      setIsAddingCuerpoTecnico(false);
  
      // Recargar la lista de cuerpo técnico
      const data = await fetchCuerpoTecnico();
      setCuerpoTecnico(data);
  
    } catch (err) {
        return null;
    }
  };
  
  // Función para eliminar un miembro del cuerpo técnico
  const handleDeleteCuerpoTecnico = async () => {
    if (!selectedCuerpoTecnico) {
      alert("Por favor, selecciona un miembro del cuerpo técnico para eliminar.");
      return;
    }

    try {
      await deleteCuerpoTecnico(selectedCuerpoTecnico);
      alert("Miembro del cuerpo técnico eliminado correctamente.");

      // Recargar la lista de cuerpo técnico
      const data = await fetchCuerpoTecnico();
      setCuerpoTecnico(data);
      setIsDeletingCuerpoTecnico(false);
    } catch (err) {
      alert("Error al eliminar el miembro del cuerpo técnico.");
    }
  };

  const handleUpdateCuerpoTecnico = async () => {
  if (!selectedCuerpoTecnico) {
    alert("Por favor, selecciona un miembro del cuerpo técnico para actualizar.");
    return;
  }

  try {
    const updates = {};

    // Determinar qué campo se actualizará
    if (campoSeleccionado === "nombre" && newNombre) {
      updates.nombre = newNombre;
    }
    if (campoSeleccionado === "puesto" && newPuesto) {
      updates.puesto = newPuesto;
    }
    if (campoSeleccionado === "foto" && newFotoFile) {
      // Aquí solo se agrega la foto al objeto `updates`, pero no se sube en el controlador
      updates.fotoFile = newFotoFile; // Solo pasar el archivo
    }

    // Verificar si hay algo que actualizar
    if (Object.keys(updates).length === 0) {
      alert("No se ha seleccionado ningún campo o valor válido para actualizar.");
      return;
    }

    // Llamar a la función Supabase con el ID y el objeto de actualizaciones
    await updateCuerpoTecnico(selectedCuerpoTecnico, updates);
    alert("Datos actualizados correctamente.");

    // Resetear los estados locales
    setNewNombre("");
    setNewPuesto("");
    setNewFotoFile(null);
    setCampoSeleccionado("");
    setSelectedCuerpoTecnico("");
    setIsUpdatingCuerpoTecnico(false);

    // Recargar la lista del cuerpo técnico
    const data = await fetchCuerpoTecnico();
    setCuerpoTecnico(data);
  } catch (err) {
    alert("Error al actualizar el cuerpo técnico: " + err.message);
  }
};

  const puestosPermitidos = [
    'Entrenador',
    '2º Entrenador',
    'Preparador Físico',
    'Delegado de Equipo',
    'Delegado de Campo',
    'Entrenador de Porteros',
    'Psicólogo de equipo',
    'Analista Táctico',
    'Equipo médico'
  ];

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };
  
  return (
    <div className="container-fluid p-0 d-flex flex-column min-vh-100" style={{
      position: 'relative', 
      minHeight: '70vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundImage: 'url("/Fotos/fondo_plantilla.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      zIndex: 1 // Asegura que el contenido esté sobre la capa oscura
    }}>
      {/* Capa semitransparente directamente sobre la imagen */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Oscurece solo la imagen de fondo
        zIndex: -1 // Asegura que esté detrás del contenido
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
                <li className="nav-item"><Link className="nav-link" href="../Partidos">Partidos</Link></li>
                <li className="nav-item"><Link className="nav-link" href="../Asistencia">Asistencia</Link></li>
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
  
      {/* Cuerpo Técnico */}
      <div className="container mt-4 flex-grow-1 d-flex flex-column justify-content-center align-items-center">
        <h2 className="text-center text-white">Staff Técnico</h2>
        {isUserAdmin && (
          <div className="container mt-3">
            <div className="row justify-content-center w-100">
              <div className="col mb-3">
                <button className="btn btn-outline-info w-100" onClick={() => setIsAddingCuerpoTecnico(true)}>
                  Añadir Cuerpo Técnico
                </button>
              </div>
              <div className="col mb-3">
                <button className="btn btn-outline-warning w-100" onClick={() => setIsUpdatingCuerpoTecnico(true)}>
                  Modificar Cuerpo Técnico
                </button>
              </div>
              <div className="col mb-3">
                <button className="btn btn-outline-danger w-100" onClick={() => setIsDeletingCuerpoTecnico(true)}>
                  Eliminar Cuerpo Técnico
                </button>
              </div>
            </div>
          </div>
        )}

        <div
          className="table-responsive"
          style={{
            overflowX: "auto", // Permite el desplazamiento horizontal
            borderRadius: "15px",
            maxWidth: "100%", // Asegura que la tabla no exceda el ancho del contenedor
          }}
        >
          <table
            className="table table-borderless"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '15px',
              overflow: 'hidden',
              minWidth: "600px", // Establece un ancho mínimo para la tabla
            }}
          >
            <thead style={{ backgroundColor: '#002c4b', color: 'white' }}>
              <tr>
                <th className="text-center align-middle" style={{ backgroundColor: '#002c4b', color: 'white' }}>Foto</th>
                <th className="text-center align-middle" style={{ backgroundColor: '#002c4b', color: 'white' }}>Nombre</th>
                <th className="text-center align-middle" style={{ backgroundColor: '#002c4b', color: 'white' }}>Fecha de nacimiento</th>
                <th className="text-center align-middle" style={{ backgroundColor: '#002c4b', color: 'white' }}>Edad</th>
                <th className="text-center align-middle" style={{ backgroundColor: '#002c4b', color: 'white' }}>Función</th>
              </tr>
            </thead>
            <tbody>
              {cuerpoTecnico.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center align-middle">No hay datos disponibles</td>
                </tr>
              ) : (
                cuerpoTecnico
                  .sort((a, b) => {
                    const ordenPuestos = [
                      'Entrenador',
                      '2º Entrenador',
                      'Preparador Físico',
                      'Delegado de Equipo',
                      'Delegado de Campo',
                      'Entrenador de Porteros',
                      'Psicólogo de equipo',
                      'Analista Táctico',
                    ];
                    return ordenPuestos.indexOf(a.puesto) - ordenPuestos.indexOf(b.puesto);
                  })
                  .map((miembro, index) => (
                    <tr key={index}>
                      <td className="text-center align-middle">
                        {miembro.foto_url ? (
                          <img
                            src={miembro.foto_url || "https://cdn-icons-png.flaticon.com/512/63/63699.png"}
                            alt={`Foto de ${miembro.nombre}`}
                            style={{
                              width: "70px",
                              height: "70px",
                              objectFit: "cover",
                              borderRadius: "50%",
                              filter: 'brightness(0.8)', // Oscurece la foto
                            }}
                          />
                        ) : (
                          <span></span>
                        )}
                      </td>
                      <td className="text-center align-middle">{miembro.nombre}</td>
                      <td className="text-center align-middle">{miembro.fecha_nacimiento}</td>
                      <td className="text-center align-middle">{miembro.edad}</td>
                      <td className="text-center align-middle">{miembro.puesto}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {/* Añadir Cuerpo Técnico */}
        {isAddingCuerpoTecnico && (
          <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Añadir Cuerpo Técnico</h5>
                  <button type="button" className="btn-close" onClick={() => setIsAddingCuerpoTecnico(false)}></button>
                </div>
                <div className="modal-body">
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Nombre"
                    value={newNombreCuerpoTecnico}
                    onChange={(e) => setNewNombreCuerpoTecnico(e.target.value)}
                  />
                  <input
                    type="date"
                    className="form-control mb-2"
                    placeholder="Fecha de Nacimiento"
                    value={newFechaNacimientoCuerpoTecnico}
                    onChange={(e) => setNewFechaNacimientoCuerpoTecnico(e.target.value)}
                  />
                  <select
                    className="form-select mb-2"
                    value={newRolCuerpoTecnico}
                    onChange={(e) => setNewRolCuerpoTecnico(e.target.value)}
                  >
                    <option value="">Selecciona un puesto</option>
                    {puestosPermitidos.map((puesto) => (
                      <option key={puesto} value={puesto}>
                        {puesto}
                      </option>
                    ))}
                  </select>
                  <input
                    type="file"
                    className="form-control mb-2"
                    onChange={(e) => setFotoFileCuerpoTecnico(e.target.files[0])}
                  />
                </div>
                <div className="modal-footer">
                  <button className="btn btn-primary" onClick={handleAddCuerpoTecnico}>Añadir</button>
                  <button className="btn btn-secondary" onClick={() => setIsAddingCuerpoTecnico(false)}>Cancelar</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modificar Cuerpo Técnico */}
        {isUpdatingCuerpoTecnico && (
          <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Actualizar Cuerpo Técnico</h5>
                  <button type="button" className="btn-close" onClick={() => setIsUpdatingCuerpoTecnico(false)}></button>
                </div>
                <div className="modal-body">
                  <select
                    className="form-select mb-2"
                    value={selectedCuerpoTecnico}
                    onChange={(e) => setSelectedCuerpoTecnico(e.target.value)}
                  >
                    <option value="">Selecciona un miembro</option>
                    {cuerpoTecnico.map((miembro) => (
                      <option key={miembro.id} value={miembro.id}>
                        {miembro.nombre}
                      </option>
                    ))}
                  </select>
                  <select
                    className="form-select mb-2"
                    value={campoSeleccionado}
                    onChange={(e) => setCampoSeleccionado(e.target.value)}
                  >
                    <option value="">Selecciona el campo a actualizar</option>
                    <option value="nombre">Nombre</option>
                    <option value="puesto">Puesto</option>
                    <option value="foto">Foto</option>
                  </select>
                  {campoSeleccionado === "nombre" && (
                    <input
                      type="text"
                      className="form-control mb-2"
                      placeholder="Nuevo Nombre"
                      value={newNombre}
                      onChange={(e) => setNewNombre(e.target.value)}
                    />
                  )}
                  {campoSeleccionado === "puesto" && (
                    <select
                      className="form-select mb-2"
                      value={newPuesto}
                      onChange={(e) => setNewPuesto(e.target.value)}
                    >
                      <option value="">Selecciona un nuevo puesto</option>
                      {puestosPermitidos.map((puesto) => (
                        <option key={puesto} value={puesto}>
                          {puesto}
                        </option>
                      ))}
                    </select>
                  )}
                  {campoSeleccionado === "foto" && (
                    <input
                      type="file"
                      className="form-control mb-2"
                      accept="image/*"
                      onChange={(e) => setNewFotoFile(e.target.files[0])}
                    />
                  )}
                </div>
                <div className="modal-footer">
                  <button className="btn btn-primary" onClick={handleUpdateCuerpoTecnico}>Actualizar</button>
                  <button className="btn btn-secondary" onClick={() => setIsUpdatingCuerpoTecnico(false)}>Cancelar</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Eliminar Cuerpo Técnico */}
        {isDeletingCuerpoTecnico && (
          <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Eliminar Cuerpo Técnico</h5>
                  <button type="button" className="btn-close" onClick={() => setIsDeletingCuerpoTecnico(false)}></button>
                </div>
                <div className="modal-body">
                  <select
                    className="form-select mb-2"
                    value={selectedCuerpoTecnico}
                    onChange={(e) => setSelectedCuerpoTecnico(e.target.value)}
                  >
                    <option value="">Selecciona un miembro del cuerpo técnico</option>
                    {cuerpoTecnico.map((miembro) => (
                      <option key={miembro.id} value={miembro.id}>
                        {miembro.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-danger" onClick={handleDeleteCuerpoTecnico}>Eliminar</button>
                  <button className="btn btn-secondary" onClick={() => setIsDeletingCuerpoTecnico(false)}>Cancelar</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  
      {/* Jugadores */}
      <div className="container mt-4 flex-grow-1 d-flex flex-column justify-content-center align-items-center">
        <h1 className="text-center text-white">Plantilla</h1>
        {isUserAdmin && (
          <div className="container mt-3">
            <div className="row">
              <div className="col">
                <button className="btn btn-outline-info w-100 my-1" onClick={() => setIsAdding(true)}>
                  Añadir Jugador
                </button>
              </div>
              <div className="col">
                <button className="btn btn-outline-warning w-100 my-1" onClick={() => setIsUpdating(true)}>
                  Modificar Jugador
                </button>
              </div>
              <div className="col">
                <button className="btn btn-outline-danger w-100 my-1" onClick={() => setIsDeleting(true)}>
                  Eliminar Jugador
                </button>
              </div>
            </div>
          </div>
        )}

        <div
          className="table-responsive"
          style={{
            overflowX: "auto", // Permite el desplazamiento horizontal
            borderRadius: "15px",
            maxWidth: "100%", // Asegura que la tabla no exceda el ancho del contenedor
          }}
        >
          <table
            className="table table-borderless"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '15px',
              overflow: 'hidden',
              minWidth: "600px", // Establece un ancho mínimo para la tabla
            }}
          >
            <thead style={{ backgroundColor: '#002c4b', color: 'white' }}>
              <tr>
                <th className="text-center align-middle" style={{ backgroundColor: '#002c4b', color: 'white' }}>Foto</th>
                <th className="text-center align-middle" style={{ backgroundColor: '#002c4b', color: 'white' }}>Nombre</th>
                <th className="text-center align-middle" style={{ backgroundColor: '#002c4b', color: 'white' }}>Dorsal</th>
                <th className="text-center align-middle" style={{ backgroundColor: '#002c4b', color: 'white' }}>Edad</th>
                <th className="text-center align-middle" style={{ backgroundColor: '#002c4b', color: 'white' }}>Fecha de Nacimiento</th>
                <th className="text-center align-middle" style={{ backgroundColor: '#002c4b', color: 'white' }}>Posición</th>
                <th className="text-center align-middle" style={{ backgroundColor: '#002c4b', color: 'white' }}>Pie Dominante</th>
              </tr>
            </thead>
            <tbody>
              {jugadoresOrdenados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center align-middle">No hay datos disponibles</td>
                </tr>
              ) : (
                jugadoresOrdenados.map((jugador, index) => (
                  <tr key={index} className="text-center">
                    <td className="d-flex justify-content-center align-items-center align-middle">
                      <img
                        src={jugador.foto_url || "https://cdn-icons-png.flaticon.com/512/63/63699.png"}
                        alt={`Foto de ${jugador.nombre}`}
                        style={{
                          width: "70px",
                          height: "70px",
                          objectFit: "cover",
                          borderRadius: "50%",
                          filter: 'brightness(0.8)', // Oscurece la foto
                        }}
                      />
                    </td>
                    <td className="align-middle">{jugador.nombre}</td>
                    <td className="align-middle">{jugador.dorsal}</td>
                    <td className="align-middle">{jugador.edad}</td>
                    <td className="align-middle">{jugador.fecha_nacimiento}</td>
                    <td className="align-middle">{jugador.posicion}</td>
                    <td className="align-middle">{jugador.pie_dominante}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Formulario de eliminación de jugador */}
        {isDeleting && (
          <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Eliminar Jugador</h5>
                  <button type="button" className="btn-close" onClick={() => setIsDeleting(false)}></button>
                </div>
                <div className="modal-body">
                  <select
                    className="form-select mb-2"
                    value={selectedJugador}
                    onChange={(e) => setSelectedJugador(e.target.value)}
                  >
                    <option value="">Selecciona un jugador</option>
                    {jugadores.map((jugador) => (
                      <option key={jugador.id} value={jugador.id}>
                        {jugador.nombre} - {jugador.dorsal}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-danger" onClick={handleDeleteJugador}>Eliminar</button>
                  <button className="btn btn-secondary" onClick={() => setIsDeleting(false)}>Cancelar</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modificar Jugador */}
        {isUpdating && (
          <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Modificar Jugador</h5>
                  <button type="button" className="btn-close" onClick={() => setIsUpdating(false)}></button>
                </div>
                <div className="modal-body">
                  <select
                    className="form-select mb-2"
                    value={selectedJugadorModificar}
                    onChange={(e) => setSelectedJugadorModificar(e.target.value)}
                  >
                    <option value="">Selecciona un jugador</option>
                    {jugadores.map((jugador) => (
                      <option key={jugador.id} value={jugador.id}>
                        {jugador.nombre} (Dorsal: {jugador.dorsal})
                      </option>
                    ))}
                  </select>
                  <select
                    className="form-select mb-2"
                    value={updateOption}
                    onChange={(e) => setUpdateOption(e.target.value)}
                  >
                    <option value="">¿Qué deseas modificar?</option>
                    <option value="dorsal">Dorsal</option>
                    <option value="posicion">Posición</option>
                    <option value="foto">Foto</option>
                  </select>
                  {updateOption === "dorsal" && (
                    <input
                      type="number"
                      className="form-control mb-2"
                      placeholder="Nuevo dorsal"
                      value={newDorsalModificar}
                      onChange={(e) => setNewDorsalModificar(e.target.value)}
                    />
                  )}
                  {updateOption === "posicion" && (
                    <input
                      type="text"
                      className="form-control mb-2"
                      placeholder="Nueva posición"
                      value={newPosicionModificar}
                      onChange={(e) => setNewPosicionModificar(e.target.value)}
                    />
                  )}
                  {updateOption === "foto" && (
                    <input
                      type="file"
                      className="form-control mb-2"
                      onChange={(e) => setNewFotoModificar(e.target.files[0])}
                    />
                  )}
                </div>
                <div className="modal-footer">
                  <button className="btn btn-primary" onClick={handleUpdateJugador}>Actualizar</button>
                  <button className="btn btn-secondary" onClick={cancelarModificar}>Cancelar</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Añadir Jugador */}
        {isAdding && (
          <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Añadir Jugador</h5>
                  <button type="button" className="btn-close" onClick={cancelarAñadir}></button>
                </div>
                <div className="modal-body">
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Nombre"
                    value={newNombre}
                    onChange={(e) => setNewNombre(e.target.value)}
                  />
                  <input
                    type="number"
                    className="form-control mb-2"
                    placeholder="Dorsal"
                    value={newDorsal}
                    onChange={(e) => setNewDorsal(e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Posición"
                    value={newPosicion}
                    onChange={(e) => setNewPosicion(e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Pie Dominante"
                    value={newPieDominante}
                    onChange={(e) => setNewPieDominante(e.target.value)}
                  />
                  <input
                    type="date"
                    className="form-control mb-2"
                    placeholder="Fecha de Nacimiento"
                    value={newFechaNacimiento}
                    onChange={(e) => setNewFechaNacimiento(e.target.value)}
                  />
                  <input
                    type="file"
                    className="form-control mb-2"
                    onChange={(e) => setFotoFile(e.target.files[0])}
                  />
                </div>
                <div className="modal-footer">
                  <button className="btn btn-primary" onClick={handleAddJugador}>Añadir</button>
                  <button className="btn btn-secondary" onClick={cancelarAñadir}>Cancelar</button>
                </div>
              </div>
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