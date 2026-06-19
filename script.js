document.documentElement.classList.add('js-anim');

async function waitForRSVPDatabase(timeoutMs = 2400) {
    const startedAt = Date.now();

    while (!window.RSVPDatabase) {
        if (Date.now() - startedAt >= timeoutMs) return false;
        await new Promise(function(resolve) {
            setTimeout(resolve, 60);
        });
    }

    return true;
}

document.addEventListener('DOMContentLoaded', async function() {
    initLangToggle();
    await waitForRSVPDatabase();
    await hydrateSiteConfigForEvent();
    applySiteConfig();
    await InvitadoApp.init();
    MensajeFlota.init();
    MusicaPlayer.init();
    initPortada();
    initScrollAnimations();
    initSectionSeparadorRotativo();
    initTrayectoriaLightbox();
    initCountdown();
    initRSVP();
    initGiftModal();
});

const externalConfig = window.config || {};

function resolveEventId() {
    const eventConfig = externalConfig.event || {};
    const eventIdParam = String(eventConfig.eventIdParam || 'eventId').trim() || 'eventId';
    const defaultEventId = String(eventConfig.defaultEventId || 'promocion-anthonyjr-2026').trim() || 'promocion-anthonyjr-2026';
    const params = new URLSearchParams(window.location.search || '');
    const paramValue = String(params.get(eventIdParam) || '').trim();
    const eventId = paramValue || defaultEventId;

    return {
        eventId,
        eventIdParam,
        defaultEventId
    };
}

const EventContext = resolveEventId();
window.EventContext = EventContext;
window.currentEventId = EventContext.eventId;

function normalizeRemoteEventConfig(rawConfig) {
    if (!rawConfig || typeof rawConfig !== 'object') return {};

    const remoteEvento = rawConfig.evento && typeof rawConfig.evento === 'object'
        ? rawConfig.evento
        : {};
    const remoteCeremonia = (remoteEvento.ceremonia && typeof remoteEvento.ceremonia === 'object'
        ? remoteEvento.ceremonia
        : rawConfig.ceremonia) || {};
    const remoteRecepcion = (remoteEvento.recepcion && typeof remoteEvento.recepcion === 'object'
        ? remoteEvento.recepcion
        : rawConfig.recepcion) || {};

    return {
        ...rawConfig,
        evento: {
            ...remoteEvento,
            ceremonia: {
                ...remoteCeremonia,
                ubicacionUrl: remoteCeremonia.ubicacionUrl || remoteCeremonia.ubicacion || ''
            },
            recepcion: {
                ...remoteRecepcion,
                ubicacionUrl: remoteRecepcion.ubicacionUrl || remoteRecepcion.ubicacion || ''
            }
        }
    };
}

function createSiteConfig(remoteConfig) {
    const normalizedRemoteConfig = normalizeRemoteEventConfig(remoteConfig);
    const localEvento = (externalConfig && externalConfig.evento) || {};
    const remoteEvento = normalizedRemoteConfig.evento || {};

    return {
        seo: {
            titulo: 'Anthony Jr. Lopez',
            descripcion: 'Celebremos los éxitos y la vida de Anthony Jr. Lopez - 27 de junio de 2026',
            autor: 'Two Design',
            ...externalConfig.seo,
            ...normalizedRemoteConfig.seo
        },
        pareja: {
            nombres: 'Anthony Jr. Lopez',
            fecha: '27-06-2026',
            fechaVisible: '27.06.2026',
            ...externalConfig.pareja,
            ...normalizedRemoteConfig.pareja
        },
        musica: {
            titulo: 'Nuestra Canción',
            archivo: 'audio/goldenhour.mp3',
            ...externalConfig.musica,
            ...normalizedRemoteConfig.musica
        },
        evento: {
            ceremonia: {
                titulo: '',
                lugar: '',
                hora: '',
                direccion: '',
                ubicacionUrl: '',
                ...(localEvento.ceremonia || {}),
                ...(remoteEvento.ceremonia || {})
            },
            recepcion: {
                titulo: 'Recepción',
                lugar: 'Vista Penthouse Ballroom & Catering',
                hora: '7:00 PM',
                direccion: '27-05 39th Ave, Long Island City, NY 11101, United States',
                ubicacionUrl: 'https://maps.apple/p/_pXDYRpviixPmz',
                ...(localEvento.recepcion || {}),
                ...(remoteEvento.recepcion || {})
            }
        },
        textos: {
            mensajeInvitado: 'Tu presencia hace este logro aún más especial',
            mensajePases: 'Hemos reservado para ti {pases}',
            ...externalConfig.textos,
            ...normalizedRemoteConfig.textos
        },
        footer: {
            hashtag: '#AnthonyJrLopez',
            instagramUrl: 'https://instagram.com/thetwodesign',
            facebookUrl: 'https://facebook.com/thetwodesign',
            marcaTexto: 'Diseño',
            marcaNombre: 'Two Design',
            marcaUrl: 'https://twodesign.com',
            ...externalConfig.footer,
            ...normalizedRemoteConfig.footer
        }
    };
}

let SiteConfig = createSiteConfig();
window.SiteConfig = SiteConfig;

async function hydrateSiteConfigForEvent() {
    try {
        const rsvpDB = window.RSVPDatabase;
        if (!rsvpDB || typeof rsvpDB.getEventConfig !== 'function') return;

        const eventId = String(window.currentEventId || '').trim();
        const remoteConfig = await rsvpDB.getEventConfig(eventId);
        if (!remoteConfig || typeof remoteConfig !== 'object') return;

        SiteConfig = createSiteConfig(remoteConfig);
        window.SiteConfig = SiteConfig;
    } catch (error) {
        console.warn('No se pudo cargar configuración remota del evento. Se usará config local:', error);
    }
}

function splitPairNames(nombres) {
    const safeNombres = String(nombres || '').trim();
    const parts = safeNombres.split('&');
    const left = (parts[0] || '').trim();
    const right = (parts[1] || '').trim();
    return { left, right };
}

function setStyledWord(container, word) {
    if (!container) return;
    const initialEl = container.querySelector('.inicial, .musica-inicial, .event-inicial');
    const restEl = container.querySelector('.resto, .musica-resto, .event-resto');
    const safeWord = String(word || '').trim();

    if (!safeWord) return;
    if (initialEl) initialEl.textContent = safeWord.charAt(0);
    if (restEl) restEl.textContent = safeWord.slice(1);
}

function applySiteConfig() {
    applySeoConfig();
    const { left, right } = splitPairNames(SiteConfig.pareja.nombres);

    const portadaNames = document.querySelectorAll('.portada-nombres .nombre');
    if (portadaNames[0]) setStyledWord(portadaNames[0], left);
    if (portadaNames[1]) setStyledWord(portadaNames[1], right);

    const heroNames = document.querySelectorAll('.hero-invitado-nombres .nombre');
    if (heroNames[0]) setStyledWord(heroNames[0], left);
    if (heroNames[1]) setStyledWord(heroNames[1], right);

    const heroDate = document.querySelector('.hero-invitado-fecha');
    if (heroDate) heroDate.textContent = SiteConfig.pareja.fechaVisible;

    const musicaTitulo = String(SiteConfig.musica.titulo || '').trim().split(/\s+/);
    const musicaWords = document.querySelectorAll('.musica-titulo .musica-palabra');
    if (musicaWords[0] && musicaTitulo[0]) {
        const firstInitial = musicaWords[0].querySelector('.musica-inicial');
        const firstRest = musicaWords[0].querySelector('.musica-resto');
        if (firstInitial) firstInitial.textContent = musicaTitulo[0].charAt(0);
        if (firstRest) firstRest.textContent = musicaTitulo[0].slice(1);
    }
    if (musicaWords[1] && musicaTitulo[1]) {
        const secondInitial = musicaWords[1].querySelector('.musica-inicial');
        const secondRest = musicaWords[1].querySelector('.musica-resto');
        if (secondInitial) secondInitial.textContent = musicaTitulo[1].charAt(0);
        if (secondRest) secondRest.textContent = musicaTitulo[1].slice(1);
    }

    const audioSource = document.querySelector('#musica-audio source');
    const audioEl = document.getElementById('musica-audio');
    if (audioSource && SiteConfig.musica.archivo) {
        audioSource.setAttribute('src', SiteConfig.musica.archivo);
    }
    if (audioEl) audioEl.load();

    const invitadoMensaje = document.querySelector('.invitado-mensaje');
    if (invitadoMensaje) invitadoMensaje.textContent = SiteConfig.textos.mensajeInvitado;

    applyEventCard('.events-container .event-card:nth-child(1)', SiteConfig.evento.recepcion);
    applyFooterConfig();
}

function applySeoConfig() {
    if (SiteConfig.seo.titulo) {
        document.title = SiteConfig.seo.titulo;
    }

    setMetaContent('description', SiteConfig.seo.descripcion);
    setMetaContent('author', SiteConfig.seo.autor);
}

function setMetaContent(name, value) {
    if (!value) return;
    const meta = document.querySelector('meta[name="' + name + '"]');
    if (!meta) return;
    meta.setAttribute('content', value);
}

function applyEventCard(selector, data) {
    const card = document.querySelector(selector);
    if (!card || !data) return;

    const initial = card.querySelector('.event-inicial');
    const rest = card.querySelector('.event-resto');
    const titulo = String(data.titulo || '').trim();
    if (titulo) {
        if (initial) initial.textContent = titulo.charAt(0);
        if (rest) rest.textContent = titulo.slice(1);
    }

    const timeEl = card.querySelector('.event-time');
    const lugarEl = card.querySelector('.event-lugar');
    const direccionEl = card.querySelector('.event-direccion');
    const linkEl = card.querySelector('.btn-location');

    if (timeEl) timeEl.textContent = data.hora || '';
    if (lugarEl) lugarEl.textContent = data.lugar || '';
    if (direccionEl) direccionEl.textContent = data.direccion || '';
    if (linkEl) linkEl.setAttribute('href', data.ubicacionUrl || '#');
}

function applyFooterConfig() {
    const instagramEl = document.querySelector('#social-icons a[aria-label="Instagram"]');
    if (instagramEl && SiteConfig.footer.instagramUrl) {
        instagramEl.setAttribute('href', SiteConfig.footer.instagramUrl);
    }

    const facebookEl = document.querySelector('#social-icons a[aria-label="Facebook"]');
    if (facebookEl && SiteConfig.footer.facebookUrl) {
        facebookEl.setAttribute('href', SiteConfig.footer.facebookUrl);
    }
}

// ============================================
// CONFIGURACIÓN - Editar aquí los invitados
// ============================================
const GuestConfig = {
    invitados: {
        "1": { nombre: "Miguel Núñez y Familia", pases: 3 },
        "2": { nombre: "Hendry Solís y Familia", pases: 3 },
        "3": { nombre: "Guido Núñez y Silvia Lescano", pases: 2 },
        "4": { nombre: "Karina Montoya", pases: 1 },
        "5": { nombre: "Julio Carrillo y Esposa", pases: 2 },
        "6": { nombre: "Alex Salazar y Esposa", pases: 2 },
        "7": { nombre: "René Andino y Esposa", pases: 2 },
        "8": { nombre: "Franklin Fiallos y Esposa", pases: 2 },
        "9": { nombre: "Lourdes Fiallos", pases: 2 },
        "10": { nombre: "Fernanda Lescano", pases: 2 },
        "11": { nombre: "Luis Balladares y Esposa", pases: 2 },
        "12": { nombre: "Danilo Jordan y Esposa", pases: 2 },
        "13": { nombre: "Byron Ulloa y Esposa", pases: 2 },
        "14": { nombre: "Mario Núñez y Esposa", pases: 2 },
        "15": { nombre: "Nelson Núñez y Esposa", pases: 2 },
        "16": { nombre: "Adriana Acosta y Familia", pases: 3 },
        "17": { nombre: "Estalin López y Esposa", pases: 2 },
        "18": { nombre: "Félix Rosero y Esposa", pases: 2 },
        "19": { nombre: "Ricardo y Esposa", pases: 2 },
        "20": { nombre: "Juan Ochoa y Esposa", pases: 4 },
        "21": { nombre: "Carlos Mota y Esposa", pases: 2 },
        "22": { nombre: "Rosa Rosero", pases: 1 },
        "23": { nombre: "Jeremy Helsel", pases: 1 },
        "24": { nombre: "Tony López", pases: 1 },
        "25": { nombre: "Rodrigo Bayas y Familia", pases: 4 },
        "26": { nombre: "Miguel Rosero", pases: 1 },
        "27": { nombre: "Víctor Florence", pases: 2 },
        "28": { nombre: "Manuela Gill", pases: 1 },
        "29": { nombre: "Marcos Santana y Esposa", pases: 2 },
        "30": { nombre: "Guido Reinoso y Esposa", pases: 2 },
        "31": { nombre: "Nicole Berrios", pases: 1 },
        "32": { nombre: "Leysha", pases: 1 },
        "33": { nombre: "Gustavo Silva", pases: 1 },
        "34": { nombre: "Ben Swann", pases: 1 },
        "35": { nombre: "Juan and Anna", pases: 2 },
        "36": { nombre: "Gino Lavarone", pases: 1 },
        "37": { nombre: "Ángel Villagómez", pases: 2 },
        "38": { nombre: "Gelena Solano", pases: 2 },
        "39": { nombre: "Héctor Vides y Esposa", pases: 2 },
        "40": { nombre: "Natalia D", pases: 2 },
        "41": { nombre: "Touria y Familia", pases: 2 },
        "42": { nombre: "Miggy y Esposo", pases: 2 },
        "43": { nombre: "Whitney", pases: 1 },
        "44": { nombre: "Benji", pases: 1 },
        "45": { nombre: "Ms. Befumo", pases: 1 },
        "46": { nombre: "Marlon Mora y Esposa", pases: 2 },
        "47": { nombre: "Diego", pases: 1 },
        "48": { nombre: "James Stauffer", pases: 2 },
        "49": { nombre: "Ashley Pérez", pases: 1 },
        "50": { nombre: "Angel Villamos", pases: 1 },
        "51": { nombre: "Tommy and Riley", pases: 2 },
        "52": { nombre: "Owen and Mecenna", pases: 2 },
        "53": { nombre: "Married by Roxy", pases: 2 },
        "54": { nombre: "Beatriz and Héctor", pases: 2 },
        "55": { nombre: "Shane", pases: 1 },
        "56": { nombre: "Drew", pases: 2 },
        "57": { nombre: "Joe Matenti", pases: 2 },
        "58": { nombre: "Jessica Alvarado", pases: 2 },
        "59": { nombre: "Ana", pases: 1 },
        "60": { nombre: "Kevin", pases: 1 },
        "61": { nombre: "Ray", pases: 1 },
        "62": { nombre: "Martín", pases: 1 },
        "63": { nombre: "Sergio Meza y Esposa", pases: 2 },
        "64": { nombre: "Harrison and Kayla", pases: 2 },
        "65": { nombre: "Bailee", pases: 1 }
    },
    invitadoDefault: { nombre: "Miguel Núñez y Familia", pases: 3 },
    paramId: 'id'
};

window.GuestConfig = GuestConfig;

// ============================================
// APP DE INVITADOS - Lógica reutilizable
// ============================================
const InvitadoApp = {
    data: null,

    async init() {
        const localGuest = this.getLocalFromURL();
        const remoteGuest = await this.getRemoteGuest(localGuest.id);
        this.data = remoteGuest || localGuest;
        this.renderSection();
        this.renderRSVP();
        return this.data;
    },

    getLocalFromURL() {
        const params = new URLSearchParams(window.location.search);
        const rawId = String(params.get(GuestConfig.paramId) || '').trim();
        const safeId = rawId || 'default';
        const invitado = GuestConfig.invitados[rawId];

        if (invitado) {
            return {
                id: safeId,
                nombre: String(invitado.nombre || ''),
                pases: Math.max(1, Number(invitado.pases) || 1),
                activo: true
            };
        }

        return {
            id: safeId,
            nombre: String(GuestConfig.invitadoDefault.nombre || ''),
            pases: Math.max(1, Number(GuestConfig.invitadoDefault.pases) || 1),
            activo: true
        };
    },

    async getRemoteGuest(guestId) {
        try {
            const rsvpDB = window.RSVPDatabase;
            if (!rsvpDB || typeof rsvpDB.getInvitadoById !== 'function') return null;

            const eventId = String(window.currentEventId || '').trim();
            const remoteGuest = await rsvpDB.getInvitadoById(eventId, guestId);
            if (!remoteGuest || typeof remoteGuest !== 'object') return null;

            return {
                id: String(remoteGuest.id || guestId || 'default'),
                nombre: String(remoteGuest.nombre || '').trim() || String(GuestConfig.invitadoDefault.nombre || ''),
                pases: Math.max(1, Number(remoteGuest.pases) || Number(GuestConfig.invitadoDefault.pases) || 1),
                activo: typeof remoteGuest.activo === 'undefined' ? true : Boolean(remoteGuest.activo)
            };
        } catch (error) {
            console.warn('No se pudo cargar invitado remoto. Se usará fallback local:', error);
            return null;
        }
    },

    renderSection() {
        const nombreEl = document.getElementById('nombre-invitado');

        if (nombreEl) nombreEl.textContent = this.data.nombre;
        this.renderPasesText(this.data.pases);
    },

    renderPasesText(pases) {
        const lugaresEl = document.querySelector('.invitado-lugares');
        if (!lugaresEl) return;

        const template = String(SiteConfig.textos.mensajePases || '');
        if (!template.includes('{pases}')) {
            lugaresEl.textContent = template;
            return;
        }

        const parts = template.split('{pases}');
        const numeroEl = document.createElement('span');
        numeroEl.id = 'numero-lugares';
        numeroEl.textContent = String(pases);

        const textoEl = document.createElement('span');
        textoEl.id = 'texto-lugares';
        textoEl.textContent = Number(pases) === 1 ? ' espacio para adulto' : ' espacios para adultos';

        lugaresEl.replaceChildren(
            document.createTextNode(parts[0] || ''),
            numeroEl,
            textoEl
        );
    },

    renderRSVP() {
        const nameInput = document.getElementById('rsvp-name');
        const guestsWrapper = document.getElementById('guest-count-wrapper');
        const guestsSelect = document.getElementById('guest-count');
        const responseYes = document.getElementById('rsvp-response-yes');
        const responseNo = document.getElementById('rsvp-response-no');
        const totalPases = Math.max(1, Number(this.data && this.data.pases) || 1);

        if (nameInput) {
            nameInput.value = this.data.nombre;
            nameInput.readOnly = true;
        }

        if (guestsSelect) {
            guestsSelect.replaceChildren();

            for (let i = 1; i <= totalPases; i += 1) {
                const option = document.createElement('option');
                option.value = String(i);
                const t = translations[currentLang] || translations['es'];
                option.textContent = i + ' ' + (i === 1 ? t.guest_singular : t.guest_plural);
                guestsSelect.appendChild(option);
            }

            guestsSelect.value = String(totalPases);
            guestsSelect.disabled = true;
            guestsSelect.required = false;
        }

        if (guestsWrapper) {
            guestsWrapper.style.display = 'none';
        }
        if (responseYes) responseYes.checked = false;
        if (responseNo) responseNo.checked = false;
    },

    getData() {
        return this.data;
    }
};

function initPortada() {
    const portada = document.getElementById('portada');
    const btnAbrir = document.getElementById('btn-abrir');
    const envelopeTrigger = document.getElementById('portada-envelope-trigger');
    const invitacion = document.getElementById('invitacion');
    
    if (!portada || !btnAbrir || !invitacion) return;

    function openInvitation() {
        MusicaPlayer.play();
        MusicaPlayer.showControl();
        
        portada.classList.add('abrir');
        invitacion.classList.add('revelar');
        MensajeFlota.mostrar();
        
        setTimeout(function() {
            portada.style.display = 'none';
        }, 1200);
    }

    btnAbrir.addEventListener('click', openInvitation);
    if (envelopeTrigger) {
        envelopeTrigger.addEventListener('click', openInvitation);
    }
}

// ============================================
// REPRODUCTOR DE MÚSICA
// ============================================
const MusicaPlayer = {
    audio: null,
    btn: null,
    editorialBtn: null,
    fab: null,
    progressFill: null,
    status: null,
    isPlaying: false,

    init() {
        this.audio = document.getElementById('musica-audio');
        this.btn = document.getElementById('musica-btn');
        this.editorialBtn = document.getElementById('btnMusic');
        this.fab = document.getElementById('music-fab');
        this.progressFill = document.querySelector('.musica-progress-fill');
        this.status = document.querySelector('.musica-status');

        const invitation = document.getElementById('invitacion');
        if (invitation && invitation.classList.contains('revelar')) {
            this.showControl();
        }
        
        if (this.audio) {
            this.audio.volume = 0.4;
            
            this.audio.addEventListener('timeupdate', () => {
                this.updateProgress();
            });
            
            this.audio.addEventListener('ended', () => {
                this.audio.play();
            });
        }
        
        if (this.btn && this.audio) {
            this.btn.addEventListener('click', () => {
                this.toggle();
            });
        }

        if (this.editorialBtn && this.audio) {
            this.editorialBtn.addEventListener('click', () => {
                this.toggle();
            });
        }
    },

    updateProgress() {
        if (!this.audio || !this.progressFill) return;
        
        const percent = (this.audio.currentTime / this.audio.duration) * 100;
        this.progressFill.style.width = percent + '%';
    },

    play() {
        if (!this.audio) return;
        
        this.audio.volume = 0.4;
        const playPromise = this.audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                this.isPlaying = true;
                this.updateUI();
            }).catch(() => {
                this.isPlaying = false;
            });
        }
    },

    pause() {
        if (!this.audio) return;
        this.audio.pause();
        this.isPlaying = false;
        this.updateUI();
    },

    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    },

    showControl() {
        if (!this.fab) return;
        this.fab.classList.add('is-visible');
    },

    updateUI() {
        if (this.btn) {
            this.btn.classList.toggle('playing', this.isPlaying);
            this.btn.setAttribute('aria-pressed', this.isPlaying ? 'true' : 'false');
            this.btn.setAttribute('aria-label', this.isPlaying ? 'Pausar música' : 'Reanudar música');
        }

        if (this.editorialBtn) {
            this.editorialBtn.classList.toggle('is-playing', this.isPlaying);
            this.editorialBtn.setAttribute('aria-pressed', this.isPlaying ? 'true' : 'false');
            this.editorialBtn.textContent = this.isPlaying ? '❚❚' : '▶';
        }

        if (this.fab) {
            this.fab.classList.toggle('playing', this.isPlaying);
        }
        
        if (this.status) {
            this.status.classList.toggle('active', this.isPlaying);
            this.status.textContent = this.isPlaying ? 'Reproduciendo' : 'Pausado';
        }
    }
};

// ============================================
// MENSAJE FLOTANTE
// ============================================
const MensajeFlota = {
    el: null,

    init() {
        this.el = document.getElementById('scroll-hint');
    },

    mostrar() {
        if (!this.el) return;
        
        this.el.classList.add('mostrar');
        
        setTimeout(() => {
            this.el.classList.remove('mostrar');
        }, 10000);
    }
};

function initScrollAnimations() {
    const elements = document.querySelectorAll('.section, .separator, .footer, .fade-in-element, .zoom-in-element');

    elements.forEach((element, index) => {
        const revealOrder = index % 4;
        element.style.setProperty('--reveal-order', String(revealOrder));
    });
    
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.14
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    elements.forEach(element => {
        observer.observe(element);
    });
}

function initCountdown() {
    const eventDate = getEventDateFromConfig();
    
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = eventDate - now;
        
        if (distance < 0) {
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function getEventDateFromConfig() {
    return new Date('2026-06-27T19:00:00').getTime();
}

function initSectionSeparadorRotativo() {
    const section = document.querySelector('.section-separador-rotativo');
    if (!section) return;

    const imageEl = section.querySelector('.separador-foto-img');
    const raw = String(section.getAttribute('data-rotativo-images') || '').trim();
    if (!imageEl || !raw) return;

    const images = raw.split(',').map(function(item) {
        return item.trim();
    }).filter(Boolean);

    if (images.length < 2) return;

    let index = 0;
    imageEl.src = images[index];

    setInterval(function() {
        index = (index + 1) % images.length;
        imageEl.src = images[index];
    }, 3200);
}

function initTrayectoriaLightbox() {
    const buttons = Array.from(document.querySelectorAll('.trayectoria-open'));
    const lightbox = document.getElementById('trayectoria-lightbox');
    const imageEl = document.getElementById('trayectoria-lightbox-img');
    const closeBtn = document.getElementById('trayectoria-lightbox-close');
    const prevBtn = document.getElementById('trayectoria-prev');
    const nextBtn = document.getElementById('trayectoria-next');

    if (!buttons.length || !lightbox || !imageEl || !closeBtn || !prevBtn || !nextBtn) return;

    const images = buttons.map(function(button) {
        const img = button.querySelector('img');
        return {
            src: img ? img.getAttribute('src') : '',
            alt: img ? img.getAttribute('alt') : 'Foto de trayectoria'
        };
    }).filter(function(item) {
        return Boolean(item.src);
    });

    if (!images.length) return;

    let currentIndex = 0;

    function render(index) {
        const total = images.length;
        currentIndex = (index + total) % total;
        imageEl.src = images[currentIndex].src;
        imageEl.alt = images[currentIndex].alt;
    }

    function open(index) {
        render(index);
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function close() {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    buttons.forEach(function(button, index) {
        button.addEventListener('click', function() {
            open(index);
        });
    });

    prevBtn.addEventListener('click', function() {
        render(currentIndex - 1);
    });

    nextBtn.addEventListener('click', function() {
        render(currentIndex + 1);
    });

    closeBtn.addEventListener('click', close);

    lightbox.addEventListener('click', function(event) {
        if (event.target === lightbox) close();
    });

    document.addEventListener('keydown', function(event) {
        if (!lightbox.classList.contains('active')) return;
        if (event.key === 'Escape') close();
        if (event.key === 'ArrowLeft') render(currentIndex - 1);
        if (event.key === 'ArrowRight') render(currentIndex + 1);
    });
}

function initRSVP() {
    const form = document.getElementById('rsvp-form');
    const successMessage = document.getElementById('rsvp-success');
    const finalMessage = document.getElementById('rsvp-final-message');
    const introMessage = document.querySelector('#rsvp-section .rsvp-intro');
    const submitBtn = document.getElementById('rsvp-submit');
    const responseYes = document.getElementById('rsvp-response-yes');
    const responseNo = document.getElementById('rsvp-response-no');
    const guestCountWrapper = document.getElementById('guest-count-wrapper');
    const guestCountSelect = document.getElementById('guest-count');
    const activeEventId = String(window.currentEventId || '').trim();
    let formLocked = false;
    let isCheckingStatus = false;
    let popupTimer = null;
    const defaultIntroText = introMessage ? introMessage.textContent : '';
    
    if (!form) return;

    function getSelectedResponse() {
        if (responseYes && responseYes.checked) return 'si';
        if (responseNo && responseNo.checked) return 'no';
        return '';
    }

    function getConfirmationMessage(respuesta) {
        const t = translations[currentLang] || translations['es'];
        return respuesta === 'si' ? t.rsvp_popup_si : t.rsvp_popup_no;
    }

    function getConfirmedIntroText() {
        const t = translations[currentLang] || translations['es'];
        return t.rsvp_confirmed_intro;
    }

    function showPopup(message, isError = false) {
        let overlay = document.getElementById('rsvp-popup-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'rsvp-popup-overlay';
            overlay.className = 'rsvp-popup-overlay';
            overlay.innerHTML = [
                '<div class="rsvp-popup" role="status" aria-live="polite">',
                '<p class="rsvp-popup-message"></p>',
                '<button type="button" class="rsvp-popup-close" aria-label="Cerrar mensaje">Aceptar</button>',
                '</div>'
            ].join('');
            document.body.appendChild(overlay);

            const closeBtn = overlay.querySelector('.rsvp-popup-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', function() {
                    overlay.classList.remove('active');
                });
            }

            overlay.addEventListener('click', function(event) {
                if (event.target === overlay) {
                    overlay.classList.remove('active');
                }
            });
        }

        const popup = overlay.querySelector('.rsvp-popup');
        const messageEl = overlay.querySelector('.rsvp-popup-message');
        if (messageEl) {
            messageEl.textContent = message;
        }
        if (popup) {
            popup.classList.toggle('is-error', Boolean(isError));
        }

        overlay.classList.add('active');
        if (popupTimer) clearTimeout(popupTimer);
        popupTimer = setTimeout(function() {
            overlay.classList.remove('active');
        }, 3600);
    }

    function setConfirmedFormVisibility(confirmed) {
        form.hidden = confirmed;
        form.setAttribute('aria-hidden', confirmed ? 'true' : 'false');
        form.style.display = confirmed ? 'none' : '';
    }

    function setIntroMessageForConfirmed(confirmed) {
        if (!introMessage) return;
        introMessage.textContent = confirmed ? getConfirmedIntroText() : defaultIntroText;
    }

    function setFormLocked(locked) {
        formLocked = locked;
        form.classList.toggle('is-locked', locked);

        const controls = form.querySelectorAll('input, select, textarea, button');
        controls.forEach(function(control) {
            if (control.id === 'rsvp-name') {
                control.readOnly = true;
                control.disabled = locked;
                return;
            }
            control.disabled = locked;
        });

        if (submitBtn) {
            submitBtn.disabled = locked;
            submitBtn.style.display = locked ? 'none' : '';
        }
    }

    function toggleGuestCountField() {
        if (!guestCountWrapper || !guestCountSelect) return;

        const shouldShow = Boolean(responseYes && responseYes.checked);
        guestCountWrapper.style.display = shouldShow ? 'block' : 'none';
        guestCountSelect.disabled = !shouldShow || formLocked;
        guestCountSelect.required = false;

        if (!shouldShow) {
            const firstOption = guestCountSelect.options[0];
            if (firstOption) guestCountSelect.value = firstOption.value;
        }
    }

    function showPermanentMessage(respuesta) {
        const message = getConfirmationMessage(respuesta);
        if (finalMessage) {
            finalMessage.textContent = message;
        }
        if (successMessage) {
            successMessage.style.display = 'block';
        }
    }

    function applyConfirmedState(record) {
        const respuesta = String(record && record.respuesta || '').toLowerCase() === 'si' ? 'si' : 'no';
        const confirmedCount = Math.max(0, Number(record && record.cantidadConfirmada) || 0);

        if (responseYes) responseYes.checked = respuesta === 'si';
        if (responseNo) responseNo.checked = respuesta === 'no';

        if (guestCountSelect && respuesta === 'si') {
            const fallbackValue = guestCountSelect.options.length > 0 ? guestCountSelect.options[guestCountSelect.options.length - 1].value : '1';
            const desiredValue = confirmedCount > 0 ? String(confirmedCount) : fallbackValue;
            const hasDesiredOption = Array.from(guestCountSelect.options).some(function(option) {
                return option.value === desiredValue;
            });
            const safeValue = hasDesiredOption ? desiredValue : fallbackValue;
            guestCountSelect.value = safeValue;
        }

        toggleGuestCountField();
        showPermanentMessage(respuesta);
        setFormLocked(true);
        setConfirmedFormVisibility(true);
        setIntroMessageForConfirmed(true);
    }

    async function getExistingConfirmation(guestId) {
        const rsvpDB = window.RSVPDatabase;
        if (!rsvpDB || typeof rsvpDB.getConfirmationByGuestId !== 'function') return null;
        return rsvpDB.getConfirmationByGuestId(activeEventId, guestId);
    }

    async function saveConfirmation(payload) {
        const rsvpDB = window.RSVPDatabase;
        if (!rsvpDB || typeof rsvpDB.saveConfirmation !== 'function') {
            throw new Error('RSVPDatabase no disponible');
        }
        return rsvpDB.saveConfirmation(activeEventId, payload);
    }

    if (responseYes) {
        responseYes.addEventListener('change', toggleGuestCountField);
    }
    if (responseNo) {
        responseNo.addEventListener('change', toggleGuestCountField);
    }

    toggleGuestCountField();

    const guestData = InvitadoApp.getData() || {};
    const guestId = String(guestData.id || 'default');

    function buildWhatsappMessage(respuesta, passesValue) {
        const t = translations[currentLang] || translations['es'];
        const guestNameInput = document.getElementById('rsvp-name');
        const guestName = String((guestNameInput && guestNameInput.value) || (guestData && guestData.nombre) || 'Invitado').trim();
        const selectedPasses = Math.max(1, Number(passesValue) || 1);
        const pasesLabel = currentLang === 'en'
            ? (selectedPasses === 1 ? 'adult' : 'adults')
            : (selectedPasses === 1 ? 'adulto' : 'adultos');

        if (respuesta === 'no') {
            return t.wa_no.replace('{nombre}', guestName);
        }

        return t.wa_si
            .replace('{nombre}', guestName)
            .replace('{pases}', selectedPasses)
            .replace('{pases_label}', pasesLabel);
    }

    function openWhatsappConfirmation(respuesta, passesValue) {
        const text = encodeURIComponent(buildWhatsappMessage(respuesta, passesValue));
        const waUrl = 'https://wa.me/16464620346?text=' + text;
        window.open(waUrl, '_blank', 'noopener');
    }

    async function checkConfirmedStatusOnLoad() {
        isCheckingStatus = true;
        if (submitBtn) submitBtn.disabled = true;

        try {
            const existing = await getExistingConfirmation(guestId);
            if (existing && existing.confirmado) {
                applyConfirmedState(existing);
            } else if (submitBtn && !formLocked) {
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('No se pudo verificar estado RSVP:', error);
            if (submitBtn && !formLocked) submitBtn.disabled = false;
        } finally {
            isCheckingStatus = false;
        }
    }

    checkConfirmedStatusOnLoad();
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (formLocked) return;

        if (isCheckingStatus) {
            showPopup((translations[currentLang] || translations['es']).rsvp_popup_validando, true);
            return;
        }

        toggleGuestCountField();

        const respuesta = getSelectedResponse();
        if (!respuesta) {
            showPopup((translations[currentLang] || translations['es']).rsvp_popup_selecciona, true);
            return;
        }

        if (respuesta === 'si') {
            const selectedCount = guestCountSelect ? String(guestCountSelect.value || '').trim() : '';
            const requestedCount = Number(selectedCount);
            const maxAllowedCount = Math.max(1, Number(guestData.pases) || 1);
            const isValidCount = selectedCount
                && Number.isInteger(requestedCount)
                && requestedCount >= 1
                && requestedCount <= maxAllowedCount;

            if (!isValidCount) {
                showPopup((translations[currentLang] || translations['es']).rsvp_popup_cantidad, true);
                return;
            }
        }

        const confirmedCount = respuesta === 'si'
            ? Math.max(1, Number(guestCountSelect && guestCountSelect.value) || 0)
            : 0;

        const payload = {
            id: guestId,
            nombre: String(guestData.nombre || ''),
            pasesAsignados: Math.max(1, Number(guestData.pases) || 1),
            respuesta,
            cantidadConfirmada: confirmedCount,
            confirmado: true,
            fechaConfirmacion: Date.now()
        };

        if (submitBtn) submitBtn.disabled = true;
        
        try {
            const savedRecord = await saveConfirmation(payload);
            applyConfirmedState(savedRecord);
            showPopup(getConfirmationMessage(respuesta));
            openWhatsappConfirmation(respuesta, confirmedCount);
        } catch (error) {
            if (error && error.code === 'RSVP_ALREADY_CONFIRMED') {
                const existingRecord = (error.existingData && error.existingData.confirmado)
                    ? error.existingData
                    : await getExistingConfirmation(guestId);

                if (existingRecord && existingRecord.confirmado) {
                    applyConfirmedState(existingRecord);
                    const existingResponse = String(existingRecord.respuesta || '').toLowerCase() === 'si' ? 'si' : 'no';
                    showPopup(getConfirmationMessage(existingResponse));
                    return;
                }
            }

            console.error('Error al guardar RSVP:', error);
            if (submitBtn && !formLocked) submitBtn.disabled = false;
            showPopup((translations[currentLang] || translations['es']).rsvp_popup_error, true);
        }
    });
}

function initGiftModal() {
    const openBtn = document.getElementById('btn-account-modal');
    const modal = document.getElementById('gift-modal');
    const closeBtn = document.getElementById('gift-modal-close');
    const copyBtn = document.getElementById('btn-copy-account');
    const feedbackEl = document.getElementById('gift-copy-feedback');
    const dataEl = document.getElementById('gift-account-data');

    if (!openBtn || !modal || !closeBtn || !copyBtn || !dataEl) return;

    function openModal() {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    async function copyAccountData() {
        const data = dataEl.innerText.trim();
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(data);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = data;
                textarea.setAttribute('readonly', '');
                textarea.style.position = 'absolute';
                textarea.style.left = '-9999px';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }
            if (feedbackEl) feedbackEl.textContent = 'Datos copiados al portapapeles.';
        } catch {
            if (feedbackEl) feedbackEl.textContent = 'No se pudo copiar. Intenta de nuevo.';
        }
    }

    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', function(event) {
        if (event.target.dataset.modalClose === 'true') {
            closeModal();
        }
    });

    copyBtn.addEventListener('click', copyAccountData);

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// ============================================
// SISTEMA DE TRADUCCIÓN
// ============================================
let currentLang = 'es';

const translations = {
  es: {
    portada_kicker: "Celebremos juntos a",
    portada_boton: "Abrir invitación",
    scroll_hint: "Desliza hacia abajo",
    names_text: "Hay logros que se construyen en silencio, con dedicación, constancia y pasión. Hoy quiero que seas parte de este momento que marca un nuevo capítulo en mi carrera.",
    invitado_mensaje: "Tu presencia hace este logro aún más especial",
    invitado_lugares: "Hemos reservado para ti {pases} espacios para adultos",
    countdown_titulo: ["F","alta","m","uy","p","oco","p","ara","e","l","g","ran","d","ía"],
    countdown_dias: "Días",
    countdown_horas: "Horas",
    countdown_min: "Min",
    countdown_seg: "Seg",
    btn_calendar: "Agregar al calendario",
    nuevo_texto: "Este logro no habría sido posible sin la dedicación, el apoyo incondicional de quienes confiaron en mí y la firme convicción de nunca conformarme con menos de lo mejor.",
    nuevo_titulo: "¡Celebremos juntos!",
    itinerary_title: "Itinerario",
    itinerary_item_1: "Cocktail Hour",
    itinerary_item_2: "Protocolo y gran anuncio",
    itinerary_item_3: "Cena",
    itinerary_item_4: "Palabras emotivas",
    itinerary_item_5: "Despedida",
    recepcion_titulo: "Recepción",
    btn_location: "Ver ubicación",
    dresscode_title: "Código de vestimenta",
    dresscode_text: "Esta noche merece tu mejor versión. Te invitamos a vestir formal en tono negro para celebrar juntos este gran logro.",
    gifts_title: "Lluvia de Sobres",
    gifts_text: "Tu presencia es mi mejor regalo. Si deseas tener un detalle conmigo, contaremos con lluvia de sobres.",
    trayectoria_title: "Mi Trayectoria",
    trayectoria_text: "Un recorrido de estos últimos años llenos de experiencias, crecimiento y dedicación.",
    playlist_title: "Playlist",
    playlist_text: "Ayúdame a crear la playlist perfecta para esta noche. Agrega esa canción que no puede faltar.",
    btn_playlist: "Agregar canción",
    wishes_title: "Buenos Deseos",
    wishes_text: "Déjame un mensaje especial para guardar este recuerdo por siempre en mi corazón.",
    btn_wish_open: "Déjame tu deseo",
    btn_wish_read: "Leer buenos deseos",
    wish_label_nombre: "Nombre",
    wish_placeholder_nombre: "Tu nombre",
    wish_label_deseo: "Deseo",
    wish_placeholder_deseo: "Escribe tu mensaje",
    btn_wish_submit: "Enviar deseo",
    wishes_empty: "Aún no hay deseos. Sé el primero en dejarme uno.",
    rsvp_title: "Confirmar Asistencia",
    rsvp_intro: "Tu presencia hará este día aún más especial. Por favor confirma tu asistencia antes del 19 de Junio.",
    rsvp_label_nombre: "Nombre del invitado",
    rsvp_label_asistencia: "Asistirás",
    rsvp_si: "Sí, con mucho gusto",
    rsvp_no: "No, lamentablemente no podré",
    rsvp_label_pases: "Passes",
    guest_singular: "pase",
    guest_plural: "pases",
    btn_rsvp: "Confirmar asistencia",
    rsvp_popup_si: "Gracias por confirmar tu asistencia. Te vemos pronto.",
    rsvp_popup_no: "Lamentamos que no puedas acompañarnos, te extrañaremos.",
    rsvp_popup_validando: "Estamos validando tu estado de confirmación. Intenta de nuevo en un momento.",
    rsvp_popup_selecciona: "Por favor selecciona si asistirás.",
    rsvp_popup_cantidad: "Selecciona la cantidad de adultos para confirmar.",
    rsvp_popup_error: "No pudimos guardar tu confirmación. Intenta nuevamente.",
    rsvp_confirmed_intro: "Gracias por haber completado el formulario de asistencia.",
    rsvp_final_si: "Gracias por confirmar tu asistencia. Este mensaje quedará visible de forma permanente.",
    wa_si: "Hola! Soy {nombre}, confirmo mi asistencia a la celebración de Anthony Jr. Lopez el 27 de junio. Asistiré con {pases} {pases_label}.",
    wa_no: "Hola! Soy {nombre}, lamentablemente no podré asistir a la celebración de Anthony Jr. Lopez el 27 de junio.",
    calendar_url: "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Celebremos%20a%20Anthony%20Jr.%20Lopez&dates=20260627T190000/20260627T230000&ctz=America/New_York&details=Celebremos%20juntos&location=27-05%2039th%20Ave%2C%20Long%20Island%20City%2C%20NY%2011101%2C%20United%20States",
    frase_final: "La excelencia no se anuncia, se demuestra - y ahora viene la mejor parte: ¡celebrarlo juntos!",
  },

  en: {
    portada_kicker: "Join us in celebrating",
    portada_boton: "Open invitation",
    scroll_hint: "Scroll to explore",
    names_text: "Some achievements are built quietly — through discipline, resilience, and an unwavering commitment to excellence. Tonight, I want you here to mark this new chapter with me.",
    invitado_mensaje: "Having you here means everything",
    invitado_lugares: "We've reserved {pases} adult spaces in your honor",
    countdown_titulo: ["T","he","b","ig","n","ight","i","s","a","lmost","h","ere","",""],
    countdown_dias: "Days",
    countdown_horas: "Hours",
    countdown_min: "Min",
    countdown_seg: "Sec",
    btn_calendar: "Add to calendar",
    nuevo_texto: "This achievement wouldn’t have been possible without the dedication, the unconditional support of those who believed in me, and the determination to never settle for anything less than the best.",
    nuevo_titulo: "Let's celebrate together!",
    itinerary_title: "Schedule",
    itinerary_item_1: "Cocktail Hour",
    itinerary_item_2: "Formal program & big announcement",
    itinerary_item_3: "Dinner",
    itinerary_item_4: "Heartfelt remarks",
    itinerary_item_5: "Farewell",
    recepcion_titulo: "Reception",
    btn_location: "View location",
    dresscode_title: "Dress Code",
    dresscode_text: "Tonight calls for your finest. We invite you to dress in formal black — because every great achievement deserves a room that looks the part.",
    gifts_title: "Envelope Shower",
    gifts_text: "Your presence is the greatest gift of all. Should you wish to offer a personal gesture, we'll have an envelope shower to receive your kind tokens of appreciation.",
    trayectoria_title: "My Journey",
    trayectoria_text: "Years of growth, learning, and unforgettable experiences that shaped who I am today.",
    playlist_title: "Playlist",
    playlist_text: "Help set the tone for the evening. Add the song that belongs on tonight's soundtrack — the one that can't be left out.",
    btn_playlist: "Add a song",
    wishes_title: "Best Wishes",
    wishes_text: "Leave me a message — something I'll carry with me long after tonight.",
    btn_wish_open: "Write a wish",
    btn_wish_read: "Read wishes",
    wish_label_nombre: "Name",
    wish_placeholder_nombre: "Your name",
    wish_label_deseo: "Message",
    wish_placeholder_deseo: "Write something meaningful",
    btn_wish_submit: "Send",
    wishes_empty: "No wishes yet. Be the first to leave one.",
    rsvp_title: "RSVP",
    rsvp_intro: "Your presence would make this evening truly unforgettable. Please confirm your attendance by June 19th.",
    rsvp_label_nombre: "Guest name",
    rsvp_label_asistencia: "Will you be joining us?",
    rsvp_si: "Absolutely, I'll be there",
    rsvp_no: "I won't be able to make it",
    rsvp_label_pases: "Passes",
    guest_singular: "pass",
    guest_plural: "passes",
    btn_rsvp: "Confirm attendance",
    rsvp_popup_si: "Thank you for confirming! We can't wait to celebrate with you.",
    rsvp_popup_no: "We're sorry you won't be able to make it — you'll be missed.",
    rsvp_popup_validando: "We're verifying your confirmation status. Please try again in a moment.",
    rsvp_popup_selecciona: "Please let us know if you'll be attending.",
    rsvp_popup_cantidad: "Please select the number of guests to confirm.",
    rsvp_popup_error: "We couldn't save your confirmation. Please try again.",
    rsvp_confirmed_intro: "Your response has been recorded. Thank you!",
    rsvp_final_si: "Thank you for confirming your attendance. This message will remain permanently visible.",
    wa_si: "Hi! This is {nombre}. I'm happy to confirm my attendance at Anthony Jr. Lopez's celebration on June 27th. I'll be attending with {pases} {pases_label}.",
    wa_no: "Hi! This is {nombre}. Unfortunately, I won't be able to attend Anthony Jr. Lopez's celebration on June 27th.",
    calendar_url: "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Anthony%20Jr.%20Lopez%20%C2%B7%20Promotion%20Celebration&dates=20260627T190000/20260627T230000&ctz=America/New_York&details=A%20celebration%20in%20honor%20of%20Anthony%20Jr.%20Lopez%27s%20career%20promotion.&location=27-05%2039th%20Ave%2C%20Long%20Island%20City%2C%20NY%2011101%2C%20United%20States",
    frase_final: "Excellence speaks for itself — and the best part? Tonight, we get to celebrate it together.",
  }
};

function applyTranslation(lang) {
  currentLang = lang;
  const t = translations[lang];
  if (!t) return;
  const titleKeysWithSpans = ['recepcion_titulo', 'rsvp_title', 'wishes_title', 'playlist_title', 'gifts_title'];

  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    const key = el.getAttribute('data-i18n');
    if (titleKeysWithSpans.includes(key)) return;
    if (t[key] !== undefined) el.textContent = t[key];
  });

  // Countdown título
  if (t && t.countdown_titulo) {
    const palabras = document.querySelectorAll('.countdown-titulo .countdown-palabra');
    const words = t.countdown_titulo;
    let wordIndex = 0;
    palabras.forEach(function(palabra) {
      const inicial = palabra.querySelector('.countdown-inicial');
      const resto = palabra.querySelector('.countdown-resto');
      if (inicial && words[wordIndex] !== undefined) {
        inicial.textContent = words[wordIndex];
        wordIndex++;
      }
      if (resto && words[wordIndex] !== undefined) {
        resto.textContent = words[wordIndex];
        wordIndex++;
      }
    });
  }

  document.querySelectorAll('[data-i18n-template]').forEach(function(el) {
    const key = el.getAttribute('data-i18n-template');
    if (t[key] === undefined) return;

    const passes = Math.max(1, Number(InvitadoApp.getData() && InvitadoApp.getData().pases) || 1);
    const parts = String(t[key]).split('{pases}');
    const numeroEl = document.createElement('span');
    numeroEl.id = 'numero-lugares';
    numeroEl.textContent = String(passes);

    el.replaceChildren(
      document.createTextNode(parts[0] || ''),
      numeroEl,
      document.createTextNode(parts[1] || '')
    );
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key] !== undefined) el.setAttribute('placeholder', t[key]);
  });

  const itineraryNames = document.querySelectorAll('.itinerary-name');
  itineraryNames.forEach(function(el, index) {
    const key = 'itinerary_item_' + (index + 1);
    if (t[key] !== undefined) el.textContent = t[key];
  });

  // Itinerary title
  const itineraryTitle = document.querySelector('.itinerary-title');
  if (itineraryTitle && t.itinerary_title) {
    const word = t.itinerary_title;
    const inicialEl = itineraryTitle.querySelector('.itinerary-inicial');
    const restoEl = itineraryTitle.querySelector('.itinerary-resto');
    if (inicialEl && restoEl) {
      inicialEl.textContent = word.charAt(0);
      restoEl.textContent = word.slice(1);
    }
  }

  const recepcionTitulo = document.querySelector('[data-i18n="recepcion_titulo"]');
  if (recepcionTitulo && t.recepcion_titulo) {
    const word = t.recepcion_titulo;
    const initialEl = recepcionTitulo.querySelector('.event-inicial');
    const restEl = recepcionTitulo.querySelector('.event-resto');
    if (initialEl && restEl) {
      initialEl.textContent = word.charAt(0);
      restEl.textContent = word.slice(1);
    } else {
      recepcionTitulo.textContent = word;
    }
  }

  const rsvpTitle = document.querySelector('[data-i18n="rsvp_title"]');
  if (rsvpTitle && t.rsvp_title) {
    const words = t.rsvp_title.split(' ');
    const palabras = rsvpTitle.querySelectorAll('.rsvp-title-palabra');
    if (palabras.length >= 1 && words[0]) {
      const i1 = palabras[0].querySelector('.rsvp-title-inicial');
      const r1 = palabras[0].querySelector('.rsvp-title-resto');
      if (i1 && r1) { i1.textContent = words[0].charAt(0); r1.textContent = words[0].slice(1); }
    }
    if (palabras.length >= 2 && words[1]) {
      const i2 = palabras[1].querySelector('.rsvp-title-inicial');
      const r2 = palabras[1].querySelector('.rsvp-title-resto');
      if (i2 && r2) { i2.textContent = words[1].charAt(0); r2.textContent = words[1].slice(1); }
    } else if (palabras.length >= 2) {
      const i2 = palabras[1].querySelector('.rsvp-title-inicial');
      const r2 = palabras[1].querySelector('.rsvp-title-resto');
      if (i2 && r2) { i2.textContent = ''; r2.textContent = ''; }
    }
  }

  const rsvpNameLabel = document.querySelector('label[for="rsvp-name"]');
  if (rsvpNameLabel && t.rsvp_label_nombre) {
    rsvpNameLabel.textContent = t.rsvp_label_nombre;
  }

  const wishesTitle = document.querySelector('[data-i18n="wishes_title"]');
  if (wishesTitle && t.wishes_title) {
    const words = t.wishes_title.split(' ');
    const iniciales = wishesTitle.querySelectorAll('.wishes-title-inicial');
    const restos = wishesTitle.querySelectorAll('.wishes-title-resto');
    if (iniciales[0] && restos[0] && words[0]) {
      iniciales[0].textContent = words[0].charAt(0);
      restos[0].textContent = words[0].slice(1);
    }
    if (iniciales[1] && restos[1] && words[1]) {
      iniciales[1].textContent = words[1].charAt(0);
      restos[1].textContent = words[1].slice(1);
    }
  }

  const playlistTitle = document.querySelector('[data-i18n="playlist_title"]');
  if (playlistTitle && t.playlist_title) {
    const word = t.playlist_title;
    const initialEl = playlistTitle.querySelector('.playlist-title-inicial');
    const restEl = playlistTitle.querySelector('.playlist-title-resto');
    if (initialEl && restEl) {
      initialEl.textContent = word.charAt(0);
      restEl.textContent = word.slice(1);
    }
  }

  const giftsTitle = document.querySelector('[data-i18n="gifts_title"]');
  if (giftsTitle && t.gifts_title) {
    const words = t.gifts_title.split(' ');
    const firstWord = words.shift() || '';
    const secondWord = words.pop() || '';
    const middleWords = words.length ? words.join(' ') + ' ' : '';
    const iniciales = giftsTitle.querySelectorAll('.gifts-title-inicial');
    const restos = giftsTitle.querySelectorAll('.gifts-title-resto');
    if (iniciales[0] && restos[0] && firstWord) {
      iniciales[0].textContent = firstWord.charAt(0);
      restos[0].textContent = firstWord.slice(1) + (secondWord ? ' ' : '') + middleWords;
    }
    if (iniciales[1] && restos[1] && secondWord) {
      iniciales[1].textContent = secondWord.charAt(0);
      restos[1].textContent = secondWord.slice(1);
    }
  }

  const calendarBtn = document.querySelector('[data-calendar-link="true"]');
  if (calendarBtn && t.calendar_url) {
    calendarBtn.setAttribute('href', t.calendar_url);
  }

  const wishesEmpty = document.querySelector('.wishes-empty');
  if (wishesEmpty && t.wishes_empty) {
    wishesEmpty.textContent = t.wishes_empty;
  }

  // Actualizar opciones del select de pases
  const guestsSelect = document.getElementById('guest-count');
  if (guestsSelect && guestsSelect.options.length > 0) {
    const t = translations[lang];
    Array.from(guestsSelect.options).forEach(function(option) {
      const val = Number(option.value);
      if (!isNaN(val) && val > 0) {
        option.textContent = val + ' ' + (val === 1 ? t.guest_singular : t.guest_plural);
      }
    });
  }

  const langBtn = document.getElementById('lang-fab-btn');
  if (langBtn) langBtn.textContent = lang === 'es' ? 'ENG' : 'ES';

  document.documentElement.setAttribute('lang', lang === 'es' ? 'es' : 'en');
}

function initLangToggle() {
  const fab = document.createElement('div');
  fab.className = 'lang-fab';
  fab.id = 'lang-fab';
  fab.innerHTML = '<button id="lang-fab-btn" class="lang-fab-btn" type="button" aria-label="Switch language">ENG</button>';
  document.body.appendChild(fab);

  document.getElementById('lang-fab-btn').addEventListener('click', function() {
    const nextLang = currentLang === 'es' ? 'en' : 'es';
    applyTranslation(nextLang);
  });
}

// Inicializar toggle de idioma cuando el DOM esté listo
// (se llama dentro del DOMContentLoaded existente — ver instrucción abajo)
