chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "sendToServer",
    title: "Send to Server",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "sendToServer") {

    chrome.storage.sync.get(["serverUrl"], async (result) => {
      const url = result.serverUrl;
      if (!url) return;

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: info.selectionText })
        });

        const data = await res.json();

        // siunčiam atsakymą į content script
        chrome.tabs.sendMessage(tab.id, {
          action: "showResponse",
          text: data.response?.reply || JSON.stringify(data)
        });

      } catch (e) {
        chrome.tabs.sendMessage(tab.id, {
          action: "showResponse",
          text: "Server error"
        });
      }
    });
  }
});