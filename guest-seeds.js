(function () {
    const guestDirectorySeed = {
        "1": { nombre: "Rosa Rosero", pases: 1, ninos: 0 },
        "2": { nombre: "Adriana Acosta", pases: 1, ninos: 2 },
        "3": { nombre: "Luis Balladares y Sra.", pases: 2, ninos: 0 },
        "4": { nombre: "Felix Rosero y Familia", pases: 2, ninos: 1 },
        "5": { nombre: "Miguel Nuñez y Familia", pases: 3, ninos: 0 },
        "6": { nombre: "Ernesto Mendoza y Familia", pases: 4, ninos: 0 },
        "7": { nombre: "Margoth Fiallos", pases: 1, ninos: 1 },
        "8": { nombre: "Reinaldo Fiallos y Sra.", pases: 2, ninos: 0 },
        "9": { nombre: "Marco Lopez y Familia", pases: 2, ninos: 1 },
        "10": { nombre: "Mariana Fiallos", pases: 1, ninos: 0 },
        "11": { nombre: "Vinicio Ortiz y Familia", pases: 2, ninos: 2 },
        "12": { nombre: "Juan Acosta y Familia", pases: 2, ninos: 2 },
        "13": { nombre: "Alex Acosta y Familia", pases: 2, ninos: 2 },
        "14": { nombre: "Alex Dinopolus y Sra.", pases: 2, ninos: 0 },
        "15": { nombre: "Dr. Reinoso y Sra.", pases: 2, ninos: 0 },
        "16": { nombre: "Maura Flores", pases: 2, ninos: 0 },
        "17": { nombre: "Candy Sifuentes", pases: 2, ninos: 0 },
        "18": { nombre: "Pascual Hernandez", pases: 2, ninos: 0 },
        "19": { nombre: "Arturo Coyotecatl", pases: 2, ninos: 0 },
        "20": { nombre: "Ana Alvarez", pases: 1, ninos: 0 },
        "21": { nombre: "Francisco Canastuj", pases: 1, ninos: 0 },
        "22": { nombre: "Jose Soto", pases: 2, ninos: 0 },
        "23": { nombre: "Alex Salazar", pases: 2, ninos: 0 },
        "24": { nombre: "Danilo Jordan", pases: 2, ninos: 0 },
        "25": { nombre: "Byron Ulloa y Sra.", pases: 2, ninos: 0 },
        "26": { nombre: "Alfredo Fiallos", pases: 1, ninos: 0 },
        "27": { nombre: "Edwin Fiallos", pases: 1, ninos: 0 },
        "28": { nombre: "Jonathan Fiallos", pases: 1, ninos: 0 },
        "29": { nombre: "Nelson Nuñez", pases: 2, ninos: 0 },
        "30": { nombre: "Mario Nuñez", pases: 2, ninos: 0 },
        "31": { nombre: "Guido Nuñez", pases: 2, ninos: 0 },
        "32": { nombre: "Vinicio Galarza", pases: 2, ninos: 0 },
        "33": { nombre: "Freddy Acosta y Sra.", pases: 2, ninos: 0 },
        "34": { nombre: "Ben", pases: 1, ninos: 0 },
        "35": { nombre: "Jeremy", pases: 3, ninos: 0 },
        "36": { nombre: "Juan Ochoa y Sra.", pases: 2, ninos: 0 },
        "37": { nombre: "Bolívar López", pases: 1, ninos: 0 },
        "38": { nombre: "Armando Cocha", pases: 1, ninos: 0 },
        "39": { nombre: "Miguel Farez", pases: 2, ninos: 0 }
    };

    const guestDirectoriesByEvent = {
        irmanestalin2026: guestDirectorySeed
    };

    window.LocalGuestSeeds = {
        ...(window.LocalGuestSeeds || {}),
        ...guestDirectoriesByEvent
    };

    window.getLocalGuestDirectoryForEvent = function (eventId) {
        const safeEventId = String(eventId || "").trim();
        return guestDirectoriesByEvent[safeEventId] || {};
    };
}());
