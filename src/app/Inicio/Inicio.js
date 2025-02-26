import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, signOut } from "../api/supabase/inicioSesion";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Inicio() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(true);

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
        setIsAuthenticated(false);
        router.push("/");
      } else {
        setIsAuthenticated(true);
      }
    };

    verifyAuthentication();
  }, [router]);

  if (!isAuthenticated) {
    return <div>Redirigiendo...</div>;
  }

  return (
    <div className="container-fluid p-0 d-flex flex-column min-vh-100"
      style={{
        position: 'relative', 
        minHeight: '70vh', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundImage: 'url("/Fotos/fondo_inicio.webp")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        zIndex: 1
      }}
    >
      {/* Capa semitransparente */}
      <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 0
        }}>
      </div>

      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: 'rgba(70, 130, 180, 0)', paddingLeft: '10px', paddingRight: '10px' }}>
        <div className="container-fluid d-flex align-items-center">
          <div className="me-auto">
            <img
              src="/Fotos/ZonaGol.png"
              alt="ZonaGol"
              className="img-fluid"
              style={{ height: "70px", maxWidth: "150px" }}
            />
          </div>
          <button className="btn btn-outline-light my-1" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* Contenido principal (grid de cards) */}
      <div className="container flex-grow-1 d-flex align-items-center justify-content-center mt-4 mb-4">
        <div className="row g-5 justify-content-center"> {/* Cambiado g-4 a g-5 para más espacio */}
          {[ 
            { href: "../Convocatorias", src: "/Fotos/Convocatorias.png", title: "Convocatorias" },
            { href: "../Goleadores", src: "/Fotos/Goleadores.png", title: "Goleadores" },
            { href: "../Partidos", src: "/Fotos/Partidos.png", title: "Partidos" },
            { href: "../Asistencia", src: "/Fotos/Asistencia.png", title: "Asistencia" },
            { href: "../Plantilla", src: "/Fotos/Plantilla.png", title: "Plantilla" },
            { href: "../Galeria", src: "/Fotos/Imagenes.png", title: "Imágenes" }
          ].map((item, index) => (
            <div key={index} className="col-lg-4 col-md-6 col-sm-12 d-flex justify-content-center">
              <Link href={item.href} className="text-decoration-none d-flex flex-grow-1">
                <div className="card shadow-sm border-0 rounded-4 overflow-hidden hover-effect d-flex flex-column flex-grow-1" style={{ backgroundColor: 'rgba(255,237,215,0.8)', maxWidth: '100%', width: '100%' }}>
                  <img
                    src={item.src}
                    className="card-img-top img-fluid"
                    alt={item.title}
                  />
                  <div className="card-body text-center d-flex flex-column flex-grow-1">
                    <h5 className="card-title">{item.title}</h5>
                  </div>
                </div>
              </Link>
            </div>
          ))}
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

      {/* Estilos personalizados */}
      <style jsx>
        {`
        .hover-effect {
          transition: transform 0.3s ease-in-out;
        }

        .hover-effect:hover {
          transform: scale(1.05);
        }

        @media (max-width: 576px) {
          .navbar-toggler {
            margin-left: 10px;
          }
        }

        /* Ajustes solo en pantallas grandes */
        @media (min-width: 992px) {
          .col-lg-4 {
            flex: 0 0 27%; /* Reducir el ancho de las columnas en pantallas grandes */
            max-width: 27%;
            margin-left: 3%; /* Margen lateral izquierdo */
            margin-right: 3%; /* Margen lateral derecho */
          }

          .card {
            max-width: 100%; /* Ajustar el ancho de las tarjetas */
            width: 100%;
          }
        }
        `}
      </style>
    </div>
  );
}