// import React, { useState, useEffect, useRef, useMemo } from 'react';
// import {
//     VolumeUp,
//     VolumeOff,
//     Business,
//     Schedule
// } from '@mui/icons-material';
// import configuracionPantallaService from '../services/configuracionPantallaService';
// import mensajeInstitucionalService from '../services/mensajeInstitucionalService';

// /* ===========================
//    Helpers Google Drive
//    =========================== */

// // Extrae el ID de Google Drive desde varias variantes de URL
// function extractDriveId(url) {
//     if (!url) return null;
//     try {
//         const u = new URL(url);
//         const m1 = u.pathname.match(/\/file\/d\/([^/]+)\//);
//         if (m1?.[1]) return m1[1];
//         const idParam = u.searchParams.get('id');
//         if (idParam) return idParam;
//         return null;
//     } catch {
//         return null;
//     }
// }

// function isDriveUrl(url) {
//     try {
//         return new URL(url).hostname.includes('drive.google.com');
//     } catch {
//         return false;
//     }
// }

// // IMAGEN: miniatura de alta resolución (rápida y estable para <img>)
// function normalizeDriveImage(url) {
//     const id = extractDriveId(url);
//     return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w1920` : url;
// }

// // VIDEO: intento de stream directo al mp4 (puede fallar por CORS)
// function normalizeDriveVideo(url) {
//     const id = extractDriveId(url);
//     return id ? `https://drive.google.com/uc?export=download&id=${id}` : url;
// }

// // PREVIEW (iframe) — funciona SIEMPRE con archivos en Drive aunque no haya CORS
// function drivePreviewIframe(url) {
//     const id = extractDriveId(url);
//     return id ? `https://drive.google.com/file/d/${id}/preview` : null;
// }

// /* ===========================
//    Paleta de colores
//    =========================== */

// const obtenerPaleta = (tema) => {
//     const paletas = {
//         blue: {
//             fondo: 'bg-gray-100',
//             texto: 'text-gray-900',
//             acentoFondo: 'bg-blue-700',
//             acentoTexto: 'text-white',
//             tablaHeader: 'bg-blue-700 text-white',
//             tablaFilaPar: 'bg-white',
//             tablaFilaImpar: 'bg-gray-100'
//         },
//         green: {
//             fondo: 'bg-gray-100',
//             texto: 'text-gray-900',
//             acentoFondo: 'bg-green-700',
//             acentoTexto: 'text-white',
//             tablaHeader: 'bg-green-700 text-white',
//             tablaFilaPar: 'bg-white',
//             tablaFilaImpar: 'bg-gray-100'
//         },
//         red: {
//             fondo: 'bg-gray-100',
//             texto: 'text-gray-900',
//             acentoFondo: 'bg-red-700',
//             acentoTexto: 'text-white',
//             tablaHeader: 'bg-red-700 text-white',
//             tablaFilaPar: 'bg-white',
//             tablaFilaImpar: 'bg-gray-100'
//         },
//         purple: {
//             fondo: 'bg-gray-100',
//             texto: 'text-gray-900',
//             acentoFondo: 'bg-purple-700',
//             acentoTexto: 'text-white',
//             tablaHeader: 'bg-purple-700 text-white',
//             tablaFilaPar: 'bg-white',
//             tablaFilaImpar: 'bg-gray-100'
//         },
//         dark: {
//             fondo: 'bg-gray-800',
//             texto: 'text-gray-100',
//             acentoFondo: 'bg-gray-700',
//             acentoTexto: 'text-white',
//             tablaHeader: 'bg-gray-700 text-white',
//             tablaFilaPar: 'bg-gray-800',
//             tablaFilaImpar: 'bg-gray-700'
//         }
//     };
//     return paletas[tema] || paletas.blue;
// };

// const PantallaTurnosPublica = () => {
//     const [configuracion, setConfiguracion] = useState(null);
//     const [mensajes, setMensajes] = useState([]);
//     const [turnos, setTurnos] = useState([]);
//     const [vistaActual, setVistaActual] = useState('turnos'); // 'turnos' | 'mensaje'
//     const [mensajeActual, setMensajeActual] = useState(0);
//     const [horaActual, setHoraActual] = useState(new Date());
//     const [turnoLlamando, setTurnoLlamando] = useState(null);
//     const [sonidoHabilitado, setSonidoHabilitado] = useState(true);
//     const [loading, setLoading] = useState(true);
//     const [conexionEstado] = useState('conectado');

//     // Fullscreen
//     const [isFullscreen, setIsFullscreen] = useState(false);
//     const overlayRef = useRef(null);

//     // Video fallback por CORS: si falla <video>, usamos <iframe>
//     const [usarIframe, setUsarIframe] = useState(false);

//     const audioRef = useRef(null);
//     const videoRef = useRef(null);

//     // Carga inicial
//     useEffect(() => {
//         const cargar = async () => {
//             try {
//                 setLoading(true);
//                 const config = await configuracionPantallaService.obtenerConfiguracionActiva();
//                 setConfiguracion(config);
//                 if (config?.id) {
//                     const msgs = await mensajeInstitucionalService.obtenerMensajesPorConfiguracion(config.id);
//                     setMensajes(msgs || []);
//                 } else {
//                     const msgs = await mensajeInstitucionalService.obtenerMensajesVigentes();
//                     setMensajes(msgs || []);
//                 }
//                 // TODO: Integrar turnos reales (WebSocket/poll)
//                 setTurnos([]);
//             } catch (e) {
//                 console.error(e);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         cargar();
//     }, []);

//     // Reloj
//     useEffect(() => {
//         const t = setInterval(() => setHoraActual(new Date()), 1000);
//         return () => clearInterval(t);
//     }, []);

//     // Alternancia vistas respetando tiempos
//     useEffect(() => {
//         if (!configuracion || loading) return;
//         let id;
//         if (vistaActual === 'turnos') {
//             id = setTimeout(() => {
//                 if (mensajes.length > 0) {
//                     setVistaActual('mensaje');
//                     setUsarIframe(false); // reset fallback al entrar a mensajes
//                 }
//             }, (configuracion.tiempoTurno || 10) * 1000);
//         } else {
//             const duracionMensaje = mensajes[mensajeActual]?.duracion || configuracion.tiempoMensaje || 8;
//             const tiempoDeMensaje = Math.max(duracionMensaje, configuracion.tiempoMensaje || 8);
//             id = setTimeout(() => {
//                 setMensajeActual((i) => (i + 1) % mensajes.length);
//                 setVistaActual('turnos');
//             }, tiempoDeMensaje * 1000);
//         }
//         return () => clearTimeout(id);
//     }, [vistaActual, mensajeActual, configuracion, mensajes, loading]);

//     // ESC para salir del overlay fullscreen y del Fullscreen API
//     useEffect(() => {
//         const onKey = async (e) => {
//             if (e.key === 'Escape') {
//                 if (document.fullscreenElement) {
//                     try { await document.exitFullscreen(); } catch { }
//                 }
//                 setIsFullscreen(false);
//             }
//         };
//         window.addEventListener('keydown', onKey);
//         return () => window.removeEventListener('keydown', onKey);
//     }, []);

//     // Activar/desactivar Fullscreen API
//     const toggleFullscreen = async () => {
//         if (!isFullscreen) {
//             setIsFullscreen(true);
//             setTimeout(async () => {
//                 try {
//                     if (overlayRef.current && !document.fullscreenElement) {
//                         await overlayRef.current.requestFullscreen();
//                     }
//                 } catch { }
//             }, 0);
//         } else {
//             if (document.fullscreenElement) {
//                 try { await document.exitFullscreen(); } catch { }
//             }
//             setIsFullscreen(false);
//         }
//     };

//     const paleta = obtenerPaleta(configuracion?.temaColor);

//     // Medios normalizados para el mensaje actual
//     const mediaActual = useMemo(() => {
//         const m = mensajes[mensajeActual];
//         if (!m) return null;

//         if (m.tipo === 'IMAGEN') {
//             const src = isDriveUrl(m.rutaArchivo)
//                 ? normalizeDriveImage(m.rutaArchivo)
//                 : m.rutaArchivo;
//             return { ...m, src, preferIframe: false };
//         }

//         if (m.tipo === 'VIDEO') {
//             const enDrive = isDriveUrl(m.rutaArchivo);
//             return {
//                 ...m,
//                 // si es Drive, preferimos iframe por defecto
//                 preferIframe: enDrive,
//                 srcVideo: enDrive ? normalizeDriveVideo(m.rutaArchivo) : m.rutaArchivo,
//                 srcIframe: drivePreviewIframe(m.rutaArchivo)
//             };
//         }

//         return m;
//     }, [mensajes, mensajeActual]);

//     // Si el mensaje actual es video de Drive, arrancamos con iframe
//     useEffect(() => {
//         if (mediaActual?.tipo === 'VIDEO') {
//             setUsarIframe(!!mediaActual.preferIframe);
//         } else {
//             setUsarIframe(false);
//         }
//     }, [mediaActual]);

//     // Loading
//     if (loading) {
//         return (
//             <div className={`min-h-screen flex items-center justify-center ${paleta.fondo} ${paleta.texto}`}>
//                 <div className="text-center space-y-4">
//                     <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent mx-auto" />
//                     <p>Cargando configuración...</p>
//                 </div>
//             </div>
//         );
//     }

//     /* ===========================
//        Bloque FULLSCREEN OVERLAY
//        =========================== */
//     if (isFullscreen) {
//         return (
//             <div
//                 ref={overlayRef}
//                 className="fixed inset-0 z-50 bg-black text-white"
//                 style={{ width: '100vw', height: '100vh' }}
//             >
//                 {/* Contenedor full-bleed */}
//                 {vistaActual === 'turnos' ? (
//                     <div className="w-screen h-screen flex flex-col">
//                         {/* Encabezado compacto para TV */}
//                         <div className="w-full px-12 py-4 flex items-center justify-between bg-black/40">
//                             <div className="flex items-center space-x-4">
//                                 {configuracion?.mostrarLogo && (
//                                     configuracion.rutaLogo ? (
//                                         <img
//                                             src={normalizeDriveImage(configuracion.rutaLogo)}
//                                             alt="Logo"
//                                             className="h-16 w-16 object-contain"
//                                         />
//                                     ) : (
//                                         <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center">
//                                             <Business className="text-3xl" />
//                                         </div>
//                                     )
//                                 )}
//                                 <div>
//                                     {/* Podés mostrar imagen institucional o texto */}
//                                     {/* <div className="text-3xl font-bold">
//                     {configuracion?.textoEncabezado || 'SISTEMA DE TURNOS'}
//                   </div> */}
//                                     <img
//                                         src="/SanAntonioArredondoWhite.avif"
//                                         alt="Logo Municipalidad de San Antonio de Arredondo"
//                                         className="h-10 object-contain"
//                                     />
//                                     <div className="text-sm opacity-80">
//                                         Municipalidad de San Antonio de Arredondo
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="flex items-center space-x-6">
//                                 <button
//                                     onClick={toggleFullscreen}
//                                     className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20"
//                                     title="Salir de pantalla completa (Esc)"
//                                 >
//                                     Salir (Esc)
//                                 </button>
//                                 <div className="text-2xl font-mono">
//                                     {horaActual.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Llamado actual */}
//                         {turnoLlamando && (
//                             <div className="px-12 py-6 bg-red-700 text-white">
//                                 <div className="text-7xl font-extrabold tracking-wider">
//                                     TURNO {turnoLlamando.codigo}
//                                 </div>
//                                 <div className="text-3xl opacity-90 mt-2">
//                                     {turnoLlamando.sector} • Ventanilla {turnoLlamando.ventanilla}
//                                 </div>
//                             </div>
//                         )}

//                         {/* Tabla de turnos grande para TV 43" */}
//                         <div className="flex-1 px-12 py-8 overflow-hidden">
//                             <div className="w-full h-full rounded-xl bg-white/5">
//                                 <div className="grid grid-cols-6 gap-6 text-2xl font-semibold px-8 py-4 border-b border-white/20">
//                                     <div>Turno</div>
//                                     <div>Sector</div>
//                                     <div className="text-center">Vent.</div>
//                                     <div>Estado</div>
//                                     <div>Ciudadano</div>
//                                     <div>Tiempo</div>
//                                 </div>
//                                 <div className="overflow-auto" style={{ maxHeight: 'calc(100% - 64px)' }}>
//                                     {turnos.length === 0 ? (
//                                         <div className="px-8 py-10 text-center text-white/80 text-2xl">
//                                             No hay turnos en cola.
//                                         </div>
//                                     ) : (
//                                         turnos.map((t, i) => {
//                                             const minutos = Math.floor((Date.now() - (t.timestamp || 0)) / 60000);
//                                             return (
//                                                 <div
//                                                     key={t.id}
//                                                     className={`grid grid-cols-6 gap-6 px-8 py-4 text-3xl ${i % 2 === 0 ? 'bg-white/5' : 'bg-white/10'
//                                                         }`}
//                                                 >
//                                                     <div className="font-extrabold tracking-wide">{t.codigo}</div>
//                                                     <div className="truncate">{t.sector}</div>
//                                                     <div className="text-center">{t.ventanilla}</div>
//                                                     <div className="capitalize">{(t.estado || '').toLowerCase()}</div>
//                                                     <div className="truncate">{t.ciudadano}</div>
//                                                     <div>{minutos > 0 ? `${minutos}m` : 'Ahora'}</div>
//                                                 </div>
//                                             );
//                                         })
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 ) : (
//                     // Vista de mensajes fullscreen
//                     <div className="w-screen h-screen relative">
//                         {/* Título arriba */}
//                         {mediaActual?.titulo && (
//                             <div className="absolute top-0 left-0 right-0 px-8 py-4 text-center text-3xl font-semibold z-10">
//                                 {mediaActual.titulo}
//                             </div>
//                         )}

//                         {/* Contenido multimedia a pantalla completa */}
//                         {mediaActual?.tipo === 'VIDEO' ? (
//                             (usarIframe && mediaActual.srcIframe) ? (
//                                 <iframe
//                                     title="drive-video"
//                                     src={mediaActual.srcIframe}
//                                     className="w-screen h-screen"
//                                     allow="autoplay; fullscreen; picture-in-picture"
//                                     allowFullScreen
//                                     frameBorder="0"
//                                 />
//                             ) : (
//                                 <video
//                                     ref={videoRef}
//                                     className="w-screen h-screen object-cover"
//                                     autoPlay
//                                     muted
//                                     loop
//                                     playsInline
//                                     onError={() => setUsarIframe(true)}
//                                 >
//                                     <source src={mediaActual.srcVideo} type="video/mp4" />
//                                 </video>
//                             )
//                         ) : mediaActual?.tipo === 'IMAGEN' ? (
//                             <img
//                                 src={mediaActual.src}
//                                 alt={mediaActual.titulo || 'Mensaje'}
//                                 className="w-screen h-screen object-cover"
//                                 onError={(e) => { e.currentTarget.style.display = 'none'; }}
//                             />
//                         ) : (
//                             <div className="w-screen h-screen flex items-center justify-center px-12 text-center">
//                                 <div className="max-w-6xl">
//                                     {mediaActual?.titulo && <h2 className="text-6xl font-bold mb-6">{mediaActual.titulo}</h2>}
//                                     <div className="text-5xl leading-snug whitespace-pre-line">
//                                         {mediaActual?.contenido || ' '}
//                                     </div>
//                                 </div>
//                             </div>
//                         )}

//                         {/* Texto superpuesto abajo (opcional) */}
//                         {mediaActual?.contenido && (mediaActual.tipo === 'IMAGEN' || mediaActual.tipo === 'VIDEO') && (
//                             <div className="absolute left-0 right-0 bottom-0 px-8 py-6 text-center text-3xl bg-black/35">
//                                 <div className="whitespace-pre-line">{mediaActual.contenido}</div>
//                             </div>
//                         )}

//                         {/* Botón para salir */}
//                         <button
//                             onClick={toggleFullscreen}
//                             className="absolute top-4 right-4 px-4 py-2 rounded-md bg-white/10 hover:bg-white/20"
//                             title="Salir de pantalla completa (Esc)"
//                         >
//                             Salir (Esc)
//                         </button>
//                     </div>
//                 )}
//             </div>
//         );
//     }

//     /* ===========================
//        Vista "normal" (panel admin visible)
//        =========================== */

//     return (
//         <div className={`${paleta.fondo} ${paleta.texto} min-h-screen flex flex-col`}>
//             {/* Audio */}
//             <audio ref={audioRef} preload="auto">
//                 {configuracion?.archivoSonido && (
//                     <source src={configuracion.archivoSonido} type="audio/mpeg" />
//                 )}
//             </audio>

//             {/* Header */}
//             <header className="shadow bg-white">
//                 <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
//                     <div className="flex items-center space-x-4">
//                         {configuracion?.mostrarLogo && (
//                             <div className="flex items-center space-x-3">
//                                 {configuracion.rutaLogo ? (
//                                     <img
//                                         src={normalizeDriveImage(configuracion.rutaLogo)}
//                                         alt="Logo"
//                                         className="h-16 w-16 object-contain"
//                                     />
//                                 ) : (
//                                     <Business className={`h-16 w-16 p-2 rounded-full ${paleta.acentoFondo} ${paleta.acentoTexto}`} />
//                                 )}
//                                 <div>
//                                     <h1 className="text-2xl font-bold tracking-wide">
//                                         {configuracion?.textoEncabezado || 'SISTEMA DE TURNOS'}
//                                     </h1>
//                                     <p className="text-sm opacity-70">Municipalidad de San Antonio</p>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                     <div className="flex items-center space-x-6">
//                         <button
//                             onClick={toggleFullscreen}
//                             className="flex items-center space-x-2 text-sm px-3 h-10 rounded-md bg-[#224666] hover:bg-[#2c3e50] transition-all duration-300"
//                             title="Pantalla completa"
//                         >
//                             <span>⤢</span>
//                             <span>Pantalla completa</span>
//                         </button>
//                         <button
//                             onClick={() => setSonidoHabilitado((p) => !p)}
//                             disabled={!configuracion?.sonidoActivo}
//                             className="flex items-center space-x-2 text-sm px-3 h-10 rounded-md bg-[#224666] hover:bg-[#2c3e50] transition-all duration-300"
//                         >
//                             {sonidoHabilitado && configuracion?.sonidoActivo ? <VolumeUp /> : <VolumeOff />}
//                             <span>{sonidoHabilitado && configuracion?.sonidoActivo ? 'Sonido' : 'Silencio'}</span>
//                         </button>
//                         <div className="text-right text-slate-900">
//                             <div className="text-xl font-mono">
//                                 {horaActual.toLocaleTimeString('es-AR', {
//                                     hour: '2-digit',
//                                     minute: '2-digit',
//                                     second: '2-digit',
//                                 })}
//                             </div>
//                             <div className="text-xs opacity-60">
//                                 {horaActual
//                                     .toLocaleDateString('es-AR', {
//                                         weekday: 'long',
//                                         day: '2-digit',
//                                         month: 'short'
//                                     })
//                                     .toUpperCase()}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </header>

//             {/* Main */}
//             <main className="flex-grow py-8 px-6 max-w-7xl mx-auto">
//                 {vistaActual === 'turnos' ? (
//                     <>
//                         {turnoLlamando && (
//                             <div className={`mb-8 p-8 rounded-lg shadow-lg ${paleta.acentoFondo} ${paleta.acentoTexto}`}>
//                                 <div className="text-5xl font-bold mb-4">Turno {turnoLlamando.codigo}</div>
//                                 <div className="text-3xl mb-2">{turnoLlamando.sector}</div>
//                                 <div className="text-2xl">Ventanilla {turnoLlamando.ventanilla}</div>
//                             </div>
//                         )}
//                         <div className="bg-white shadow rounded-lg overflow-hidden">
//                             <div className={`px-6 py-3 text-sm font-semibold uppercase ${paleta.tablaHeader}`}>
//                                 <div className="grid grid-cols-6 gap-4">
//                                     <div>Turno</div>
//                                     <div>Sector</div>
//                                     <div className="text-center">Vent.</div>
//                                     <div>Estado</div>
//                                     <div>Ciudadano</div>
//                                     <div>Tiempo</div>
//                                 </div>
//                             </div>
//                             {turnos.length === 0 ? (
//                                 <div className="px-6 py-8 text-center text-gray-600">No hay turnos en cola.</div>
//                             ) : (
//                                 turnos.map((t, i) => {
//                                     const min = Math.floor((Date.now() - (t.timestamp || 0)) / 60000);
//                                     return (
//                                         <div
//                                             key={t.id}
//                                             className={`px-6 py-4 text-sm ${i % 2 === 0 ? paleta.tablaFilaPar : paleta.tablaFilaImpar}`}
//                                         >
//                                             <div className="grid grid-cols-6 gap-4 items-center">
//                                                 <div className="text-xl font-bold">{t.codigo}</div>
//                                                 <div>{t.sector}</div>
//                                                 <div className="text-center font-medium">{t.ventanilla}</div>
//                                                 <div className="capitalize">{(t.estado || '').toLowerCase()}</div>
//                                                 <div className="truncate">{t.ciudadano}</div>
//                                                 <div>{min > 0 ? `${min}m` : 'Ahora'}</div>
//                                             </div>
//                                         </div>
//                                     );
//                                 })
//                             )}
//                         </div>
//                     </>
//                 ) : (
//                     <div className="flex items-center justify-center">
//                         <div className="max-w-4xl w-full">
//                             {mediaActual?.tipo === 'VIDEO' ? (
//                                 (usarIframe && mediaActual.srcIframe) ? (
//                                     <iframe
//                                         title="drive-video"
//                                         src={mediaActual.srcIframe}
//                                         className="w-full h-[70vh] rounded-lg shadow"
//                                         allow="autoplay; fullscreen; picture-in-picture"
//                                         allowFullScreen
//                                         frameBorder="0"
//                                     />
//                                 ) : (
//                                     <video
//                                         ref={videoRef}
//                                         className="w-full h-[70vh] rounded-lg shadow object-cover"
//                                         autoPlay
//                                         muted
//                                         loop
//                                         playsInline
//                                         onError={() => setUsarIframe(true)}
//                                     >
//                                         <source src={mediaActual.srcVideo} type="video/mp4" />
//                                     </video>
//                                 )
//                             ) : mediaActual?.tipo === 'IMAGEN' ? (
//                                 <img
//                                     src={mediaActual.src}
//                                     alt={mediaActual.titulo || 'Mensaje'}
//                                     className="w-full rounded-lg shadow"
//                                 />
//                             ) : (
//                                 <div className="space-y-4">
//                                     {mediaActual?.titulo && <h2 className="text-2xl font-bold">{mediaActual.titulo}</h2>}
//                                     <p className="text-lg whitespace-pre-line">{mediaActual?.contenido || ' '}</p>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 )}
//             </main>
//         </div>
//     );
// };

// export default PantallaTurnosPublica;


import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    VolumeUp,
    VolumeOff,
    Business,
    Schedule
} from '@mui/icons-material';
import configuracionPantallaService from '../services/configuracionPantallaService';
import mensajeInstitucionalService from '../services/mensajeInstitucionalService';

/* ===========================
   Helpers Google Drive
   =========================== */

// Extrae el ID de Google Drive desde varias variantes de URL
function extractDriveId(url) {
    if (!url) return null;
    try {
        const u = new URL(url);
        const m1 = u.pathname.match(/\/file\/d\/([^/]+)\//);
        if (m1?.[1]) return m1[1];
        const idParam = u.searchParams.get('id');
        if (idParam) return idParam;
        return null;
    } catch {
        return null;
    }
}

function isDriveUrl(url) {
    try {
        return new URL(url).hostname.includes('drive.google.com');
    } catch {
        return false;
    }
}

// IMAGEN: miniatura de alta resolución (rápida y estable para <img>)
function normalizeDriveImage(url) {
    const id = extractDriveId(url);
    return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w1920` : url;
}

// VIDEO: intento de stream directo al mp4 (puede fallar por CORS)
function normalizeDriveVideo(url) {
    const id = extractDriveId(url);
    return id ? `https://drive.google.com/uc?export=download&id=${id}` : url;
}

// PREVIEW (iframe) — funciona SIEMPRE con archivos en Drive aunque no haya CORS
function drivePreviewIframe(url) {
    const id = extractDriveId(url);
    return id ? `https://drive.google.com/file/d/${id}/preview` : null;
}

/* ===========================
   Tema único con color #224666
   =========================== */

const estilos = {
    // Colores principales
    primario: '#224666',
    primarioHover: '#1a3652',
    primarioClaro: '#2d5580',
    
    // Fondos
    fondoPrincipal: 'bg-gray-100',
    fondoBlanco: 'bg-white',
    fondoPrimario: 'bg-[#224666]',
    fondoPrimarioHover: 'hover:bg-[#1a3652]',
    
    // Textos
    textoPrincipal: 'text-gray-900',
    textoBlanco: 'text-white',
    textoGris: 'text-gray-600',
    textoGrisClaro: 'text-gray-400',
    
    // Tabla
    tablaHeader: 'bg-[#224666] text-white',
    tablaFilaPar: 'bg-white',
    tablaFilaImpar: 'bg-gray-50',
    
    // Sombras y bordes
    sombra: 'shadow-lg',
    sombraCard: 'shadow',
    borde: 'border border-gray-200',
    bordeClaro: 'border-gray-100'
};

const PantallaTurnosPublica = () => {
    const [configuracion, setConfiguracion] = useState(null);
    const [mensajes, setMensajes] = useState([]);
    const [turnos, setTurnos] = useState([]);
    const [vistaActual, setVistaActual] = useState('turnos'); // 'turnos' | 'mensaje'
    const [mensajeActual, setMensajeActual] = useState(0);
    const [horaActual, setHoraActual] = useState(new Date());
    const [turnoLlamando, setTurnoLlamando] = useState(null);
    const [sonidoHabilitado, setSonidoHabilitado] = useState(true);
    const [loading, setLoading] = useState(true);
    const [conexionEstado] = useState('conectado');

    // Fullscreen
    const [isFullscreen, setIsFullscreen] = useState(false);
    const overlayRef = useRef(null);

    // Video fallback por CORS: si falla <video>, usamos <iframe>
    const [usarIframe, setUsarIframe] = useState(false);

    const audioRef = useRef(null);
    const videoRef = useRef(null);

    // Carga inicial
    useEffect(() => {
        const cargar = async () => {
            try {
                setLoading(true);
                const config = await configuracionPantallaService.obtenerConfiguracionActiva();
                setConfiguracion(config);
                if (config?.id) {
                    const msgs = await mensajeInstitucionalService.obtenerMensajesPorConfiguracion(config.id);
                    setMensajes(msgs || []);
                } else {
                    const msgs = await mensajeInstitucionalService.obtenerMensajesVigentes();
                    setMensajes(msgs || []);
                }
                // TODO: Integrar turnos reales (WebSocket/poll)
                setTurnos([]);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, []);

    // Reloj
    useEffect(() => {
        const t = setInterval(() => setHoraActual(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    // Alternancia vistas respetando tiempos
    useEffect(() => {
        if (!configuracion || loading) return;
        let id;
        if (vistaActual === 'turnos') {
            id = setTimeout(() => {
                if (mensajes.length > 0) {
                    setVistaActual('mensaje');
                    setUsarIframe(false); // reset fallback al entrar a mensajes
                }
            }, (configuracion.tiempoTurno || 10) * 1000);
        } else {
            const duracionMensaje = mensajes[mensajeActual]?.duracion || configuracion.tiempoMensaje || 8;
            const tiempoDeMensaje = Math.max(duracionMensaje, configuracion.tiempoMensaje || 8);
            id = setTimeout(() => {
                setMensajeActual((i) => (i + 1) % mensajes.length);
                setVistaActual('turnos');
            }, tiempoDeMensaje * 1000);
        }
        return () => clearTimeout(id);
    }, [vistaActual, mensajeActual, configuracion, mensajes, loading]);

    // ESC para salir del overlay fullscreen y del Fullscreen API
    useEffect(() => {
        const onKey = async (e) => {
            if (e.key === 'Escape') {
                if (document.fullscreenElement) {
                    try { await document.exitFullscreen(); } catch { }
                }
                setIsFullscreen(false);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // Activar/desactivar Fullscreen API
    const toggleFullscreen = async () => {
        if (!isFullscreen) {
            setIsFullscreen(true);
            setTimeout(async () => {
                try {
                    if (overlayRef.current && !document.fullscreenElement) {
                        await overlayRef.current.requestFullscreen();
                    }
                } catch { }
            }, 0);
        } else {
            if (document.fullscreenElement) {
                try { await document.exitFullscreen(); } catch { }
            }
            setIsFullscreen(false);
        }
    };

    // Medios normalizados para el mensaje actual
    const mediaActual = useMemo(() => {
        const m = mensajes[mensajeActual];
        if (!m) return null;

        if (m.tipo === 'IMAGEN') {
            const src = isDriveUrl(m.rutaArchivo)
                ? normalizeDriveImage(m.rutaArchivo)
                : m.rutaArchivo;
            return { ...m, src, preferIframe: false };
        }

        if (m.tipo === 'VIDEO') {
            const enDrive = isDriveUrl(m.rutaArchivo);
            return {
                ...m,
                // si es Drive, preferimos iframe por defecto
                preferIframe: enDrive,
                srcVideo: enDrive ? normalizeDriveVideo(m.rutaArchivo) : m.rutaArchivo,
                srcIframe: drivePreviewIframe(m.rutaArchivo)
            };
        }

        return m;
    }, [mensajes, mensajeActual]);

    // Si el mensaje actual es video de Drive, arrancamos con iframe
    useEffect(() => {
        if (mediaActual?.tipo === 'VIDEO') {
            setUsarIframe(!!mediaActual.preferIframe);
        } else {
            setUsarIframe(false);
        }
    }, [mediaActual]);

    // Loading
    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${estilos.fondoPrincipal} ${estilos.textoPrincipal}`}>
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#224666] border-t-transparent mx-auto" />
                    <p>Cargando configuración...</p>
                </div>
            </div>
        );
    }

    /* ===========================
       Bloque FULLSCREEN OVERLAY
       =========================== */
    if (isFullscreen) {
        return (
            <div
                ref={overlayRef}
                className="fixed inset-0 z-50 bg-[#224666] text-white"
                style={{ width: '100vw', height: '100vh' }}
            >
                {/* Contenedor full-bleed */}
                {vistaActual === 'turnos' ? (
                    <div className="w-screen h-screen flex flex-col">
                        {/* Encabezado compacto para TV */}
                        <div className="w-full px-12 py-4 flex items-center justify-between bg-black/30">
                            <div className="flex items-center space-x-4">
                                <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center">
                                    <Business className="text-3xl" />
                                </div>
                                <div>
                                    <img
                                        src="/SanAntonioArredondoWhite.avif"
                                        alt="Logo Municipalidad de San Antonio de Arredondo"
                                        className="h-10 object-contain"
                                    />
                                    <div className="text-sm opacity-80">
                                        Municipalidad de San Antonio de Arredondo
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-6">
                                <button
                                    onClick={toggleFullscreen}
                                    className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
                                    title="Salir de pantalla completa (Esc)"
                                >
                                    Salir (Esc)
                                </button>
                                <div className="text-2xl font-mono">
                                    {horaActual.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>

                        {/* Llamado actual */}
                        {turnoLlamando && (
                            <div className="px-12 py-6 bg-red-700 text-white">
                                <div className="text-7xl font-extrabold tracking-wider">
                                    TURNO {turnoLlamando.codigo}
                                </div>
                                <div className="text-3xl opacity-90 mt-2">
                                    {turnoLlamando.sector} • Ventanilla {turnoLlamando.ventanilla}
                                </div>
                            </div>
                        )}

                        {/* Tabla de turnos grande para TV 43" */}
                        <div className="flex-1 px-12 py-8 overflow-hidden">
                            <div className="w-full h-full rounded-xl bg-white/5">
                                <div className="grid grid-cols-6 gap-6 text-2xl font-semibold px-8 py-4 border-b border-white/20">
                                    <div>Turno</div>
                                    <div>Sector</div>
                                    <div className="text-center">Vent.</div>
                                    <div>Estado</div>
                                    <div>Ciudadano</div>
                                    <div>Tiempo</div>
                                </div>
                                <div className="overflow-auto" style={{ maxHeight: 'calc(100% - 64px)' }}>
                                    {turnos.length === 0 ? (
                                        <div className="px-8 py-10 text-center text-white/80 text-2xl">
                                            No hay turnos en cola.
                                        </div>
                                    ) : (
                                        turnos.map((t, i) => {
                                            const minutos = Math.floor((Date.now() - (t.timestamp || 0)) / 60000);
                                            return (
                                                <div
                                                    key={t.id}
                                                    className={`grid grid-cols-6 gap-6 px-8 py-4 text-3xl ${i % 2 === 0 ? 'bg-white/5' : 'bg-white/10'
                                                        }`}
                                                >
                                                    <div className="font-extrabold tracking-wide">{t.codigo}</div>
                                                    <div className="truncate">{t.sector}</div>
                                                    <div className="text-center">{t.ventanilla}</div>
                                                    <div className="capitalize">{(t.estado || '').toLowerCase()}</div>
                                                    <div className="truncate">{t.ciudadano}</div>
                                                    <div>{minutos > 0 ? `${minutos}m` : 'Ahora'}</div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Vista de mensajes fullscreen
                    <div className="w-screen h-screen relative">
                        {/* Título arriba */}
                        {mediaActual?.titulo && (
                            <div className="absolute top-0 left-0 right-0 px-8 py-4 text-center text-3xl font-semibold z-10">
                                {mediaActual.titulo}
                            </div>
                        )}

                        {/* Contenido multimedia a pantalla completa */}
                        {mediaActual?.tipo === 'VIDEO' ? (
                            (usarIframe && mediaActual.srcIframe) ? (
                                <iframe
                                    title="drive-video"
                                    src={mediaActual.srcIframe}
                                    className="w-screen h-screen"
                                    allow="autoplay; fullscreen; picture-in-picture"
                                    allowFullScreen
                                    frameBorder="0"
                                />
                            ) : (
                                <video
                                    ref={videoRef}
                                    className="w-screen h-screen object-cover"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    onError={() => setUsarIframe(true)}
                                >
                                    <source src={mediaActual.srcVideo} type="video/mp4" />
                                </video>
                            )
                        ) : mediaActual?.tipo === 'IMAGEN' ? (
                            <img
                                src={mediaActual.src}
                                alt={mediaActual.titulo || 'Mensaje'}
                                className="w-screen h-screen object-cover"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        ) : (
                            <div className="w-screen h-screen flex items-center justify-center px-12 text-center">
                                <div className="max-w-6xl">
                                    {mediaActual?.titulo && <h2 className="text-6xl font-bold mb-6">{mediaActual.titulo}</h2>}
                                    <div className="text-5xl leading-snug whitespace-pre-line">
                                        {mediaActual?.contenido || ' '}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Texto superpuesto abajo (opcional) */}
                        {mediaActual?.contenido && (mediaActual.tipo === 'IMAGEN' || mediaActual.tipo === 'VIDEO') && (
                            <div className="absolute left-0 right-0 bottom-0 px-8 py-6 text-center text-3xl bg-black/35">
                                <div className="whitespace-pre-line">{mediaActual.contenido}</div>
                            </div>
                        )}

                        {/* Botón para salir */}
                        <button
                            onClick={toggleFullscreen}
                            className="absolute top-4 right-4 px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
                            title="Salir de pantalla completa (Esc)"
                        >
                            Salir (Esc)
                        </button>
                    </div>
                )}
            </div>
        );
    }

    /* ===========================
       Vista "normal" (panel admin visible)
       =========================== */

    return (
        <div className={`${estilos.fondoPrincipal} ${estilos.textoPrincipal} min-h-screen flex flex-col`}>
            {/* Audio */}
            <audio ref={audioRef} preload="auto">
                {configuracion?.archivoSonido && (
                    <source src={configuracion.archivoSonido} type="audio/mpeg" />
                )}
            </audio>

            {/* Header */}
            <header className={`${estilos.sombra} ${estilos.fondoBlanco}`}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                            <div className={`h-16 w-16 rounded-full ${estilos.fondoPrimario} ${estilos.textoBlanco} flex items-center justify-center`}>
                                <Business className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-wide">
                                    {configuracion?.textoEncabezado || 'SISTEMA DE TURNOS'}
                                </h1>
                                <p className={`text-sm ${estilos.textoGris}`}>Municipalidad de San Antonio de Arredondo</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">
                        <button
                            onClick={toggleFullscreen}
                            className={`flex items-center space-x-2 text-sm px-4 py-2 rounded-md ${estilos.fondoPrimario} ${estilos.fondoPrimarioHover} ${estilos.textoBlanco} transition-all duration-300`}
                            title="Pantalla completa"
                        >
                            <span>⤢</span>
                            <span>Pantalla completa</span>
                        </button>
                        <button
                            onClick={() => setSonidoHabilitado((p) => !p)}
                            disabled={!configuracion?.sonidoActivo}
                            className={`flex items-center space-x-2 text-sm px-4 py-2 rounded-md ${estilos.fondoPrimario} ${estilos.fondoPrimarioHover} ${estilos.textoBlanco} transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {sonidoHabilitado && configuracion?.sonidoActivo ? <VolumeUp /> : <VolumeOff />}
                            <span>{sonidoHabilitado && configuracion?.sonidoActivo ? 'Sonido' : 'Silencio'}</span>
                        </button>
                        <div className={`text-right ${estilos.textoPrincipal}`}>
                            <div className="text-xl font-mono">
                                {horaActual.toLocaleTimeString('es-AR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                })}
                            </div>
                            <div className={`text-xs ${estilos.textoGris}`}>
                                {horaActual
                                    .toLocaleDateString('es-AR', {
                                        weekday: 'long',
                                        day: '2-digit',
                                        month: 'short'
                                    })
                                    .toUpperCase()}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="flex-grow py-8 px-6 max-w-7xl mx-auto w-full">
                {vistaActual === 'turnos' ? (
                    <>
                        {turnoLlamando && (
                            <div className={`mb-8 p-8 rounded-lg ${estilos.sombra} ${estilos.fondoPrimario} ${estilos.textoBlanco}`}>
                                <div className="text-5xl font-bold mb-4">Turno {turnoLlamando.codigo}</div>
                                <div className="text-3xl mb-2">{turnoLlamando.sector}</div>
                                <div className="text-2xl">Ventanilla {turnoLlamando.ventanilla}</div>
                            </div>
                        )}
                        <div className={`${estilos.fondoBlanco} ${estilos.sombraCard} rounded-lg overflow-hidden`}>
                            <div className={`px-6 py-3 text-sm font-semibold uppercase ${estilos.tablaHeader}`}>
                                <div className="grid grid-cols-6 gap-4">
                                    <div>Turno</div>
                                    <div>Sector</div>
                                    <div className="text-center">Vent.</div>
                                    <div>Estado</div>
                                    <div>Ciudadano</div>
                                    <div>Tiempo</div>
                                </div>
                            </div>
                            {turnos.length === 0 ? (
                                <div className={`px-6 py-8 text-center ${estilos.textoGris}`}>No hay turnos en cola.</div>
                            ) : (
                                turnos.map((t, i) => {
                                    const min = Math.floor((Date.now() - (t.timestamp || 0)) / 60000);
                                    return (
                                        <div
                                            key={t.id}
                                            className={`px-6 py-4 text-sm ${i % 2 === 0 ? estilos.tablaFilaPar : estilos.tablaFilaImpar}`}
                                        >
                                            <div className="grid grid-cols-6 gap-4 items-center">
                                                <div className="text-xl font-bold">{t.codigo}</div>
                                                <div>{t.sector}</div>
                                                <div className="text-center font-medium">{t.ventanilla}</div>
                                                <div className="capitalize">{(t.estado || '').toLowerCase()}</div>
                                                <div className="truncate">{t.ciudadano}</div>
                                                <div>{min > 0 ? `${min}m` : 'Ahora'}</div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center">
                        <div className="max-w-4xl w-full">
                            {mediaActual?.tipo === 'VIDEO' ? (
                                (usarIframe && mediaActual.srcIframe) ? (
                                    <iframe
                                        title="drive-video"
                                        src={mediaActual.srcIframe}
                                        className={`w-full h-[70vh] rounded-lg ${estilos.sombraCard}`}
                                        allow="autoplay; fullscreen; picture-in-picture"
                                        allowFullScreen
                                        frameBorder="0"
                                    />
                                ) : (
                                    <video
                                        ref={videoRef}
                                        className={`w-full h-[70vh] rounded-lg ${estilos.sombraCard} object-cover`}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        onError={() => setUsarIframe(true)}
                                    >
                                        <source src={mediaActual.srcVideo} type="video/mp4" />
                                    </video>
                                )
                            ) : mediaActual?.tipo === 'IMAGEN' ? (
                                <img
                                    src={mediaActual.src}
                                    alt={mediaActual.titulo || 'Mensaje'}
                                    className={`w-full rounded-lg ${estilos.sombraCard}`}
                                />
                            ) : (
                                <div className={`space-y-4 p-8 ${estilos.fondoBlanco} rounded-lg ${estilos.sombraCard}`}>
                                    {mediaActual?.titulo && <h2 className="text-3xl font-bold">{mediaActual.titulo}</h2>}
                                    <p className="text-xl whitespace-pre-line leading-relaxed">{mediaActual?.contenido || ' '}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PantallaTurnosPublica;