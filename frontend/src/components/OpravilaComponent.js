import React, { useEffect, useState } from "react";
import {
    pridobiVsaOpravila,
    ustvariOpravilo,
    izbrisiOpravilo,
    posodobiOpravilo,
    oznaciKotOpravljeno,
    isciOpravila,
    pridobiPrilogeZaOpravilo,
    syncTaskToGoogleCalendar
} from "../services/OpravilaService";
import '../Opravila.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { dodajPrilogoNaStreznik } from "../services/OpravilaService";

const SeznamOpravil = () => {
    const [opravila, nastaviOpravila] = useState([]); // Shranjuje vsa opravila
    const [novoOpravilo, nastaviNovoOpravilo] = useState({ aktivnost: '', opis: '', opravljeno: '',datumCas: null, reminderMethod: 'none' }); // Stanje za novo opravilo
    const [urediOpravilo, nastaviUrediOpravilo] = useState(null); // Stanje za urejanje obstoječih opravil
    const [iskalniNiz, nastaviIskalniNiz] = useState('');// za iskanje
    const [uporabnikId, nastaviUporabnikId] = useState(null); // Default user's ID
    const [priloge, nastaviPriloge] = useState({});
    const [prikazanePriloge, nastaviPrikazanePriloge] = useState([]);
    const [syncingId, setSyncingId] = useState(null);

    useEffect(() => {
        // Automatically set defaultUser
        const defaultUserId = 1; // Assuming the `defaultUser` has ID 1
        nastaviUporabnikId(defaultUserId);
        naloziOpravila(defaultUserId);
    }, []);

    const naloziOpravila = (uporabnikId) => {
        console.log("Fetching tasks for user:", uporabnikId);
        pridobiVsaOpravila(uporabnikId).then((odziv) => {
            if (Array.isArray(odziv)) {
                nastaviOpravila(odziv);
            } else {
                console.error("Nepričakovana oblika odziva:", odziv);
            }
        }).catch((napaka) => {
            console.error("Napaka pri pridobivanju opravil", napaka);
        });
    };

    const rocnObrisi = (id) => {
         izbrisiOpravilo(id).then(() => {
            naloziOpravila(uporabnikId); // Ponovno naloži opravila po brisanju
        }).catch((napaka) => {
            console.error("Napaka pri brisanju opravila", napaka);
        });
    };

    const rocnUstvari = () => {
        ustvariOpravilo({ ...novoOpravilo, uporabnik: { id: uporabnikId } })
            .then((ustvarjenoOpravilo) => {
                alert("Opravilo uspešno ustvarjeno!");
                naloziOpravila(uporabnikId); // Refresh tasks
                // Reset form
                nastaviNovoOpravilo({ aktivnost: '', opis: '', opravljeno: '', datumCas: null, reminderMethod: 'none' });
            })
            .catch((napaka) => {
                console.error("Napaka pri ustvarjanju opravila:", napaka);
            });
    };

    const rocnUredi = (opravilo) => {
        nastaviUrediOpravilo(opravilo);
        nastaviNovoOpravilo({
            aktivnost: opravilo.aktivnost,
            opis: opravilo.opis,
            opravljeno: opravilo.opravljeno,
            datumCas: new Date(opravilo.datumCas),
            reminderMethod: opravilo.reminderMethod || 'none'

        }); // Predizpolni obrazec
    };

    const rocnPosodobi = () => {
        posodobiOpravilo(urediOpravilo.id, { ...novoOpravilo, uporabnik: { id: uporabnikId } })
            .then((posodobljenoOpravilo) => {
                alert("Opravilo uspešno posodobljeno!");
                naloziOpravila(uporabnikId); // Refresh tasks
                // Reset form
                nastaviNovoOpravilo({ aktivnost: '', opis: '', opravljeno: '', datumCas: null, reminderMethod: 'none' });
                nastaviUrediOpravilo(null); // Clear edit state
            })
            .catch((napaka) => {
                console.error("Napaka pri posodabljanju opravila:", napaka);
            });
    };

    //Oznaci kot opravljeno
    const rocnoOznaciKotOpravljenoo = (id)=>{
        oznaciKotOpravljeno(id).then(()=>{
            naloziOpravila(uporabnikId);
        }).catch((napaka)=>{
            console.error("Napaka pri oznacevanju opravila na opravljeno",  napaka);
        })
    }

    const rocnoIskanje = () => {
        isciOpravila(iskalniNiz, uporabnikId).then((odziv) => {
            nastaviOpravila(odziv); // Nastavi iskalne rezultate
        }).catch((napaka) => {
            console.error("Napaka pri iskanju opravil", napaka);
        });
    };

    const obravnavaSpremembeVnosa = (e) => {
        const { name, value } = e.target;
        nastaviNovoOpravilo({ ...novoOpravilo, [name]: value });
    };

    const dodajPrilogo = async (opraviloId) => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "*/*"; // Dovolite vse vrste datotek, po potrebi prilagodite
        fileInput.onchange = async (event) => {
            const file = event.target.files[0];
            if (file) {
                const formData = new FormData();
                formData.append("priloga", file);
                try {
                    await dodajPrilogoNaStreznik(opraviloId, formData);
                    alert("Priloga uspešno naložena!");
                    // Ponovno naloži opravila, da osvežimo seznam z novo prilogo
                    naloziOpravila(uporabnikId);
                } catch (error) {
                    console.error("Napaka pri nalaganju priloge:", error);
                    alert("Napaka pri nalaganju priloge.");
                }
            }
        };
        fileInput.click();
    };

    const naloziPrilogeZaOpravilo = async (opraviloId) => {
        try {
            const priloge = await pridobiPrilogeZaOpravilo(opraviloId);
            nastaviPriloge((prejsnjePriloge) => ({
                ...prejsnjePriloge,
                [opraviloId]: priloge,
            }));
        } catch (napaka) {
            console.error(`Napaka pri nalaganju prilog za opravilo ${opraviloId}:`, napaka);
        }
    };

    const prikaziPriloge = (id) => {
        // Check if attachments are already loaded
        if (!priloge[id]) {
            naloziPrilogeZaOpravilo(id);
        }
        // Toggle visibility
        if (!prikazanePriloge.includes(id)) {
            nastaviPrikazanePriloge([...prikazanePriloge, id]);
        }
    };

    const skrijPriloge = (id) => {
        nastaviPrikazanePriloge(prikazanePriloge.filter((prilogaId) => prilogaId !== id));
    };


    const sinhronizirajZGCal = async (opravilo) => {
        setSyncingId(opravilo.id);
        try {
            // Preverjanje, ali obstajajo ključni podatki
            if (!opravilo.aktivnost || !opravilo.datumCas) {
                alert("Manjkajo ključni podatki: naslov ali datum za Google Calendar.");
                return;
            }

            await syncTaskToGoogleCalendar(opravilo);
            alert("Opravilo uspešno dodano v Google Calendar!");
        } catch (error) {
            console.error("Napaka pri dodajanju v Google Calendar:", error.message);
            alert("Napaka pri dodajanju v Google Calendar. Preveri podatke.");
        } finally {
            setSyncingId(null);
        }
    };

    return (
        <div className="todo-container">
            <h2 className="naslov-aplikacije">To-Do App (Opravila)</h2>

            <h3 className="naslov-seznama">Seznam Opravil</h3>

            {/* Obrazec za novo opravilo */}
            <div className="vnosno-podrocje">
                <input
                    type="text"
                    name="aktivnost"
                    placeholder="Naslov opravila"
                    value={novoOpravilo.aktivnost}
                    onChange={obravnavaSpremembeVnosa}
                    className="vnosno-polje"
                />
                <input
                    type="text"
                    name="opis"
                    placeholder="Opis opravila"
                    value={novoOpravilo.opis}
                    onChange={obravnavaSpremembeVnosa}
                    className="vnosno-polje"
                />
                <DatePicker
                    selected={novoOpravilo.datumCas}
                    onChange={(date) => nastaviNovoOpravilo({ ...novoOpravilo, datumCas: date })}
                    showTimeSelect
                    dateFormat="Pp"
                    placeholderText="Izberite datum in čas"
                    className="vnosno-polje"
                />
                <div>
                    <p>Izberite način opomnika:</p>
                    <label>
                        <input
                            type="radio"
                            name="reminderMethod"
                            value="email"
                            checked={novoOpravilo.reminderMethod === 'email'}
                            onChange={(e) => nastaviNovoOpravilo({ ...novoOpravilo, reminderMethod: e.target.value })}
                        />
                        E-pošta
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="reminderMethod"
                            value="sms"
                            checked={novoOpravilo.reminderMethod === 'sms'}
                            onChange={(e) => nastaviNovoOpravilo({ ...novoOpravilo, reminderMethod: e.target.value })}
                        />
                        SMS
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="reminderMethod"
                            value="none"
                            checked={novoOpravilo.reminderMethod === 'none'}
                            onChange={(e) => nastaviNovoOpravilo({ ...novoOpravilo, reminderMethod: e.target.value })}
                        />
                        Brez opomnika
                    </label>
                </div>
                {urediOpravilo ? (
                    <button onClick={rocnPosodobi} className="gumb">Posodobi opravilo</button>
                ) : (
                    <button onClick={rocnUstvari} className="gumb">Dodaj opravilo</button>
                )}
            </div>
            {/* Iskalno polje */}
            <div className="iskalno-podrocje">
                <input
                    type="text"
                    placeholder="Iskanje po aktivnosti"
                    value={iskalniNiz}
                    onChange={(e) => nastaviIskalniNiz(e.target.value)}
                    className="vnosno-polje"
                />
                <button onClick={rocnoIskanje} className="gumb">Išči</button>
            </div>
            {/* Seznam opravil */}
            <ul className="seznam-opravil">
                {Array.isArray(opravila) && opravila.length > 0 ? (
                    opravila.map((opravilo) => (
                        <li key={opravilo.id} className="opravilo">
                            <span>{opravilo.aktivnost} - {opravilo.opis}</span>
                            {opravilo.datumCas && (
                                <span className="datum-cas">
                                    Datum in čas: {new Date(opravilo.datumCas).toLocaleString()}
                                </span>
                            )}
                            <span className="reminder-method">
                                Način opomnika: {opravilo.reminderMethod === 'email' ? 'E-pošta' : opravilo.reminderMethod === 'sms' ? 'SMS' : 'Brez opomnika'}
                            </span>
                            <div className="opravilo-gumbi">
                                {!opravilo.opravljeno ? (
                                    <button onClick={() => rocnoOznaciKotOpravljenoo(opravilo.id)} className={"gumb-opravljeno"}>
                                        Opravljeno
                                    </button>
                                ) : (
                                    <span className="kljukica">✔️</span>
                                )}
                                <button onClick={() => rocnUredi(opravilo)} className="gumb-uredi">Uredi</button>
                                <button onClick={() => rocnObrisi(opravilo.id)} className="gumb-izbrisi">Izbriši</button>
                                <button onClick={() => dodajPrilogo(opravilo.id)}>Dodaj prilogo</button>
                                <button
                                    onClick={() => sinhronizirajZGCal(opravilo)}
                                    disabled={syncingId === opravilo.id}
                                >
                                    {syncingId === opravilo.id
                                        ? "Dodajanje..."
                                        : "Dodaj v Google Calendar"}
                                </button>
                                {prikazanePriloge.includes(opravilo.id) ? (
                                    <>
                                        <ul>
                                            {priloge[opravilo.id] && priloge[opravilo.id].length > 0 ? (
                                                priloge[opravilo.id].map((priloga) => (
                                                    <li key={priloga.id}>
                                                        <a href={priloga.povezava} target="_blank" rel="noopener noreferrer">
                                                            {priloga.ime}
                                                        </a>
                                                    </li>
                                                ))
                                            ) : (
                                                <li>Ni prilog za to opravilo.</li>
                                            )}
                                        </ul>
                                        <button onClick={() => skrijPriloge(opravilo.id)}>Skrij priloge</button>
                                    </>
                                ) : (
                                    <button onClick={() => prikaziPriloge(opravilo.id)}>Prikaži priloge</button>
                                )}
                            </div>
                        </li>
                    ))
                ) : (
                    <p>Ni razpoložljivih opravil</p>
                )}
            </ul>
        </div>
    );
};

export default SeznamOpravil;
