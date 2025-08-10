document.addEventListener('DOMContentLoaded', () => {
            Chart.defaults.animation = false;

            const navButtons = document.querySelectorAll('.nav-button');
            const contentSections = document.querySelectorAll('.content-section');
            let charts = {};
            const prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const Motion = window.motion; // { animate, timeline, stagger }
            const contentArea = document.getElementById('content-area');
            const backToTopButton = document.getElementById('back-to-top');
            const mainNav = document.getElementById('main-nav');
            const themeToggle = document.getElementById('theme-toggle');
            const themePanel = document.getElementById('theme-panel');

            // Gestión de tema: 8 nuevos + neutral
            const themes = ['neutral', 'pri', 'pan', 'prd', 'morena', 'pt', 'verde', 'mc', 'na'];
            function applyTheme(theme) {
                const html = document.documentElement;
                html.setAttribute('data-theme', theme);
                localStorage.setItem('theme', theme);
                if (themeToggle) {
                    const label = themeToggle.querySelector('.label');
                    if (label) label.textContent = `Tema`;
                }
                // Actualiza meta theme-color según el tema activo
                const primary600 = getComputedStyle(document.documentElement).getPropertyValue('--primary-600').trim() || '#7c3aed';
                const metaTheme = document.querySelector('meta[name="theme-color"]');
                if (metaTheme) metaTheme.setAttribute('content', primary600);
            }
            const savedTheme = localStorage.getItem('theme');
            const initial = themes.includes(savedTheme) ? savedTheme : 'neutral';
            applyTheme(initial);
            if (themeToggle) {
                themeToggle.addEventListener('click', () => {
                    const expanded = themeToggle.getAttribute('aria-expanded') === 'true';
                    if (!expanded) {
                        themeToggle.setAttribute('aria-expanded', 'true');
                        if (themePanel) {
                            themePanel.classList.add('open');
                            if (Motion && !prefersReduce) {
                                Motion.animate(themePanel, { opacity: [0, 1], transform: ['translateY(-8px)', 'translateY(0)'] }, { duration: 0.25, easing: 'ease-out' });
                            }
                        }
                    } else {
                        // Animar cierre y luego ocultar
                        if (themePanel && Motion && !prefersReduce) {
                            const a = Motion.animate(themePanel, { opacity: [1, 0], transform: ['translateY(0)', 'translateY(-8px)'] }, { duration: 0.2, easing: 'ease-in' });
                            a.finished.then(() => {
                                themePanel.classList.remove('open');
                                themeToggle.setAttribute('aria-expanded', 'false');
                            });
                        } else {
                            if (themePanel) themePanel.classList.remove('open');
                            themeToggle.setAttribute('aria-expanded', 'false');
                        }
                    }
                });
                document.addEventListener('click', (e) => {
                    if (!themePanel || !themeToggle) return;
                    const expanded = themeToggle.getAttribute('aria-expanded') === 'true';
                    if (expanded && !themePanel.contains(e.target) && !themeToggle.contains(e.target)) {
                        if (Motion && !prefersReduce) {
                            const a = Motion.animate(themePanel, { opacity: [1, 0], transform: ['translateY(0)', 'translateY(-8px)'] }, { duration: 0.18, easing: 'ease-in' });
                            a.finished.then(() => { themePanel.classList.remove('open'); themeToggle.setAttribute('aria-expanded', 'false'); });
                        } else {
                            themePanel.classList.remove('open');
                            themeToggle.setAttribute('aria-expanded', 'false');
                        }
                    }
                });
                // Cerrar con Escape
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && themePanel && themePanel.classList.contains('open')) {
                        if (Motion && !prefersReduce) {
                            const a = Motion.animate(themePanel, { opacity: [1, 0], transform: ['translateY(0)', 'translateY(-8px)'] }, { duration: 0.18, easing: 'ease-in' });
                            a.finished.then(() => { themePanel.classList.remove('open'); themeToggle.setAttribute('aria-expanded', 'false'); });
                        } else {
                            themePanel.classList.remove('open');
                            themeToggle.setAttribute('aria-expanded', 'false');
                        }
                    }
                });
                if (themePanel) {
                    themePanel.querySelectorAll('.swatch').forEach(btn => {
                        btn.addEventListener('click', () => {
                            const t = btn.getAttribute('data-theme');
                            applyTheme(t);
                            if (Motion && !prefersReduce) {
                                const a = Motion.animate(themePanel, { opacity: [1, 0], transform: ['translateY(0)', 'translateY(-8px)'] }, { duration: 0.15, easing: 'ease-in' });
                                a.finished.then(() => { themePanel.classList.remove('open'); themeToggle.setAttribute('aria-expanded', 'false'); });
                            } else {
                                themePanel.classList.remove('open');
                                themeToggle.setAttribute('aria-expanded', 'false');
                            }
                        });
                    });
                }
            }

            const proposals = {
                eje1: [
                    { id: 'movilidad_inteligente', title: '🚌 Movilidad para Todos', desc: '4 autobuses nuevos conectando cabecera y comunidades con rutas fijas, horarios definidos y app de seguimiento.', counter: 4, details: '<strong>Beneficio:</strong> Puntualidad y certeza para tus traslados. Se crearán rutas estratégicas para San José, Citala, La Puerta y más, asegurando un transporte público eficiente, seguro e inclusivo.<div class="mt-2 text-left text-xs bg-slate-100 p-2 rounded-lg"><p class="font-bold">Ej. Ruta Citala - Teocuitatlán:</p><p>L-V: 6:30 AM, 9:00 AM, 3:30 PM, 6:00 PM</p></div>' },
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
                const counterHtml = proposal.counter ? `<div class="text-center my-4"><div class="text-7xl font-extrabold brand-counter" data-target="${proposal.counter}">0</div><p class="font-bold text-xl mt-2 font-title">Autobuses Nuevos</p></div>` : '';
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
                Object.values(charts).forEach(chart => {
                    if (chart) { try { chart.destroy(); } catch {} }
                });
                charts = {};

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

            function createChart(canvas) {
                if (!canvas) return;
                const type = canvas.dataset.chartConfig;
                const chartId = canvas.id;
                if (charts[chartId] && typeof charts[chartId].destroy === 'function') {
                    charts[chartId].destroy();
                }
                
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                
                let config;
                const chartTitleOptions = { display: true, font: { size: 14, weight: 'bold', family: 'Poppins' }, color: '#44403c' };
                const defaultOptions = { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { display: false } } };
                const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary-500').trim() || '#8b5cf6';
                const primarySoft = getComputedStyle(document.documentElement).getPropertyValue('--primary-400').trim() || '#a78bfa';

                switch (type) {
                    case 'alumbrado': config = { type: 'doughnut', data: { datasets: [{ data: [100, 0], backgroundColor: [primary, '#e5e7eb'], borderColor: ['#fff'], borderWidth: 4 }] }, options: { ...defaultOptions, cutout: '70%', plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Meta: 100% Cobertura LED' } } } }; break;
                    case 'plaza_calidad_chart': config = { type: 'bar', data: { labels: ['Calidad del Espacio Público'], datasets: [{ label: 'Antes', data: [40], backgroundColor: '#6b7280'}, { label: 'Después', data: [95], backgroundColor: primary }] }, options: { ...defaultOptions, plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Mejora del Espacio Público' } }, scales: { y: { beginAtZero: true, max: 100 } } } }; break;
                    case 'agua': config = { type: 'line', data: { labels: ['Año 0', '1', '2', '3'], datasets: [{ label: 'Fugas', data: [40, 30, 15, 5], fill: true, borderColor: '#fb923c', backgroundColor: 'rgba(251, 146, 60, 0.1)', tension: 0.4 }] }, options: { ...defaultOptions, plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Reducción de Fugas (%)' } } } }; break;
                    case 'emprendedores': config = { type: 'bar', data: { labels: ['Año 1', 'Año 2', 'Año 3'], datasets: [{ label: 'Nuevas Empresas', data: [15, 35, 50], backgroundColor: '#f59e0b', borderRadius: 4 }] }, options: { ...defaultOptions, plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Nuevas Empresas Creadas' } }, scales: { y: { beginAtZero: true } } } }; break;
                    case 'campo': config = { type: 'bar', data: { labels: ['Ingreso Actual', 'Ingreso Propuesto'], datasets: [{ label: 'Ganancia del Productor', data: [100, 150], backgroundColor: ['#6b7280', '#f97316'], borderRadius: 4 }] }, options: { ...defaultOptions, plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Aumento de Rentabilidad' } } } }; break;
                    case 'turismo': config = { type: 'line', data: { labels: ['Año 0', '1', '2', '3'], datasets: [{ label: 'Visitantes', data: [1000, 2500, 4500, 7000], fill: true, borderColor: primary, backgroundColor: 'rgba(139, 92, 246, 0.1)', tension: 0.4 }] }, options: { ...defaultOptions, plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Crecimiento Exponencial de Visitantes' } } } }; break;
                    case 'mercado_visitantes_chart': config = { type: 'bar', data: { labels: ['Visitantes Semanales'], datasets: [{ label: 'Antes', data: [500], backgroundColor: '#6b7280'}, { label: 'Después', data: [1500], backgroundColor: primary }] }, options: { ...defaultOptions, plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Aumento de Visitantes al Mercado' } }, scales: { y: { beginAtZero: true } } } }; break;
                    case 'policia_respuesta': config = { type: 'bar', data: { labels: ['Tiempo de Respuesta (Min)'], datasets: [{ label: 'Actual', data: [15], backgroundColor: '#6b7280'}, { label: 'Propuesta', data: [5], backgroundColor: primary }] }, options: { ...defaultOptions, plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Reducción Tiempo de Respuesta' } }, scales: { y: { beginAtZero: true } } } }; break;
                    case 'vecinos': config = { type: 'doughnut', data: { datasets: [{ data: [100, 0], backgroundColor: [primary, '#e5e7eb'], borderColor: ['#fff'], borderWidth: 4 }] }, options: { ...defaultOptions, cutout: '70%', plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Meta: 100% Colonias Conectadas' } } } }; break;
                    case 'justicia_civica_chart': config = { type: 'doughnut', data: { labels: ['Quejas Atendidas', 'Pendientes'], datasets: [{ data: [95, 5], backgroundColor: ['#f59e0b', '#e5e7eb'], borderColor: ['#fff'], borderWidth: 4 }] }, options: { ...defaultOptions, cutout: '70%', plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Meta: 95% de Quejas Resueltas' } } } }; break;
                    case 'presupuesto_participativo': config = { type: 'doughnut', data: { labels: ['Decidido por Ciudadanos', 'Presupuesto Regular'], datasets: [{ data: [20, 80], backgroundColor: ['#f59e0b', '#e5e7eb'], borderColor: ['#fff'], borderWidth: 4 }] }, options: { ...defaultOptions, cutout: '70%', plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: '20% del Presupuesto en tus Manos' } } } }; break;
                    case 'despacho_itinerante_chart': config = { type: 'doughnut', data: { labels: ['Comunidades Atendidas', 'Pendientes'], datasets: [{ data: [100, 0], backgroundColor: ['#f59e0b', '#e5e7eb'], borderColor: ['#fff'], borderWidth: 4 }] }, options: { ...defaultOptions, cutout: '70%', plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Meta: 100% comunidades visitadas al mes' } } } }; break;
                    case 'tramites_digitales': config = { type: 'bar', data: { labels: ['Tiempo para un Trámite (Hrs)'], datasets: [{ label: 'Antes', data: [4], backgroundColor: '#6b7280'}, { label: 'Ahora', data: [0.25], backgroundColor: primary }] }, options: { ...defaultOptions, plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Reducción Drástica de Tiempos' } }, scales: { y: { beginAtZero: true } } } }; break;
                    case 'servicios_publicos_chart': config = { type: 'bar', data: { labels: ['Tiempo de Atención (Días)'], datasets: [{ label: 'Antes', data: [15], backgroundColor: '#6b7280'}, { label: 'Ahora', data: [3], backgroundColor: primary }] }, options: { ...defaultOptions, plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Respuesta Rápida a Reportes' } }, scales: { y: { beginAtZero: true } } } }; break;
                    case 'brigadas_chart': config = { type: 'bar', data: { labels: ['Año 1', 'Año 2', 'Año 3'], datasets: [{ label: 'Consultas Realizadas', data: [2000, 5000, 8000], backgroundColor: '#f59e0b', borderRadius: 4 }] }, options: { ...defaultOptions, plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Consultas Médicas Gratuitas' } }, scales: { y: { beginAtZero: true } } } }; break;
                    case 'dengue_chart': config = { type: 'line', data: { labels: ['Año 0', '1', '2', '3'], datasets: [{ label: 'Casos de Dengue', data: [100, 60, 20, 5], fill: true, borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', tension: 0.4 }] }, options: { ...defaultOptions, plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Reducción de Casos de Dengue' } } } }; break;
                    case 'adultos_mayores_chart': config = { type: 'doughnut', data: { datasets: [{ data: [100, 0], backgroundColor: [primary, '#e5e7eb'], borderColor: ['#fff'], borderWidth: 4 }] }, options: { ...defaultOptions, cutout: '70%', plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Meta: Atención al 100% de inscritos' } } } }; break;
                    case 'parque_solar_chart': config = { type: 'bar', data: { labels: ['Costo de Electricidad'], datasets: [{ label: 'Costo Actual', data: [100], backgroundColor: '#6b7280'}, { label: 'Costo con Apoyo Solar', data: [60], backgroundColor: primary }] }, options: { ...defaultOptions, plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Reducción en Recibo de Luz (-40%)' } }, scales: { y: { beginAtZero: true } } } }; break;
                    case 'cosecha_agua_chart': config = { type: 'line', data: { labels: ['Año 0', '1', '2', '3'], datasets: [{ label: 'Dependencia Externa', data: [100, 85, 70, 55], fill: true, borderColor: primary, backgroundColor: `${primarySoft}33`, tension: 0.4 }] }, options: { ...defaultOptions, plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Reducción de Dependencia Hídrica (%)' } } } }; break;
                    case 'basura_cero_chart': config = { type: 'doughnut', data: { labels: ['Reciclado/Compostado', 'Relleno Sanitario'], datasets: [{ data: [60, 40], backgroundColor: ['#f59e0b', '#e5e7eb'], borderColor: ['#fff'], borderWidth: 4 }] }, options: { ...defaultOptions, cutout: '70%', plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Meta: 60% de Basura Revalorizada' } } } }; break;
                    case 'reforestacion_chart': config = { type: 'bar', data: { labels: ['Año 1', 'Año 2', 'Año 3'], datasets: [{ label: 'Árboles Plantados', data: [2500, 6000, 10000], backgroundColor: '#f59e0b', borderRadius: 4 }] }, options: { ...defaultOptions, plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Nuevos Árboles para Teocuitatlán' } }, scales: { y: { beginAtZero: true } } } }; break;
                    case 'canchas_rehabilitadas_chart': config = { type: 'doughnut', data: { datasets: [{ data: [100, 0], backgroundColor: [primary, '#e5e7eb'], borderColor: ['#fff'], borderWidth: 4 }] }, options: { ...defaultOptions, cutout: '70%', plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Meta: 100% Canchas Rehabilitadas' } } } }; break;
                    case 'semillero_campeones_chart': config = { type: 'bar', data: { labels: ['Año 1', 'Año 2', 'Año 3'], datasets: [{ label: 'Atletas Apoyados', data: [20, 50, 100], backgroundColor: '#f59e0b', borderRadius: 4 }] }, options: { ...defaultOptions, plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Atletas con Beca Deportiva' } }, scales: { y: { beginAtZero: true } } } }; break;
                }
                if(config) charts[chartId] = new Chart(ctx, config);
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
                mainNav.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });

            activateSection('eje1', true);
        });
