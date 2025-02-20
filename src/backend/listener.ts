import browser from "webextension-polyfill";
import { api } from "./api";
import { readImage, fillInputBox } from "./action";
import { regexMatch, getFilterList } from "../libs/storage";

// Solves captcha
async function solveCaptcha(
	tabId: number,
	tab: browser.Tabs.Tab,
	matchingRegex: string
) {
	// Inject content script if matching regex is found
	try {
		await browser.scripting
			.executeScript({
				target: { tabId },
				files: ["./src/content-script.js"],
			})
			.then(() => {
				console.log(
					"Content script injected on page",
					tab.url,
					"matching regex",
					matchingRegex,
					"tabId",
					tabId
				);
				getFilterList(matchingRegex).then((result) => {
					if (!result || !Array.isArray(result)) {
						console.error("getFilterList returned invalid result:", result);
						return;
					}
					result.some(async (action: any) => {
						try {
							console.log("Executing: ", action.image, action.input);
							const image = await readImage(tabId, action.image);
							console.log("Image:", image);
							const ocrResult = await api.runOCR(image);
							fillInputBox(tabId, action.input, ocrResult);
						} catch (error) {
							console.error(error);
						}
					});
				});
			});
	} catch (error) {
		console.error(error);
	}
}

// Listener for completed tab
function completedTabListener(
	tabId: number,
	changeInfo: browser.Tabs.OnUpdatedChangeInfoType,
	tab: browser.Tabs.Tab
) {
	if (changeInfo.status === "complete") {
		regexMatch(tab.url ?? "").then((result): [boolean, string] => {
			if (result[0]) {
				solveCaptcha(tabId, tab, result[1]);
			}
			return result;
		});
	}
}

// Load listeners
function loadListeners(): void {
	browser.tabs.onUpdated.addListener(completedTabListener);
}

export default loadListeners;
