import browser from "webextension-polyfill";
import loadListeners from "./backend/listener";
import init from "./backend/init";

browser.runtime.onInstalled.addListener((details) => {
	console.log("Extension installed:", details);
});

init();
loadListeners();
