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
