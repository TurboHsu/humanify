// Cross-browser compatibility
if (typeof browser === "undefined") { 
    browser = window.browser || window.chrome;
}

// Logger
function log(message) {
    console.log("[Humanify] " + message);
}

// Check if element exists
function doesElementExist(xpath) {
	return document.evaluate(
		xpath,
		document,
		null,
		XPathResult.FIRST_ORDERED_NODE_TYPE,
		null
	).singleNodeValue != null;
}

// Action listener listenes to messages from background script
// Due to https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage#browser_compatibility,
// Cannot use promise as response. Must use sendResponse callback
function actionListener(message, sender, sendResponse) {
	switch (message.action) {
		case "read-image":
			// Check if image exists
			if (!doesElementExist(message.xpath)) {
				log("No target image found");
				sendResponse({
					status: "error",
					message: "Image not found",
				});
				return;
			}

            log("Reading image" + message.xpath);

            // Convert image to dataURL(base64)
			const image = document.evaluate(
				message.xpath,
				document,
				null,
				XPathResult.FIRST_ORDERED_NODE_TYPE,
				null
			).singleNodeValue;
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");
			canvas.width = image.width;
			canvas.height = image.height;
			ctx.drawImage(image, 0, 0);
			const dataURL = canvas.toDataURL();
			// Send response
			sendResponse({
				status: "ok",
				data: dataURL,
			});
			break;
		case "fill-input":
			// Check if input exists
			if (!doesElementExist(message.xpath)) {
				log("No target input found");
				sendResponse({
					status: "error",
					message: "Input not found",
				});
				return;
			}

            log("Filling input" + message.xpath + " with " + message.data);
			// Fill input field
			const input = document.evaluate(
				message.xpath,
				document,
				null,
				XPathResult.FIRST_ORDERED_NODE_TYPE,
				null
			).singleNodeValue;
			input.value = message.data;
			// Send response
			sendResponse({
				status: "ok",
			});
			break;
		default:
			log("Unknown action received", message);
			break;
	}
}

// Event Listener
browser.runtime.onMessage.addListener(actionListener);
log("Content script loaded");
