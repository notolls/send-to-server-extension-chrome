const input = document.getElementById("serverUrl");
const status = document.getElementById("status");

function restoreOptions() {
  chrome.storage.sync.get(["serverUrl"], (result) => {
    if (result.serverUrl) {
      input.value = result.serverUrl;
    }
  });
}

function saveOptions() {
  const url = input.value.trim();

  chrome.storage.sync.set({ serverUrl: url }, () => {
    status.textContent = "Saved!";
    setTimeout(() => status.textContent = "", 2000);
  });
}

document.getElementById("save").addEventListener("click", saveOptions);
document.addEventListener("DOMContentLoaded", restoreOptions);