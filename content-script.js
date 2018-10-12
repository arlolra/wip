// FIXME: Can't wait on the async call to storage before injecting the base
// chrome.storage.local.get({ host: '208.80.154.224' }, (items) => {
//     if (document.location.host !== items.host) { return; }  // Not current option
    document.cookie.split(';').find((item) => {
        let match = /^x-host=(.*)$/i.exec(item);
        if (match) {
            let host = match[1].trim();
            const base = document.createElement('base');
            base.setAttribute('href', `//${host}`);
            document.documentElement.appendChild(base);
            return true;
        }
        return false;
    });
// });
