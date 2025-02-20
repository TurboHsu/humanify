// Cross-browser compatibility
if (typeof browser === "undefined") {
	browser = window.browser || window.chrome;
}

// Logger
function log(message, ...args) {
	console.log("[Humanify] ", message, ...args);
}

function imgNodeToDataURL(node) {
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	canvas.width = node.width;
	canvas.height = node.height;
	ctx.drawImage(node, 0, 0, node.width, node.height);
	return canvas.toDataURL("image/png");
}

// Action listener listens to messages from background script
// Due to https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage#browser_compatibility,
// Cannot use promise as response. Must use sendResponse callback
function actionListener(message, sender, sendResponse) {
	switch (message.action) {
		case "read-image":
			const imgNode = document.evaluate(
				message.xpath,
				document,
				null,
				XPathResult.FIRST_ORDERED_NODE_TYPE,
				null
			).singleNodeValue;

			if (!imgNode) {
				log("No target image found");
				sendResponse({
					status: "error",
					message: "Image not found",
				});
				return true;
			}

			if (imgNode.tagName === "IMG") {
				const dataURL = imgNodeToDataURL(imgNode);
				log("Captured as", dataURL);
				sendResponse({
					status: "ok",
					data: dataURL,
				});
				return true;
			} else {
				import(browser.runtime.getURL("static/html2canvas/html2canvas.esm.js"))
					.then((module) => {
						const html2canvas = module.default;
						log("Loaded html2canvas" + html2canvas);

						log("Reading image" + message.xpath);
						// Convert image to dataURL(base64)
						html2canvas(imgNode)
							.then((canvas) => {
								const dataURL = canvas.toDataURL("image/png");
								log("Captured as", dataURL);
								sendResponse({
									status: "ok",
									data: dataURL,
								});
							})
							.catch((error) => {
								log("Error capturing image", error);
							});
					})
					.catch((error) => {
						log("Error loading html2canvas", error);
					});
				return true;
			}
		case "fill-input":
			const inputNode = document.evaluate(
				message.xpath,
				document,
				null,
				XPathResult.FIRST_ORDERED_NODE_TYPE,
				null
			).singleNodeValue;

			// Check if input exists
			if (!inputNode) {
				log("No target input found");
				sendResponse({
					status: "error",
					message: "Input not found",
				});
				return true;
			}

			log("Filling input" + message.xpath + " with " + message.data);

			inputNode.value = message.data;
			sendResponse({ status: "ok" });
			break;
		default:
			log("Unknown action received", message);
			break;
	}
}

// Event Listener
browser.runtime.onMessage.addListener(actionListener);
log("Content script loaded");
