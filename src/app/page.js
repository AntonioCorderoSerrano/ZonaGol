'use client'
import { useState } from 'react';
import Link from 'next/link';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Home() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  return (
    <div className="container-fluid p-0 d-flex flex-column min-vh-100" style={{
      position: 'relative', 
      minHeight: '70vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundImage: 'url("/Fotos/fondo.jpg")',
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

       {/* Contenido principal */}
       <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Navbar */}
        <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: 'rgba(70, 130, 180, 0)' }}>
          <div className="container-fluid d-flex align-items-center">
            <img src="/Fotos/ZonaGol.png" alt="ZonaGol" className="rounded-circle" width="60" height="60" />
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
              aria-controls="navbarNav" aria-expanded={menuAbierto ? "true" : "false"} aria-label="Toggle navigation"
              onClick={toggleMenu}>
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className={`collapse navbar-collapse ${menuAbierto ? 'show' : ''}`} id="navbarNav">
              <ul className="navbar-nav ms-auto"> 
                <li className="nav-item">
                  <Link className="nav-link px-3" href="/InicioSesion" style={{ color: '#ffffff', transition: 'color 0.3s ease' }} onMouseEnter={e => e.target.style.color = '#007bff'} onMouseLeave={e => e.target.style.color = '#ffffff'}>
                    Iniciar Sesión
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link px-3" href="/Registro" style={{ color: '#ffffff', transition: 'color 0.3s ease' }} onMouseEnter={e => e.target.style.color = '#007bff'} onMouseLeave={e => e.target.style.color = '#ffffff'}>
                    Registrarse
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Contenido principal */}
        <main className="container mt-5">
        <h1 className="text-center text-white text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif", fontSize: "350%" }}>
          Bienvenido a ZonaGol
        </h1>
        <p className="text-center text-white text-lg shadow-md" style={{ fontFamily: "'Playfair Display', serif", fontSize: "120%", color:'#ffff'}}>
          La plataforma ideal para gestionar tu equipo de fútbol. Encuentra convocatorias, revisa la plantilla, consulta resultados y mucho más.
        </p>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            maxWidth: '500px'
          }}>
            <h2 className="mt-5" style={{ fontFamily: 'Arial', textAlign: 'center', color: '#ffffff' }}>
              ¿Qué puedes hacer con ZonaGol?
            </h2>
          </div>

          <div className="row mt-5">
            <div className="col-sm-6 col-md-4 mb-4">
              <div className="card shadow-sm h-100 d-flex flex-column" style={{ backgroundColor: 'rgba(255,237,215, 0.8)', minHeight: '350px' }}>
                <img src="/Fotos/convocatorias_card.png" className="card-img-top rounded" alt="Convocatorias" />
                <div className="card-body">
                  <h5 className="card-title">Convocatorias</h5>
                  <p className="card-text">Consulta la lista de jugadores convocados para los próximos partidos.</p>
                </div>
              </div>
            </div>
            

            <div className="col-sm-6 col-md-4 mb-4">
              <div className="card shadow-sm h-100 d-flex flex-column" style={{ backgroundColor: 'rgba(255,237,215, 0.8)', minHeight: '350px' }}>
                <img src="/Fotos/plantilla_card.png" className="card-img-top rounded" alt="Plantilla" />
                <div className="card-body">
                  <h5 className="card-title">Plantilla</h5>
                  <p className="card-text">Conoce al equipo completo incluyendo al cuerpo técnico, las posiciones de los futbolístas, etc</p>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-md-4 mb-4">
              <div className="card shadow-sm h-100 d-flex flex-column" style={{ backgroundColor: 'rgba(255,237,215, 0.8)', minHeight: '350px' }}>
                <img src="/Fotos/resultados_card.png" className="card-img-top rounded" alt="Resultados" />
                <div className="card-body">
                  <h5 className="card-title">Resultados</h5>
                  <p className="card-text">Accede a los últimos marcadores y análisis de partidos.</p>
                </div>
              </div>
            </div>
              
            <div className="col-sm-6 col-md-4 mt-4">
              <div className="card shadow-sm h-100 d-flex flex-column" style={{ backgroundColor: 'rgba(255,237,215, 0.8)', minHeight: '350px' }}>
                <img src="/Fotos/asistencias_card.png" className="card-img-top rounded" alt="Asistencia" />
                <div className="card-body">
                  <h5 className="card-title">Asistencia</h5>
                  <p className="card-text">Controla la asistencia de los jugadores a entrenamientos y partidos.</p>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-md-4 mt-4">
              <div className="card shadow-sm h-100 d-flex flex-column" style={{ backgroundColor: 'rgba(255,237,215, 0.8)', minHeight: '350px' }}>
                <img src="/Fotos/goleadores_card.png" className="card-img-top rounded" alt="Goleadores" />
                <div className="card-body">
                  <h5 className="card-title">Goleadores</h5>
                  <p className="card-text">Consulta la tabla de los máximos anotadores del equipo.</p>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-md-4 mt-4">
              <div className="card shadow-sm h-100 d-flex flex-column" style={{ backgroundColor: 'rgba(255,237,215, 0.8)', minHeight: '350px' }}>
                <img src="/Fotos/imagenes_card.png" className="card-img-top rounded" alt="Imágenes" />
                <div className="card-body">
                  <h5 className="card-title">Imágenes</h5>
                  <p className="card-text">Explora una galería con los mejores momentos de la temporada.</p>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-md-4 mt-4">
              <div className="card shadow-sm h-100 d-flex flex-column" style={{ backgroundColor: 'rgba(255,237,215, 0.8)', minHeight: '350px' }}>
                <img src="/Fotos/estadisticas_card.png" className="card-img-top rounded" alt="Asistencia" />
                <div className="card-body">
                  <h5 className="card-title">Estadísticas</h5>
                  <p className="card-text">Accede a un análisis detallado del rendimiento del equipo con estadísticas de goles, asistencias y desempeño individual.</p>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-md-4 mt-4">
              <div className="card shadow-sm h-100 d-flex flex-column" style={{ backgroundColor: 'rgba(255,237,215, 0.8)', minHeight: '350px' }}>
                <img src="/Fotos/scouting_card.png" className="card-img-top rounded" alt="Asistencia" />
                <div className="card-body">
                  <h5 className="card-title">Scouting</h5>
                  <p className="card-text">Realiza un análisis táctico de los equipos rivales para planificar estrategias y optimizar el rendimiento del equipo.</p>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-md-4 mt-4">
              <div className="card shadow-sm h-100 d-flex flex-column" style={{ backgroundColor: 'rgba(255,237,215, 0.8)', minHeight: '350px' }}>
                <img src="/Fotos/lesiones.webp" className="card-img-top rounded" alt="Asistencia" />
                <div className="card-body">
                  <h5 className="card-title">Lesiones</h5>
                  <p className="card-text">Lleva un control detallado de las lesiones del equipo y la evolución de cada jugador para optimizar su regreso al campo en las mejores condiciones.</p>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-md-4 mt-4">
              <div className="card shadow-sm h-100 d-flex flex-column" style={{ backgroundColor: 'rgba(255,237,215, 0.8)', minHeight: '350px' }}>
                <img src="/Fotos/mensajeria.png" className="card-img-top rounded" alt="Asistencia" />
                <div className="card-body">
                  <h5 className="card-title">Mensajería interna</h5>
                  <p className="card-text">Envía y recibe mensajes internos de forma rápida y segura para mejorar la coordinación del equipo.</p>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-md-4 mt-4">
              <div className="card shadow-sm h-100 d-flex flex-column" style={{ backgroundColor: 'rgba(255,237,215, 0.8)', minHeight: '350px' }}>
                <img src="/Fotos/calendario_card.png" className="card-img-top rounded" alt="Asistencia" />
                <div className="card-body">
                  <h5 className="card-title">Calendario</h5>
                  <p className="card-text">Consulta y organiza los partidos, entrenamientos y eventos importantes del equipo.</p>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-md-4 mt-4">
              <div className="card shadow-sm h-100 d-flex flex-column" style={{ backgroundColor: 'rgba(255,237,215, 0.8)', minHeight: '350px' }}>
                <img src="/Fotos/nutricion.png" className="card-img-top rounded" alt="Asistencia" />
                <div className="card-body">
                  <h5 className="card-title">Nutrición y Descanso</h5>
                  <p className="card-text">Accede a recomendaciones sobre alimentación y hábitos de descanso para optimizar el rendimiento y la recuperación.</p>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-md-4 mt-4">
              <div className="card shadow-sm h-100 d-flex flex-column" style={{ backgroundColor: 'rgba(255,237,215, 0.8)', minHeight: '350px' }}>
                <img src="/Fotos/entrenamientos.png" className="card-img-top rounded" alt="Asistencia" />
                <div className="card-body">
                  <h5 className="card-title">Entrenamientos</h5>
                  <p className="card-text">Planifica las sesiones y realiza un seguimiento del progreso físico y táctico del equipo.</p>
                </div>
              </div>
            </div>
          </div>
        </main>

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
      <style jsx>{`
        .card-img-top {
          width: 100%;
          height: 300px; 
          object-fit: cover; 
        }
    `}</style>
    </div>
  );
}