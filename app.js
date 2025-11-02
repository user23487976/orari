// Schedule application JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Inizializza l'applicazione
    updateDateTime();
    highlightCurrentTimeSlot();
    addScheduleCellInteractions(); // Unito dal secondo listener
    initializeTheme(); // Aggiunto per il tema
    
    // Aggiorna l'ora ogni secondo
    setInterval(updateDateTime, 1000);
    
    // Aggiorna l'evidenziazione della fascia oraria ogni minuto
    setInterval(highlightCurrentTimeSlot, 60000);
});

function updateDateTime() {
    const now = new Date();
    
    // Formatta la data in italiano
    const dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    const formattedDate = now.toLocaleDateString('it-IT', dateOptions);
    
    // Formatta l'ora
    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    
    const formattedTime = now.toLocaleTimeString('it-IT', timeOptions);
    
    // Aggiorna elementi DOM
    const dateElement = document.getElementById('current-date');
    const timeElement = document.getElementById('current-time');
    
    if (dateElement) {
        dateElement.textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    }
    
    if (timeElement) {
        timeElement.textContent = formattedTime;
    }
}

function highlightCurrentTimeSlot() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Converti in minuti
    
    // Definisci le fasce orarie in minuti (da mezzanotte)
    const timeSlots = [
        { start: 8 * 60, end: 9 * 60, row: 0 },         // 08:00 - 09:00
        { start: 9 * 60, end: 9 * 60 + 55, row: 1 },   // 09:00 - 09:55
        { start: 9 * 60 + 55, end: 10 * 60 + 50, row: 2 }, // 09:55 - 10:50
        { start: 10 * 60 + 50, end: 11 * 60 + 45, row: 3 }, // 10:50 - 11:45
        { start: 11 * 60 + 45, end: 12 * 60 + 40, row: 4 }, // 11:45 - 12:40
        { start: 12 * 60 + 40, end: 13 * 60 + 35, row: 5 }, // 12:40 - 13:35
        { start: 13 * 60 + 35, end: 14 * 60 + 30, row: 6 }  // 13:35 - 14:30 (new slot)
    ];
    
    // Rimuovi evidenziazione esistente
    const rows = document.querySelectorAll('.schedule-table tbody tr');
    rows.forEach(row => {
        row.classList.remove('current-time-row');
    });
    
    // Controlla se l'ora corrente rientra in una fascia
    const currentDay = now.getDay(); // 0 = Domenica, 1 = Lunedì, etc.
    
    // Evidenzia solo nei giorni feriali (da Lunedì 1 a Venerdì 5)
    if (currentDay >= 1 && currentDay <= 5) {
        timeSlots.forEach(slot => {
            if (currentTime >= slot.start && currentTime < slot.end) {
                const targetRow = rows[slot.row];
                if (targetRow) {
                    targetRow.classList.add('current-time-row');
                    
                    // Scroll dolce alla fascia oraria
                    targetRow.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }
        });
    }
}

// Aggiungi gestione click alle celle
function addScheduleCellInteractions() {
    const scheduleCells = document.querySelectorAll('.schedule-cell');
    
    scheduleCells.forEach(cell => {
        cell.addEventListener('click', function() {
            const teacher = this.querySelector('.teacher')?.textContent || '';
            const room = this.querySelector('.room')?.textContent || '';
            
            if (teacher && room) {
                showTooltip(this, teacher, room);
            }
        });
        
        // Aggiungi effetti hover
        cell.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        cell.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

function showTooltip(element, teacher, room) {
    // Rimuovi tooltip esistenti
    const existingTooltips = document.querySelectorAll('.schedule-tooltip');
    existingTooltips.forEach(tooltip => tooltip.remove());
    
    const tooltip = document.createElement('div');
    tooltip.className = 'schedule-tooltip';
    tooltip.innerHTML = `
        <strong>Docente:</strong> ${teacher}<br>
        <strong>Aula:</strong> ${room}
    `;
    
    tooltip.style.cssText = `
        position: absolute;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-base);
        padding: var(--space-8);
        font-size: var(--font-size-sm);
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        pointer-events: none;
        max-width: 200px;
        color: var(--color-text);
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
    let top = rect.top - tooltipRect.height - 10;
    
    if (left < 10) left = 10;
    if (left + tooltipRect.width > window.innerWidth - 10) {
        left = window.innerWidth - tooltipRect.width - 10;
    }
    if (top < 10) {
        top = rect.bottom + 10;
    }
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
    
    setTimeout(() => {
        if (tooltip.parentNode) tooltip.remove();
    }, 3000);
}

// --- NUOVE FUNZIONI PER IL TEMA ---

function initializeTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (!themeToggleBtn) return; // Esci se il pulsante non è trovato

    const htmlElement = document.documentElement; // Seleziona <html>
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    function setTheme(theme) {
        htmlElement.dataset.colorScheme = theme; // Imposta data-color-scheme="light" o "dark"
        localStorage.setItem('theme', theme); // Salva la preferenza
        
        // Gestisci la visualizzazione delle icone (emoji)
        const sunIcon = themeToggleBtn.querySelector('.icon-sun');
        const moonIcon = themeToggleBtn.querySelector('.icon-moon');
        
        if (sunIcon && moonIcon) {
             if (theme === 'dark') {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'inline';
            } else {
                sunIcon.style.display = 'inline';
                moonIcon.style.display = 'none';
            }
        }
    }

    function toggleTheme() {
        // Controlla il tema corrente dall'attributo data
        const currentTheme = htmlElement.dataset.colorScheme;
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    }

    // Aggiungi l'evento click al pulsante
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Imposta il tema iniziale al caricamento
    let initialTheme = 'light'; // Predefinito
    if (savedTheme) {
        initialTheme = savedTheme; // 1. Controlla localStorage
    } else if (prefersDark) {
        initialTheme = 'dark'; // 2. Controlla preferenze OS
    }
    
    setTheme(initialTheme);
}

// --- FINE NUOVE FUNZIONI TEMA ---


document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        printSchedule();
    }
    if (e.key === 'Escape') {
        document.querySelectorAll('.schedule-tooltip').forEach(tooltip => tooltip.remove());
    }
});

// Il secondo listener DOMContentLoaded è stato unito nel primo
// document.addEventListener('DOMContentLoaded', function() {
//     addScheduleCellInteractions();
// });

function handleTableScroll() {
    const wrapper = document.querySelector('.schedule-wrapper');
    const table = document.querySelector('.schedule-table');
    
    if (wrapper && table) {
        if (table.scrollWidth > wrapper.clientWidth) {
            wrapper.classList.add('scrollable');
            wrapper.addEventListener('scroll', function() {
                const scrollLeft = this.scrollLeft;
                const maxScroll = this.scrollWidth - this.clientWidth;
                
                if (scrollLeft > 0) this.classList.add('scroll-left');
                else this.classList.remove('scroll-left');
                
                if (scrollLeft < maxScroll) this.classList.add('scroll-right');
                else this.classList.remove('scroll-right');
            });
        }
    }
}

window.addEventListener('resize', handleTableScroll);
window.addEventListener('load', handleTableScroll);