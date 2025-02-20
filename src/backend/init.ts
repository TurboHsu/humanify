import browser from "webextension-polyfill";
import Action from "./model";

async function init() {
	// Checks if the database is empty and if so, creates empty tables
	// and inserts some default data.
	if (
		!(await browser.storage.sync.get("enabledFilter")) ||
		!Array.isArray(
			(await browser.storage.sync.get("enabledFilter")).enabledFilter
		) ||
		!(await browser.storage.sync.get("enabledFilter")).enabledFilter.length
	) {
		console.log("Making default enabledFilter");
		browser.storage.sync.set({
			enabledFilter: ["https://authserver.nuist.edu.cn/*"],
		});

		console.log("Making default filterActions");
		browser.storage.sync.set({
			filterActions: {
				"https://authserver.nuist.edu.cn/*": <Action[]>[
					{ image: '//*[@id="captchaImg"]', input: '//*[@id="captcha"]' },
				],
			},
		});
	}
	console.log(
		"Loaded enabledFilter:",
		await browser.storage.sync.get("enabledFilter")
	);
	console.log(
		"Loaded filterActions:",
		await browser.storage.sync.get("filterActions")
	);
	console.log("Finished Init");
}

export default init;
