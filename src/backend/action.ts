import browser from "webextension-polyfill";
import sleep from "../libs/utils";

// Read image from the page
async function readImage(tabId: number, xpath: string): Promise<string> {
    // Send message to content script
    return browser.tabs
        .sendMessage(tabId, {
            action: "read-image",
            xpath: xpath,
        })
        .then(async (response: any) => {
            console.log("From content-script:", response);
            if (response.status === "ok") {
                // Maybe the image is not loaded yet
                if (response.data === "data:,") {
                    console.log("Image not loaded yet, retrying...");
                    // Wait for 1 second
                    await sleep(1000);
                    // Try again
                    return await readImage(tabId, xpath);
                } else {
                    return response.data;
                }
            }
        });
}

// Fills input box
async function fillInputBox(tabId: number, xpath: string, data: string) {
	await browser.tabs
		.sendMessage(tabId, {
			action: "fill-input",
			xpath: xpath,
			data: data,
		})
		.then((response: any) => {
			if (response.status === "ok") {
				console.log("Filled input box");
			}
		});
	throw new Error("Failed to fill input box");
}

export { readImage, fillInputBox };