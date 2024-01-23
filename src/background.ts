import browser from "webextension-polyfill";

console.log("Hello from the background!");

browser.runtime.onInstalled.addListener((details) => {
	console.log("Extension installed:", details);
});

browser.contextMenus.create({
  id: "eat-page",
  title: "Eat this page",
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "eat-page") {
    const tabId = tab?.id; // Ensure tabId is defined
    if (tabId) {
      browser.scripting.executeScript({
        target: { tabId },
        files: ["./src/content-script.js"],
      });
    }
  }
});
