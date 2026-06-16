import { db, wishesCollection } from '../../firebase-config.js';
import { addDoc, onSnapshot, updateDoc, doc, increment, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { util } from '../../common/util.js';
import { pagination } from './pagination.js';

export const comment = (() => {
    let commentsContainer = null;
    let likesStorage = null;
    let allWishes = [];
    let unsubscribe = null;

    const renderWish = (docId, data) => {
        const isLiked = likesStorage.get(docId);
        const dateStr = data.createdAt ? new Date(data.createdAt.toMillis()).toLocaleString('ru-RU', {day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit'}) : '';
        
        return `
        <div class="wish-card bg-theme-auto shadow p-3 mx-0 mt-0 mb-3 rounded-4 border border-light-subtle">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <p class="fw-bold m-0 text-theme-auto" style="font-size: 1.05rem; word-break: break-word;">${util.escapeHtml(data.name)}</p>
                <small class="text-secondary text-end ms-2 flex-shrink-0" style="font-size: 0.75rem;">${util.escapeHtml(dateStr)}</small>
            </div>
            <div class="d-flex justify-content-between align-items-end">
                <p class="m-0 text-secondary pe-3" style="font-size: 0.95rem; line-height: 1.5; white-space: pre-wrap; flex-grow: 1; word-break: break-word;">${util.escapeHtml(data.message)}</p>
                <div class="flex-shrink-0">
                    <button onclick="undangan.comment.likeWish('${docId}')" class="btn btn-sm ${isLiked ? 'btn-danger text-white' : 'btn-outline-danger'} rounded-pill px-3 shadow-sm d-flex align-items-center transition-all" ${isLiked ? 'disabled' : ''}>
                        <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart me-2"></i>
                        <span>${data.likes || 0}</span>
                    </button>
                </div>
            </div>
        </div>`;
    };

    const render = () => {
        if (!commentsContainer) return;
        
        // Sort wishes: likes (desc), then createdAt (desc)
        allWishes.sort((a, b) => {
            if (b.likes !== a.likes) {
                return b.likes - a.likes;
            }
            const timeA = a.createdAt ? a.createdAt.toMillis() : 0;
            const timeB = b.createdAt ? b.createdAt.toMillis() : 0;
            return timeB - timeA;
        });

        pagination.setTotal(allWishes.length);

        const offset = pagination.getNext();
        const limit = pagination.getPer();
        const paginatedWishes = allWishes.slice(offset, offset + limit);

        if (allWishes.length === 0) {
            commentsContainer.innerHTML = '<div class="text-center p-4 text-secondary">Пока нет пожеланий. Будьте первыми!</div>';
        } else {
            let html = '';
            paginatedWishes.forEach((docData) => {
                html += renderWish(docData.id, docData);
            });
            commentsContainer.innerHTML = html;
        }
        
        commentsContainer.dispatchEvent(new Event('undangan.comment.done'));
        commentsContainer.dispatchEvent(new Event('undangan.comment.result'));
    };

    const show = () => {
        if (unsubscribe) {
            render();
            return;
        }

        commentsContainer.innerHTML = '<div class="text-center p-4"><div class="spinner-border text-primary" role="status"></div></div>';
        
        unsubscribe = onSnapshot(wishesCollection, (snapshot) => {
            allWishes = [];
            snapshot.forEach((doc) => {
                allWishes.push({ id: doc.id, ...doc.data() });
            });
            render();
        }, (error) => {
            console.error("Error fetching wishes: ", error);
            commentsContainer.innerHTML = '<div class="text-center p-4 text-danger">Ошибка загрузки пожеланий. Убедитесь, что правила Firebase Firestore разрешают чтение.</div>';
        });
    };

    const send = async (button) => {
        const nameInput = document.getElementById('form-name');
        const messageInput = document.getElementById('form-comment');

        const name = nameInput.value.trim();
        const message = messageInput.value.trim();

        if (!name) {
            util.notify('Пожалуйста, введите ваше имя').warning();
            return;
        }
        if (!message) {
            util.notify('Пожалуйста, напишите пожелание').warning();
            return;
        }

        const btn = util.disableButton(button);

        try {
            await addDoc(wishesCollection, {
                name: name,
                message: message,
                likes: 0,
                createdAt: serverTimestamp()
            });
            messageInput.value = '';
            util.notify('Ваше пожелание успешно отправлено!').success();
        } catch (error) {
            console.error("Error adding wish: ", error);
            util.notify('Произошла ошибка при отправке').danger();
        } finally {
            btn.restore();
        }
    };

    const likeWish = async (docId) => {
        if (likesStorage.get(docId)) return; // Already liked

        try {
            // Set local storage first so the optimistic onSnapshot render catches it
            likesStorage.set(docId, true);
            const wishRef = doc(db, "wishes", docId);
            await updateDoc(wishRef, {
                likes: increment(1)
            });
        } catch (error) {
            // Revert on error
            likesStorage.set(docId, false);
            console.error("Error liking wish: ", error);
        }
    };

    const init = () => {
        commentsContainer = document.getElementById('comments');
        pagination.init();
        commentsContainer.addEventListener('undangan.comment.show', show);
        likesStorage = {
            get: (id) => {
                const likes = JSON.parse(localStorage.getItem('wish_likes') || '{}');
                return likes[id];
            },
            set: (id, val) => {
                const likes = JSON.parse(localStorage.getItem('wish_likes') || '{}');
                likes[id] = val;
                localStorage.setItem('wish_likes', JSON.stringify(likes));
            }
        };
    };

    return {
        init,
        show,
        send,
        likeWish,
        pagination
    };
})();