const DEFAULT_POPUP_TEMPLATE = `
<div style="font-weight:700; margin-bottom:8px;">Server response</div>
<div style="line-height:1.45; white-space:pre-wrap;">{{response}}</div>
`;

const input = document.getElementById("serverUrl");
const popupTemplate = document.getElementById("popupTemplate");
const status = document.getElementById("status");

function restoreOptions() {
  chrome.storage.sync.get(["serverUrl", "popupTemplate"], (result) => {
    if (result.serverUrl) {
      input.value = result.serverUrl;
    }

    popupTemplate.value = result.popupTemplate || DEFAULT_POPUP_TEMPLATE;
  });
}

function saveOptions() {
  const url = input.value.trim();
  const template = popupTemplate.value.trim() || DEFAULT_POPUP_TEMPLATE;

  chrome.storage.sync.set({ serverUrl: url, popupTemplate: template }, () => {
    status.textContent = "Saved!";
    setTimeout(() => (status.textContent = ""), 2000);
  });
}

document.getElementById("save").addEventListener("click", saveOptions);
document.addEventListener("DOMContentLoaded", restoreOptions);
