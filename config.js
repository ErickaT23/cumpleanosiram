const config = {
    event: {
        defaultEventId: "irmanstalin2026",
        eventIdParam: "eventId",
        eventDate: "2026-08-01T13:30:00",
        eventName: "Irman Estalin Lopez",
        maxGuests: 6,
        legacyFallback: {
            read: false,
            write: false,
            subscribe: false
        }
    },

    admin: {
        adminKey: "twodesign123",
        keyParam: "key",
        legacyKeyParam: "admin"
    },

    seo: {
        titulo: "Irman Estalin Lopez",
        descripcion: "Celebremos juntos la vida",
        autor: "Two Design"
    },

    pareja: {
        nombres: "Irman Estalin Lopez",
        fecha: "01-08-2026",
        fechaVisible: "01.08.2026"
    },

    musica: {
        titulo: "Nuestra Canción",
        archivo: "audio/cancion.mp3"
    },

    evento: {
        bendicion: {
            titulo: "Bendición del Negocio",
            lugar: "La Lavandería de Stalin",
            hora: "1:30 PM",
            direccion: "54-22 31st Ave, Woodside, NY 11377, United States",
            ubicacionUrl: "https://share.google/LOSU7umZPkkgv4c7U"
        },
        recepcion: {
            titulo: "Celebración",
            lugar: "Terrace On The Park",
            hora: "7:30 PM",
            direccion: "52-11 111th St, Queens, NY 11368, United States",
            ubicacionUrl: "https://maps.apple/p/Y9vPoC194GsG.D"
        }
    },

    textos: {
        mensajeInvitado: "Tu presencia hace este momento aún más memorable",
        mensajePases: "Hemos reservado para ti {pases}"
    },

    footer: {
        hashtag: "#IrmanEstalinLopez",
        instagramUrl: "https://instagram.com/thetwodesign",
        facebookUrl: "https://facebook.com/thetwodesign",
        marcaTexto: "Diseño",
        marcaNombre: "Two Design",
        marcaUrl: "https://twodesign.com"
    }
};

window.config = config;
