document.addEventListener('DOMContentLoaded', () => {
            Chart.defaults.animation = false;

            const navButtons = document.querySelectorAll('.nav-button');
            const contentSections = document.querySelectorAll('.content-section');
            let charts = {};
            const contentArea = document.getElementById('content-area');
            const backToTopButton = document.getElementById('back-to-top');
            const mainNav = document.getElementById('main-nav');

            const proposals = {
                eje1: [
                    { id: 'movilidad_inteligente', title: '🚌 Movilidad Confiable', desc: '4 autobuses nuevos con rutas fijas, horarios definidos y una app para seguimiento en tiempo real.', counter: 4, details: '<strong>Beneficio:</strong> Puntualidad y certeza para tus traslados diarios. Transporte público eficiente, seguro e inclusivo.<div class="mt-2 text-left text-xs bg-slate-100 p-2 rounded-lg"><p class="font-bold">Ej. Ruta Centro - San José:</p><p>L-V: 7:00 AM, 8:30 AM, 4:00 PM, 6:30 PM</p></div>' },
                    { id: 'plaza_principal', title: '🌟 Plaza Principal: Corazón de Nuestro Pueblo', desc: 'Rehabilitación completa de la plaza con restauración del quiosco, suelos de cantera e iluminación arquitectónica.', chart: 'plaza_calidad_chart', details: '<strong>Beneficio:</strong> Un espacio público de primer nivel, seguro y hermoso para la convivencia familiar, que impulse el orgullo y el comercio local.' },
                    { id: 'calles_para_siempre', title: '🛣️ Calles para Siempre: Cimientos del Futuro', desc: 'Reconstrucción total de calles con concreto hidráulico, reemplazando por completo la infraestructura subterránea de agua y drenaje.', visual: { type: 'progress', label: 'Kilómetros Reconstruidos', value: 100 }, details: '<strong>Beneficio:</strong> Calles sin baches por más de 20 años, fin de las fugas de agua y un servicio de drenaje eficiente. Una inversión inteligente que se ve en la superficie y funciona por debajo.' },
                    { id: 'iluminacion_inteligente', title: '💡 Iluminación Inteligente', desc: 'Red 100% LED con sistema de telegestión para detectar fallas en tiempo real y maximizar el ahorro.', chart: 'alumbrado', details: '<strong>Beneficio:</strong> Máxima seguridad en cada rincón con un ahorro superior al 60%, liberando recursos para más obras.' },
                ],
                eje2: [
                    { id: 'incubadora', title: '🚀 Incubadora de Negocios', desc: 'Centro de apoyo con microcréditos, asesoría legal/fiscal y mentoría para nuevas empresas locales.', chart: 'emprendedores', details: '<strong>Beneficio:</strong> Facilitar la creación de 50+ nuevas empresas, generando empleos de calidad y diversificando nuestra economía.' },
                    { id: 'campo_fuerte', title: '🌽 Campo Fuerte y Productivo', desc: 'Revolución agrícola con apoyo directo en insumos, tecnificación (riego, drones) y un centro de valor agregado.', chart: 'campo', details: '<strong>Beneficio:</strong> Cosechas más rentables y resistentes. Creación del programa "Insumos a Bajo Costo" y acceso a tecnología para reducir costos y aumentar la producción.' },
                    { id: 'destino_autentico', title: '🏞️ Destino Auténtico', desc: 'Desarrollo de experiencias únicas: Ruta Sierra del Tigre, ecoturismo y un festival anual de gastronomía.', chart: 'turismo', details: '<strong>Beneficio:</strong> Posicionar a Teocuitatlán como un destino turístico clave, atrayendo inversión y visitantes durante todo el año.' },
                    { id: 'mercado_moderno', title: '🛍️ Mercado Municipal Vibrante', desc: 'Transformar el mercado en un centro gastronómico y artesanal, con espacios dignos, áreas de comida y eventos culturales.', chart: 'mercado_visitantes_chart', details: '<strong>Beneficio:</strong> Un corazón comercial renovado que atraiga a locales y turistas, impulse las ventas y se convierta en un punto de encuentro social.' },
                ],
                eje3: [
                    { id: 'policia_proximidad', title: '🛡️ Policía de Proximidad y Reacción', desc: 'Modelo policial por cuadrantes con patrullaje estratégico y capacitación en derechos humanos.', chart: 'policia_respuesta', details: '<strong>Beneficio:</strong> Reducción de los tiempos de respuesta a emergencias a menos de 5 minutos y una policía que genera confianza, no temor.' },
                    { id: 'red_vecinal', title: '📲 Red de Alerta Vecinal', desc: 'Comunicación directa entre vecinos y policía a través de una app y grupos de WhatsApp por colonia.', chart: 'vecinos', details: '<strong>Beneficio:</strong> Atención inmediata a reportes ciudadanos y una comunidad organizada para la prevención del delito.' },
                    { id: 'escudo_urbano', title: '🛰️ Escudo Urbano C5i', desc: 'Cámaras con IA, arcos lectores de placas en accesos y botones de pánico en espacios públicos.', visual: { type: 'progress', label: 'Implementación del Escudo Urbano', value: 100 }, details: '<strong>Beneficio:</strong> Un municipio blindado con tecnología de punta para disuadir, identificar y reaccionar eficazmente ante el delito.' },
                    { id: 'justicia_civica', title: '⚖️ Justicia Cívica: Cero Tolerancia', desc: 'Creación de jueces cívicos para sancionar faltas (ruido, basura, desorden) que deterioran la convivencia, conmutando sanciones por trabajo comunitario.', chart: 'justicia_civica_chart', details: '<strong>Beneficio:</strong> Atender los problemas cotidianos que más molestan, fomentando una cultura de respeto y orden en la comunidad.' },
                ],
                eje4: [
                    { id: 'gobierno_escucha', title: '🏛️ Gobierno que Escucha', desc: 'Implementación de Presupuesto Participativo, donde tú decides en qué se invierten tus impuestos.', chart: 'presupuesto_participativo', details: '<strong>Beneficio:</strong> Las obras y proyectos reflejarán las verdaderas necesidades de tu colonia. El poder de decisión regresa a los ciudadanos.' },
                    { id: 'cuentas_claras', title: '👁️ Cuentas Claras en Tiempo Real', desc: 'Plataforma digital para seguir en vivo el avance y costo de cada obra pública. Nómina y contratos a un clic.', visual: { type: 'progress', label: 'Transparencia en Obras y Gastos', value: 100 }, details: '<strong>Beneficio:</strong> Cero espacio para la corrupción. Vigilancia ciudadana total sobre cada peso del presupuesto municipal.' },
                    { id: 'ventanilla_unica', title: '📱 Ventanilla Única Digital', desc: 'Todos los trámites y servicios municipales en una sola app y página web. Paga tu predial o solicita un permiso desde casa.', chart: 'tramites_digitales', details: '<strong>Beneficio:</strong> Adiós a las filas y la burocracia. Un gobierno ágil, eficiente y sin "mordidas" que funciona 24/7 para ti.' },
                    { id: 'servicios_publicos', title: '🛠️ Reporta y Listo (072)', desc: 'Una app y línea directa para reportar baches, fugas o fallas de alumbrado, con garantía de atención en menos de 72 horas.', chart: 'servicios_publicos_chart', details: '<strong>Beneficio:</strong> Un gobierno que responde con rapidez y eficiencia a tus necesidades más básicas, con seguimiento transparente de tu reporte.' },
                ],
                eje5: [
                    { id: 'brigadas_salud', title: '❤️ Salud en tu Colonia', desc: 'Brigadas médicas móviles que llevarán consultas, vacunas y detecciones a todas las delegaciones y barrios.', chart: 'brigadas_chart', details: '<strong>Beneficio:</strong> Atención médica preventiva y de primer nivel al alcance de todos, especialmente para nuestros adultos mayores y niños.' },
                    { id: 'guerra_dengue', title: '🦟 Guardianes contra el Dengue', desc: 'Programa permanente de prevención con participación ciudadana, eliminando criaderos y con nebulización estratégica.', chart: 'dengue_chart', details: '<strong>Beneficio:</strong> Reducción drástica de los casos de dengue, zika y chikungunya, protegiendo la salud de todas las familias.' },
                    { id: 'bienestar_juvenil', title: '🧠 Centro de Bienestar Juvenil', desc: 'Espacio para jóvenes con apoyo psicológico, talleres de arte, deporte y prevención de adicciones.', visual: { type: 'progress', label: 'Jóvenes Atendidos y Protegidos', value: 100 }, details: '<strong>Beneficio:</strong> Ofrecer alternativas saludables y apoyo profesional a nuestros jóvenes para construir un futuro libre de adicciones.' },
                    { id: 'casa_de_dia', title: '👵🏻 Casa de Día para Adultos Mayores', desc: 'Creación de un espacio digno y activo para nuestros mayores, con talleres, atención médica, actividades recreativas y alimentación.', chart: 'adultos_mayores_chart', details: '<strong>Beneficio:</strong> Mejorar la calidad de vida de los adultos mayores, brindándoles un lugar de pertenencia, cuidado y socialización.' },
                ],
                eje6: [
                    { id: 'parque_solar', title: '☀️ Revolución Energética: Parque Solar', desc: 'Construcción de un parque solar municipal para generar energía limpia y reducir el costo de la luz para las familias.', chart: 'parque_solar_chart', details: '<strong>Beneficio:</strong> Ahorro significativo en el recibo de luz de cada hogar y comercio, y un municipio líder en energías renovables.' },
                    { id: 'cosecha_agua', title: '💧 Agua para el Futuro', desc: 'Programa de instalación de sistemas de captación de lluvia y reciclaje de aguas grises en edificios públicos y parques.', chart: 'cosecha_agua_chart', details: '<strong>Beneficio:</strong> Reducir nuestra dependencia de fuentes externas de agua y promover una cultura de cuidado y reutilización del recurso hídrico.' },
                    { id: 'basura_cero', title: '♻️ Teocuitatlán Limpio: Basura Cero', desc: 'Modernización del sistema de recolección, con centros de reciclaje y un programa de compostaje municipal.', chart: 'basura_cero_chart', details: '<strong>Beneficio:</strong> Un municipio más limpio, con menos contaminación y la transformación de la basura en un recurso valioso.' },
                    { id: 'reforestacion_masiva', title: '🌳 Teocuitatlán Verde: Pulmón Regional', desc: 'Programa masivo de reforestación en zonas urbanas y rurales, plantando 10,000 árboles nativos en 3 años.', chart: 'reforestacion_chart', details: '<strong>Beneficio:</strong> Mejorar la calidad del aire, aumentar la captación de agua y crear un entorno más fresco y saludable para todos.' },
                ],
                eje7: [
                    { id: 'unidad_deportiva', title: '🏟️ Unidad Deportiva de Primer Nivel', desc: 'Renovación total: campo de fútbol con pasto natural de alta resistencia, pista de tartán, nueva iluminación y gradas seguras.', visual: { type: 'progress', label: 'Modernización de la Unidad Deportiva', value: 100 }, details: '<strong>Beneficio:</strong> Un espacio digno para nuestros atletas, fomentando el deporte de alto rendimiento y atrayendo torneos regionales.' },
                    { id: 'ciclovia', title: '🚴 Ciclovía Recreativa', desc: 'Construcción de una ciclovía segura y moderna que conecte los puntos clave del municipio, ideal para el deporte y el esparcimiento familiar.', visual: { type: 'progress', label: 'Kilómetros de Ciclovía Construidos', value: 100 }, details: '<strong>Beneficio:</strong> Un espacio seguro para nuestros ciclistas, fomentando un estilo de vida saludable y ofreciendo una nueva opción de recreación para todas las edades.' },
                    { id: 'espacios_activos', title: '🏀 Espacios Activos en tu Colonia', desc: 'Rehabilitación integral de todas las canchas públicas del municipio e instalación de gimnasios al aire libre.', chart: 'canchas_rehabilitadas_chart', details: '<strong>Beneficio:</strong> Deporte de calidad y accesible en cada rincón del municipio, promoviendo la salud y la convivencia familiar.' },
                    { id: 'semillero_campeones', title: '🏆 Semillero de Campeones', desc: 'Creación de las Ligas Municipales oficiales y un programa de becas para apoyar a los atletas destacados de todas las disciplinas.', chart: 'semillero_campeones_chart', details: '<strong>Beneficio:</strong> Plataforma de competencia y apoyo real para que nuestros talentos deportivos puedan desarrollarse y brillar.' },
                ]
            };
            
            function createCard(proposal, isFeatured = false) {
                const chartHtml = proposal.chart ? `<div class="chart-container mt-4"><canvas id="canvas-${proposal.id}" data-chart-config="${proposal.chart}"></canvas></div>` : '';
                const counterHtml = proposal.counter ? `<div class="text-center my-4"><div class="text-7xl font-extrabold text-indigo-700" data-target="${proposal.counter}">0</div><p class="font-bold text-xl mt-2 font-title">Autobuses Nuevos</p></div>` : '';
                const visualHtml = proposal.visual ? `<div class="mt-4 text-center"><p class="font-bold text-stone-700">${proposal.visual.label}</p><div class="progress-bar-container"><div class="progress-bar" data-value="${proposal.visual.value}"></div></div></div>` : '';

                const cardFooter = `
                    <div class="mt-6 pt-4 border-t border-gray-200">
                        <button class="toggle-details text-sm font-bold text-teal-600 hover:text-teal-800 self-start">Ver más +</button>
                    </div>
                `;

                if (isFeatured) {
                    return `
                        <div id="card-${proposal.id}" class="proposal-card w-full p-8 rounded-2xl shadow-lg flex flex-col md:flex-row gap-8">
                            <div class="md:w-1/2">
                                <h3 class="font-bold text-3xl text-stone-800 mb-4">${proposal.title}</h3>
                                <p class="text-stone-600 text-base">${proposal.desc}</p>
                                <div class="details-content mt-4 border-t border-gray-200">
                                    <p class="text-sm text-stone-700">${proposal.details}</p>
                                </div>
                                ${cardFooter}
                            </div>
                            <div class="md:w-1/2 flex items-center justify-center">
                                ${counterHtml}${chartHtml}${visualHtml}
                            </div>
                        </div>
                    `;
                }

                return `
                    <div id="card-${proposal.id}" class="proposal-card p-6 rounded-2xl shadow-lg flex flex-col">
                        <h3 class="font-bold text-2xl text-stone-800 mb-4">${proposal.title}</h3>
                        <p class="text-stone-600 flex-grow text-sm">${proposal.desc}</p>
                        ${counterHtml}${chartHtml}${visualHtml}
                        <div class="details-content mt-4 border-t border-gray-200">
                            <p class="text-sm text-stone-700">${proposal.details}</p>
                        </div>
                        ${cardFooter}
                    </div>
                `;
            }

            function animateCounter(element) {
                const target = +element.dataset.target; let current = 0; const increment = target / 100;
                const interval = setInterval(() => {
                    current += increment;
                    if (current >= target) { current = target; clearInterval(interval); }
                    element.textContent = Math.ceil(current);
                }, 20);
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
                    card.querySelector('.toggle-details').addEventListener('click', (e) => {
                        const details = e.target.closest('.proposal-card').querySelector('.details-content');
                        details.classList.toggle('expanded');
                        e.target.textContent = details.classList.contains('expanded') ? 'Ver menos -' : 'Ver más +';
                    });
                });
            }

            function activateSection(targetId, isInitialLoad = false) {
                Object.values(charts).forEach(chart => {
                    if (chart) chart.destroy();
                });
                charts = {};

                contentSections.forEach(section => section.classList.toggle('active', section.id === targetId));
                navButtons.forEach(button => button.classList.toggle('active', button.dataset.target === targetId));
                
                if (targetId) {
                    renderCards(targetId);
                    setTimeout(() => {
                        if (proposals[targetId]) {
                            proposals[targetId].forEach(p => {
                                if (p.chart) {
                                    const canvas = document.getElementById(`canvas-${p.id}`);
                                    if (canvas) createChart(canvas);
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
                const defaultOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

                switch (type) {
                    case 'alumbrado': config = { type: 'doughnut', data: { datasets: [{ data: [100, 0], backgroundColor: ['#4338ca', '#e5e7eb'], borderColor: ['#fff'], borderWidth: 4 }] }, options: { ...defaultOptions, cutout: '70%', plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Meta: 100% Cobertura LED' } } } }; break;
                    case 'plaza_calidad_chart': config = { type: 'bar', data: { labels: ['Calidad del Espacio Público'], datasets: [{ label: 'Antes', data: [40], backgroundColor: '#f59e0b'}, { label: 'Después', data: [95], backgroundColor: '#4338ca' }] }, options: { ...defaultOptions, plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Mejora del Espacio Público' } }, scales: { y: { beginAtZero: true, max: 100 } } } }; break;
                    case 'agua': config = { type: 'line', data: { labels: ['Año 0', '1', '2', '3'], datasets: [{ label: 'Fugas', data: [40, 30, 15, 5], fill: true, borderColor: '#0ea5e9', backgroundColor: 'rgba(14, 165, 233, 0.1)', tension: 0.4 }] }, options: { ...defaultOptions, plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Reducción de Fugas (%)' } } } }; break;
                    case 'emprendedores': config = { type: 'bar', data: { labels: ['Año 1', 'Año 2', 'Año 3'], datasets: [{ label: 'Nuevas Empresas', data: [15, 35, 50], backgroundColor: '#14b8a6', borderRadius: 4 }] }, options: { ...defaultOptions, plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Nuevas Empresas Creadas' } }, scales: { y: { beginAtZero: true } } } }; break;
                    case 'campo': config = { type: 'bar', data: { labels: ['Ingreso Actual', 'Ingreso Propuesto'], datasets: [{ label: 'Ganancia del Productor', data: [100, 150], backgroundColor: ['#f59e0b', '#4338ca'], borderRadius: 4 }] }, options: { ...defaultOptions, plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Aumento de Rentabilidad' } } } }; break;
                    case 'turismo': config = { type: 'line', data: { labels: ['Año 0', '1', '2', '3'], datasets: [{ label: 'Visitantes', data: [1000, 2500, 4500, 7000], fill: true, borderColor: '#8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.1)', tension: 0.4 }] }, options: { ...defaultOptions, plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Crecimiento Exponencial de Visitantes' } } } }; break;
                    case 'mercado_visitantes_chart': config = { type: 'bar', data: { labels: ['Visitantes Semanales'], datasets: [{ label: 'Antes', data: [500], backgroundColor: '#f59e0b'}, { label: 'Después', data: [1500], backgroundColor: '#4338ca' }] }, options: { ...defaultOptions, plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Aumento de Visitantes al Mercado' } }, scales: { y: { beginAtZero: true } } } }; break;
                    case 'policia_respuesta': config = { type: 'bar', data: { labels: ['Tiempo de Respuesta (Min)'], datasets: [{ label: 'Actual', data: [15], backgroundColor: '#f59e0b'}, { label: 'Propuesta', data: [5], backgroundColor: '#4338ca' }] }, options: { ...defaultOptions, plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Reducción Tiempo de Respuesta' } }, scales: { y: { beginAtZero: true } } } }; break;
                    case 'vecinos': config = { type: 'doughnut', data: { datasets: [{ data: [100, 0], backgroundColor: ['#4338ca', '#e5e7eb'], borderColor: ['#fff'], borderWidth: 4 }] }, options: { ...defaultOptions, cutout: '70%', plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Meta: 100% Colonias Conectadas' } } } }; break;
                    case 'justicia_civica_chart': config = { type: 'doughnut', data: { labels: ['Quejas Atendidas', 'Pendientes'], datasets: [{ data: [95, 5], backgroundColor: ['#14b8a6', '#e5e7eb'], borderColor: ['#fff'], borderWidth: 4 }] }, options: { ...defaultOptions, cutout: '70%', plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Meta: 95% de Quejas Resueltas' } } } }; break;
                    case 'presupuesto_participativo': config = { type: 'doughnut', data: { labels: ['Decidido por Ciudadanos', 'Presupuesto Regular'], datasets: [{ data: [20, 80], backgroundColor: ['#14b8a6', '#e5e7eb'], borderColor: ['#fff'], borderWidth: 4 }] }, options: { ...defaultOptions, cutout: '70%', plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: '20% del Presupuesto en tus Manos' } } } }; break;
                    case 'tramites_digitales': config = { type: 'bar', data: { labels: ['Tiempo para un Trámite (Hrs)'], datasets: [{ label: 'Antes', data: [4], backgroundColor: '#f59e0b'}, { label: 'Ahora', data: [0.25], backgroundColor: '#4338ca' }] }, options: { ...defaultOptions, plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Reducción Drástica de Tiempos' } }, scales: { y: { beginAtZero: true } } } }; break;
                    case 'servicios_publicos_chart': config = { type: 'bar', data: { labels: ['Tiempo de Atención (Días)'], datasets: [{ label: 'Antes', data: [15], backgroundColor: '#f59e0b'}, { label: 'Ahora', data: [3], backgroundColor: '#4338ca' }] }, options: { ...defaultOptions, plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Respuesta Rápida a Reportes' } }, scales: { y: { beginAtZero: true } } } }; break;
                    case 'brigadas_chart': config = { type: 'bar', data: { labels: ['Año 1', 'Año 2', 'Año 3'], datasets: [{ label: 'Consultas Realizadas', data: [2000, 5000, 8000], backgroundColor: '#14b8a6', borderRadius: 4 }] }, options: { ...defaultOptions, plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Consultas Médicas Gratuitas' } }, scales: { y: { beginAtZero: true } } } }; break;
                    case 'dengue_chart': config = { type: 'line', data: { labels: ['Año 0', '1', '2', '3'], datasets: [{ label: 'Casos de Dengue', data: [100, 60, 20, 5], fill: true, borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', tension: 0.4 }] }, options: { ...defaultOptions, plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Reducción de Casos de Dengue' } } } }; break;
                    case 'adultos_mayores_chart': config = { type: 'doughnut', data: { datasets: [{ data: [100, 0], backgroundColor: ['#4338ca', '#e5e7eb'], borderColor: ['#fff'], borderWidth: 4 }] }, options: { ...defaultOptions, cutout: '70%', plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Meta: Atención al 100% de inscritos' } } } }; break;
                    case 'parque_solar_chart': config = { type: 'bar', data: { labels: ['Costo de Electricidad'], datasets: [{ label: 'Costo Actual', data: [100], backgroundColor: '#f59e0b'}, { label: 'Costo con Apoyo Solar', data: [60], backgroundColor: '#4338ca' }] }, options: { ...defaultOptions, plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Reducción en Recibo de Luz (-40%)' } }, scales: { y: { beginAtZero: true } } } }; break;
                    case 'cosecha_agua_chart': config = { type: 'line', data: { labels: ['Año 0', '1', '2', '3'], datasets: [{ label: 'Dependencia Externa', data: [100, 85, 70, 55], fill: true, borderColor: '#0ea5e9', backgroundColor: 'rgba(14, 165, 233, 0.1)', tension: 0.4 }] }, options: { ...defaultOptions, plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Reducción de Dependencia Hídrica (%)' } } } }; break;
                    case 'basura_cero_chart': config = { type: 'doughnut', data: { labels: ['Reciclado/Compostado', 'Relleno Sanitario'], datasets: [{ data: [60, 40], backgroundColor: ['#14b8a6', '#e5e7eb'], borderColor: ['#fff'], borderWidth: 4 }] }, options: { ...defaultOptions, cutout: '70%', plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Meta: 60% de Basura Revalorizada' } } } }; break;
                    case 'reforestacion_chart': config = { type: 'bar', data: { labels: ['Año 1', 'Año 2', 'Año 3'], datasets: [{ label: 'Árboles Plantados', data: [2500, 6000, 10000], backgroundColor: '#14b8a6', borderRadius: 4 }] }, options: { ...defaultOptions, plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Nuevos Árboles para Teocuitatlán' } }, scales: { y: { beginAtZero: true } } } }; break;
                    case 'canchas_rehabilitadas_chart': config = { type: 'doughnut', data: { datasets: [{ data: [100, 0], backgroundColor: ['#4338ca', '#e5e7eb'], borderColor: ['#fff'], borderWidth: 4 }] }, options: { ...defaultOptions, cutout: '70%', plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Meta: 100% Canchas Rehabilitadas' } } } }; break;
                    case 'semillero_campeones_chart': config = { type: 'bar', data: { labels: ['Año 1', 'Año 2', 'Año 3'], datasets: [{ label: 'Atletas Apoyados', data: [20, 50, 100], backgroundColor: '#14b8a6', borderRadius: 4 }] }, options: { ...defaultOptions, plugins: { ...defaultOptions.plugins, title: { ...chartTitleOptions, text: 'Atletas con Beca Deportiva' } }, scales: { y: { beginAtZero: true } } } }; break;
                }
                if(config) charts[chartId] = new Chart(ctx, config);
            }

            navButtons.forEach(button => { button.addEventListener('click', () => { activateSection(button.dataset.target); }); });
            
            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) {
                    backToTopButton.classList.add('show');
                } else {
                    backToTopButton.classList.remove('show');
                }
            });

            backToTopButton.addEventListener('click', () => {
                mainNav.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });

            activateSection('eje1', true);
        });
