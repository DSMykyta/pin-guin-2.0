// links-generator.js

let countriesData = {}; // Зберігаємо дані про країни

// Функція для ініціалізації блоку "Офіційні сайти"
export function initLinksGenerator() {
    const buttonsContainer = document.getElementById("buttons-container");
    const searchInput = document.getElementById("search-link");
    const countryDisplay = document.getElementById("links-country-name");
    
    if (!buttonsContainer || !searchInput || !countryDisplay) {
        return;
    }

    const csvUrlLinks = 'https://docs.google.com/spreadsheets/d/1kDpQ6FoSsEsA7dc36MKYA97j6lTmLZ_de11o83CZGXU/export?format=csv';

    const updateLinkCountry = () => {
        const brandName = searchInput.value.trim().toLowerCase();
        countryDisplay.textContent = countriesData[brandName] || '';
    };

    Papa.parse(csvUrlLinks, {
        download: true,
        header: true,
        complete: function(results) {
            const data = results.data;
            
            countriesData = data.reduce((acc, row) => {
                const brand = row.BrandName ? row.BrandName.toLowerCase().trim() : '';
                const country = row.CountryName ? row.CountryName.trim() : '';
                if (brand && country) {
                    acc[brand] = country;
                }
                return acc;
            }, {});

            buttonsContainer.innerHTML = ''; 
            data.forEach(row => {
                if (row.BrandName && row.Link) {
                    const button = document.createElement("button");
                    button.className = "link-button";
                    
                    const linkElement = document.createElement("a");
                    linkElement.href = row.Link;
                    linkElement.target = "_blank";

                    // 1. Створюємо span для тексту
                    const textSpan = document.createElement("span");
                    textSpan.className = "link-button-text";
                    textSpan.textContent = row.BrandName;

                    // 2. Створюємо span для іконки
                    const iconSpan = document.createElement("span");
                    iconSpan.className = "material-symbols-outlined link-button-icon";
                    iconSpan.textContent = "open_in_new";
                    
                    // 3. Додаємо текст та іконку в посилання
                    linkElement.appendChild(textSpan);
                    //linkElement.appendChild(iconSpan);
                    
                    button.appendChild(linkElement);
                    buttonsContainer.appendChild(button);
                }
            });
            
            updateLinkCountry();
        },
        error: function(err) {
            console.error('Помилка завантаження CSV з посиланнями:', err);
        }
    });

    searchInput.addEventListener("input", function () {
        const searchTerm = searchInput.value.toLowerCase();
        const buttons = buttonsContainer.getElementsByClassName("link-button");
        for (let i = 0; i < buttons.length; i++) {
            const buttonText = buttons[i].textContent.toLowerCase();
            if (buttonText.includes(searchTerm)) {
                buttons[i].style.display = "inline-flex";
            } else {
                buttons[i].style.display = "none";
            }
        }
    });

    searchInput.addEventListener('input', updateLinkCountry);
}