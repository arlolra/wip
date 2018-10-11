// Docs:
// * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Intercept_HTTP_requests
// * https://developer.chrome.com/extensions/webRequest

const IP = "208.80.154.224";  // From my nslookup

const hostMap = new Map();  // Leaky!

const onBeforeRequest = (details) => {
    const url = new URL(details.url);
    hostMap.set(details.requestId, url.host);
    url.host = IP;
    return { redirectUrl: url.toString() };
};

chrome.webRequest.onBeforeRequest.addListener(
    onBeforeRequest,
    { urls: ["*://*.wikipedia.org/*"] },
    ["blocking"]
);

const onBeforeSendHeaders = (details) => {
    const requestId = details.requestId;
    if (hostMap.has(requestId)) {
        const requestHeaders = details.requestHeaders;
        requestHeaders.push({ name: "Host", value: hostMap.get(requestId) });
        return { requestHeaders };
    }
};

const filter = { urls: [`*://${IP}/*`] };

chrome.webRequest.onBeforeSendHeaders.addListener(
    onBeforeSendHeaders, filter, ["blocking", "requestHeaders"]
);

const onHeadersReceived = (details) => {
    const requestId = details.requestId;
    if (hostMap.has(requestId)) {
        const responseHeaders = details.responseHeaders;
        responseHeaders.push({ name: "Set-Cookie", value: `x-host=${hostMap.get(requestId)}` });
        return { responseHeaders };
    }
}

chrome.webRequest.onHeadersReceived.addListener(
    onHeadersReceived, filter, ["blocking", "responseHeaders"]
);
