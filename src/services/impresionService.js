class ImpresionService {
    /**
     * Imprime un turno directamente desde el navegador
     */
    async imprimirTurno(datosTurno) {
        try {
            // Crear contenido HTML para impresión
            const contenidoImpresion = this.generarHTMLImpresion(datosTurno);

            // Abrir ventana de impresión
            const ventanaImpresion = window.open('', '_blank', 'width=300,height=600');

            if (!ventanaImpresion) {
                throw new Error('No se pudo abrir la ventana de impresión');
            }

            ventanaImpresion.document.write(contenidoImpresion);
            ventanaImpresion.document.close();

            // Esperar un poco para que cargue el contenido
            setTimeout(() => {
                ventanaImpresion.print();
                ventanaImpresion.close();
            }, 500);

        } catch (error) {
            console.error('Error imprimiendo turno:', error);
            throw error;
        }
    }

    /**
     * Genera el HTML para impresión térmica (58mm típicamente)
     */
    generarHTMLImpresion(datos) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Turno ${datos.codigo}</title>
            <style>
                @page {
                    size: 58mm auto;
                    margin: 0;
                }
                body {
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    line-height: 1.2;
                    margin: 0;
                    padding: 5mm;
                    width: 48mm;
                }
                .header {
                    text-align: center;
                    border-bottom: 1px dashed #000;
                    padding-bottom: 5px;
                    margin-bottom: 5px;
                }
                .titulo {
                    font-weight: bold;
                    font-size: 14px;
                    margin-bottom: 2px;
                }
                .subtitulo {
                    font-size: 10px;
                    margin-bottom: 3px;
                }
                .turno-codigo {
                    font-size: 20px;
                    font-weight: bold;
                    text-align: center;
                    margin: 8px 0;
                    border: 2px solid #000;
                    padding: 5px;
                }
                .info-line {
                    margin: 3px 0;
                    display: flex;
                    justify-content: space-between;
                }
                .label {
                    font-weight: bold;
                }
                .footer {
                    text-align: center;
                    margin-top: 10px;
                    padding-top: 5px;
                    border-top: 1px dashed #000;
                    font-size: 10px;
                }
                .separador {
                    text-align: center;
                    margin: 5px 0;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="titulo">MUNICIPALIDAD</div>
                <div class="subtitulo">San Antonio de Arredondo</div>
                <div class="subtitulo">Sistema de Turnos</div>
            </div>

            <div class="turno-codigo">
                ${datos.codigo}
            </div>

            <div class="info-line">
                <span class="label">Fecha:</span>
                <span>${datos.fecha}</span>
            </div>
            <div class="info-line">
                <span class="label">Hora:</span>
                <span>${datos.hora}</span>
            </div>
            <div class="info-line">
                <span class="label">Ciudadano:</span>
                <span style="font-size: 10px;">${datos.ciudadano}</span>
            </div>
            <div class="info-line">
                <span class="label">DNI:</span>
                <span>${datos.dni}</span>
            </div>
            <div class="info-line">
                <span class="label">Sector:</span>
                <span style="font-size: 10px;">${datos.sector}</span>
            </div>
            <div class="info-line">
                <span class="label">Tipo:</span>
                <span>${datos.tipo}</span>
            </div>
            ${datos.prioridad > 0 ? `
            <div class="info-line">
                <span class="label">Prioridad:</span>
                <span style="font-weight: bold;">SÍ</span>
            </div>
            ` : ''}

            <div class="separador">
                --------------------------------
            </div>

            <div class="footer">
                <div>Conserve este turno</div>
                <div>Será llamado por pantalla</div>
                <div style="margin-top: 5px; font-size: 9px;">
                    ${new Date().toLocaleString('es-AR')}
                </div>
            </div>
        </body>
        </html>
        `;
    }
}

export default new ImpresionService();