// Cross-browser compatibility
const browser = window.browser || window.chrome;

// Event Listener
browser.runtime.onMessage.addListener(actionListener);

// Action listener listenes to messages from background script
// Due to https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage#browser_compatibility,
// Cannot use promise as response. Must use sendResponse callback
async function actionListener(message, sender, sendResponse) {
    console.log(message); // Debugging
    switch (message.action) {
        case "read-image":
            const image = document.evaluate(message.xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0);
            const dataURL = canvas.toDataURL();
            // Send response
            sendResponse({
              status: "ok",
              data: dataURL
            });
            break;
        case "fill-input":
            // Fill input field
            const input = document.evaluate(message.xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            input.value = message.data;
            // Send response
            await sendResponse({
                status: "ok"
            });
            break;
        default:
            console.log("Unknown action received", message);
            break;
    }
}

(async () => {
    const sending = await browser.runtime.sendMessage({
        msg: "Hello from content script"
    });
    console.log(sending);
})();