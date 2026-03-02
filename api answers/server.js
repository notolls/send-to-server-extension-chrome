const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

// Svarbu: CORS leidžia plėtiniui susisiekti su lokaliu serveriu
app.use(cors());
app.use(express.json());

const RESPONSES_FILE = path.join(__dirname, "responses.json");

// Funkcija nuskaityti atsakymus iš JSON
function loadResponses() {
    try {
        if (!fs.existsSync(RESPONSES_FILE)) return {};
        const data = fs.readFileSync(RESPONSES_FILE, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        console.error("Klaida nuskaitant responses.json:", err);
        return {};
    }
}

// POST /ask
app.post("/ask", (req, res) => {
    try {
        // Pasiimame tekstą iš užklausos (dažniausiai plėtiniai siunčia body.text)
        const rawText = req.body.text || "";
        const question = rawText.toLowerCase().trim();
        
        console.log("Gautas pažymėtas tekstas:", rawText);

        const responses = loadResponses();

        // 1. Tikriname, ar turime paruoštą atsakymą JSON faile
        if (responses[question]) {
            return res.json({
                requestReceived: req.body,
                response: { reply: responses[question] }
            });
        }

        // 2. JEI NĖRA JSON'e -> Gražiname TĄ PATĮ tekstą (Echo funkcionalumas)
        // Tai užtikrins, kad plėtinys gaus atgal tai, ką išsiuntė
        res.json({
            requestReceived: req.body,
            response: { reply: rawText } 
        });

    } catch (error) {
        console.error("Serverio klaida apdorojant užklausą:", error);
        res.status(500).json({ error: "Vidinė serverio klaida" });
    }
});

// Maršrutas atsakymų papildymui
app.post("/set-response", (req, res) => {
    const { question, reply } = req.body;
    if (!question || !reply) return res.status(400).json({ error: "Trūksta duomenų" });

    const responses = loadResponses();
    responses[question.toLowerCase()] = reply;
    fs.writeFileSync(RESPONSES_FILE, JSON.stringify(responses, null, 2), "utf-8");

    res.json({ message: "Atsakymas išsaugotas!" });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Plėtinio serveris veikia!`);
    console.log(`🔗 Endpoint'as: http://localhost:${PORT}/ask`);
    console.log(`💡 Jei nerandama atitikmens JSON'e, bus grąžintas gautas tekstas.\n`);
});