import browser from "webextension-polyfill";
import loadListeners from "./backend/listener";
import init from "./backend/init";

browser.runtime.onInstalled.addListener((details) => {
	console.log("Extension installed:", details);
});

init();
loadListeners();


// browser.contextMenus.create({
// 	id: "test-trigger",
// 	title: "Test Trigger",
// });

// browser.contextMenus.onClicked.addListener((info, tab) => {
// 	if (info.menuItemId === "test-trigger") {
// 		browser.storage.sync.set({ enabledFilter: ["https://authserver.nuist.edu.cn/*"] });
//     browser.storage.sync.set({ filterActions: { "https://authserver.nuist.edu.cn/*": [{image: '//*[@id="captchaImg"]', input: '//*[@id="captcha"]'}] } })
// 		console.log("test-trigger clicked");
// 	}
// });