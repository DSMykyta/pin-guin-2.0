// sticky-panel.js
export function initStickyPanelObserver() {
    const sections = document.querySelectorAll('.content-section');
    const panels = document.querySelectorAll('.panel-content');
    if (!sections.length || !panels.length) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetPanelId = entry.target.dataset.panelTarget;
                panels.forEach(panel => panel.classList.remove('is-active'));
                const targetPanel = document.getElementById(targetPanelId);
                if (targetPanel) targetPanel.classList.add('is-active');
            }
        });
    }, { root: document.getElementById('main-content'), threshold: 0.4 });
    sections.forEach(section => observer.observe(section));
}

