import { progress } from './progress.js';
import { util } from '../../common/util.js';

export const video = (() => {

    /**
     * @returns {Promise<void>}
     */
    const load = () => {
        const wrap = document.getElementById('video-love-stroy');
        if (!wrap || !wrap.hasAttribute('data-src')) {
            wrap?.remove();
            progress.complete('video', true);
            return Promise.resolve();
        }

        const src = wrap.getAttribute('data-src');
        if (!src) {
            progress.complete('video', true);
            return Promise.resolve();
        }

        const vid = document.createElement('video');
        vid.className = wrap.getAttribute('data-vid-class');
        vid.loop = true;
        vid.muted = true;
        vid.controls = true;
        vid.playsInline = true;
        vid.preload = 'metadata';
        vid.disableRemotePlayback = true;
        vid.disablePictureInPicture = true;
        vid.controlsList = 'noremoteplayback nodownload noplaybackrate';
        vid.src = util.escapeHtml(src);

        const observer = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting ? vid.play() : vid.pause()));
        
        vid.addEventListener('error', () => progress.invalid('video'));
        
        return new Promise((r) => {
            vid.addEventListener('loadedmetadata', r, { once: true });
            // Fallback in case metadata event doesn't fire immediately
            setTimeout(r, 2000); 
        }).then(() => {
            wrap.appendChild(vid);
            observer.observe(vid);
            progress.complete('video');
            document.getElementById('video-love-stroy-loading')?.remove();
        });
    };

    /**
     * @returns {object}
     */
    const init = () => {
        progress.add();
        return {
            load,
        };
    };

    return {
        init,
    };
})();