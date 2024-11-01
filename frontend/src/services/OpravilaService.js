import axios from "axios";

// Ustvarjanje Axios instance z osnovnim URL-jem
const apiOdjemalec = axios.create({
    baseURL: "http://localhost:8080/opravila", // Osnovni URL za vaš API
    headers: {
        "Content-Type": "application/json",
    },
});

// Pridobi vsa opravila
export const pridobiVsaOpravila = async () => {
    try {
        const odziv = await apiOdjemalec.get("");
        return odziv.data; // Neposredno vrni podatke
    } catch (napaka) {
        console.error("Napaka pri pridobivanju opravil:", napaka);
        throw napaka; // Znova sproži napako za obravnavo v komponenti
    }
};

// Pridobi opravilo po ID-ju
export const pridobiOpraviloPoId = async (id) => {
    try {
        const odziv = await apiOdjemalec.get(`/${id}`);
        return odziv.data; // Neposredno vrni podatke
    } catch (napaka) {
        console.error(`Napaka pri pridobivanju opravila z ID-jem ${id}:`, napaka);
        throw napaka; // Znova sproži napako
    }
};

// Ustvari novo opravilo
export const ustvariOpravilo = async (opravilo) => {
    try {
        const odziv = await apiOdjemalec.post("", opravilo);
        return odziv.data; // Vrni ustvarjene podatke o opravilu
    } catch (napaka) {
        console.error("Napaka pri ustvarjanju opravila:", napaka);
        throw napaka; // Znova sproži napako
    }
};

// Posodobi opravilo
export const posodobiOpravilo = async (id, opravilo) => {
    try {
        const odziv = await apiOdjemalec.put(`/${id}`, opravilo);
        return odziv.data; // Vrni posodobljene podatke o opravilu
    } catch (napaka) {
        console.error(`Napaka pri posodabljanju opravila z ID-jem ${id}:`, napaka);
        throw napaka; // Znova sproži napako
    }
};

// Izbriši opravilo
export const izbrisiOpravilo = async (id) => {
    try {
        await apiOdjemalec.delete(`/${id}`);
    } catch (napaka) {
        console.error(`Napaka pri brisanju opravila z ID-jem ${id}:`, napaka);
        throw napaka; // Znova sproži napako
    }
};

//Posodobi opravilo na opravljeno
export const oznaciKotOpravljeno = async (id) =>{
    try{
        const odziv = await apiOdjemalec.put(`/${id}/opravi`);
        return odziv.data;
    }catch (napaka){
        console.error(`Napaka pri označevanju opravila z ID-jem ${id} kot opravljeno:`, napaka);
        throw napaka;
    }
}

// Iskanje opravil po aktivnosti
export const isciOpravila = async (query) => {
    try {
        const odziv = await apiOdjemalec.get(`/search?aktivnost=${query}`);
        return odziv.data;
    } catch (napaka) {
        console.error("Napaka pri iskanju opravil:", napaka);
        throw napaka;
    }
};
