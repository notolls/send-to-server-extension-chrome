console.log("CONTENT SCRIPT LOADED");

const DEFAULT_POPUP_TEMPLATE = `
  <div style="font-weight:700; margin-bottom:8px;">Server response</div>
  <div style="line-height:1.45; white-space:pre-wrap;">{{response}}</div>
`;

function removePopup() {
  const old = document.getElementById("server-response-popup");
  if (old) old.remove();
}

function getPopupTemplate() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["popupTemplate"], (result) => {
      resolve(result.popupTemplate || DEFAULT_POPUP_TEMPLATE);
    });
  });
}

function applyTemplate(template, responseText) {
  return template.replaceAll("{{response}}", responseText || "");
}

async function createPopup(responseText) {
  removePopup();

  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  const popup = document.createElement("div");
  popup.id = "server-response-popup";

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.textContent = "×";
  closeBtn.setAttribute("aria-label", "Close popup");
  closeBtn.style.cursor = "pointer";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "8px";
  closeBtn.style.right = "8px";
  closeBtn.style.border = "none";
  closeBtn.style.background = "transparent";
  closeBtn.style.fontSize = "18px";
  closeBtn.onclick = () => removePopup();

  const content = document.createElement("div");
  const template = await getPopupTemplate();
  content.innerHTML = applyTemplate(template, responseText);
  popup.appendChild(closeBtn);
  popup.appendChild(content);

  popup.style.position = "absolute";
  popup.style.background = "#ffffff";
  popup.style.color = "#000000";
  popup.style.border = "1px solid #ccc";
  popup.style.padding = "14px 16px";
  popup.style.borderRadius = "8px";
  popup.style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)";
  popup.style.fontSize = "14px";
  popup.style.zIndex = "999999";
  popup.style.maxWidth = "420px";
  popup.style.maxHeight = "320px";
  popup.style.overflowY = "auto";

  popup.style.top = `${window.scrollY + rect.top}px`;
  popup.style.left = `${window.scrollX + rect.right + 8}px`;

  document.body.appendChild(popup);

  function outsideClickHandler(event) {
    if (!popup.contains(event.target)) {
      removePopup();
      document.removeEventListener("click", outsideClickHandler);
    }
  }

  setTimeout(() => {
    document.addEventListener("click", outsideClickHandler);
  }, 0);
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "showResponse") {
    createPopup(msg.text);
  }
});
