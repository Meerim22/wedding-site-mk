/**
 * @returns {Promise<void>}
 */
const loadAOS = () => {

    const urlCss = 'https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.css';
    const urlJs = 'https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.js';

    /**
     * @returns {Promise<void>}
     */
    const loadCss = () => new Promise((res, rej) => {
        const link = document.createElement('link');
        link.onload = res;
        link.onerror = rej;

        link.rel = 'stylesheet';
        link.href = urlCss;
        document.head.appendChild(link);
    });

    /**
     * @returns {Promise<void>}
     */
    const loadJs = () => new Promise((res, rej) => {
        const sc = document.createElement('script');
        sc.onload = res;
        sc.onerror = rej;

        sc.src = urlJs;
        document.head.appendChild(sc);
    });

    return Promise.all([loadCss(), loadJs()]).then(() => {
        if (typeof window.AOS === 'undefined') {
            throw new Error('AOS library failed to load');
        }

        window.AOS.init();
    });
};

/**
 * @returns {Promise<void>}
 */
const loadConfetti = () => {

    const url = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.js';

    return new Promise((res, rej) => {
        const sc = document.createElement('script');
        sc.onerror = rej;
        sc.onload = () => {
            typeof window.confetti === 'undefined' ? rej(new Error('Confetti library failed to load')) : res();
        };

        sc.src = url;
        document.head.appendChild(sc);
    });
};

/**
 * @returns {Promise<void>}
 */
const loadAdditionalFont = () => {

    const fonts = [
        { css: 'https://fonts.googleapis.com/css2?family=Marck+Script&display=swap', family: 'Marck Script' },
        { css: 'https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic&display=swap', family: 'Noto Naskh Arabic' },
    ];

    /**
     * @param {object}
     * @returns {Promise<void>}
     */
    const loadFont = ({ css, family }) => new Promise((res, rej) => {
        const link = document.createElement('link');
        link.onload = res;
        link.onerror = rej;

        link.rel = 'stylesheet';
        link.href = css;
        document.head.appendChild(link);
    }).then(() => document.fonts.load(`1em "${family}"`));

    return Promise.all(fonts.map(loadFont));
};

/**
 * @param {Object} [opt]
 * @param {boolean} [opt.aos=true] - Load AOS library
 * @param {boolean} [opt.confetti=true] - Load Confetti library
 * @param {boolean} [opt.additionalFont=true] - Load Additional Font
 * @returns {Promise<void>}
 */
export const loader = (opt = {}) => {
    const promises = [];

    if (opt?.aos ?? true) {
        promises.push(loadAOS());
    }

    if (opt?.confetti ?? true) {
        promises.push(loadConfetti());
    }

    if (opt?.additionalFont ?? true) {
        promises.push(loadAdditionalFont());
    }

    return Promise.all(promises);
};