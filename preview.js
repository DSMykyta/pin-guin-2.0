// preview.js
import * as dom from './dom-elements.js';
import { generateHtmlTable, generateBrText } from './table-generator.js';
import { generateTextHtml, generateTextBr, generateTextClean, generateTextKeepTags } from './text-generator.js';

export function initPreviewFeature() {
    const actionWrappers = document.querySelectorAll('.result-card-actions');
    const previewTriggers = document.querySelectorAll('[data-modal-trigger="preview-modal"]');

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

    // --- НОВА ЛОГІКА ДЛЯ ПОПЕРЕДНЬОГО ПЕРЕГЛЯДУ ---

    // Навішуємо слухач на кожну кнопку "Показати візуалізацію"
    previewTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            // Визначаємо, який тип контенту потрібно показати (html чи br)
            const previewType = trigger.dataset.previewTarget;

            let content = '';
            let title = 'Попередній перегляд';

            // Викликаємо відповідну функцію генерації
            if (previewType === 'html') {
                title = 'Попередній перегляд: Склад (таблиця)';
                content = generateHtmlTable();
            } else if (previewType === 'br') {
                title = 'Попередній перегляд: 1 порція (текст)';
                content = generateBrText();
            } else if (previewType === 'text-html') {
                title = 'Попередній перегляд: Розмітка';
                content = generateTextHtml();
            } else if (previewType === 'text-br') {
                title = 'Попередній перегляд: br/ізація';
                content = generateTextBr();
            } else if (previewType === 'text-clean') {
                title = 'Попередній перегляд: Чистий текст';
                content = `<pre>${generateTextClean()}</pre>`;
            } else if (previewType === 'text-clean-tags') {
                title = 'Попередній перегляд: Без стилів (теги)';
                content = generateTextKeepTags(); // показуємо як HTML зі збереженими тегами
            }

            // Якщо контенту немає, показуємо заглушку
            if (!content.trim()) {
                content = '<p class="preview-placeholder">Немає даних для попереднього перегляду. Спочатку заповніть поля.</p>';
            }

            // Вставляємо згенерований контент та заголовок у модальне вікно
            if (dom.previewModalTitle && dom.previewContent) {
                dom.previewModalTitle.textContent = title;
                dom.previewContent.innerHTML = content;
            }

            // Примітка: саме відкриття модального вікна обробляється
            // універсальним скриптом modal.js, оскільки на кнопці є
            // атрибут data-modal-trigger="preview-modal"
        });
    });
}