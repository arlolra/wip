
const restore_options = () => {
    chrome.storage.local.get({ host: '208.80.154.224' }, (items) => {
        document.querySelector(`#host option[value="${items.host}"]`).selected = true;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);

const save_options = () => {
    const select = document.getElementById('host');
    const host = select.options[select.selectedIndex].value;
    chrome.storage.local.set({ host }, () => {
        const status = document.getElementById('status');
        status.textContent = `Saved as ${host}!`;
        setTimeout(() => { status.textContent = ''; }, 1000);
    });
}

document.getElementById('save').addEventListener('click', save_options);
