import { apiClient } from './authService';


class HorariosService {

    /**
     * Lista todos los horarios de un sector
     * GET /api/horarios/{id}/horarios
     */
    async listarPorSector(sectorId) {
        try {
            const response = await apiClient.get(`/horarios/${sectorId}/horarios`);
            return response.data.data;
        } catch (error) {
            console.error('Error obteniendo horarios del sector:', error);
            throw new Error(
                error.response?.data?.message ||
                'Error al obtener los horarios del sector'
            );
        }
    }

    /**
     * Lista horarios de un sector para un día específico
     * GET /api/horarios/{id}/horarios/dia/{diaSemana}
     */
    async listarPorDia(sectorId, diaSemana) {
        try {
            const response = await apiClient.get(`/horarios/${sectorId}/horarios/dia/${diaSemana}`);
            return response.data.data;
        } catch (error) {
            console.error('Error obteniendo horarios del día:', error);
            throw new Error(
                error.response?.data?.message ||
                'Error al obtener los horarios del día'
            );
        }
    }

    /**
     * Verifica si un sector está en horario de atención
     * GET /api/horarios/{id}/en-horario/{diaSemana}/{hora}
     */
    async estaEnHorario(sectorId, diaSemana, hora) {
        try {
            const response = await apiClient.get(`/horarios/${sectorId}/en-horario/${diaSemana}/${hora}`);
            return response.data.data;
        } catch (error) {
            console.error('Error verificando horario:', error);
            throw new Error(
                error.response?.data?.message ||
                'Error al verificar el horario'
            );
        }
    }

    /**
     * Crea un nuevo horario para un sector
     * POST /api/horarios/{id}/horarios
     */
    async crear(sectorId, datosHorario) {
        try {
            const response = await apiClient.post(`/horarios/${sectorId}/horarios`, datosHorario);
            return response.data.data;
        } catch (error) {
            console.error('Error creando horario:', error);
            throw new Error(
                error.response?.data?.message ||
                'Error al crear el horario'
            );
        }
    }

    /**
     * Actualiza un horario existente
     * PUT /api/horarios/{sectorId}/horarios/{horarioId}
     */
    async actualizar(sectorId, horarioId, datosActualizados) {
        try {
            const response = await apiClient.put(`/horarios/${sectorId}/horarios/${horarioId}`, datosActualizados);
            return response.data.data;
        } catch (error) {
            console.error('Error actualizando horario:', error);
            throw new Error(
                error.response?.data?.message ||
                'Error al actualizar el horario'
            );
        }
    }

    /**
     * Activa un horario
     * PATCH /api/horarios/{sectorId}/horarios/{horarioId}/activar
     */
    async activar(sectorId, horarioId) {
        try {
            const response = await apiClient.patch(`/horarios/${sectorId}/horarios/${horarioId}/activar`);
            return response.data.data;
        } catch (error) {
            console.error('Error activando horario:', error);
            throw new Error(
                error.response?.data?.message ||
                'Error al activar el horario'
            );
        }
    }

    /**
     * Desactiva un horario
     * PATCH /api/horarios/{sectorId}/horarios/{horarioId}/desactivar
     */
    async desactivar(sectorId, horarioId) {
        try {
            const response = await apiClient.patch(`/horarios/${sectorId}/horarios/${horarioId}/desactivar`);
            return response.data.data;
        } catch (error) {
            console.error('Error desactivando horario:', error);
            throw new Error(
                error.response?.data?.message ||
                'Error al desactivar el horario'
            );
        }
    }

    /**
     * Formatea un horario para la UI
     */
    formatearParaUI(horario) {
        if (!horario) return null;

        return {
            id: horario.id,
            diaSemana: horario.diaSemana,
            horaInicio: horario.horaInicio,
            horaFin: horario.horaFin,
            intervaloCitas: horario.intervaloCitas,
            capacidadMaxima: horario.capacidadMaxima,
            observaciones: horario.observaciones,
            activo: horario.activo,
            fechaCreacion: horario.fechaCreacion,
            fechaActualizacion: horario.fechaActualizacion
        };
    }

    /**
     * Valida los datos de un horario antes de enviar
     */
    validarDatosHorario(datos) {
        const errores = {};

        // Validar día de la semana
        const diasValidos = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
        if (!datos.diaSemana || !diasValidos.includes(datos.diaSemana)) {
            errores.diaSemana = 'Día de la semana requerido';
        }

        // Validar hora de inicio
        if (!datos.horaInicio) {
            errores.horaInicio = 'Hora de inicio requerida';
        }

        // Validar hora de fin
        if (!datos.horaFin) {
            errores.horaFin = 'Hora de fin requerida';
        }

        // Validar que hora de inicio sea menor que hora de fin
        if (datos.horaInicio && datos.horaFin && datos.horaInicio >= datos.horaFin) {
            errores.horaFin = 'La hora de fin debe ser posterior a la hora de inicio';
        }

        // Validar intervalo de citas
        if (!datos.intervaloCitas || datos.intervaloCitas < 5 || datos.intervaloCitas > 120) {
            errores.intervaloCitas = 'Intervalo debe estar entre 5 y 120 minutos';
        }

        // Validar capacidad máxima
        if (!datos.capacidadMaxima || datos.capacidadMaxima < 1 || datos.capacidadMaxima > 50) {
            errores.capacidadMaxima = 'Capacidad debe estar entre 1 y 50 personas';
        }

        return {
            esValido: Object.keys(errores).length === 0,
            errores
        };
    }

    /**
     * Obtiene los días de la semana en español
     */
    getDiasSemanario() {
        return [
            { valor: 'MONDAY', etiqueta: 'Lunes' },
            { valor: 'TUESDAY', etiqueta: 'Martes' },
            { valor: 'WEDNESDAY', etiqueta: 'Miércoles' },
            { valor: 'THURSDAY', etiqueta: 'Jueves' },
            { valor: 'FRIDAY', etiqueta: 'Viernes' },
            { valor: 'SATURDAY', etiqueta: 'Sábado' },
            { valor: 'SUNDAY', etiqueta: 'Domingo' }
        ];
    }

    /**
     * Genera opciones de intervalos de tiempo comunes
     */
    getIntervalosComunes() {
        return [
            { valor: 15, etiqueta: '15 minutos' },
            { valor: 20, etiqueta: '20 minutos' },
            { valor: 30, etiqueta: '30 minutos' },
            { valor: 45, etiqueta: '45 minutos' },
            { valor: 60, etiqueta: '1 hora' },
            { valor: 90, etiqueta: '1 hora 30 minutos' },
            { valor: 120, etiqueta: '2 horas' }
        ];
    }

    /**
     * Obtiene opciones de capacidad común
     */
    getCapacidadesComunes() {
        return [
            { valor: 1, etiqueta: '1 persona' },
            { valor: 2, etiqueta: '2 personas' },
            { valor: 3, etiqueta: '3 personas' },
            { valor: 4, etiqueta: '4 personas' },
            { valor: 5, etiqueta: '5 personas' },
            { valor: 10, etiqueta: '10 personas' },
            { valor: 15, etiqueta: '15 personas' },
            { valor: 20, etiqueta: '20 personas' }
        ];
    }

    /**
     * Convierte horario a texto legible
     */
    formatearHorarioTexto(horario) {
        if (!horario) return '';

        const dia = this.getDiaLabel(horario.diaSemana);
        const inicio = this.formatearHora(horario.horaInicio);
        const fin = this.formatearHora(horario.horaFin);

        return `${dia} de ${inicio} a ${fin}`;
    }

    /**
     * Obtiene etiqueta en español de un día
     */
    getDiaLabel(diaSemana) {
        const dias = {
            'MONDAY': 'Lunes',
            'TUESDAY': 'Martes',
            'WEDNESDAY': 'Miércoles',
            'THURSDAY': 'Jueves',
            'FRIDAY': 'Viernes',
            'SATURDAY': 'Sábado',
            'SUNDAY': 'Domingo'
        };
        return dias[diaSemana] || diaSemana;
    }

    /**
     * Formatea hora para mostrar (HH:MM)
     */
    formatearHora(hora) {
        if (!hora) return '';
        return hora.substring(0, 5); // Solo HH:MM
    }

    /**
     * Calcula duración de un horario en minutos
     */
    calcularDuracion(horaInicio, horaFin) {
        if (!horaInicio || !horaFin) return 0;

        const [horasInicio, minutosInicio] = horaInicio.split(':').map(Number);
        const [horasFin, minutosFin] = horaFin.split(':').map(Number);

        const inicioEnMinutos = horasInicio * 60 + minutosInicio;
        const finEnMinutos = horasFin * 60 + minutosFin;

        return finEnMinutos - inicioEnMinutos;
    }

    /**
     * Calcula número de slots disponibles en un horario
     */
    calcularSlotsDisponibles(horario) {
        if (!horario?.horaInicio || !horario?.horaFin || !horario?.intervaloCitas) {
            return 0;
        }

        const duracion = this.calcularDuracion(horario.horaInicio, horario.horaFin);
        return Math.floor(duracion / horario.intervaloCitas);
    }

    /**
     * Verifica si hay conflicto entre dos horarios
     */
    hayConflictoHorarios(horario1, horario2) {
        if (horario1.diaSemana !== horario2.diaSemana) {
            return false;
        }

        const inicio1 = horario1.horaInicio;
        const fin1 = horario1.horaFin;
        const inicio2 = horario2.horaInicio;
        const fin2 = horario2.horaFin;

        // Verificar solapamiento
        return (inicio1 < fin2 && inicio2 < fin1);
    }

    /**
     * Ordena horarios por día y hora
     */
    ordenarHorarios(horarios) {
        const ordenDias = {
            'MONDAY': 1,
            'TUESDAY': 2,
            'WEDNESDAY': 3,
            'THURSDAY': 4,
            'FRIDAY': 5,
            'SATURDAY': 6,
            'SUNDAY': 7
        };

        return [...horarios].sort((a, b) => {
            // Primero por día
            const diaA = ordenDias[a.diaSemana] || 8;
            const diaB = ordenDias[b.diaSemana] || 8;

            if (diaA !== diaB) {
                return diaA - diaB;
            }

            // Luego por hora de inicio
            return a.horaInicio.localeCompare(b.horaInicio);
        });
    }

    /**
     * Agrupa horarios por día de la semana
     */
    agruparPorDia(horarios) {
        const grupos = {};

        horarios.forEach(horario => {
            const dia = horario.diaSemana;
            if (!grupos[dia]) {
                grupos[dia] = [];
            }
            grupos[dia].push(horario);
        });

        // Ordenar horarios dentro de cada día
        Object.keys(grupos).forEach(dia => {
            grupos[dia] = grupos[dia].sort((a, b) =>
                a.horaInicio.localeCompare(b.horaInicio)
            );
        });

        return grupos;
    }

    /**
     * Manejo de errores específicos de horarios
     */
    handleHorariosError(error) {
        if (error.response) {
            const { status, data } = error.response;

            // Extraer mensaje de error del wrapper ApiResponseWrapper
            if (data?.message) {
                error.message = data.message;
            } else if (data?.error?.detail) {
                error.message = data.error.detail;
            }

            // Errores específicos de horarios
            switch (status) {
                case 409:
                    error.message = 'Conflicto de horarios - El horario se superpone con otro existente';
                    break;
                case 404:
                    error.message = 'Horario no encontrado';
                    break;
                case 403:
                    error.message = 'No tienes permisos para gestionar horarios';
                    break;
                case 400:
                    if (data?.errorCode === 'INVALID_TIME_RANGE') {
                        error.message = 'Rango de tiempo inválido - La hora de inicio debe ser anterior a la hora de fin';
                    } else if (data?.errorCode === 'TIME_CONFLICT') {
                        error.message = 'El horario se superpone con otro horario existente del mismo día';
                    }
                    break;
            }
        } else if (error.request) {
            error.message = 'Error de conexión al gestionar horarios';
        }

        console.error('Horarios Service Error:', {
            message: error.message,
            status: error.response?.status,
            url: error.config?.url
        });
    }
}

// Exportar instancia singleton del servicio
export default new HorariosService();