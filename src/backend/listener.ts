import browser from "webextension-polyfill";
import api from "./api";
import sleep from "../libs/utils";

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
				result.filterActions[matchingRegex].some((action: any) => {
					console.log("Executing: ", action.image, action.result);
					// Send message to content script
					browser.tabs
						.sendMessage(tabId, {
							action: "read-image",
							xpath: action.image,
						})
						.then(async (response: any) => {
							console.log("From content-script:", response);
							if (response.status === "ok") {
								// Maybe the image is not loaded yet
								if (response.data === "data:,") {
									console.log("Image not loaded yet");
									// Wait for 1 second
									await sleep(1000);
									solveCaptcha(tabId, tab, matchingRegex);
									return;
								}

								const image = response.data;
								const result = await api.runOCR(image);

								// Fill the result into the input box
								browser.tabs
									.sendMessage(tabId, {
										action: "fill-input",
										xpath: action.input,
										data: result,
									})
									.then((response: any) => {
										if (response.status === "ok") {
											console.log("Filled input box");
										}
									});
							}
						});
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
