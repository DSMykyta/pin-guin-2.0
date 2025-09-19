// modal.js: Універсальний обробник модальних вікон

export function initializeModal() {
    // Знайти всі елементи, які можуть відкривати модальні вікна
    const triggers = document.querySelectorAll('[data-modal-trigger]');

    // Функція для відкриття вікна
    const openModal = (modal) => {
        if (!modal) return;
        modal.classList.add('is-open');
        document.body.classList.add('is-modal-open');
    };

    // Функція для закриття вікна
    const closeModal = (modal) => {
        if (!modal) return;
        modal.classList.remove('is-open');
        document.body.classList.remove('is-modal-open');
    };

    // Навісити слухач на кожну кнопку-тригер
    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const modalId = trigger.dataset.modalTrigger;
            const modal = document.getElementById(modalId);
            openModal(modal);
        });
    });

    // Навісити слухач на всі кнопки закриття
    const closeButtons = document.querySelectorAll('[data-modal-close]');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal-overlay');
            closeModal(modal);
        });
    });

    // Дозволити закриття по кліку на темний фон
    const overlays = document.querySelectorAll('.modal-overlay');
    overlays.forEach(overlay => {
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                closeModal(overlay);
            }
        });
    });

    // Дозволити закриття по натисканню на Escape
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const openModal = document.querySelector('.modal-overlay.is-open');
            closeModal(openModal);
        }
    });
}