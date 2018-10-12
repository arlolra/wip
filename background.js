// Docs:
// * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Intercept_HTTP_requests
// * https://developer.chrome.com/extensions/webRequest

chrome.storage.local.get({ host: '208.80.154.224' }, (items) => {
    const hostMap = new Map();  // Leaky!

    let host;
    const onBeforeRequest = (details) => {
        const url = new URL(details.url);
        hostMap.set(details.requestId, url.host);
        url.host = host;
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

    const onHeadersReceived = (details) => {
        const requestId = details.requestId;
        if (hostMap.has(requestId)) {
            const responseHeaders = details.responseHeaders;
            responseHeaders.push({ name: "Set-Cookie", value: `x-host=${hostMap.get(requestId)}` });
            return { responseHeaders };
        }
    };

    const addListenersForHost = () => {
        const filter = { urls: [`*://${host}/*`] };

        if (chrome.webRequest.onBeforeSendHeaders.hasListener(onBeforeSendHeaders)) {
            chrome.webRequest.onBeforeSendHeaders.removeListener(onBeforeSendHeaders);
        }
        chrome.webRequest.onBeforeSendHeaders.addListener(
            onBeforeSendHeaders, filter, ["blocking", "requestHeaders"]
        );

        if (chrome.webRequest.onHeadersReceived.hasListener(onHeadersReceived)) {
            chrome.webRequest.onHeadersReceived.removeListener(onHeadersReceived);
        }
        chrome.webRequest.onHeadersReceived.addListener(
            onHeadersReceived, filter, ["blocking", "responseHeaders"]
        );
    };

    const initForHost = (h) => {
        host = h;
        addListenersForHost();
    };
    initForHost(items.host);

    chrome.storage.onChanged.addListener(function(changes, namespace) {
        console.log(arguments);
        if (namespace === 'local' && 'host' in changes) {
            initForHost(changes.host.newValue);
        }
    });
})
