import "./styles.css";

// Equivalencias internacionales de letras, números y signos comunes.
// La Ñ se incluye de acuerdo con el material de referencia proporcionado.
const MORSE = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.",
  G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..",
  M: "--", N: "-.", Ñ: "--.--", O: "---", P: ".--.", Q: "--.-",
  R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--",
  X: "-..-", Y: "-.--", Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--",
  "4": "....-", "5": ".....", "6": "-....", "7": "--...",
  "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "!": "-.-.--",
  "'": ".----.", '"': ".-..-.", "(": "-.--.", ")": "-.--.-",
  "&": ".-...", ":": "---...", ";": "-.-.-.", "=": "-...-",
  "+": ".-.-.", "-": "-....-", "_": "..--.-", "$": "...-..-",
  "@": ".--.-."
};

const REVERSE_MORSE = Object.fromEntries(
  Object.entries(MORSE).map(([letter, code]) => [code, letter])
);

const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const inputLabel = document.getElementById("inputLabel");
const inputHint = document.getElementById("inputHint");
const charCount = document.getElementById("charCount");
const message = document.getElementById("message");
const modeToMorse = document.getElementById("modeToMorse");
const modeToText = document.getElementById("modeToText");
const convertBtn = document.getElementById("convertBtn");
const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");
const exampleBtn = document.getElementById("exampleBtn");

let mode = "toMorse";

// Actualiza el texto de ayuda y el estado visual del selector.
function setMode(newMode) {
  mode = newMode;
  const textMode = mode === "toText";
  modeToMorse.classList.toggle("active", !textMode);
  modeToText.classList.toggle("active", textMode);
  modeToMorse.setAttribute("aria-pressed", String(!textMode));
  modeToText.setAttribute("aria-pressed", String(textMode));
  inputLabel.textContent = textMode ? "TU CÓDIGO MORSE" : "TU MENSAJE EN TEXTO";
  inputText.placeholder = textMode
    ? "Escribe Morse usando puntos, rayas y espacios..."
    : "Escribe aquí el mensaje que quieres convertir...";
  inputHint.textContent = textMode
    ? "Usa puntos (.) y rayas (-); separa letras con espacios y palabras con /."
    : "Puedes escribir letras, números y signos admitidos.";
  clearMessage();
  outputText.textContent = "Tu resultado aparecerá aquí...";
}

function showMessage(text, type = "info") {
  message.textContent = text;
  message.className = `message ${type}`;
}

function clearMessage() {
  message.textContent = "";
  message.className = "message";
}

// Convierte texto a Morse y conserva la separación entre palabras con /.
function textToMorse(text) {
  const normalized = text.toLocaleUpperCase("es-MX").normalize("NFC");
  const words = normalized.trim().split(/\s+/);
  const unknown = new Set();
  const result = words.map(word => [...word].map(character => {
    if (MORSE[character]) return MORSE[character];
    unknown.add(character);
    return "";
  }).filter(Boolean).join(" ")).join(" / ");

  if (unknown.size) {
    throw new Error(`No se reconocen estos caracteres: ${[...unknown].join(" ")}.`);
  }
  return result;
}

// Convierte Morse a texto. Acepta / o | como separador de palabras.
function morseToText(text) {
  const normalized = text.trim();
  if (!normalized) return "";
  if (/[^.\-/|\s]/.test(normalized)) {
    throw new Error("El código Morse solo puede contener puntos, rayas, espacios y / para separar palabras.");
  }

  const words = normalized.split(/\s*(?:\/|\|)\s*/);
  return words.map(word => {
    if (!word.trim()) throw new Error("Hay una separación de palabra vacía. Revisa las diagonales.");
    const codes = word.trim().split(/\s+/);
    return codes.map(code => {
      if (!REVERSE_MORSE[code]) {
        throw new Error(`El código "${code}" no corresponde a una equivalencia conocida.`);
      }
      return REVERSE_MORSE[code];
    }).join("");
  }).join(" ");
}

function convert() {
  clearMessage();
  const value = inputText.value.trim();

  // Validación de entrada vacía.
  if (!value) {
    outputText.textContent = "Tu resultado aparecerá aquí...";
    showMessage("Escribe un mensaje antes de realizar la conversión.", "error");
    inputText.focus();
    return;
  }

  try {
    const result = mode === "toMorse" ? textToMorse(value) : morseToText(value);
    outputText.textContent = result || "No hay contenido para mostrar.";
    showMessage("Conversión realizada correctamente.", "success");
  } catch (error) {
    outputText.textContent = "No se pudo generar el resultado.";
    showMessage(error.message, "error");
  }
}

function clearAll() {
  inputText.value = "";
  outputText.textContent = "Tu resultado aparecerá aquí...";
  charCount.textContent = "0 caracteres";
  clearMessage();
  inputText.focus();
}

modeToMorse.addEventListener("click", () => setMode("toMorse"));
modeToText.addEventListener("click", () => setMode("toText"));
convertBtn.addEventListener("click", convert);
clearBtn.addEventListener("click", clearAll);
inputText.addEventListener("input", () => {
  charCount.textContent = `${inputText.value.length} caracteres`;
  clearMessage();
});
inputText.addEventListener("keydown", event => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") convert();
});
exampleBtn.addEventListener("click", () => {
  setMode("toMorse");
  inputText.value = "HOLA MUNDO";
  charCount.textContent = `${inputText.value.length} caracteres`;
  convert();
});
copyBtn.addEventListener("click", async () => {
  const result = outputText.textContent;
  if (!result || result === "Tu resultado aparecerá aquí..." ||
      result === "No se pudo generar el resultado.") {
    showMessage("Primero realiza una conversión para copiar el resultado.", "error");
    return;
  }
  try {
    await navigator.clipboard.writeText(result);
    showMessage("Resultado copiado al portapapeles.", "success");
  } catch {
    showMessage("El navegador no permitió copiar automáticamente. Selecciona el resultado y cópialo manualmente.", "error");
  }
});