const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const RESPONSES_FILE = path.join(__dirname, "responses.json");

// Pagal nutylėjimą atsakymas, jei klausimas nerastas
const DEFAULT_RESPONSE = "Sveiki! Čia lokalus atsakymas.";

// Funkcija nuskaityti atsakymus iš JSON
function loadResponses() {
  try {
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
  console.log("Gauta užklausa:", question);

  const responses = loadResponses();
  const reply = responses[question] || DEFAULT_RESPONSE;

  res.json({
    requestReceived: req.body,
    response: { reply }
  });
});

// Optional: pakeisti / pridėti atsakymus per API
app.post("/set-response", (req, res) => {
  const { question, reply } = req.body;
  if (!question || !reply) return res.status(400).json({ error: "Reikia question ir reply" });

  const responses = loadResponses();
  responses[question.toLowerCase()] = reply;
  fs.writeFileSync(RESPONSES_FILE, JSON.stringify(responses, null, 2), "utf-8");

  res.json({ message: "Atsakymas atnaujintas!" });
});

app.listen(3000, () =>
  console.log("Mock API veikia → http://localhost:3000")
);