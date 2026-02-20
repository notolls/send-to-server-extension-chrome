chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "sendToServer",
    title: "Send to Server",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "sendToServer") {
    const selectedText = info.selectionText;

    chrome.storage.sync.get(["serverUrl"], async (result) => {
      const serverUrl = result.serverUrl;

      if (!serverUrl) {
        alert("Server URL not set. Please configure it in extension options.");
        return;
      }

      try {
        await fetch(serverUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            text: selectedText,
            page: tab.url,
            timestamp: new Date().toISOString()
          })
        });

        console.log("Text sent successfully");
      } catch (err) {
        console.error("Error sending text:", err);
      }
    });
  }
});