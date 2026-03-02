const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const RESPONSES_FILE = path.join(__dirname, "responses.json");

// Nurodome kelią iki failo, kurį norime siųsti kaip numatytąjį
const DEFAULT_FILE_PATH = path.join(__dirname, "default_response.pdf"); // Pakeisk failo pavadinimą ir plėtinį

function loadResponses() {
  try {
    if (!fs.existsSync(RESPONSES_FILE)) return {};
    const data = fs.readFileSync(RESPONSES_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Nepavyko nuskaityti responses.json:", err);
    return {};
  }
}

// POST /ask
app.post("/ask", (req, res) => {
  const question = (req.body.text || "").toLowerCase().trim();
  const responses = loadResponses();

  // Tikriname, ar turime specifinį atsakymą JSON faile
  if (responses[question]) {
    return res.json({
      requestReceived: req.body,
      response: { reply: responses[question] }
    });
  }

  // Jei atsakymo nėra, siunčiame numatytąjį FAILĄ
  console.log("Klausimas nerastas, siunčiamas numatytasis failas.");
  
  // Patikra, ar failas egzistuoja prieš siunčiant
  if (fs.existsSync(DEFAULT_FILE_PATH)) {
    res.sendFile(DEFAULT_FILE_PATH);
  } else {
    res.status(404).json({ error: "Numatytasis failas nerastas sistemoje." });
  }
});

// ... (likusi set-response dalis lieka tokia pati)

app.listen(3000, () => console.log("Mock API veikia → http://localhost:3000"));