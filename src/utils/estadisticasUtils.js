/**
 * Utilidades para el manejo de estadísticas
 */

// =============================================
// FORMATEO DE DATOS
// =============================================

/**
 * Formatea un número para mostrar con separadores de miles
 */
export const formatearNumero = (numero) => {
    if (numero == null || isNaN(numero)) return '0';
    return new Intl.NumberFormat('es-AR').format(numero);
};

/**
 * Formatea un porcentaje
 */
export const formatearPorcentaje = (valor, decimales = 1) => {
    if (valor == null || isNaN(valor)) return '0%';
    return `${Number(valor).toFixed(decimales)}%`;
};

/**
 * Formatea tiempo en minutos a formato legible
 */
export const formatearTiempo = (minutos) => {
    if (minutos == null || isNaN(minutos)) return '0 min';
    
    const mins = Math.floor(minutos);
    if (mins < 60) return `${mins} min`;
    
    const horas = Math.floor(mins / 60);
    const minutosRestantes = mins % 60;
    
    if (minutosRestantes === 0) return `${horas}h`;
    return `${horas}h ${minutosRestantes}min`;
};

/**
 * Formatea una fecha para mostrar
 */
export const formatearFecha = (fecha, formato = 'corto') => {
    if (!fecha) return '—';
    
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return '—';
    
    const opciones = {
        corto: { day: '2-digit', month: '2-digit', year: 'numeric' },
        largo: { day: '2-digit', month: 'long', year: 'numeric' },
        dia: { weekday: 'long', day: '2-digit', month: 'long' }
    };
    
    return new Intl.DateTimeFormat('es-AR', opciones[formato] || opciones.corto).format(date);
};

// =============================================
// CÁLCULOS ESTADÍSTICOS
// =============================================

/**
 * Calcula eficiencia como porcentaje
 */
export const calcularEficiencia = (atendidos, generados) => {
    if (!generados || generados === 0) return 0;
    return (atendidos / generados) * 100;
};

/**
 * Calcula tasa de ausencias
 */
export const calcularTasaAusencias = (ausentes, generados) => {
    if (!generados || generados === 0) return 0;
    return (ausentes / generados) * 100;
};

/**
 * Calcula estadísticas resumidas de un array de datos
 */
export const calcularResumen = (datos) => {
    if (!Array.isArray(datos) || datos.length === 0) {
        return {
            totalGenerados: 0,
            totalAtendidos: 0,
            totalAusentes: 0,
            eficienciaPromedio: 0,
            tiempoEsperaPromedio: 0
        };
    }
    
    const totales = datos.reduce((acc, item) => {
        acc.generados += item.turnosGenerados || 0;
        acc.atendidos += item.turnosAtendidos || 0;
        acc.ausentes += item.turnosAusentes || 0;
        acc.tiempoEspera += item.tiempoPromedioEspera || 0;
        return acc;
    }, { generados: 0, atendidos: 0, ausentes: 0, tiempoEspera: 0 });
    
    return {
        totalGenerados: totales.generados,
        totalAtendidos: totales.atendidos,
        totalAusentes: totales.ausentes,
        eficienciaPromedio: calcularEficiencia(totales.atendidos, totales.generados),
        tiempoEsperaPromedio: totales.tiempoEspera / datos.length
    };
};

// =============================================
// VALIDACIONES
// =============================================

/**
 * Valida un rango de fechas
 */
export const validarRangoFechas = (desde, hasta) => {
    if (!desde || !hasta) {
        return { valido: false, error: 'Ambas fechas son requeridas' };
    }
    
    const fechaDesde = new Date(desde);
    const fechaHasta = new Date(hasta);
    
    if (isNaN(fechaDesde.getTime()) || isNaN(fechaHasta.getTime())) {
        return { valido: false, error: 'Fechas inválidas' };
    }
    
    if (fechaHasta < fechaDesde) {
        return { valido: false, error: 'La fecha final no puede ser anterior a la inicial' };
    }
    
    const diffDias = Math.ceil((fechaHasta - fechaDesde) / (1000 * 60 * 60 * 24));
    if (diffDias > 365) {
        return { valido: false, error: 'El rango no puede exceder un año' };
    }
    
    return { valido: true };
};

/**
 * Valida parámetros de filtro
 */
export const validarFiltros = (tab, filtros) => {
    const errores = [];
    
    switch (tab) {
        case 'FECHA':
            if (!filtros.fecha) errores.push('La fecha es requerida');
            break;
            
        case 'SECTOR':
            if (!filtros.sectorId) errores.push('El sector es requerido');
            break;
            
        case 'PERIODO':
            if (!filtros.desde || !filtros.hasta) {
                errores.push('Las fechas de inicio y fin son requeridas');
            } else {
                const validacion = validarRangoFechas(filtros.desde, filtros.hasta);
                if (!validacion.valido) errores.push(validacion.error);
            }
            break;
    }
    
    return {
        valido: errores.length === 0,
        errores
    };
};

// =============================================
// COLORES Y ESTILOS
// =============================================

/**
 * Obtiene el color según la eficiencia
 */
export const obtenerColorEficiencia = (eficiencia) => {
    if (eficiencia >= 90) return 'text-green-600 bg-green-50';
    if (eficiencia >= 75) return 'text-blue-600 bg-blue-50';
    if (eficiencia >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
};

/**
 * Obtiene el color según el tiempo de espera
 */
export const obtenerColorTiempoEspera = (minutos) => {
    if (minutos <= 5) return 'text-green-600';
    if (minutos <= 15) return 'text-yellow-600';
    if (minutos <= 30) return 'text-orange-600';
    return 'text-red-600';
};

/**
 * Obtiene clases CSS para un badge de estado
 */
export const obtenerClasesBadge = (tipo, valor) => {
    const base = 'inline-flex px-2 py-1 text-xs font-semibold rounded-full';
    
    switch (tipo) {
        case 'eficiencia':
            if (valor >= 80) return `${base} bg-green-100 text-green-800`;
            if (valor >= 60) return `${base} bg-yellow-100 text-yellow-800`;
            return `${base} bg-red-100 text-red-800`;
            
        case 'tiempo':
            if (valor <= 10) return `${base} bg-green-100 text-green-800`;
            if (valor <= 20) return `${base} bg-yellow-100 text-yellow-800`;
            return `${base} bg-red-100 text-red-800`;
            
        default:
            return `${base} bg-gray-100 text-gray-800`;
    }
};

// =============================================
// EXPORTACIÓN DE DATOS
// =============================================

/**
 * Convierte datos a CSV
 */
export const convertirACSV = (datos, columnas) => {
    if (!Array.isArray(datos) || datos.length === 0) return '';
    
    const headers = columnas.map(col => col.label).join(',');
    const filas = datos.map(row => 
        columnas.map(col => {
            const valor = row[col.key];
            // Escapar comas y comillas
            return typeof valor === 'string' && valor.includes(',') 
                ? `"${valor.replace(/"/g, '""')}"` 
                : valor;
        }).join(',')
    );
    
    return [headers, ...filas].join('\n');
};

/**
 * Descarga datos como archivo CSV
 */
export const descargarCSV = (datos, columnas, nombreArchivo = 'estadisticas') => {
    const csv = convertirACSV(datos, columnas);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${nombreArchivo}_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// =============================================
// HELPERS DE FECHAS
// =============================================

/**
 * Obtiene el rango de fechas para la semana actual
 */
export const obtenerSemanaActual = () => {
    const hoy = new Date();
    const diaActual = hoy.getDay();
    const diferencia = diaActual === 0 ? -6 : 1 - diaActual; // Lunes como primer día
    
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() + diferencia);
    
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    
    return {
        desde: lunes.toISOString().slice(0, 10),
        hasta: domingo.toISOString().slice(0, 10)
    };
};

/**
 * Obtiene el rango de fechas para el mes actual
 */
export const obtenerMesActual = () => {
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    
    return {
        desde: primerDia.toISOString().slice(0, 10),
        hasta: ultimoDia.toISOString().slice(0, 10)
    };
};

/**
 * Obtiene el rango para los últimos N días
 */
export const obtenerUltimosDias = (dias = 7) => {
    const hasta = new Date();
    const desde = new Date();
    desde.setDate(hasta.getDate() - dias + 1);
    
    return {
        desde: desde.toISOString().slice(0, 10),
        hasta: hasta.toISOString().slice(0, 10)
    };
};

// =============================================
// CONSTANTES ÚTILES
// =============================================

export const GRUPOS_DISPONIBLES = [
    { value: 'FECHA', label: 'Por fecha' },
    { value: 'SECTOR', label: 'Por sector' },
    { value: 'FECHA_SECTOR', label: 'Por fecha y sector' }
];

export const RANGOS_RAPIDOS = [
    { label: 'Hoy', valor: () => ({ desde: new Date().toISOString().slice(0, 10), hasta: new Date().toISOString().slice(0, 10) }) },
    { label: 'Ayer', valor: () => {
        const ayer = new Date();
        ayer.setDate(ayer.getDate() - 1);
        const fecha = ayer.toISOString().slice(0, 10);
        return { desde: fecha, hasta: fecha };
    }},
    { label: 'Últimos 7 días', valor: () => obtenerUltimosDias(7) },
    { label: 'Últimos 30 días', valor: () => obtenerUltimosDias(30) },
    { label: 'Esta semana', valor: obtenerSemanaActual },
    { label: 'Este mes', valor: obtenerMesActual }
];

export default {
    formatearNumero,
    formatearPorcentaje,
    formatearTiempo,
    formatearFecha,
    calcularEficiencia,
    calcularTasaAusencias,
    calcularResumen,
    validarRangoFechas,
    validarFiltros,
    obtenerColorEficiencia,
    obtenerColorTiempoEspera,
    obtenerClasesBadge,
    convertirACSV,
    descargarCSV,
    obtenerSemanaActual,
    obtenerMesActual,
    obtenerUltimosDias,
    GRUPOS_DISPONIBLES,
    RANGOS_RAPIDOS
};