// sidebar.js

import * as dom from './dom-elements.js';

function initializeLeftSidebarMobile() {
    if (dom.menuToggleBtn && dom.sidebarNav) {
        dom.menuToggleBtn.addEventListener('click', () => {
            dom.sidebarNav.classList.toggle('is-open');
        });
        document.addEventListener('click', (event) => {
            const isClickInside = dom.sidebarNav.contains(event.target);
            const isClickOnToggle = dom.menuToggleBtn.contains(event.target);
            if (!isClickInside && !isClickOnToggle && dom.sidebarNav.classList.contains('is-open')) {
                dom.sidebarNav.classList.remove('is-open');
            }
        });
    }
}

/**
 * Керує правою бічною панеллю для всіх пристроїв
 */
function initializeRightSidebar() {
    if (!dom.rightSidebar) return;

    // Єдина функція-обробник для обох кнопок
    function handleToggle() {
        if (window.innerWidth < 1024) {
            // На мобільних перемикаємо клас .is-open
            dom.rightSidebar.classList.toggle('is-open');
        } else {
            // На десктопі перемикаємо клас .is-collapsed
            dom.rightSidebar.classList.toggle('is-collapsed');
        }
    }

    // Призначаємо обробник для мобільної кнопки
    if (dom.rightSidebarMobileToggle) {
        dom.rightSidebarMobileToggle.addEventListener('click', handleToggle);
    }
    // Призначаємо той самий обробник для десктопної кнопки
    if (dom.rightSidebarDesktopToggle) {
        dom.rightSidebarDesktopToggle.addEventListener('click', handleToggle);
    }

    // Закриття на мобільних при кліку поза панеллю
    document.addEventListener('click', (event) => {
        if (window.innerWidth < 1024) {
            const isClickInside = dom.rightSidebar.contains(event.target);
            // Перевіряємо клік на обох кнопках, оскільки десктопна видима всередині панелі
            const isClickOnMobileToggle = dom.rightSidebarMobileToggle && dom.rightSidebarMobileToggle.contains(event.target);
            const isClickOnDesktopToggle = dom.rightSidebarDesktopToggle && dom.rightSidebarDesktopToggle.contains(event.target);

            if (!isClickInside && !isClickOnMobileToggle && !isClickOnDesktopToggle && dom.rightSidebar.classList.contains('is-open')) {
                dom.rightSidebar.classList.remove('is-open');
            }
        }
    });
}

function initializeDesktopSidebars() {
    // Ця функція тепер керує тільки лівою панеллю на десктопі
    if (dom.leftSidebarToggle) {
        dom.leftSidebarToggle.addEventListener('click', () => {
            dom.sidebarNav.classList.toggle('is-expanded');
        });
    }
}

export function initSidebars() {
    initializeLeftSidebarMobile();
    initializeRightSidebar(); // Викликаємо нову об'єднану функцію
    initializeDesktopSidebars();

    // Обробник зміни розміру вікна для скидання станів
    const handleResize = () => {
        if (window.innerWidth >= 1024) {
            // Забираємо мобільні класи на десктопі
            dom.rightSidebar.classList.remove('is-open');
            dom.sidebarNav.classList.remove('is-open');
        } else {
            // Забираємо десктопні класи на мобільних
            dom.rightSidebar.classList.remove('is-collapsed');
            dom.sidebarNav.classList.remove('is-expanded');
        }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Перший запуск для встановлення правильного стану
}