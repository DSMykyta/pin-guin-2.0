// preview.js
import * as dom from './dom-elements.js';

export function initPreviewFeature() {
    const actionWrappers = document.querySelectorAll('.result-card-actions');

    // Керування випадаючим меню
    actionWrappers.forEach(wrapper => {
        const trigger = wrapper.querySelector('.lil-btn');
        const dropdown = wrapper.querySelector('.attributes-dropdown');

        if (!trigger || !dropdown) return;

        trigger.addEventListener('click', (e) => {
            e.stopPropagation(); // Зупиняємо копіювання по кліку на всю картку
            
            const isVisible = dropdown.style.display === 'flex';
            
            // Закриваємо всі інші меню
            document.querySelectorAll('.result-card-actions .attributes-dropdown').forEach(d => {
                d.style.display = 'none';
            });
            
            // Показуємо або ховаємо поточне меню
            dropdown.style.display = isVisible ? 'none' : 'flex';
        });
    });

    // Глобальний слухач для закриття меню по кліку за межами
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.result-card-actions')) {
            document.querySelectorAll('.result-card-actions .attributes-dropdown').forEach(d => {
                d.style.display = 'none';
            });
        }
    });

    // Логіка для кнопки "Показати візуалізацію" всередині меню
    // (Ця логіка вже обробляється універсальним файлом modal.js)
}