import browser from "webextension-polyfill";
import api from "./api";
import { readImage, fillInputBox } from "./action";

// Solves captcha
function solveCaptcha(
	tabId: number,
	tab: browser.Tabs.Tab,
	matchingRegex: string
) {
	// Inject content script if matching regex is found
	browser.scripting
		.executeScript({
			target: { tabId },
			files: ["./src/content-script.js"],
		})
		.then(() => {
			// Content script logic here
			console.log(
				"Content script injected on page",
				tab.url,
				"matching regex",
				matchingRegex
			);
			browser.storage.sync.get("filterActions").then((result) => {
				// Find the action in regex map
				result.filterActions[matchingRegex].some(async (action: any) => {
					console.log("Executing: ", action.image, action.input);
					const image = await readImage(tabId, action.image);
					console.log("Image:", image);
					const result = await api.runOCR(image);
					fillInputBox(tabId, action.input, result);
				});
			});
		});
}

// Listener for completed tab
function completedTabListener(
	tabId: number,
	changeInfo: browser.Tabs.OnUpdatedChangeInfoType,
	tab: browser.Tabs.Tab
) {
	if (changeInfo.status === "complete") {
		// Ensure tab is completely loaded
		browser.storage.sync.get("enabledFilter").then((result) => {
			// Find the regex that matches the current tab's URL
			const matchingRegex = result.enabledFilter.find(
				(regex: string | RegExp) => new RegExp(regex).test(tab.url ?? "")
			);
			solveCaptcha(tabId, tab, matchingRegex);
		});
	}
}

// Load listeners
function loadListeners(): void {
	browser.tabs.onUpdated.addListener(completedTabListener);
}

export default loadListeners;
