console.log("CONTENT SCRIPT LOADED");
function removePopup() {
  const old = document.getElementById("server-response-popup");
  if (old) old.remove();
}

function createPopup(text) {
  removePopup();

  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  const popup = document.createElement("div");
  popup.id = "server-response-popup";
  popup.innerText = text;

  // STILIUS: white box
  popup.style.position = "absolute";
  popup.style.background = "#ffffff";        // white background
  popup.style.color = "#000000";             // black text
  popup.style.border = "1px solid #ccc";     // grey border
  popup.style.padding = "8px 12px";
  popup.style.borderRadius = "6px";
  popup.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
  popup.style.fontSize = "14px";
  popup.style.zIndex = "999999";

  // PADĖTIS šalia selection (dešinėje)
  popup.style.top = `${window.scrollY + rect.top}px`;
  popup.style.left = `${window.scrollX + rect.right + 8}px`; // 8px nuo pažymėto teksto dešinės

  document.body.appendChild(popup);

  // Uždaryti paspaudus bet kur
  const removeHandler = () => {
    popup.remove();
    document.removeEventListener("click", removeHandler);
  };
  document.addEventListener("click", removeHandler);

  // arba automatiškai po 5 sekundžių
  setTimeout(() => popup.remove(), 5000);
}

// gaunam žinutę iš background.js
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "showResponse") {
    createPopup(msg.text);
  }
});