document.addEventListener('DOMContentLoaded', () => {
            // Mantén animaciones suaves y respetuosas; micro-animación opcional por gráfica

            const navButtons = document.querySelectorAll('.nav-button');
            const contentSections = document.querySelectorAll('.content-section');
            let eCharts = {};
            const prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const Motion = window.motion; // { animate, timeline, stagger }
            const contentArea = document.getElementById('content-area');
            const backToTopButton = document.getElementById('back-to-top');
            const mainNav = document.getElementById('main-nav');
            const themeToggle = document.getElementById('theme-toggle');
            const themePanel = null; // eliminado en modo día/noche

            // Helpers de color/tema y utilidades de charts
            function getThemeColor(varName, fallback) {
                return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || fallback;
            }
            function formatNumber(n) {
                const v = Number(n);
                if (!isFinite(v)) return String(n);
                return v >= 1000 ? new Intl.NumberFormat('es-MX', { notation: 'compact' }).format(v) : v.toString();
            }
            // Chart.js eliminado; toda la visualización usa ECharts.

            // Sistema reducido: sólo día (day) y noche (night)
            function applyTheme(theme) {
                const html = document.documentElement;
                html.setAttribute('data-theme', theme);
                localStorage.setItem('theme', theme);
                // Icono sol/luna
                if (themeToggle) {
                    const iconSpan = themeToggle.querySelector('.icon');
                    if (iconSpan) iconSpan.textContent = theme === 'night' ? '☀️' : '🌙';
                }
                // Meta theme-color (para navegadores móviles)
                const primary600 = getThemeColor('--primary-600', '#0284c7');
                const metaTheme = document.querySelector('meta[name="theme-color"]');
                if (metaTheme) metaTheme.setAttribute('content', primary600);
                try { refreshVisibleCharts(); } catch {}
            }
            // Preferencia persistida; si no existe, arrancamos siempre en modo noche por diseño
            const stored = localStorage.getItem('theme');
            const initial = (stored === 'day' || stored === 'night') ? stored : 'night';
            applyTheme(initial);
            if (themeToggle) {
                themeToggle.addEventListener('click', () => {
                    const current = document.documentElement.getAttribute('data-theme');
                    const next = current === 'night' ? 'day' : 'night';
                    applyTheme(next);
                    if (Motion && !prefersReduce) {
                        try { Motion.animate(themeToggle, { rotate: [0, 180] }, { duration: 0.5, easing: 'ease-in-out' }); } catch {}
                    }
                });
            }

            const proposals = {
                                eje1: [
                                        { id: 'movilidad_inteligente', title: '🚌 Movilidad para Todos',
                                            desc: 'Arranca la micro‑red municipal: 4 eco‑autobuses inteligentes enlazando cabecera y comunidades con rutas confiables, horarios públicos y una app para ver en tiempo real tu unidad. Menos espera, más vida.',
                                            counter: 4, counterLabel: 'Eco‑Autobuses',
                                            details: '<strong>Beneficio:</strong> Puntualidad, seguridad y ahorro en traslados diarios. Rutas estratégicas para San José, Citala, La Puerta y más; integración de paradas seguras iluminadas y monitoreo en línea.<div class="mt-2 text-left text-xs bg-slate-100 p-2 rounded-lg"><p class="font-bold">Ej. Ruta Citala – Teocuitatlán (Piloto):</p><p>L–V: 6:30 • 9:00 • 15:30 • 18:00</p></div><p class="mt-2 text-xs"><em>La app mostrará: ubicación del autobús, tiempo estimado de arribo y nivel de ocupación.</em></p>' },
                    { id: 'plaza_principal', title: '🌟 Plazas y Espacios Dignos', desc: 'Rehabilitación completa de la plaza principal y rescate de los jardines y plazas públicas en todas las comunidades.', chart: 'plaza_calidad_chart', details: '<strong>Beneficio:</strong> Un espacio público de primer nivel en la cabecera y lugares de convivencia seguros y hermosos en cada comunidad para impulsar el orgullo y el comercio local.' },
                    { id: 'calles_para_siempre', title: '🛣️ Calles y Caminos para Siempre', desc: 'Reconstrucción de calles con concreto hidráulico en la cabecera y un programa permanente de rehabilitación de caminos rurales y sacacosechas.', visual: { type: 'progress', label: 'Kilómetros Reconstruidos y Mejorados', value: 100 }, details: '<strong>Beneficio:</strong> Calles sin baches por más de 20 años en la cabecera y caminos rurales transitables todo el año para conectar a nuestras comunidades y apoyar a los productores.' },
                    { id: 'iluminacion_inteligente', title: '💡 Iluminación Total', desc: 'Llevar la red de alumbrado público 100% LED a cada rincón del municipio, incluyendo todas las delegaciones y rancherías.', chart: 'alumbrado', details: '<strong>Beneficio:</strong> Máxima seguridad en cada comunidad con un ahorro superior al 60%, liberando recursos para más obras y servicios para todos.' },
                ],
                eje2: [
                    { id: 'incubadora', title: '🚀 Incubadora de Negocios Itinerante', desc: 'Centro de apoyo con microcréditos y asesoría que visitará periódicamente las comunidades para impulsar el talento local.', chart: 'emprendedores', details: '<strong>Beneficio:</strong> Facilitar la creación de 50+ nuevas empresas en todo el municipio, generando empleos de calidad y diversificando nuestra economía sin que tengas que salir de tu comunidad.' },
                    { id: 'campo_fuerte', title: '🌽 Campo Fuerte y Productivo', desc: 'Apoyo directo a los productores de todas las comunidades con insumos, tecnificación y un centro de valor agregado para sus cosechas.', chart: 'campo', details: '<strong>Beneficio:</strong> Cosechas más rentables y resistentes. Creación del programa "Insumos a Bajo Costo" y acceso a tecnología para reducir costos y aumentar la producción en todo el municipio.' },
                    { id: 'destino_autentico', title: '🏞️ Ruta Turística Comunitaria', desc: 'Creación de una ruta turística que integre las maravillas de nuestras comunidades: gastronomía, artesanías y paisajes.', chart: 'turismo', details: '<strong>Beneficio:</strong> Posicionar a Teocuitatlán y sus comunidades como un destino turístico clave, generando una derrama económica directa para las familias de la zona rural.' },
                    { id: 'mercado_moderno', title: '🛍️ Mercados y Tianguis Dignos', desc: 'Modernizar el mercado municipal y crear "Días de Plaza" semanales en las comunidades más grandes para fomentar el comercio local.', chart: 'mercado_visitantes_chart', details: '<strong>Beneficio:</strong> Un corazón comercial renovado en la cabecera y puntos de venta directos para que los productores de las comunidades ofrezcan sus productos sin intermediarios.' },
                ],
                eje3: [
                    { id: 'policia_proximidad', title: '🛡️ Policía Guardián en tu Comunidad', desc: 'Asignación de patrullas y oficiales fijos para las comunidades más grandes, garantizando vigilancia permanente y reacción inmediata.', chart: 'policia_respuesta', details: '<strong>Beneficio:</strong> Reducción de los tiempos de respuesta a emergencias a menos de 5 minutos en cabecera y presencia constante en comunidades para una paz duradera.' },
                    { id: 'red_vecinal', title: '📲 Red de Alerta Municipal', desc: 'Comunicación directa entre vecinos y policía a través de una app y grupos de WhatsApp por cada comunidad y colonia.', chart: 'vecinos', details: '<strong>Beneficio:</strong> Atención inmediata a reportes ciudadanos y una comunidad organizada para la prevención del delito en todo el municipio.' },
                    { id: 'escudo_urbano', title: '🛰️ Escudo Urbano C5i para Todos', desc: 'Cámaras con IA y arcos lectores de placas en accesos a la cabecera y puntos estratégicos de las comunidades.', visual: { type: 'progress', label: 'Implementación del Escudo Urbano', value: 100 }, details: '<strong>Beneficio:</strong> Un municipio blindado con tecnología de punta para disuadir, identificar y reaccionar eficazmente ante el delito, protegiendo a todas las familias.' },
                    { id: 'justicia_civica', title: '⚖️ Justicia Cívica Itinerante', desc: 'Jueces cívicos visitarán las comunidades para mediar en conflictos vecinales y sancionar faltas que alteran el orden público.', chart: 'justicia_civica_chart', details: '<strong>Beneficio:</strong> Atender los problemas cotidianos que más molestan, fomentando una cultura de respeto y orden en cada rincón del municipio.' },
                ],
                eje4: [
                    { id: 'gobierno_escucha', title: '🏛️ Despacho Itinerante', desc: 'El Presidente y su equipo atenderán directamente en las plazas públicas de las comunidades al menos una vez al mes.', chart: 'despacho_itinerante_chart', details: '<strong>Beneficio:</strong> Un gobierno cercano que resuelve de frente y sin burocracia. Las decisiones se toman escuchando a la gente en su propio entorno.' },
                    { id: 'cuentas_claras', title: '👁️ Cuentas Claras en Tiempo Real', desc: 'Plataforma digital para seguir en vivo el avance y costo de cada obra pública, sea en la cabecera o en las comunidades.', visual: { type: 'progress', label: 'Transparencia en Obras y Gastos', value: 100 }, details: '<strong>Beneficio:</strong> Cero espacio para la corrupción. Vigilancia ciudadana total sobre cada peso del presupuesto, sin importar dónde se invierta.' },
                    { id: 'ventanilla_unica', title: '📱 Trámites sin Vueltas', desc: 'Instalación de quioscos digitales en las delegaciones para realizar trámites y pagos sin necesidad de ir hasta la cabecera.', chart: 'tramites_digitales', details: '<strong>Beneficio:</strong> Adiós a las filas y los gastos de traslado. Un gobierno ágil que te ahorra tiempo y dinero, al alcance de todos.' },
                    { id: 'servicios_publicos', title: '🛠️ Reporta y Listo (072)', desc: 'Una app y línea directa con cobertura total para reportar fallas en servicios públicos desde cualquier punto del municipio.', chart: 'servicios_publicos_chart', details: '<strong>Beneficio:</strong> Un gobierno que responde con rapidez y eficiencia a tus necesidades más básicas, con seguimiento transparente de tu reporte, vivas donde vivas.' },
                ],
                eje5: [
                    { id: 'brigadas_salud', title: '❤️ Salud en tu Comunidad', desc: 'Brigadas médicas móviles permanentes que llevarán consultas, medicinas y detecciones a todas las delegaciones y barrios.', chart: 'brigadas_chart', details: '<strong>Beneficio:</strong> Atención médica de calidad y gratuita en la puerta de tu casa, especialmente para nuestros adultos mayores, niños y mujeres.' },
                    { id: 'guerra_dengue', title: '🦟 Guardianes contra el Dengue', desc: 'Programa permanente de prevención en todo el municipio, con participación ciudadana y nebulización estratégica en cabecera y comunidades.', chart: 'dengue_chart', details: '<strong>Beneficio:</strong> Reducción drástica de los casos de dengue, zika y chikungunya, protegiendo la salud de todas las familias por igual.' },
                    { id: 'bienestar_juvenil', title: '🧠 Centro de Bienestar Juvenil', desc: 'Espacio para jóvenes con apoyo psicológico, talleres y prevención de adicciones, con transporte desde las comunidades.', visual: { type: 'progress', label: 'Jóvenes Atendidos y Protegidos', value: 100 }, details: '<strong>Beneficio:</strong> Ofrecer alternativas saludables y apoyo profesional a nuestros jóvenes de todo el municipio para construir un futuro libre de adicciones.' },
                    { id: 'casa_de_dia', title: '👵🏻 Cuidado y Cariño para Nuestros Mayores', desc: 'Creación de la Casa de Día y un programa de transporte para que los adultos mayores de las comunidades puedan asistir.', chart: 'adultos_mayores_chart', details: '<strong>Beneficio:</strong> Mejorar la calidad de vida de los adultos mayores de todo el municipio, brindándoles un lugar de pertenencia, cuidado y socialización.' },
                ],
                eje6: [
                    { id: 'parque_solar', title: '☀️ Revolución Energética para Todos', desc: 'Construcción de un parque solar municipal para reducir el costo de la luz en los hogares de la cabecera y las comunidades.', chart: 'parque_solar_chart', details: '<strong>Beneficio:</strong> Ahorro significativo en el recibo de luz de cada familia y comercio, y un municipio líder en energías renovables.' },
                    { id: 'cosecha_agua', title: '💧 Agua para el Futuro en Cada Casa', desc: 'Programa de instalación de sistemas de captación de lluvia en todo el municipio, con subsidios para las familias de las comunidades.', chart: 'cosecha_agua_chart', details: '<strong>Beneficio:</strong> Reducir la dependencia de fuentes externas de agua y promover una cultura de cuidado del recurso hídrico en cada hogar.' },
                    { id: 'basura_cero', title: '♻️ Comunidades Limpias: Basura Cero', desc: 'Modernización del sistema de recolección para garantizar el servicio en todas las comunidades y programa de compostaje regional.', chart: 'basura_cero_chart', details: '<strong>Beneficio:</strong> Un municipio más limpio, con rutas de recolección eficientes para todos y la transformación de la basura en un recurso valioso.' },
                    { id: 'reforestacion_masiva', title: '🌳 Teocuitatlán Verde: Pulmón Regional', desc: 'Programa masivo de reforestación con la participación activa de las comunidades para recuperar nuestros bosques y ríos.', chart: 'reforestacion_chart', details: '<strong>Beneficio:</strong> Mejorar la calidad del aire, aumentar la captación de agua y crear un entorno más saludable con el liderazgo de quienes cuidan la tierra.' },
                ],
                eje7: [
                    { id: 'unidad_deportiva', title: '🏟️ Unidad Deportiva de Primer Nivel', desc: 'Renovación total de la unidad deportiva y un programa de transporte para que los equipos de las comunidades puedan utilizarla.', visual: { type: 'progress', label: 'Modernización de la Unidad Deportiva', value: 100 }, details: '<strong>Beneficio:</strong> Un espacio digno para todos nuestros atletas, fomentando el deporte de alto rendimiento y la integración municipal.' },
                    { id: 'ciclovia', title: '🚴 Rutas Recreativas Comunitarias', desc: 'Construcción de una ciclovía en la cabecera y rehabilitación de caminos rurales para crear circuitos seguros para correr y andar en bici.', visual: { type: 'progress', label: 'Kilómetros de Rutas Seguras', value: 100 }, details: '<strong>Beneficio:</strong> Espacios seguros para el deporte en todo el municipio, fomentando un estilo de vida saludable para todas las edades.' },
                    { id: 'espacios_activos', title: '🏀 Cancha Digna en tu Comunidad', desc: 'Rehabilitación integral de todas las canchas y espacios deportivos en cada delegación y ranchería del municipio.', chart: 'canchas_rehabilitadas_chart', details: '<strong>Beneficio:</strong> Deporte de calidad y accesible en cada rincón del municipio, promoviendo la salud y la convivencia familiar donde vives.' },
                    { id: 'semillero_campeones', title: '🏆 Semillero de Campeones', desc: 'Creación de Ligas Municipales y un programa de visorías para detectar y becar a los talentos deportivos de nuestras comunidades.', chart: 'semillero_campeones_chart', details: '<strong>Beneficio:</strong> Apoyo real para que nuestros talentos deportivos, sin importar dónde nazcan, puedan desarrollarse y poner en alto el nombre de Teocuitatlán.' },
                ]
            };
            
            // Texto alternativo para describir gráficas a lectores de pantalla
            function getChartAltText(type) {
                switch (type) {
                    case 'alumbrado': return 'Gráfico de dona de una sola sección que comunica la meta de 100 por ciento de cobertura de alumbrado LED.';
                    case 'plaza_calidad_chart': return 'Gráfico de barras que compara la calidad del espacio público antes y después de la rehabilitación.';
                    case 'agua': return 'Gráfico de línea que muestra la reducción proyectada de fugas de agua a lo largo de tres años.';
                    case 'emprendedores': return 'Gráfico de barras que muestra el crecimiento de nuevas empresas por año.';
                    case 'campo': return 'Gráfico de barras que compara ingresos actuales frente a ingresos propuestos para productores.';
                    case 'turismo': return 'Gráfico de línea que refleja el aumento de visitantes a lo largo del tiempo.';
                    case 'mercado_visitantes_chart': return 'Gráfico de barras que compara visitantes semanales antes y después de la modernización del mercado.';
                    case 'policia_respuesta': return 'Gráfico de barras que compara tiempos de respuesta policial actuales y propuestos en minutos.';
                    case 'vecinos': return 'Gráfico de dona que señala la meta de cien por ciento de colonias conectadas a la red de alerta municipal.';
                    case 'justicia_civica_chart': return 'Gráfico de dona que indica el porcentaje objetivo de quejas atendidas frente a pendientes.';
                    case 'presupuesto_participativo': return 'Gráfico de dona que representa la proporción del presupuesto decidido por ciudadanos.';
                    case 'despacho_itinerante_chart': return 'Gráfico de dona que representa la meta de comunidades atendidas mensualmente.';
                    case 'tramites_digitales': return 'Gráfico de barras que muestra la reducción del tiempo de atención de trámites en horas.';
                    case 'servicios_publicos_chart': return 'Gráfico de barras que muestra la mejora en tiempos de atención de reportes de servicios públicos en días.';
                    case 'brigadas_chart': return 'Gráfico de barras que muestra el número de consultas médicas realizadas por año.';
                    case 'dengue_chart': return 'Gráfico de línea que muestra la disminución proyectada de casos de dengue.';
                    case 'adultos_mayores_chart': return 'Gráfico de dona que muestra la meta de atención al cien por ciento de personas adultas mayores inscritas.';
                    case 'parque_solar_chart': return 'Gráfico de barras que compara el costo de electricidad actual contra el costo con apoyo solar.';
                    case 'cosecha_agua_chart': return 'Gráfico de línea que muestra la reducción de dependencia hídrica externa a lo largo del tiempo.';
                    case 'basura_cero_chart': return 'Gráfico de dona que muestra la proporción de residuos reciclados o compostados frente a los llevados a relleno sanitario.';
                    case 'reforestacion_chart': return 'Gráfico de barras que muestra la cantidad de árboles plantados por año.';
                    case 'canchas_rehabilitadas_chart': return 'Gráfico de dona que comunica la meta de rehabilitar el cien por ciento de las canchas y espacios deportivos.';
                    case 'semillero_campeones_chart': return 'Gráfico de barras que muestra el número de atletas apoyados por año.';
                    default: return 'Gráfico informativo relacionado con la propuesta.';
                }
            }

            function createCard(proposal, isFeatured = false) {
                const chartHtml = proposal.chart ? `<div class="chart-container mt-4"><canvas id="canvas-${proposal.id}" data-chart-config="${proposal.chart}"></canvas></div>` : '';
                const counterHtml = proposal.counter ? (() => {
                    const label = proposal.counterLabel || 'Beneficiarios';
                    return `<div class="text-center my-4"><div class="text-7xl font-extrabold brand-counter" data-target="${proposal.counter}">0</div><p class="font-bold text-xl mt-2 font-title">${label}</p></div>`;
                })() : '';
                const visualHtml = proposal.visual ? `<div class="mt-4 text-center"><p class="font-bold text-stone-700">${proposal.visual.label}</p><div class="progress-bar-container"><div class="progress-bar" data-value="${proposal.visual.value}"></div></div></div>` : '';

                const cardFooter = (proposalId) => `
                    <div class="mt-6 pt-4 border-t border-gray-200">
                        <button class="toggle-details inline-flex items-center gap-2 text-sm font-bold brand-link self-start" aria-expanded="false" aria-controls="details-${proposalId}">
                            <span class="label">Ver más</span>
                            <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path d="M6 4l8 6-8 6V4z"></path>
                            </svg>
                        </button>
                    </div>
                `;

                if (isFeatured) {
                    return `
                        <div id="card-${proposal.id}" class="proposal-card w-full p-8 rounded-2xl shadow-lg flex flex-col md:flex-row gap-8" data-aos="fade-right" data-aos-delay="300">
                            <div class="md:w-1/2">
                                <h3 class="font-bold text-3xl text-stone-800 mb-4">${proposal.title}</h3>
                                <p class="text-stone-600 text-base">${proposal.desc}</p>
                <div id="details-${proposal.id}" class="details-content mt-4 border-t border-gray-200">
                                    <p class="text-sm text-stone-700">${proposal.details}</p>
                                </div>
                ${cardFooter(proposal.id)}
                            </div>
                            <div class="md:w-1/2 flex items-center justify-center">
                                ${counterHtml}${chartHtml}${visualHtml}
                            </div>
                        </div>
                    `;
                }

                return `
                    <div id="card-${proposal.id}" class="proposal-card p-6 rounded-2xl shadow-lg flex flex-col" data-aos="fade-up">
                        <h3 class="font-bold text-2xl text-stone-800 mb-4">${proposal.title}</h3>
                        <p class="text-stone-600 flex-grow text-sm">${proposal.desc}</p>
                        ${counterHtml}${chartHtml}${visualHtml}
            <div id="details-${proposal.id}" class="details-content mt-4 border-t border-gray-200">
                            <p class="text-sm text-stone-700">${proposal.details}</p>
                        </div>
            ${cardFooter(proposal.id)}
                    </div>
                `;
            }

            function animateCounter(element) {
                const target = Number(element.dataset.target) || 0;
                try {
                    if (window.countUp && window.countUp.CountUp) {
                        const cu = new window.countUp.CountUp(element, target, { duration: 1.2, separator: ',', useEasing: true });
                        if (!cu.error) { cu.start(); return; }
                    }
                } catch { /* noop */ }
                // Fallback simple
                let current = 0; const increment = Math.max(1, Math.ceil(target / 60));
                const interval = setInterval(() => {
                    current += increment;
                    if (current >= target) { current = target; clearInterval(interval); }
                    element.textContent = current.toString();
                }, 16);
            }
            
            function animateProgressBar(bar) {
                if (!bar) return;
                const value = bar.dataset.value;
                setTimeout(() => { bar.style.width = `${value}%`; }, 200);
            }

            function renderCards(targetId) {
                const section = document.getElementById(targetId); if (!section) return;
                const featuredContainer = section.querySelector('.featured-container');
                const grid = section.querySelector('.grid'); 
                if (!grid || !proposals[targetId]) return;

                const [featuredProposal, ...otherProposals] = proposals[targetId];
                
                if (featuredProposal && featuredContainer) {
                    featuredContainer.innerHTML = createCard(featuredProposal, true);
                }
                
                grid.innerHTML = otherProposals.map(p => createCard(p, false)).join('');
                
                const allCards = section.querySelectorAll('.proposal-card');
                allCards.forEach((card, index) => { card.style.animationDelay = `${index * 100}ms`; });
                
                allCards.forEach(card => {
                    const btn = card.querySelector('.toggle-details');
                    if (!btn) return;
                    btn.addEventListener('click', (e) => {
                        const button = e.currentTarget;
                        const cardEl = button.closest('.proposal-card');
                        const details = cardEl.querySelector('.details-content');
                        const icon = button.querySelector('svg');
                        const label = button.querySelector('.label');
                        const willExpand = !details.classList.contains('expanded');

                        details.classList.toggle('expanded', willExpand);
                        button.setAttribute('aria-expanded', willExpand ? 'true' : 'false');
                        if (label) label.textContent = willExpand ? 'Ver menos' : 'Ver más';
                        if (icon) icon.classList.toggle('rotated', willExpand);

                        if (willExpand) {
                            const rect = cardEl.getBoundingClientRect();
                            const overflowDown = rect.bottom > window.innerHeight;
                            const overflowUp = rect.top < 0;
                            if (overflowDown || overflowUp) {
                                cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                            }
                        }
                    });
                });
            }

            function activateSection(targetId, isInitialLoad = false) {
                Object.values(eCharts).forEach(inst => { try { inst.dispose && inst.dispose(); } catch {} });
                eCharts = {};

                contentSections.forEach(section => {
                    const isActive = section.id === targetId;
                    section.classList.toggle('active', isActive);
                    section.hidden = !isActive;
                });
                navButtons.forEach(button => {
                    const isActive = button.dataset.target === targetId;
                    button.classList.toggle('active', isActive);
                    button.setAttribute('aria-selected', isActive ? 'true' : 'false');
                    button.setAttribute('tabindex', isActive ? '0' : '-1');
                });
                
                if (targetId) {
                    renderCards(targetId);
                    setTimeout(() => {
                        if (proposals[targetId]) {
                            proposals[targetId].forEach(p => {
                                if (p.chart) {
                                    const canvas = document.getElementById(`canvas-${p.id}`);
                                    if (canvas) {
                                        // Atributos ARIA y descripción para lectores de pantalla
                                        canvas.setAttribute('role', 'img');
                                        const descId = `chart-desc-${p.id}`;
                                        let descEl = document.getElementById(descId);
                                        if (!descEl) {
                                            descEl = document.createElement('p');
                                            descEl.id = descId;
                                            descEl.className = 'sr-only';
                                            const host = canvas.parentElement || canvas;
                                            host.appendChild(descEl);
                                        }
                                        descEl.textContent = getChartAltText(p.chart);
                                        canvas.setAttribute('aria-describedby', descId);
                                        createChart(canvas);
                                    }
                                }
                                if (p.counter) { const el = document.querySelector(`#card-${p.id} [data-target="${p.counter}"]`); if(el) animateCounter(el); }
                                if (p.visual && p.visual.type === 'progress') { 
                                    const cardEl = document.getElementById(`card-${p.id}`);
                                    if (cardEl) {
                                        const progressBar = cardEl.querySelector('.progress-bar');
                                        if (progressBar) animateProgressBar(progressBar);
                                    }
                                }
                            });
                        }
                        if (!isInitialLoad) {
                            contentArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }, 100);
                }
            }

            // Re-render de todos los canvases visibles (cuando cambia el tema)
            function refreshVisibleCharts() {
                const activeSection = document.querySelector('.content-section.active');
                if (!activeSection) return;
                const canvases = activeSection.querySelectorAll('canvas[data-chart-config]');
                canvases.forEach((canvas) => {
                    const id = canvas.id;
                    try { if (eCharts[id]) { eCharts[id].dispose(); delete eCharts[id]; } } catch {}
                    createChart(canvas);
                });
            }

            // Helpers para usar ECharts dentro del mismo wrapper del canvas
            function ensureEContainer(canvas, height = '320px') {
                const host = canvas.parentElement || canvas;
                const containerId = `echart-${canvas.id}`;
                let container = host.querySelector(`#${containerId}`);
                if (!container) {
                    container = document.createElement('div');
                    container.id = containerId;
                    container.style.width = '100%';
                    container.style.height = height;
                    // Copiar atributos ARIA al contenedor para accesibilidad
                    const ariaDesc = canvas.getAttribute('aria-describedby');
                    container.setAttribute('role', 'img');
                    if (ariaDesc) container.setAttribute('aria-describedby', ariaDesc);
                    // Ocultar canvas original para evitar solapado
                    canvas.style.display = 'none';
                    host.appendChild(container);
                }
                return container;
            }
            function initEChart(container) {
                return window.echarts.init(container, null, { renderer: 'svg' });
            }

            function createChart(canvas) {
                if (!canvas) return;
                const type = canvas.dataset.chartConfig;
                const chartId = canvas.id;
                if (eCharts[chartId] && typeof eCharts[chartId].dispose === 'function') {
                    eCharts[chartId].dispose();
                }
                
                const prefersReduceAnim = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                const primary = getThemeColor('--primary-500', '#8b5cf6');
                const primarySoft = getThemeColor('--primary-400', '#a78bfa');
                const primaryDark = getThemeColor('--primary-700', '#6d28d9');
                const isNight = document.documentElement.getAttribute('data-theme') === 'night';
                const titleColor = isNight ? getThemeColor('--text-strong', '#e6edf3') : '#44403c';
                const axisColor = isNight ? getThemeColor('--text-muted', '#8ea2b5') : '#6b7280';
                const gridLine = isNight ? 'rgba(255,255,255,0.08)' : '#e5e7eb';
                const barBase = isNight ? '#94a3b8' : '#9ca3af';

                // Piloto: usar ECharts (renderer SVG) para 'alumbrado'
                if (type === 'alumbrado' && window.echarts) {
                    // Reemplazar canvas por un contenedor ECharts dentro del mismo wrapper
                    const container = ensureEContainer(canvas, '300px');
                    const prefersReduceAnim = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                    const chart = initEChart(container);
                    const option = {
                        title: { text: 'Meta: 100% Cobertura LED', left: 'center', top: 10, textStyle: { fontFamily: 'Poppins', fontSize: 14, fontWeight: 'bold', color: titleColor } },
                        animation: !prefersReduceAnim,
                        animationDuration: 700,
                        animationEasing: 'cubicOut',
                        tooltip: { show: false },
                        legend: { show: false },
                        graphic: !prefersReduceAnim ? {
                            elements: [{
                                type: 'text', left: 'center', top: 'middle',
                                style: { text: '100%', fontFamily: 'Poppins', fontSize: 22, fontWeight: 'bold', fill: primary },
                                keyframeAnimation: {
                                    duration: 600, delay: 200, loop: false,
                                    keyframes: [
                                        { percent: 0, style: { opacity: 0 }, scaleX: 0.95, scaleY: 0.95 },
                                        { percent: 1, style: { opacity: 1 }, scaleX: 1, scaleY: 1 }
                                    ]
                                }
                            }]
                        } : undefined,
                        series: [{
                            type: 'pie',
                            radius: ['50%', '70%'],
                            center: ['50%', '50%'],
                            animationType: 'expansion',
                            animationDuration: 900,
                            animationEasing: 'cubicOut',
                            avoidLabelOverlap: false,
                            label: { show: false },
                            labelLine: { show: false },
                            emphasis: { disabled: true },
                            data: [
                                { value: 100, name: 'LED', itemStyle: { color: primary } },
                                { value: 0, name: 'Pendiente', itemStyle: { color: '#e5e7eb' } }
                            ]
                        }]
                    };
                    chart.setOption(option);
                    eCharts[chartId] = chart;
                    // Micro-animación del contenedor al aparecer (no loop)
                    if (Motion && !prefersReduceAnim) {
                        try { Motion.animate(container, { opacity: [0, 1], transform: ['scale(0.985)', 'scale(1)'] }, { duration: 0.22, easing: 'ease-out' }); } catch {}
                    }
                    return;
                }

                switch (type) {
                    case 'alumbrado': {
                        // Ya cubierto arriba con ECharts
                        break;
                    }
                    case 'mercado_visitantes_chart':
                        if (window.echarts) {
                const container2 = ensureEContainer(canvas, '320px');
                            const prefersReduceAnim2 = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                const ec2 = initEChart(container2);
                            const option2 = {
                                title: { text: 'Aumento de Visitantes al Mercado', left: 'center', top: 8, textStyle: { fontFamily: 'Poppins', fontSize: 14, fontWeight: 'bold', color: titleColor } },
                                animation: !prefersReduceAnim2,
                                animationDuration: 700,
                                animationDurationUpdate: 500,
                                animationEasing: 'cubicOut',
                                animationEasingUpdate: 'cubicOut',
                                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                                legend: { show: true, bottom: 0, textStyle: { color: axisColor, fontFamily: 'Lato' } },
                                grid: { left: 40, right: 16, top: (window.innerWidth <= 640 ? 64 : 72), bottom: (window.innerWidth <= 640 ? 56 : 56) },
                                xAxis: { type: 'category', data: ['Visitantes Semanales'], axisLabel: { color: axisColor }, axisTick: { show: false }, axisLine: { lineStyle: { color: gridLine } } },
                                yAxis: { type: 'value', axisLabel: { color: axisColor }, splitLine: { lineStyle: { color: gridLine } } },
                                series: [
                                    { name: 'Antes', type: 'bar', data: [500], itemStyle: { color: barBase, borderRadius: [4,4,0,0] }, animationDelay: (idx) => 120 },
                                    { name: 'Después', type: 'bar', data: [1500], itemStyle: { color: primary, borderRadius: [4,4,0,0] }, animationDelay: (idx) => 220 }
                                ]
                            };
                            ec2.setOption(option2);
                            eCharts[chartId] = ec2;
                            if (Motion && !prefersReduceAnim2) {
                                try { Motion.animate(container2, { opacity: [0, 1], transform: ['translateY(6px)', 'translateY(0)'] }, { duration: 0.26, easing: 'ease-out' }); } catch {}
                            }
                            return;
                        }
                        break;
                    case 'plaza_calidad_chart':
                        if (window.echarts) {
                            const c = ensureEContainer(canvas, '320px');
                            const ec = initEChart(c);
                            const opts = {
                                title: { text: 'Mejora del Espacio Público', left: 'center', top: 8, textStyle: { fontFamily: 'Poppins', fontSize: 14, fontWeight: 'bold', color: titleColor } },
                                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                                grid: { left: 40, right: 16, top: (window.innerWidth <= 640 ? 60 : 68), bottom: (window.innerWidth <= 640 ? 52 : 40) },
                                xAxis: { type: 'category', data: ['Antes', 'Después'], axisLabel: { color: axisColor }, axisTick: { show: false }, axisLine: { lineStyle: { color: gridLine } } },
                                yAxis: { type: 'value', max: 100, axisLabel: { color: axisColor }, splitLine: { lineStyle: { color: gridLine } } },
                                series: [{ type: 'bar', data: [40, 95], itemStyle: { color: (p) => p.dataIndex === 0 ? '#9ca3af' : primary, borderRadius: [6,6,0,0] } }]
                            };
                            ec.setOption(opts); eCharts[chartId] = ec; return;
                        }
                        break;
                    case 'agua':
                        if (window.echarts) {
                            const c = ensureEContainer(canvas, '320px');
                            const ec = initEChart(c);
                            const opts = {
                                title: { text: 'Reducción de Fugas (%)', left: 'center', top: 8, textStyle: { fontFamily: 'Poppins', fontSize: 14, fontWeight: 'bold', color: titleColor } },
                                tooltip: { trigger: 'axis' },
                                grid: { left: 40, right: 16, top: (window.innerWidth <= 640 ? 60 : 68), bottom: (window.innerWidth <= 640 ? 52 : 40) },
                                xAxis: { type: 'category', data: ['Año 0','1','2','3'], boundaryGap: false, axisLabel: { color: axisColor }, axisLine: { lineStyle: { color: gridLine } } },
                                yAxis: { type: 'value', min: 0, axisLabel: { color: axisColor }, splitLine: { lineStyle: { color: gridLine } } },
                                series: [{ name: 'Fugas', type: 'line', smooth: true, data: [40,30,15,5], lineStyle: { width: 2.5, color: '#fb923c' }, areaStyle: { color: 'rgba(251,146,60,0.18)' }, symbol: 'circle', symbolSize: 8, itemStyle: { color: '#fb923c' } }]
                            };
                            ec.setOption(opts); eCharts[chartId] = ec; return;
                        }
                        break;
                    case 'emprendedores':
                        if (window.echarts) {
                            const c = ensureEContainer(canvas, '320px');
                            const ec = initEChart(c);
                            const opts = {
                                title: { text: 'Nuevas Empresas Creadas', left: 'center', top: 8, textStyle: { fontFamily: 'Poppins', fontSize: 14, fontWeight: 'bold', color: titleColor } },
                                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                                grid: { left: 40, right: 16, top: (window.innerWidth <= 640 ? 60 : 68), bottom: (window.innerWidth <= 640 ? 52 : 40) },
                                xAxis: { type: 'category', data: ['Año 1','Año 2','Año 3'], axisLabel: { color: axisColor }, axisTick: { show: false }, axisLine: { lineStyle: { color: gridLine } } },
                                yAxis: { type: 'value', axisLabel: { color: axisColor }, splitLine: { lineStyle: { color: gridLine } } },
                                series: [{ type: 'bar', data: [15,35,50], itemStyle: { color: '#f59e0b', borderRadius: [8,8,0,0] } }]
                            };
                            ec.setOption(opts); eCharts[chartId] = ec; return;
                        }
                        break;
                    case 'campo':
                        if (window.echarts) {
                            const c = ensureEContainer(canvas, '320px');
                            const ec = initEChart(c);
                            const opts = {
                                title: { text: 'Aumento de Rentabilidad', left: 'center', top: 8, textStyle: { fontFamily: 'Poppins', fontSize: 14, fontWeight: 'bold', color: titleColor } },
                                animation: !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches),
                                animationDuration: 700,
                                animationDurationUpdate: 500,
                                animationEasing: 'cubicOut',
                                animationEasingUpdate: 'cubicOut',
                                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                                legend: { show: true, bottom: 0, textStyle: { color: axisColor, fontFamily: 'Lato' } },
                                grid: { left: 40, right: 16, top: (window.innerWidth <= 640 ? 64 : 72), bottom: (window.innerWidth <= 640 ? 56 : 56) },
                                xAxis: { type: 'category', data: ['Ingreso Mensual'], axisLabel: { color: axisColor }, axisTick: { show: false }, axisLine: { lineStyle: { color: gridLine } } },
                                yAxis: { type: 'value', axisLabel: { color: axisColor }, splitLine: { lineStyle: { color: gridLine } } },
                                series: [
                                    { name: 'Antes', type: 'bar', data: [100], itemStyle: { color: '#6b7280', borderRadius: [4,4,0,0] }, animationDelay: (idx) => 120 },
                                    { name: 'Después', type: 'bar', data: [150], itemStyle: { color: primary, borderRadius: [4,4,0,0] }, animationDelay: (idx) => 220 }
                                ]
                            };
                            ec.setOption(opts); eCharts[chartId] = ec; return;
                        }
                        break;
                    case 'turismo':
                        if (window.echarts) {
                            const c = ensureEContainer(canvas, '320px');
                            const ec = initEChart(c);
                            const opts = {
                                title: { text: 'Crecimiento Exponencial de Visitantes', left: 'center', top: 8, textStyle: { fontFamily: 'Poppins', fontSize: 14, fontWeight: 'bold', color: titleColor } },
                                tooltip: { trigger: 'axis' },
                                grid: { left: 40, right: 16, top: (window.innerWidth <= 640 ? 60 : 68), bottom: (window.innerWidth <= 640 ? 52 : 40) },
                                xAxis: { type: 'category', data: ['Año 0','1','2','3'], boundaryGap: false, axisLabel: { color: axisColor }, axisLine: { lineStyle: { color: gridLine } } },
                                yAxis: { type: 'value', axisLabel: { color: axisColor }, splitLine: { lineStyle: { color: gridLine } } },
                                series: [{ name: 'Visitantes', type: 'line', smooth: true, data: [1000,2500,4500,7000], lineStyle: { width: 2.5, color: primary }, areaStyle: { color: `${primarySoft}55` }, symbol: 'circle', symbolSize: 8, itemStyle: { color: primary } }]
                            };
                            ec.setOption(opts); eCharts[chartId] = ec; return;
                        }
                        break;
                    case 'policia_respuesta':
                        if (window.echarts) {
                            const c = ensureEContainer(canvas, '320px');
                            const ec = initEChart(c);
                            const opts = {
                                title: { text: 'Reducción Tiempo de Respuesta', left: 'center', top: 8, textStyle: { fontFamily: 'Poppins', fontSize: 14, fontWeight: 'bold', color: titleColor } },
                                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                                grid: { left: 40, right: 16, top: (window.innerWidth <= 640 ? 60 : 68), bottom: (window.innerWidth <= 640 ? 52 : 40) },
                                xAxis: { type: 'category', data: ['Actual','Propuesta'], axisLabel: { color: axisColor }, axisTick: { show: false }, axisLine: { lineStyle: { color: gridLine } } },
                                yAxis: { type: 'value', axisLabel: { color: axisColor } },
                                series: [{ type: 'bar', data: [15,5], itemStyle: { color: (p)=> p.dataIndex===0? '#6b7280' : primary, borderRadius: [6,6,0,0] } }]
                            };
                            ec.setOption(opts); eCharts[chartId] = ec; return;
                        }
                        break;
                    case 'vecinos': {
                        if (window.echarts) {
                            const c = ensureEContainer(canvas, '300px');
                            const ec = initEChart(c);
                            const opts = {
                                title: { text: 'Red de Alerta Municipal: 100% Cobertura', left: 'center', top: 10, textStyle: { fontFamily: 'Poppins', fontSize: 14, fontWeight: 'bold', color: titleColor } },
                                tooltip: { show: false },
                                legend: { show: false },
                                graphic: { elements: [{ type: 'text', left: 'center', top: 'middle', style: { text: '100%', fontFamily: 'Poppins', fontWeight: 'bold', fontSize: 22, fill: primary } }] },
                                series: [{ type: 'pie', radius: ['50%','70%'], center: ['50%', (window.innerWidth <= 640 ? '48%' : '50%')], avoidLabelOverlap: false, label: { show: false }, labelLine: { show: false }, data: [{ value: 100, name: 'Conectadas', itemStyle: { color: primary } }, { value: 0, name: 'Pendientes', itemStyle: { color: '#e5e7eb' } }] }]
                            };
                            ec.setOption(opts); eCharts[chartId] = ec; return;
                        }
                        break;
                    }
                    case 'justicia_civica_chart': {
                        if (window.echarts) {
                            const c = ensureEContainer(canvas, '300px');
                            const ec = initEChart(c);
                            const amber = '#f59e0b';
                            const opts = {
                                title: { text: 'Justicia Cívica Itinerante: 95% Quejas Resueltas', left: 'center', top: 10, textStyle: { fontFamily: 'Poppins', fontSize: 14, fontWeight: 'bold', color: titleColor } },
                                tooltip: { show: false },
                                legend: { show: false },
                                graphic: { elements: [{ type: 'text', left: 'center', top: 'middle', style: { text: '95%', fontFamily: 'Poppins', fontWeight: 'bold', fontSize: 22, fill: amber } }] },
                                series: [{ type: 'pie', radius: ['50%','70%'], center: ['50%', (window.innerWidth <= 640 ? '48%' : '50%')], avoidLabelOverlap: false, label: { show: false }, labelLine: { show: false }, data: [{ value: 95, name: 'Atendidas', itemStyle: { color: amber } }, { value: 5, name: 'Pendientes', itemStyle: { color: '#e5e7eb' } }] }]
                            };
                            ec.setOption(opts); eCharts[chartId] = ec; return;
                        }
                        break;
                    }
                    case 'presupuesto_participativo':
                        if (window.echarts) {
                            const c = ensureEContainer(canvas, '300px');
                            const ec = initEChart(c);
                            const amber = '#f59e0b';
                            const opts = {
                                title: { text: 'Presupuesto Participativo: 20% Ciudadano', left: 'center', top: 10, textStyle: { fontFamily: 'Poppins', fontSize: 14, fontWeight: 'bold', color: titleColor } },
                                tooltip: { show: true, formatter: '{b}: {c}%' }, legend: { show: false },
                                series: [{ type: 'pie', radius: ['40%','70%'], center: ['50%','50%'], label: { formatter: '{b}: {d}%' }, data: [{ value: 20, name: 'Decidido por Ciudadanos', itemStyle: { color: amber } }, { value: 80, name: 'Presupuesto Regular', itemStyle: { color: '#e5e7eb' } }] }]
                            };
                            ec.setOption(opts); eCharts[chartId] = ec; return;
                        }
                        break;
                    case 'despacho_itinerante_chart': {
                        if (window.echarts) {
                            const c = ensureEContainer(canvas, '300px');
                            const ec = initEChart(c);
                            const amber = '#f59e0b';
                            const opts = {
                                title: { text: 'Meta: 100% Comunidades Atendidas (Mensual)', left: 'center', top: 10, textStyle: { fontFamily: 'Poppins', fontSize: 14, fontWeight: 'bold', color: titleColor } },
                                tooltip: { show: false }, legend: { show: false },
                                graphic: { elements: [{ type: 'text', left: 'center', top: 'middle', style: { text: '100%', fontFamily: 'Poppins', fontWeight: 'bold', fontSize: 22, fill: amber } }] },
                                series: [{ type: 'pie', radius: ['50%','70%'], center: ['50%', (window.innerWidth <= 640 ? '48%' : '50%')], avoidLabelOverlap: false, label: { show: false }, labelLine: { show: false }, data: [{ value: 100, name: 'Atendidas', itemStyle: { color: amber } }, { value: 0, name: 'Pendientes', itemStyle: { color: '#e5e7eb' } }] }]
                            };
                            ec.setOption(opts); eCharts[chartId] = ec; return;
                        }
                        break;
                    }
                    case 'tramites_digitales':
                        if (window.echarts) {
                            const c = ensureEContainer(canvas, '320px');
                            const ec = initEChart(c);
                            const opts = {
                                title: { text: 'Reducción Drástica de Tiempos', left: 'center', top: 8, textStyle: { fontFamily: 'Poppins', fontSize: 14, fontWeight: 'bold', color: titleColor } },
                                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                                grid: { left: 40, right: 16, top: 56, bottom: (window.innerWidth <= 640 ? 52 : 40) },
                                xAxis: { type: 'category', data: ['Antes','Ahora'], axisLabel: { color: axisColor }, axisTick: { show: false }, axisLine: { lineStyle: { color: gridLine } } },
                                yAxis: { type: 'value', axisLabel: { color: axisColor }, splitLine: { lineStyle: { color: gridLine } } },
                                series: [{ type: 'bar', data: [4,0.25], itemStyle: { color: (p)=> p.dataIndex===0? '#9ca3af' : primary, borderRadius: [8,8,0,0] } }]
                            };
                            ec.setOption(opts); eCharts[chartId] = ec; return;
                        }
                        break;
                    case 'servicios_publicos_chart':
                        if (window.echarts) {
                            const c = ensureEContainer(canvas, '320px');
                            const ec = initEChart(c);
                            const opts = {
                                title: { text: 'Respuesta Rápida a Reportes', left: 'center', top: 8, textStyle: { fontFamily: 'Poppins', fontSize: 14, fontWeight: 'bold', color: titleColor } },
                                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                                grid: { left: 40, right: 16, top: (window.innerWidth <= 640 ? 64 : 72), bottom: (window.innerWidth <= 640 ? 56 : 44) },
                                xAxis: { type: 'category', data: ['Antes','Ahora'], axisLabel: { color: axisColor }, axisTick: { show: false }, axisLine: { lineStyle: { color: gridLine } } },
                                yAxis: { type: 'value', axisLabel: { color: axisColor }, splitLine: { lineStyle: { color: gridLine } } },
                                series: [{ type: 'bar', data: [15,3], itemStyle: { color: (p)=> p.dataIndex===0? '#9ca3af' : primary, borderRadius: [8,8,0,0] } }]
                            };
                            ec.setOption(opts); eCharts[chartId] = ec; return;
                        }
                        break;
                    case 'brigadas_chart':
                        if (window.echarts) {
                            const c = ensureEContainer(canvas, '320px');
                            const ec = initEChart(c);
                            const opts = {
                                title: { text: 'Consultas Médicas Gratuitas', left: 'center', top: 8, textStyle: { fontFamily: 'Poppins', fontSize: 14, fontWeight: 'bold', color: titleColor } },
                                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                                grid: { left: 40, right: 16, top: (window.innerWidth <= 640 ? 60 : 68), bottom: 40 },
                                xAxis: { type: 'category', data: ['Año 1','Año 2','Año 3'], axisLabel: { color: axisColor }, axisTick: { show: false }, axisLine: { lineStyle: { color: gridLine } } },
                                yAxis: { type: 'value', axisLabel: { color: axisColor }, splitLine: { lineStyle: { color: gridLine } } },
                                series: [{ type: 'bar', data: [2000,5000,8000], itemStyle: { color: '#f59e0b', borderRadius: [8,8,0,0] } }]
                            };
                            ec.setOption(opts); eCharts[chartId] = ec; return;
                        }
                        break;
                    case 'dengue_chart':
                        if (window.echarts) {
                            const c = ensureEContainer(canvas, '320px');
                            const ec = initEChart(c);
                            const opts = {
                                title: { text: 'Reducción de Casos de Dengue', left: 'center', top: 8, textStyle: { fontFamily: 'Poppins', fontSize: 14, fontWeight: 'bold', color: titleColor } },
                                tooltip: { trigger: 'axis' },
                                grid: { left: 40, right: 16, top: (window.innerWidth <= 640 ? 60 : 68), bottom: 40 },
                                xAxis: { type: 'category', data: ['Año 0','1','2','3'], boundaryGap: false, axisLabel: { color: axisColor }, axisLine: { lineStyle: { color: gridLine } } },
                                yAxis: { type: 'value', min: 0, axisLabel: { color: axisColor }, splitLine: { lineStyle: { color: gridLine } } },
                                series: [{ name: 'Casos de Dengue', type: 'line', smooth: true, data: [100,60,20,5], lineStyle: { width: 2.5, color: '#ef4444' }, areaStyle: { color: 'rgba(239,68,68,0.18)' }, symbol: 'circle', symbolSize: 8, itemStyle: { color: '#ef4444' } }]
                            };
                            ec.setOption(opts); eCharts[chartId] = ec; return;
                        }
                        break;
                    case 'adultos_mayores_chart': {
                        if (window.echarts) {
                            const c = ensureEContainer(canvas, '300px');
                            const ec = initEChart(c);
                            const opts = {
                                title: { text: 'Adultos Mayores: 100% Atención Integral', left: 'center', top: 10, textStyle: { fontFamily: 'Poppins', fontSize: 14, fontWeight: 'bold', color: titleColor } },
                                tooltip: { show: false }, legend: { show: false },
                                graphic: { elements: [{ type: 'text', left: 'center', top: 'middle', style: { text: '100%', fontFamily: 'Poppins', fontWeight: 'bold', fontSize: 22, fill: primary } }] },
                                series: [{ type: 'pie', radius: ['50%','70%'], center: ['50%', (window.innerWidth <= 640 ? '48%' : '50%')], avoidLabelOverlap: false, label: { show: false }, labelLine: { show: false }, data: [{ value: 100, name: 'Atendidos', itemStyle: { color: primary } }, { value: 0, name: 'Pendiente', itemStyle: { color: '#e5e7eb' } }] }]
                            };
                            ec.setOption(opts); eCharts[chartId] = ec; return;
                        }
                        break;
                    }
                    case 'parque_solar_chart':
                        if (window.echarts) {
                            const c = ensureEContainer(canvas, '320px');
                            const ec = initEChart(c);
                            const opts = {
                                title: { text: 'Reducción en Recibo de Luz (-40%)', left: 'center', top: 8, textStyle: { fontFamily: 'Poppins', fontSize: 14, fontWeight: 'bold', color: titleColor } },
                                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                                grid: { left: 40, right: 16, top: (window.innerWidth <= 640 ? 60 : 68), bottom: 40 },
                                xAxis: { type: 'category', data: ['Costo Actual','Apoyo Solar'], axisLabel: { color: axisColor }, axisTick: { show: false }, axisLine: { lineStyle: { color: gridLine } } },
                                yAxis: { type: 'value', axisLabel: { color: axisColor }, splitLine: { lineStyle: { color: gridLine } } },
                                series: [{ type: 'bar', data: [100,60], itemStyle: { color: (p)=> p.dataIndex===0? '#9ca3af' : primary, borderRadius: [8,8,0,0] } }]
                            };
                            ec.setOption(opts); eCharts[chartId] = ec; return;
                        }
                        break;
                    case 'cosecha_agua_chart':
                        if (window.echarts) {
                            const c = ensureEContainer(canvas, '320px');
                            const ec = initEChart(c);
                            const opts = {
                                title: { text: 'Reducción de Dependencia Hídrica (%)', left: 'center', top: 8, textStyle: { fontFamily: 'Poppins', fontSize: 14, fontWeight: 'bold', color: titleColor } },
                                tooltip: { trigger: 'axis' },
                                grid: { left: 40, right: 16, top: (window.innerWidth <= 640 ? 60 : 68), bottom: 40 },
                                xAxis: { type: 'category', data: ['Año 0','1','2','3'], boundaryGap: false, axisLabel: { color: axisColor }, axisLine: { lineStyle: { color: gridLine } } },
                                yAxis: { type: 'value', min: 0, max: 100, axisLabel: { color: axisColor }, splitLine: { lineStyle: { color: gridLine } } },
                                series: [{ name: 'Dependencia Externa', type: 'line', smooth: true, data: [100,85,70,55], lineStyle: { width: 2.5, color: primary }, areaStyle: { color: `${primarySoft}55` }, symbol: 'circle', symbolSize: 8, itemStyle: { color: primary } }]
                            };
                            ec.setOption(opts); eCharts[chartId] = ec; return;
                        }
                        break;
                    case 'basura_cero_chart': {
                        if (window.echarts) {
                            const c = ensureEContainer(canvas, '300px');
                            const ec = initEChart(c);
                            const amber = '#f59e0b';
                            const opts = {
                                title: { text: 'Basura Cero: 60% Revalorizada', left: 'center', top: 10, textStyle: { fontFamily: 'Poppins', fontSize: 14, fontWeight: 'bold', color: titleColor } },
                                tooltip: { show: false }, legend: { show: false },
                                graphic: { elements: [{ type: 'text', left: 'center', top: 'middle', style: { text: '60%', fontFamily: 'Poppins', fontWeight: 'bold', fontSize: 22, fill: amber } }] },
                                series: [{ type: 'pie', radius: ['50%','70%'], center: ['50%', (window.innerWidth <= 640 ? '48%' : '50%')], avoidLabelOverlap: false, label: { show: false }, labelLine: { show: false }, data: [{ value: 60, name: 'Revalorizado', itemStyle: { color: amber } }, { value: 40, name: 'Relleno', itemStyle: { color: '#e5e7eb' } }] }]
                            };
                            ec.setOption(opts); eCharts[chartId] = ec; return;
                        }
                        break;
                    }
                    case 'reforestacion_chart':
                        if (window.echarts) {
                            const c = ensureEContainer(canvas, '320px');
                            const ec = initEChart(c);
                            const opts = {
                                title: { text: 'Nuevos Árboles para Teocuitatlán', left: 'center', top: 8, textStyle: { fontFamily: 'Poppins', fontSize: 14, fontWeight: 'bold', color: titleColor } },
                                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                                grid: { left: 40, right: 16, top: (window.innerWidth <= 640 ? 60 : 68), bottom: 40 },
                                xAxis: { type: 'category', data: ['Año 1','Año 2','Año 3'], axisLabel: { color: axisColor }, axisTick: { show: false }, axisLine: { lineStyle: { color: gridLine } } },
                                yAxis: { type: 'value', axisLabel: { color: axisColor }, splitLine: { lineStyle: { color: gridLine } } },
                                series: [{ type: 'bar', data: [2500,6000,10000], itemStyle: { color: '#f59e0b', borderRadius: [8,8,0,0] } }]
                            };
                            ec.setOption(opts); eCharts[chartId] = ec; return;
                        }
                        break;
                    case 'canchas_rehabilitadas_chart': {
                        if (window.echarts) {
                            const c = ensureEContainer(canvas, '300px');
                            const ec = initEChart(c);
                            const opts = {
                                title: { text: 'Deporte: 100% Canchas Rehabilitadas', left: 'center', top: 10, textStyle: { fontFamily: 'Poppins', fontSize: 14, fontWeight: 'bold', color: titleColor } },
                                tooltip: { show: false }, legend: { show: false },
                                graphic: { elements: [{ type: 'text', left: 'center', top: 'middle', style: { text: '100%', fontFamily: 'Poppins', fontWeight: 'bold', fontSize: 22, fill: primary } }] },
                                series: [{ type: 'pie', radius: ['50%','70%'], center: ['50%', (window.innerWidth <= 640 ? '48%' : '50%')], avoidLabelOverlap: false, label: { show: false }, labelLine: { show: false }, data: [{ value: 100, name: 'Rehabilitadas', itemStyle: { color: primary } }, { value: 0, name: 'Pendientes', itemStyle: { color: '#e5e7eb' } }] }]
                            };
                            ec.setOption(opts); eCharts[chartId] = ec; return;
                        }
                        break;
                    }
                    case 'semillero_campeones_chart':
                        if (window.echarts) {
                            const c = ensureEContainer(canvas, '320px');
                            const ec = initEChart(c);
                            const opts = {
                                title: { text: 'Atletas con Beca Deportiva', left: 'center', top: 8, textStyle: { fontFamily: 'Poppins', fontSize: 14, fontWeight: 'bold', color: titleColor } },
                                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                                grid: { left: 40, right: 16, top: 56, bottom: 40 },
                                xAxis: { type: 'category', data: ['Año 1','Año 2','Año 3'], axisLabel: { color: axisColor }, axisTick: { show: false }, axisLine: { lineStyle: { color: gridLine } } },
                                yAxis: { type: 'value', axisLabel: { color: axisColor }, splitLine: { lineStyle: { color: gridLine } } },
                                series: [{ type: 'bar', data: [20,50,100], itemStyle: { color: '#f59e0b', borderRadius: [8,8,0,0] } }]
                            };
                            ec.setOption(opts); eCharts[chartId] = ec; return;
                        }
                        break;
                    // Nuevos tipos opcionales para usar en propuestas futuras, ahora en ECharts
                    case 'gauge_avance': {
                        const c = ensureEContainer(canvas, '300px');
                        const ec = initEChart(c);
                        const value = 75;
                        const opts = {
                            title: { text: 'Avance General', left: 'center', top: 6, textStyle: { fontFamily: 'Poppins', fontSize: 14, fontWeight: 'bold', color: titleColor } },
                            tooltip: { show: false },
                            series: [{
                                type: 'gauge', startAngle: 180, endAngle: 0, center: ['50%','65%'], radius: '90%',
                                progress: { show: true, width: 14, roundCap: true, itemStyle: { color: primary } },
                                axisLine: { lineStyle: { width: 14, color: [[1, '#e5e7eb']] } },
                                splitLine: { show: false }, axisTick: { show: false }, axisLabel: { show: false }, pointer: { show: false },
                                detail: { valueAnimation: true, formatter: '{value}%', fontSize: 18, fontFamily: 'Poppins', color: primary, offsetCenter: [0, '0%'] },
                                data: [{ value }]
                            }]
                        };
                        ec.setOption(opts); eCharts[chartId] = ec; return;
                    }
                    case 'radar_balance': {
                        const c = ensureEContainer(canvas, '320px');
                        const ec = initEChart(c);
                        const opts = {
                            title: { text: 'Balance de Objetivos', left: 'center', top: 8, textStyle: { fontFamily: 'Poppins', fontSize: 14, fontWeight: 'bold', color: titleColor } },
                            legend: { bottom: 0, textStyle: { color: axisColor } },
                            radar: { indicator: [
                                { name: 'Movilidad', max: 100 }, { name: 'Agua', max: 100 }, { name: 'Seguridad', max: 100 }, { name: 'Economía', max: 100 }, { name: 'Salud', max: 100 }
                            ], axisName: { color: axisColor }, splitLine: { lineStyle: { color: gridLine } }, splitArea: { areaStyle: { color: ['transparent'] } } },
                            series: [
                                { type: 'radar', name: 'Actual', data: [[45,50,55,50,52]], areaStyle: { color: 'rgba(148,163,184,0.2)' }, lineStyle: { color: '#94a3b8' }, itemStyle: { color: '#94a3b8' } },
                                { type: 'radar', name: 'Objetivo', data: [[85,80,90,88,86]], areaStyle: { color: `${primarySoft}55` }, lineStyle: { color: primary }, itemStyle: { color: primary } }
                            ]
                        };
                        ec.setOption(opts); eCharts[chartId] = ec; return;
                    }
                    case 'stacked_empleo': {
                        const c = ensureEContainer(canvas, '320px');
                        const ec = initEChart(c);
                        const opts = {
                            title: { text: 'Estructura del Empleo (%)', left: 'center', top: 8, textStyle: { fontFamily: 'Poppins', fontSize: 14, fontWeight: 'bold', color: titleColor } },
                            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                            legend: { bottom: 0, textStyle: { color: axisColor } },
                            grid: { left: 40, right: 16, top: (window.innerWidth <= 640 ? 64 : 72), bottom: (window.innerWidth <= 640 ? 56 : 56) },
                            xAxis: { type: 'category', data: ['Antes','Después'], axisLabel: { color: axisColor }, axisTick: { show: false }, axisLine: { lineStyle: { color: gridLine } } },
                            yAxis: { type: 'value', max: 100, axisLabel: { color: axisColor }, splitLine: { lineStyle: { color: gridLine } } },
                            series: [
                                { name: 'Formal', type: 'bar', stack: 'total', data: [40,65], itemStyle: { color: primary, borderRadius: [8,8,0,0] } },
                                { name: 'Informal', type: 'bar', stack: 'total', data: [60,35], itemStyle: { color: '#cbd5e1', borderRadius: [8,8,0,0] } }
                            ]
                        };
                        ec.setOption(opts); eCharts[chartId] = ec; return;
                    }
                }
            }

            navButtons.forEach(button => {
                button.addEventListener('click', () => { activateSection(button.dataset.target); });
                // Activación también con Enter o Espacio
                button.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        activateSection(button.dataset.target);
                    }
                });
            });

            // Navegación por teclado para tabs (flechas, Home/End)
            const tabs = Array.from(navButtons);
            tabs.forEach((button, idx) => {
                button.addEventListener('keydown', (e) => {
                    let newIdx = null;
                    switch (e.key) {
                        case 'ArrowRight': newIdx = (idx + 1) % tabs.length; break;
                        case 'ArrowLeft': newIdx = (idx - 1 + tabs.length) % tabs.length; break;
                        case 'Home': newIdx = 0; break;
                        case 'End': newIdx = tabs.length - 1; break;
                        default: break;
                    }
                    if (newIdx !== null) {
                        e.preventDefault();
                        const nextTab = tabs[newIdx];
                        nextTab.focus();
                        activateSection(nextTab.dataset.target);
                    }
                });
            });
            
            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) {
                    const wasHidden = !backToTopButton.classList.contains('show');
                    backToTopButton.classList.add('show');
                    if (wasHidden && Motion && !prefersReduce) {
                        Motion.animate(backToTopButton, { opacity: [0, 1], transform: ['translateY(10px) scale(0.9)', 'translateY(0) scale(1)'] }, { duration: 0.22, easing: 'ease-out' });
                    }
                } else {
                    backToTopButton.classList.remove('show');
                }
            });

            // Sin animaciones adicionales: no se requiere pausar/reanudar

            backToTopButton.addEventListener('click', () => {
                // Nueva lógica: si estamos lejos del nav -> ir al nav; si ya casi arriba -> ir al top absoluto
                const header = document.getElementById('page-header');
                const navRect = mainNav ? mainNav.getBoundingClientRect() : null;
                const navTopAbs = navRect ? window.pageYOffset + navRect.top : 0;
                const current = window.pageYOffset;
                // Umbrales
                const nearNav = Math.abs(current - navTopAbs) < 120; // ya estamos prácticamente en los ejes
                if (!mainNav) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }
                if (nearNav) {
                    // Subir del todo para mostrar también el hero
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    // Ir a los ejes (ligero margen superior)
                    const targetY = Math.max(0, navTopAbs - 16);
                    window.scrollTo({ top: targetY, behavior: 'smooth' });
                }
            });

            activateSection('eje1', true);

            // Redimensiona gráficas ECharts cuando cambie el viewport
            window.addEventListener('resize', () => {
                Object.values(eCharts).forEach((inst) => { try { inst.resize(); } catch {} });
            });
            // --- Parallax Partículas (mejorado con líneas y profundidad) ---
            (function initParticles(){
                const wrapper = document.getElementById('particle-wrapper');
                const canvas = document.getElementById('particles-canvas');
                if(!canvas || !wrapper) return;
                const ctx = canvas.getContext('2d');
                const dpr = window.devicePixelRatio || 1;
                const mediaReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                const CONFIG = {
                    // Aumentamos ligeramente la cantidad para más presencia visual
                    COUNT: mediaReduce ? 40 : 100,
                    LINK_DIST: 130,
                    MAX_LINKS_PER_PARTICLE: 8
                };
                let particles = [];
                function rand(min,max){ return Math.random()*(max-min)+min; }
                function themeColor(varName, fallback){ return getComputedStyle(document.documentElement).getPropertyValue(varName).trim()||fallback; }
                function resize(){
                    // Usar dimensiones del viewport para mantener partículas constantes entre cambios de eje
                    const w = window.innerWidth;
                    const h = window.innerHeight;
                    canvas.width = w * dpr;
                    canvas.height = h * dpr;
                    ctx.setTransform(1,0,0,1,0,0); // evita acumulación de escalas
                    ctx.scale(dpr,dpr);
                }
                window.addEventListener('resize', () => { resize(); spawn(true); });
                resize();
                function spawn(reset=false){
                    const w = canvas.width / dpr; const h = canvas.height / dpr;
                    if(!reset || particles.length === 0){
                        particles = Array.from({length: CONFIG.COUNT}, () => newParticle(w,h));
                    } else {
                        // Ajusta posiciones al nuevo tamaño
                        particles.forEach(p => { p.x = (p.x / p._wPrev) * w; p.y = (p.y / p._hPrev) * h; p._wPrev = w; p._hPrev = h; });
                    }
                }
        function newParticle(w,h){
                    const depth = Math.random(); // 0 (lejos) a 1 (cerca)
                    return {
            x: Math.random()*w,
            y: Math.random()*h,
            // Más variación de tamaño (pequeños y algunos un poco mayores)
            r: rand(0.8, 4.2) * (0.55 + depth*0.9),
            o: rand(0.25,0.85) * (0.5 + depth*0.6),
            // +10% velocidad y ligera mayor amplitud
            vx: rand(-0.066,0.066) * (0.3 + depth) * 1.1,
            vy: rand(0.0165,0.121) * (0.4 + depth*0.8) * 1.1,
            drift: rand(-0.0385,0.0385),
                        depth,
                        _wPrev: w,
                        _hPrev: h
                    };
                }
                spawn();
                let lastY = window.scrollY;
                let lastFrame = performance.now();
                let frameCount = 0;
                function draw(now){
                    const dtMs = now - lastFrame; lastFrame = now;
                    const w = canvas.width / dpr; const h = canvas.height / dpr;
                    ctx.clearRect(0,0,w,h);
                    const colA = themeColor('--primary-400', '#94a3b8') || '#94a3b8';
                    const colB = themeColor('--primary-500', '#64748b') || '#64748b';
                    const colLine = themeColor('--primary-600', '#475569') || '#475569';
                    // Precalcula gradiente grande para relleno de partículas
                    const bgGrad = ctx.createLinearGradient(0,0,w,h);
                    bgGrad.addColorStop(0, colA + '40');
                    bgGrad.addColorStop(1, colB + '55');
                    // Movimiento flotante: ruido senoidal + deriva leve, sin gravedad
                    const MAX_SPEED = 0.22; // menor para sensación flotante
                    particles.forEach(p => {
                        // Pequeña variación direccional lenta (cambia suavemente dirección)
                        const wander = 0.0009 + p.depth*0.0007;
                        p.vx += Math.sin((now/4000) + p.x*0.002 + p.depth*5) * wander;
                        p.vy += Math.cos((now/5000) + p.y*0.002 + p.depth*7) * wander;
                        // Límite de velocidad
                        const speed = Math.hypot(p.vx, p.vy) || 1;
                        const maxLocal = MAX_SPEED * (0.5 + p.depth*0.9);
                        if(speed > maxLocal){ const s = maxLocal / speed; p.vx *= s; p.vy *= s; }
                        const speedScale = mediaReduce ? 0.35 : 0.9;
                        p.x += (p.vx + p.drift * Math.sin(now/6000)) * speedScale;
                        p.y += (p.vy + Math.sin(now/9000 + p.drift)*0.02) * speedScale;
                        // Envolvente (wrap) para efecto espacio infinito
                        if(p.x < -20) p.x = w + 20; else if(p.x > w + 20) p.x = -20;
                        if(p.y < -20) p.y = h + 20; else if(p.y > h + 20) p.y = -20;
                        // Dibujo círculo con leve halo
                        ctx.beginPath();
                        ctx.globalAlpha = p.o;
                        ctx.fillStyle = bgGrad;
                        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
                        ctx.fill();
                        // Halo
                        ctx.globalAlpha = p.o * 0.25;
                        ctx.beginPath();
                        ctx.fillStyle = colB + '22';
                        ctx.arc(p.x, p.y, p.r*2.2, 0, Math.PI*2);
                        ctx.fill();
                    });
                    ctx.globalAlpha = 1;
                    // Líneas de conexión con variabilidad (no siempre unidas)
                    // Animación de líneas: mantenemos enlaces vivos con curva y pulso viajero
                    // Estructura de enlace: {key,a,b,t0,dur,seed,baseAlpha,width,proximity}
                    if(!window.__particleLinks){ window.__particleLinks = new Map(); }
                    const linksMap = window.__particleLinks;
                    // Intentamos crear nuevos enlaces sólo 1 de cada 3 frames
                    if(frameCount % 3 === 0){
                        for(let i=0;i<particles.length;i++){
                            let createdForA = 0;
                            const pa = particles[i];
                            for(let j=i+1;j<particles.length;j++){
                                if(createdForA >= CONFIG.MAX_LINKS_PER_PARTICLE) break;
                                const pb = particles[j];
                                const dx = pa.x - pb.x; const dy = pa.y - pb.y;
                                const dist2 = dx*dx + dy*dy;
                                const maxD = CONFIG.LINK_DIST;
                                if(dist2 < maxD*maxD){
                                    const dist = Math.sqrt(dist2);
                                    const proximity = 1 - dist / maxD;
                                    const depthMix = (pa.depth + pb.depth)/2;
                                    const prob = (0.25 + depthMix*0.5) * proximity;
                                    if(Math.random() < prob){
                                        const key = i+"-"+j;
                                        if(!linksMap.has(key) && linksMap.size < 260){
                                            const baseAlpha = proximity * 0.55 * (pa.o+pb.o)/2;
                                            if(baseAlpha > 0.04){
                                                linksMap.set(key, {
                                                    key, a: pa, b: pb,
                                                    t0: now,
                                                    dur: 1400 + Math.random()*2300, // 1.4s - 3.7s
                                                    seed: Math.random(),
                                                    baseAlpha,
                                                    width: 0.6 + proximity * 0.9 * (0.3 + pa.depth*0.7),
                                                    proximity
                                                });
                                                createdForA++;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    // Dibujo de enlaces existentes con animaciones
                    if(linksMap.size){
                        const toDelete = [];
                        linksMap.forEach(link => {
                            const age = now - link.t0;
                            if(age > link.dur){ toDelete.push(link.key); return; }
                            const t = age / link.dur; // 0..1
                            // Easing para alpha (acelera y desacelera) y fade in/out
                            const ease = t < 0.5 ? (2*t*t) : (1 - Math.pow(-2*t+2,2)/2); // easeInOutQuad
                            // Fade: entra 15%, sale 25%
                            let fade = 1;
                            if(t < 0.15) fade = t/0.15; else if(t > 0.75) fade = (1 - t) / 0.25; // lineal
                            const alpha = link.baseAlpha * ease * fade;
                            if(alpha < 0.02) return;
                            const { a, b } = link;
                            const dx = b.x - a.x; const dy = b.y - a.y;
                            // Curvatura ligera según seno y seed
                            const perpLen = Math.hypot(dx,dy) || 1;
                            const nx = -dy / perpLen; const ny = dx / perpLen;
                            const wobble = Math.sin((t + link.seed) * Math.PI * 2) * (4 + 8*(1 - link.proximity)) * (0.3 + (1 - a.depth));
                            const cx = a.x + dx * 0.5 + nx * wobble; // punto de control
                            const cy = a.y + dy * 0.5 + ny * wobble;
                            // Gradiente dinámico con brillo central
                            const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
                            grad.addColorStop(0, colLine + '00');
                            grad.addColorStop(0.5, colLine + 'ff');
                            grad.addColorStop(1, colLine + '00');
                            ctx.lineWidth = link.width * (0.9 + 0.4*Math.sin((t+link.seed)*Math.PI*2));
                            ctx.strokeStyle = grad;
                            ctx.globalAlpha = alpha;
                            ctx.beginPath();
                            ctx.moveTo(a.x, a.y);
                            ctx.quadraticCurveTo(cx, cy, b.x, b.y);
                            ctx.stroke();
                            // Pulso viajero luminoso
                            const pulseT = ((t * 1.6 + link.seed) % 1);
                            const px = a.x + dx * pulseT;
                            const py = a.y + dy * pulseT;
                            const pulseR = 1.2 + 2.2 * (1 - Math.abs(0.5 - pulseT)*2); // pico al centro
                            ctx.globalAlpha = alpha * 0.85;
                            const pulseGrad = ctx.createRadialGradient(px, py, 0, px, py, pulseR*3);
                            pulseGrad.addColorStop(0, colLine + 'ff');
                            pulseGrad.addColorStop(1, colLine + '00');
                            ctx.fillStyle = pulseGrad;
                            ctx.beginPath();
                            ctx.arc(px, py, pulseR, 0, Math.PI*2);
                            ctx.fill();
                            ctx.globalAlpha = 1;
                        });
                        toDelete.forEach(k => linksMap.delete(k));
                    }
                    frameCount++;
                    requestAnimationFrame(draw);
                }
                requestAnimationFrame(draw);
                // Parallax por scroll (suave y sutil)
                window.addEventListener('scroll', () => {
                    const delta = window.scrollY - lastY; lastY = window.scrollY;
                    const factor = -0.03; // más ligero
                    particles.forEach(p => { p.y += delta * factor * (0.3 + p.depth*0.7); });
                }, { passive: true });
            })();
        });
