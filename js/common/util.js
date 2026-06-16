export const util = (() => {

    const loader = '<span class="spinner-border spinner-border-sm my-0 ms-0 me-1 p-0" style="height: 0.8rem; width: 0.8rem;"></span>';

    const listsMarkDown = [
        ['*', `<strong class="text-theme-auto">$1</strong>`],
        ['_', `<em class="text-theme-auto">$1</em>`],
        ['~', `<del class="text-theme-auto">$1</del>`],
        ['```', `<code class="font-monospace text-theme-auto">$1</code>`]
    ];

    const deviceTypes = [
        { type: 'Mobile', regex: /Android.*Mobile|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i },
        { type: 'Tablet', regex: /iPad|Android(?!.*Mobile)|Tablet/i },
        { type: 'Desktop', regex: /Windows NT|Macintosh|Linux/i },
    ];

    const browsers = [
        { name: 'Chrome', regex: /Chrome|CriOS/i },
        { name: 'Safari', regex: /Safari/i },
        { name: 'Edge', regex: /Edg|Edge/i },
        { name: 'Firefox', regex: /Firefox|FxiOS/i },
        { name: 'Opera', regex: /Opera|OPR/i },
        { name: 'Internet Explorer', regex: /MSIE|Trident/i },
        { name: 'Samsung Browser', regex: /SamsungBrowser/i },
    ];

    const operatingSystems = [
        { name: 'Windows', regex: /Windows NT ([\d.]+)/i },
        { name: 'MacOS', regex: /Mac OS X ([\d_.]+)/i },
        { name: 'Android', regex: /Android ([\d.]+)/i },
        { name: 'iOS', regex: /OS ([\d_]+) like Mac OS X/i },
        { name: 'Linux', regex: /Linux/i },
        { name: 'Ubuntu', regex: /Ubuntu/i },
        { name: 'Chrome OS', regex: /CrOS/i },
    ];

    /**
     * @param {string} unsafe
     * @returns {string}
     */
    const escapeHtml = (unsafe) => {
        return String(unsafe)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    const notify = (message) => {
        const exec = (emoji) => {
            let modalElement = document.getElementById('custom-notify-modal');
            if (!modalElement) {
                modalElement = document.createElement('div');
                modalElement.id = 'custom-notify-modal';
                modalElement.className = 'modal fade';
                modalElement.tabIndex = -1;
                modalElement.innerHTML = `
                <div class="modal-dialog modal-dialog-centered modal-sm">
                    <div class="modal-content rounded-4 border-0 shadow-lg bg-theme-auto">
                        <div class="modal-body text-center p-4">
                            <div class="mb-3" style="font-size: 3rem;" id="notify-emoji"></div>
                            <p class="mb-4 fw-medium text-theme-auto" id="notify-message" style="font-size: 1.05rem;"></p>
                            <button type="button" class="btn btn-wish w-100 rounded-pill py-2 shadow-sm fw-bold" data-bs-dismiss="modal">ОК</button>
                        </div>
                    </div>
                </div>`;
                document.body.appendChild(modalElement);
            }
            
            document.getElementById('notify-emoji').innerHTML = emoji;
            document.getElementById('notify-message').innerText = message;
            
            // Assuming bootstrap is globally available
            const modalInstance = new bootstrap.Modal(modalElement);
            modalInstance.show();
        };

        return {
            success: () => exec('<i class="fa-solid fa-circle-check" style="color: var(--bs-primary);"></i>'),
            error: () => exec('<i class="fa-solid fa-circle-xmark" style="color: var(--bs-primary);"></i>'),
            warning: () => exec('<i class="fa-solid fa-triangle-exclamation" style="color: var(--bs-primary);"></i>'),
            info: () => exec('<i class="fa-solid fa-circle-info" style="color: var(--bs-primary);"></i>'),
            custom: (emoji) => exec(emoji),
        };
    };

    /**
     * @param {string} message
     * @returns {boolean}
     */
    const ask = (message) => window.confirm(`🟦 ${message}`);

    /**
     * @param {HTMLElement} el
     * @param {string} html
     * @returns {HTMLElement}
     */
    const safeInnerHTML = (el, html) => {
        el.replaceChildren(document.createRange().createContextualFragment(html));
        return el;
    };

    /**
     * @param {HTMLElement} el 
     * @param {boolean} isUp 
     * @param {number} step
     * @returns {Promise<HTMLElement>}
     */
    const changeOpacity = (el, isUp, step = 0.05) => new Promise((res) => {
        let op = parseFloat(el.style.opacity);
        const target = isUp ? 1 : 0;

        const animate = () => {
            op += isUp ? step : -step;
            op = Math.max(0, Math.min(1, op));
            el.style.opacity = op.toFixed(2);

            if ((isUp && op >= target) || (!isUp && op <= target)) {
                el.style.opacity = target.toString();
                res(el);
            } else {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    });

    /**
     * @param {function} callback
     * @param {number} [delay=0]
     * @returns {void}
     */
    const timeOut = (callback, delay = 0) => {
        let clear = null;
        const c = () => {
            callback();
            clearTimeout(clear);
            clear = null;
        };

        clear = setTimeout(c, delay);
    };

    /**
     * @param {function} callback
     * @param {number} [delay=100]
     * @returns {function}
     */
    const debounce = (callback, delay = 100) => {
        let timeout = null;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => callback(...args), delay);
        };
    };

    /**
     * @param {HTMLElement} button
     * @param {string} [message='Loading']
     * @param {boolean} [replace=false]
     * @returns {object}
     */
    const disableButton = (button, message = 'Loading', replace = false) => {
        button.disabled = true;

        const tmp = button.innerHTML;
        safeInnerHTML(button, replace ? message : loader + message);

        return {
            restore: (disabled = false) => {
                button.innerHTML = tmp;
                button.disabled = disabled;
            },
        };
    };

    /**
     * @param {HTMLElement} checkbox
     * @returns {object}
     */
    const disableCheckbox = (checkbox) => {
        checkbox.disabled = true;

        const label = document.querySelector(`label[for="${checkbox.id}"]`);
        const tmp = label.innerHTML;
        safeInnerHTML(label, loader + tmp);

        return {
            restore: () => {
                label.innerHTML = tmp;
                checkbox.disabled = false;
            },
        };
    };

    /**
     * @param {HTMLElement} button
     * @param {string} [message=null]
     * @param {number} [timeout=1500]
     * @returns {Promise<void>}
     */
    const copy = async (button, message = null, timeout = 1500) => {
        const data = button.getAttribute('data-copy');

        if (!data || data.length === 0) {
            notify('Nothing to copy').warning();
            return;
        }

        button.disabled = true;

        try {
            await navigator.clipboard.writeText(data);
        } catch {
            button.disabled = false;
            notify('Failed to copy').error();
            return;
        }

        const tmp = button.innerHTML;
        safeInnerHTML(button, message ? message : '<i class="fa-solid fa-check"></i>');

        timeOut(() => {
            button.disabled = false;
            button.innerHTML = tmp;
        }, timeout);
    };

    /**
     * @param {string} str
     * @returns {string}
     */
    const base64Encode = (str) => {
        const encoder = new TextEncoder();
        const encodedBytes = encoder.encode(str);
        return window.btoa(String.fromCharCode(...encodedBytes));
    };

    /**
     * @param {string} str
     * @returns {string}
     */
    const base64Decode = (str) => {
        const decoder = new TextDecoder();
        const decodedBytes = Uint8Array.from(window.atob(str), (c) => c.charCodeAt(0));
        return decoder.decode(decodedBytes);
    };

    /**
     * @param {string} userAgent 
     * @returns {string}
     */
    const parseUserAgent = (userAgent) => {
        if (!userAgent || typeof userAgent !== 'string') {
            return 'Unknown';
        }

        const deviceType = deviceTypes.find((i) => i.regex.test(userAgent))?.type ?? 'Unknown';
        const browser = browsers.find((i) => i.regex.test(userAgent))?.name ?? 'Unknown';
        const osMatch = operatingSystems.find((i) => i.regex.test(userAgent));

        const osName = osMatch ? osMatch.name : 'Unknown';
        const osVersion = osMatch ? (userAgent.match(osMatch.regex)?.[1]?.replace(/_/g, '.') ?? null) : null;

        return `${browser} ${deviceType} ${osVersion ? `${osName} ${osVersion}` : osName}`;
    };

    /**
     * @param {string} tz 
     * @returns {string}
     */
    const getGMTOffset = (tz) => {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            hourCycle: 'h23',
            hour: 'numeric',
        });

        let offset = (parseInt(formatter.format(now)) - now.getUTCHours() + 24) % 24;
        if (offset > 12) {
            offset -= 24;
        }

        return `GMT${offset >= 0 ? '+' : ''}${offset}`;
    };

    /**
     * @param {string} str 
     * @returns {string}
     */
    const convertMarkdownToHTML = (str) => {
        listsMarkDown.forEach(([k, v]) => {
            str = str.replace(new RegExp(`\\${k}(\\S(?:[\\s\\S]*?\\S)?)\\${k}`, 'g'), v);
        });

        return str;
    };

    return {
        loader,
        ask,
        copy,
        notify,
        timeOut,
        debounce,
        escapeHtml,
        base64Encode,
        base64Decode,
        disableButton,
        disableCheckbox,
        safeInnerHTML,
        parseUserAgent,
        changeOpacity,
        getGMTOffset,
        convertMarkdownToHTML,
    };
})();