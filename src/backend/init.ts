import browser from "webextension-polyfill";
import Action from "./model";

async function init() {
	console.log(await browser.storage.sync.get("enabledFilter"));
	// Checks if the database is empty and if so, creates empty tables
	// and inserts some default data.
	if (browser.storage.sync.get("enabledFilter") === undefined) {
		// browser.storage.sync.set({ enabledFilter: [] });
		browser.storage.sync.set({
			enabledFilter: ["https://authserver.nuist.edu.cn/*"],
		});
	}

	if (browser.storage.sync.get("filterActions") === undefined) {
		browser.storage.sync.set({
			filterActions: {
				"https://authserver.nuist.edu.cn/*": <Action[]>[
					{ image: '//*[@id="captchaImg"]', input: '//*[@id="captcha"]' },
				],
			},
		});
	}
	console.log("Finished Init");
	// }
}

export default init;
