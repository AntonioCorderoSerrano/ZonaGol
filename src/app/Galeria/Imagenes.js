import { useState, useEffect, useRef } from "react";
import { subirImagen, obtenerImagenes, eliminarImagen, isAdmin, checkEmailInAdmins } from "../api/imagenes/imagenes";
import { getUser, getUserAdminStatus, signOut } from '../api/supabase/inicioSesion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function GaleriaImagenes() {
  const [imagenes, setImagenes] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const menuRef = useRef(null);
  const modalRef = useRef(null); 
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
        }
      };
  
      verifyAuthentication();
    }, [router]);

  // Obtener las imágenes al cargar el componente
  useEffect(() => {
    const fetchImagenes = async () => {
      try {
        setLoading(true);
        const data = await obtenerImagenes();
        setImagenes(data);
      } catch (err) {
        setError("Error al cargar las imágenes.");
      } finally {
        setLoading(false);
      }
    };

    const checkAdminStatus = async () => {
      const user = await getUser();
      if (user) {
        const adminStatus = await getUserAdminStatus(user.email);
        setIsUserAdmin(adminStatus);
      }
    };

    const checkEmail = async () => {
      const user = await getUser();
      if (user) {
        const emailChecked = await checkEmailInAdmins(user.email);
        setEmailChecked(emailChecked);
      }
    };

    fetchImagenes();
    checkAdminStatus();
    checkEmail();
  }, []);

  // Manejar la subida de una imagen
  const handleSubirImagen = async () => {
    if (!file) {
      alert("Por favor, selecciona una imagen.");
      return;
    }

    try {
      setLoading(true);
      await subirImagen(file);
      const data = await obtenerImagenes();
      setImagenes(data);
      setFile(null);
      setShowUploadForm(false); // Cerrar el formulario después de subir la imagen
    } catch (err) {
      setError("Error al subir la imagen.");
    } finally {
      setLoading(false);
    }
  };

  // Manejar la eliminación de una imagen con confirmación
  const handleEliminarImagen = async (url_imagen) => {
    const confirmacion = window.confirm("¿Estás seguro de que deseas eliminar esta imagen?");
    if (!confirmacion) return;

    try {
      setLoading(true);
      await eliminarImagen(url_imagen);
      const data = await obtenerImagenes();
      setImagenes(data);
    } catch (err) {
      setError("Error al eliminar la imagen.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/'); // Redirige a la página de inicio de sesión
  };

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  // Manejar el clic en una imagen para agrandarla
  const handleImageClick = (index) => {
    setSelectedImage(index);
  };

  // Navegar entre las imágenes agrandadas
  const handleNextImage = () => {
    setSelectedImage((prev) => (prev + 1) % imagenes.length);
  };

  const handlePrevImage = () => {
    setSelectedImage((prev) => (prev - 1 + imagenes.length) % imagenes.length);
  };

  // Cerrar la imagen al hacer clic fuera de ella
  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setSelectedImage(null);
    }
  };

  // Agregar el manejador de eventos para cerrar la imagen al hacer clic fuera
  useEffect(() => {
    if (selectedImage !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedImage]);

  return (
    <div className="container-fluid p-0 d-flex flex-column min-vh-100" style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundImage: 'url("/Fotos/fondo_imagenes.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      zIndex: 1,
    }}>
      {/* Capa semitransparente directamente sobre la imagen */}
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
                <li className="nav-item"><Link className="nav-link text-center" href="../Convocatorias">Convocatorias</Link></li>
                <li className="nav-item"><Link className="nav-link text-center" href="../Goleadores">Goleadores</Link></li>
                <li className="nav-item"><Link className="nav-link text-center" href="../Partidos">Partidos</Link></li>
                <li className="nav-item"><Link className="nav-link text-center" href="../Asistencia">Asistencia</Link></li>
                <li className="nav-item"><Link className="nav-link text-center" href="../Plantilla">Plantilla</Link></li>
                
                {/* Botón de Cerrar Sesión */}
                <li className="nav-item">
                  <button className="btn btn-outline-light btn-tamano-uniforme" onClick={handleSignOut}>Cerrar Sesión</button>
                </li>
              </ul>
            </div>

          </div>
        </nav>
      </header>

      {/* Formulario flotante para subir imágenes */}
      {showUploadForm && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Subir Imagen</h5>
                <button type="button" className="btn-close" onClick={() => setShowUploadForm(false)}></button>
              </div>
              <div className="modal-body">
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleSubirImagen} disabled={loading}>
                  {loading ? "Subiendo..." : "Subir"}
                </button>
                <button className="btn btn-secondary" onClick={() => setShowUploadForm(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mostrar las imágenes en una cuadrícula responsive */}
      <div className="container mt-4">
        <h1 className="text-center text-white">Galería de Imágenes</h1>
        {isUserAdmin && (
          <div className="mb-3"> {/* Contenedor para el botón */}
            <button
              className="btn btn-outline-info w-100" // w-100 hace que el botón ocupe el 100% del ancho
              onClick={() => setShowUploadForm(true)}
            >
              Subir Imagen
            </button>
          </div>
        )}
        {emailChecked && (
          <div className="row">
            {imagenes.map((imagen, index) => (
              <div key={index} className="col-12 col-md-4 col-lg-3 mb-4">
                <div className="card" style={{ backgroundColor: 'transparent', border: 'none' }}>
                  <img
                    src={imagen.url_imagen}
                    alt={`Imagen ${index}`}
                    className="card-img-top"
                    style={{ 
                      height: "200px", 
                      objectFit: "cover", 
                      cursor: "pointer", 
                      borderRadius: '10px',
                      transition: 'transform 0.3s ease-in-out',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    onClick={() => handleImageClick(index)}
                  />
                  {isUserAdmin && (
                    <div className="card-body" style={{ padding: '10px 0' }}>
                      <button
                        className="btn btn-danger w-100"
                        onClick={() => handleEliminarImagen(imagen.url_imagen)}
                        disabled={loading}
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para mostrar la imagen agrandada */}
      {selectedImage !== null && ( 
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.9)' }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '90%', maxHeight: '90%' }}>
            <div className="modal-content" style={{ backgroundColor: 'transparent', border: 'none' }} ref={modalRef}>
              <div className="modal-header" style={{ border: 'none' }}>
              </div>
              <div className="modal-body text-center">
                <img
                  src={imagenes[selectedImage].url_imagen}
                  alt={`Imagen ${selectedImage}`}
                  style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '10px' }}
                />
              </div>
              {/* Contenedor de botones de navegación en la parte inferior */}
              <div 
                className="d-flex justify-content-center gap-3 p-3"
                style={{ 
                  position: 'fixed', 
                  bottom: '20px', 
                  left: '50%', 
                  transform: 'translateX(-50%)', 
                  zIndex: 1000,
                  width: '100%',
                  textAlign: 'center'
                }}
              >
                <button 
                  className="btn btn-primary" 
                  onClick={handlePrevImage} 
                  disabled={selectedImage === 0}
                >
                  Anterior
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleNextImage} 
                  disabled={selectedImage === imagenes.length - 1}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* Footer fijo abajo */}
        <footer className="text-white text-center py-2 mt-auto" style={{ backgroundColor: 'rgba(70, 130, 180, 0)', zIndex: 2 }}>
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