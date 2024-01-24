import browser from "webextension-polyfill";
import loadListeners from "./backend/listener";

loadListeners();

browser.runtime.onInstalled.addListener((details) => {
	console.log("Extension installed:", details);
});

browser.contextMenus.create({
	id: "test-trigger",
	title: "Test Trigger",
});

browser.contextMenus.onClicked.addListener((info, tab) => {
	if (info.menuItemId === "test-trigger") {
		browser.storage.sync.set({ enabledFilter: ["https://authserver.nuist.edu.cn/*"] });
    browser.storage.sync.set({ filterActions: { "https://authserver.nuist.edu.cn/*": [{image: '//*[@id="captchaImg"]', input: '//*[@id="captcha"]'}] } })
		console.log("test-trigger clicked");
	}
});

// Testing messaging functionality
browser.runtime.onMessage.addListener((sender, message) => {
	console.log("Message received:", sender, message);
	return Promise.resolve({ message: "nom nom nom" });
});