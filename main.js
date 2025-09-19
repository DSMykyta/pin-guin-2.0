import { initSidebars } from './sidebar.js';
import { initTableGenerator } from './table-generator.js';
import { initializeModal } from './modal.js';
import { initStickyPanelObserver } from './sticky-panel.js';
import { initPreviewFeature } from './preview.js'; // <-- Додайте імпорт

document.addEventListener('DOMContentLoaded', () => {
    initSidebars();
    initializeModal();
    initTableGenerator();
    initPreviewFeature();
    initStickyPanelObserver();
});