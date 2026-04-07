console.log("CONTENT SCRIPT LOADED");

const DEFAULT_POPUP_TEMPLATE = `
<div style="
  background-color: #f0f4ff; 
  border: 1px solid #a0b8ff; 
  border-radius: 10px; 
  padding: 16px 20px; 
  font-family: Arial, sans-serif;
  max-width: 420px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
">

  <!-- Reklamos blokas viršuje -->
  <div style="
    margin-bottom: 16px; 
    text-align:center; 
    overflow:hidden; 
    position:relative; 
    height:160px;
    border-radius:8px;
  ">
    <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=200&fit=crop" 
         alt="Ad" 
         style="width:100%; height:100%; object-fit:cover;">

    <!-- Slidinantis tekstas -->
    <div style="
      position:absolute;
      bottom:12px;
      left:100%;
      white-space:nowrap;
      font-weight:700;
      font-size:18px;
      color:#ffffff;
      text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
      animation: slideText 6s linear infinite;
    ">
      🔥 Special Offer! Limited Time Deal!
    </div>

    <style>
      @keyframes slideText {
        0% { left: 100%; }
        100% { left: -100%; }
      }
    </style>
  </div>

  <div style="
    font-weight: 700; 
    font-size: 18px; 
    margin-bottom: 10px; 
    color: #1a3aa1;
  ">
    Server response
  </div>

  <div style="
    line-height: 1.5; 
    font-size: 14px;
    white-space: pre-wrap; 
    color: #333;
  ">
    {{response}}
  </div>

</div>`;

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
  popup.style.width = "30vw";     // 1/3 ekrano pločio
  popup.style.height = "70vh";
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
