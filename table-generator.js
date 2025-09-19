// table-generator.js
import * as dom from './dom-elements.js';

let rowCounter = 1;

export function initTableGenerator() {
    if (!dom.rowsContainer) return;
    setupEventListeners();
    initializeFirstRow();
    new Sortable(dom.rowsContainer, {
        handle: '.move-btn',
        animation: 150,
    });
}

function setupEventListeners() {
    dom.addInputBtn.addEventListener('click', () => createAndAppendRow());
    dom.addEmptyLineButton.addEventListener('click', initializeEmptyRow);
    // dom.tablesBtn.addEventListener('click', generateTables);
    dom.ingredientsBtn.addEventListener('click', addIngredientsSample);
    dom.warningTextBtn.addEventListener('click', addWarningSample);
    dom.compositionTextBtn.addEventListener('click', addCompositionSample);
    dom.addNutritionFactsSampleBtn.addEventListener('click', () => addSample(getNutritionFacts()));
    dom.addVitaminsSampleBtn.addEventListener('click', () => addSample(getVitamins()));
    dom.addAminoAcidsSampleBtn.addEventListener('click', () => addSample(getAminoAcids()));

    document.addEventListener('applyMagic', (event) => processAndFillInputs(event.detail));

    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    };

    const debouncedCalculate = debounce(calculatePercentages, 300);

    dom.rowsContainer.addEventListener('input', debouncedCalculate);

    dom.resultCardHtml.addEventListener("click", () => {
        if (checkForEmptyNutritionFacts()) {
            return;
        }
        const htmlContent = generateHtmlTable();
        copyToClipboard(htmlContent, dom.resultCardHtml);
    });

    dom.resultCardBr.addEventListener("click", () => {
        if (checkForEmptyNutritionFacts()) {
            return;
        }
        const brContent = generateBrText();
        copyToClipboard(brContent, dom.resultCardBr);
    });

    if (dom.magicButton) {
        dom.magicButton.addEventListener('click', () => {
            // Створюємо та відправляємо подію "applyMagic" з текстом з поля вводу
            document.dispatchEvent(new CustomEvent('applyMagic', { detail: dom.magicText.value }));

            // Закриваємо модальне вікно
            if (dom.magicModal) {
                dom.magicModal.classList.remove('is-open');
                document.body.classList.remove('is-modal-open');
            }
        });
    }

}

function createAndAppendRow() {
    const newRow = createNewRow();
    dom.rowsContainer.appendChild(newRow);
    updateRowIdsAndEvents();
    return newRow;
}

function createNewRow() {
    const rowId = rowCounter++;
    const newRow = document.createElement('div');
    newRow.className = 'inputs-bloc td';
    newRow.id = `inputs-bloc-${rowId}`;
    newRow.innerHTML = `
        <button class="move-btn" tabindex="-1"><span class="material-symbols-outlined">expand_all</span></button>
        <div class="inputs-line">
            <div class="left"><input class="input-left" placeholder="Введіть текст" autocomplete="off"></div>
            <div class="right"><input class="input-right" placeholder="Введіть текст" autocomplete="off"><span class="input-right-tool"></span></div>
        </div>
        <div class="select">
            <button class="use-attributes lil-btn" tabindex="-1"><span class="material-symbols-outlined">tune</span></button>
            <div class="attributes-dropdown" style="display: none;">
                <button class="option-btn option-btn-l active" data-class="td"><span>Звичайний</span></button>
                <button class="option-btn option-btn-l" data-class="th-strong"><span>Заголовок</span></button>
                <button class="option-btn option-btn-l" data-class="th"><span>Підзаголовок</span></button>
                <div class="line"></div>
                <div class="container-option-btn-sm">
                    <button class="option-btn option-btn-sm" data-class="bold"><span class="material-symbols-outlined">format_bold</span></button>
                    <button class="option-btn option-btn-sm" data-class="italic"><span class="material-symbols-outlined">format_italic</span></button>
                    <button class="option-btn option-btn-sm" data-class="h2"><span class="material-symbols-outlined">format_h2</span></button>
                    <button class="option-btn option-btn-sm" data-class="colspan2"><span class="material-symbols-outlined">fit_page</span></button>
                </div>
                <div class="line"></div>
                <button class="option-btn option-btn-l" data-class="new-table"><span>Нова таблиця</span></button>
                <div class="line"></div>
                <button class="option-btn option-btn-l" data-action="insert-above"><span>Створити вище</span></button>
                <button class="option-btn option-btn-l" data-action="insert-below"><span>Створити нижче</span></button>
                <div class="line"></div>
                <div class="switch-container">
                    <input type="radio" id="row-${rowId}" name="input-type-${rowId}" value="row" checked>
                    <label for="row-${rowId}" class="switch-label">Строка</label>
                    <input type="radio" id="field-${rowId}" name="input-type-${rowId}" value="field">
                    <label for="field-${rowId}" class="switch-label">Поле</label>
                </div>
            </div>
        </div>
        <button class="lil-btn" tabindex="-1"><span class="material-symbols-outlined">close</span></button>
    `;

    const dropdown = newRow.querySelector('.attributes-dropdown');
    const closeBtn = newRow.querySelector('.lil-btn:last-child');
    const triggerBtn = newRow.querySelector('.use-attributes');

    // --- ОНОВЛЕНА ЛОГІКА ---

    // Функція для закриття меню та очищення слухачів
    const closeDropdown = () => {
        dropdown.style.display = 'none';
        document.removeEventListener('click', handleClickOutside);
    };

    // Функція для закриття по кліку за межами
    const handleClickOutside = (event) => {
        if (!triggerBtn.contains(event.target) && !dropdown.contains(event.target)) {
            closeDropdown();
        }
    };

    triggerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = dropdown.style.display === 'flex';
        document.querySelectorAll('.attributes-dropdown').forEach(d => d.style.display = 'none');

        if (isVisible) {
            closeDropdown();
        } else {
            dropdown.style.display = 'flex';
            document.addEventListener('click', handleClickOutside);
        }
    });

    // ==> ОСЬ ВИРІШЕННЯ ВАШОЇ ПРОБЛЕМИ <==
    // Додаємо слухач, який закриває меню, коли миша його покидає
    dropdown.addEventListener('mouseleave', closeDropdown);

    closeBtn.addEventListener('click', () => { newRow.remove(); updateRowIdsAndEvents(); });

    dropdown.querySelectorAll('.option-btn').forEach(button => button.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = button.dataset.action;
        if (action === 'insert-above') insertRowAbove(newRow);
        else if (action === 'insert-below') insertRowBelow(newRow);
        else handleOptionClick(button, newRow);

        closeDropdown(); // Закриваємо меню після вибору будь-якої опції
    }));

    dropdown.querySelectorAll('input[type="radio"]').forEach(input => input.addEventListener('change', () => handleInputTypeSwitch(newRow, input.value)));

    dropdown.addEventListener('click', (e) => e.stopPropagation());

    return newRow;
}

function initializeFirstRow() {
    if (dom.rowsContainer.children.length > 0) return;
    const firstRow = createAndAppendRow();
    const thStrongBtn = firstRow.querySelector('[data-class="th-strong"]');
    if (thStrongBtn) handleOptionClick(thStrongBtn, firstRow);
    firstRow.querySelector('.input-left').value = 'Пищевая ценность';
}

function initializeEmptyRow() {
    const newRow = createAndAppendRow();
    const newTblBtn = newRow.querySelector('[data-class="new-table"]');
    if (newTblBtn) handleOptionClick(newTblBtn, newRow);
}

function insertRowAbove(referenceRow) {
    const newRow = createNewRow();
    referenceRow.parentNode.insertBefore(newRow, referenceRow);
    updateRowIdsAndEvents();
}

function insertRowBelow(referenceRow) {
    const newRow = createNewRow();
    referenceRow.parentNode.insertBefore(newRow, referenceRow.nextSibling);
    updateRowIdsAndEvents();
}

function updateRowIdsAndEvents() { /* IDs are not critical for functionality, can be simplified */ }

function handleOptionClick(button, row) {
    const classToApply = button.dataset.class;
    const exclusiveClasses = ['td', 'th-strong', 'th', 'new-table', 'h2'];
    const isExclusive = exclusiveClasses.includes(classToApply);

    if (isExclusive) {
        if (row.classList.contains(classToApply)) {
            row.classList.remove(classToApply);
            button.classList.remove('active');
            if (!row.classList.contains('td')) {
                row.classList.add('td');
                const tdButton = row.querySelector('[data-class="td"]');
                if (tdButton) tdButton.classList.add('active');
            }
        } else {
            exclusiveClasses.forEach(cls => row.classList.remove(cls));
            row.classList.add(classToApply);
            row.querySelectorAll('.option-btn-l, [data-class="h2"]').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        }
    } else {
        row.classList.toggle(classToApply);
        button.classList.toggle('active');
    }
}

function handleInputTypeSwitch(row, type) {
    ['.input-left', '.input-right'].forEach(selector => {
        const oldEl = row.querySelector(selector);
        const newEl = document.createElement(type === 'field' ? 'textarea' : 'input');
        newEl.className = oldEl.className;
        newEl.placeholder = oldEl.placeholder;
        newEl.value = oldEl.value;
        if (type === 'row') newEl.autocomplete = 'off';
        oldEl.parentNode.replaceChild(newEl, oldEl);
    });
}

function generateHtmlTable() {
    let tableHTML = '';
    let isTableOpen = false;
    dom.rowsContainer.querySelectorAll('.inputs-bloc').forEach(row => {
        let leftInput = row.querySelector('.input-left').value;
        let rightInput = row.querySelector('.input-right').value;

        if ((row.classList.contains('added') && !rightInput.trim()) || (!row.classList.contains('new-table') && !leftInput.trim() && !rightInput.trim())) return;
        if (row.classList.contains('new-table') || row.classList.contains('h2')) {
            if (isTableOpen) { tableHTML += '</tbody></table>'; isTableOpen = false; }
            if (row.classList.contains('h2')) tableHTML += `<h2>${sanitizeText(leftInput)}</h2>`;
            return;
        }
        if (!isTableOpen) { tableHTML += '<table><tbody>'; isTableOpen = true; }

        let leftContent = sanitizeText(leftInput);
        let rightContent = sanitizeText(rightInput);

        leftContent = leftContent.replace(/\(([^)]+)\)/g, '<em>($1)</em>');
        rightContent = rightContent.replace(/\(([^)]+)\)/g, '<em>($1)</em>');
        if (row.classList.contains('italic')) {
            leftContent = `<em>${leftContent}</em>`;
            rightContent = `<em>${rightContent}</em>`;
        }

        const isTh = row.classList.contains('th-strong') || row.classList.contains('th');
        const cellTag = isTh ? 'th' : 'td';

        // --- ОСЬ ТУТ ЗМІНИ ---
        if (row.classList.contains('colspan2')) {
            // Логіка для colspan="2"
            let content = row.classList.contains('th-strong') || row.classList.contains('bold') ? `<strong>${leftContent}</strong>` : leftContent;
            tableHTML += `<tr><${cellTag} colspan="2">${content}</${cellTag}></tr>`;

        } else if (row.classList.contains('single')) {
            // НОВА логіка для single: одна комірка БЕЗ colspan
            let content = row.classList.contains('th-strong') || row.classList.contains('bold') ? `<strong>${leftContent}</strong>` : leftContent;
            tableHTML += `<tr><${cellTag}>${content}</${cellTag}></tr>`;

        } else {
            // Стандартна логіка для двох комірок
            let leftCell = row.classList.contains('th-strong') || row.classList.contains('bold') ? `<strong>${leftContent}</strong>` : leftContent;
            let rightCell = row.classList.contains('th-strong') || row.classList.contains('bold') ? `<strong>${rightContent}</strong>` : rightContent;
            tableHTML += `<tr><${cellTag}>${leftCell}</${cellTag}><${cellTag}>${rightCell}</${cellTag}></tr>`;
        }
    });
    if (isTableOpen) tableHTML += '</tbody></table>';
    return tableHTML;
}

function generateBrText() {
    let textHTML = '';
    dom.rowsContainer.querySelectorAll('.inputs-bloc').forEach(row => {
        if (row.classList.contains('new-table')) { textHTML += '<br>'; return; }

        let leftInput = row.querySelector('.input-left').value;
        let rightInput = row.querySelector('.input-right').value;

        if ((row.classList.contains('added') && !rightInput.trim()) || (!leftInput.trim() && !rightInput.trim())) return;
        if (leftInput.match(/Харчова цінність|Пищевая ценность/gi)) leftInput = '';

        const sanitizedLeft = sanitizeText(leftInput);
        let line;

        // ВИПРАВЛЕННЯ: Для h2 та colspan2 беремо тільки ліве поле
        if (row.classList.contains('h2') || row.classList.contains('colspan2') || row.classList.contains('single')) {
            line = sanitizedLeft;
        } else {
            const sanitizedRight = sanitizeText(rightInput);
            line = `${sanitizedLeft} ${sanitizedRight}`.trim();
        }

        if (row.classList.contains('h2') || row.classList.contains('bold') || row.classList.contains('th-strong') || row.classList.contains('th')) {
            line = `<strong>${line}</strong>`;
        }

        if (line) textHTML += line + '<br>';
    });
    return textHTML;
}

function checkForEmptyNutritionFacts(silent = false) {
    const nutritionRow = Array.from(dom.rowsContainer.querySelectorAll('.inputs-bloc')).find(row => row.querySelector('.input-left').value.match(/Харчова цінність|Пищевая ценность/gi));
    if (nutritionRow && !nutritionRow.querySelector('.input-right').value.trim()) {
        if (!silent) alert('Обов\'язкове поле "Пищевая ценность" не заповнено!');
        return true;
    }
    return false;
}

function addSample(items) {
    items.forEach(item => {
        const newRow = createAndAppendRow();
        newRow.classList.add('added');
        newRow.querySelector('.input-left').value = item;
    });
}

function addIngredientsSample() {
    initializeEmptyRow(); // Створюємо розділювач

    // Створюємо заголовок "Ингредиенты"
    const headerRow = createAndAppendRow();
    handleOptionClick(headerRow.querySelector('[data-class="th-strong"]'), headerRow);
    headerRow.querySelector('.input-left').value = 'Ингредиенты';
    headerRow.classList.add('single'); // Робимо його однокомірковим

    // Створюємо поле для вводу інгредієнтів
    const fieldRow = createAndAppendRow();
    handleInputTypeSwitch(fieldRow, 'field'); // Перетворюємо на <textarea>
    fieldRow.classList.add('single'); // Робимо його однокомірковим
}

function addWarningSample() {
    initializeEmptyRow(); // Створюємо розділювач

    // Створюємо поле для вводу попередження
    const fieldRow = createAndAppendRow();
    handleInputTypeSwitch(fieldRow, 'field'); // Перетворюємо на <textarea>
    handleOptionClick(fieldRow.querySelector('[data-class="bold"]'), fieldRow); // Робимо жирним
    fieldRow.classList.add('single'); // Робимо його однокомірковим
}

function addCompositionSample() {
    initializeEmptyRow(); // Створюємо розділювач

    // Створюємо поле з готовим текстом
    const fieldRow = createAndAppendRow();
    handleInputTypeSwitch(fieldRow, 'field'); // Перетворюємо на <textarea>
    handleOptionClick(fieldRow.querySelector('[data-class="bold"]'), fieldRow); // Робимо жирним
    fieldRow.classList.add('single'); // Робимо його однокомірковим
    fieldRow.querySelector('.input-left').value = 'Состав может незначительно отличаться в зависимости от вкуса';
}

function processAndFillInputs(text) {
    if (!text) return;
    const lines = text.split('\n');
    lines.forEach(line => {
        line = line.replace(/\d+\s*%(\*\*)?|\d+\*\*+|\*+/g, '').trim();
        if (!line) return;
        let rightCell = '', leftCell = line;
        const parenthesesMatch = line.match(/\(([^)]+)\)$/);
        if (parenthesesMatch) { rightCell = `(${parenthesesMatch[1].trim()})`.replace(/,/g, '.'); leftCell = line.slice(0, parenthesesMatch.index).trim(); }
        const valueMatch = leftCell.match(/(<\s*)?(\d+\.\d+|\d+,\d+|\d+)(?!(.*\d))(\s+[а-яА-Яa-zA-Z]+\.*\s*(?!.*\))|(?=\n|$))/);
        if (valueMatch) { let newRightCell = valueMatch[0].trim().replace(/,/g, '.'); leftCell = leftCell.slice(0, valueMatch.index).trim(); rightCell = `${newRightCell} ${rightCell}`.trim(); }
        const newRow = createAndAppendRow();
        newRow.querySelector('.input-left').value = leftCell;
        newRow.querySelector('.input-right').value = rightCell;
    });
    if (dom.magicText) dom.magicText.value = '';
}

function getNutritionFacts() { return ["Калории", " - от жиров", "Жиры", " - насыщенные", " - транс-жиры", "Холестерин", "Углеводы", " - сахар", "Пищевые волокна", "Белок", "Соль"]; }
function getVitamins() { return ["Витамин A", "Витамин C", "Витамин D", "Витамин E", "Витамин K", "Витамин B1", "Витамин B2", "Витамин B3", "Витамин B5", "Витамин B6", "Витамин B7", "Витамин B9", "Витамин B12"]; }
function getAminoAcids() { return ["Аланин", "Аргинин", "Аспарагин", "Аспарагиновая кислота", "Цистеин", "Глутамин", "Глутаминовая кислота", "Глицин", "Гистидин", "Изолейцин", "Лейцин", "Лизин", "Метионин", "Фенилаланин", "Пролин", "Серин", "Треонин", "Триптофан", "Тирозин", "Валин"]; }


function calculatePercentages() {
    let servingWeight = 0;
    const servingRow = Array.from(dom.rowsContainer.querySelectorAll('.inputs-bloc')).find(r => r.querySelector('.input-left').value.match(/Пищевая ценность|Харчова цінність/gi));
    if (servingRow) {
        const weightMatch = servingRow.querySelector('.input-right').value.match(/(\d+)/);
        if (weightMatch) servingWeight = parseInt(weightMatch[0], 10);
    }
    if (servingWeight === 0) {
        dom.rowsContainer.querySelectorAll('.input-right-tool').forEach(span => { span.textContent = ''; span.classList.remove('tooltip-sm'); });
        return;
    };
    ['Жиры', 'Жири', 'Углеводы', 'Вуглеводи', 'Белок', 'Білок'].forEach(nutrient => {
        const row = Array.from(dom.rowsContainer.querySelectorAll('.inputs-bloc')).find(r => r.querySelector('.input-left').value.includes(nutrient));
        if (row) {
            const value = parseFloat(row.querySelector('.input-right').value) || 0;
            const percentage = value > 0 ? `${Math.round((value / servingWeight) * 100)}%` : '';
            const toolSpan = row.querySelector('.input-right-tool');
            toolSpan.textContent = percentage;
            toolSpan.classList.toggle('tooltip-sm', !!percentage);
        }
    });
}

function copyToClipboard(text, cardElement) {
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = text;
    document.body.appendChild(tempTextarea);
    tempTextarea.select();
    document.execCommand("copy");
    document.body.removeChild(tempTextarea);

    if (cardElement) {
        const status = cardElement.querySelector('.result-status');
        const originalText = status.textContent; // Зберігаємо оригінальний текст (Склад/1 порція)
        status.textContent = 'Скопійовано!';
        cardElement.classList.add('copied');
        setTimeout(() => {
            status.textContent = originalText;
            cardElement.classList.remove('copied');
        }, 2000);
    }
}

function sanitizeText(text) {
    if (!text) return '';
    return text.trim()
        .replace(/МСМ/g, "MSM")
        .replace(/(\d+),(\d+)/g, '$1.$2');
}