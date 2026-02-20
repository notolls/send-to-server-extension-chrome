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

  // OPTIONAL: add a manual close button
  const closeBtn = document.createElement("span");
  closeBtn.innerText = "×";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.float = "right";
  closeBtn.style.fontWeight = "bold";
  closeBtn.style.marginLeft = "10px";
  closeBtn.onclick = () => removePopup();
  popup.appendChild(closeBtn);

  // add text content
  const textNode = document.createElement("div");
  textNode.innerText = text;
  popup.appendChild(textNode);

  // STYLES
  popup.style.position = "absolute";
  popup.style.background = "#ffffff";
  popup.style.color = "#000000";
  popup.style.border = "1px solid #ccc";
  popup.style.padding = "8px 12px";
  popup.style.borderRadius = "6px";
  popup.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
  popup.style.fontSize = "14px";
  popup.style.zIndex = "999999";
  popup.style.maxWidth = "400px";
  popup.style.maxHeight = "300px";
  popup.style.overflowY = "auto";
  popup.style.whiteSpace = "pre-wrap";

  // Position next to selection
  popup.style.top = `${window.scrollY + rect.top}px`;
  popup.style.left = `${window.scrollX + rect.right + 8}px`;

  document.body.appendChild(popup);

  // Remove popup ONLY if clicked outside
  function outsideClickHandler(event) {
    if (!popup.contains(event.target)) {
      removePopup();
      document.removeEventListener("click", outsideClickHandler);
    }
  }
  document.addEventListener("click", outsideClickHandler);

  // ❌ Remove the automatic 5s timeout → popup stays until outside click
}

// Listen for messages from background.js
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "showResponse") {
    createPopup(msg.text);
  }
});