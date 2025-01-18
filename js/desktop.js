function initializeDesktop() {
    // Start Menu Toggle
    const startButton = document.querySelector('.start-button');
    const startMenu = document.getElementById('startMenu');
    let isStartMenuOpen = false;

    // Update clock
    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        document.getElementById('clock').textContent = timeString;
    }
    updateClock();
    setInterval(updateClock, 1000);

    // Start Menu functionality
    startButton.addEventListener('click', (e) => {
        e.stopPropagation();
        isStartMenuOpen = !isStartMenuOpen;
        startMenu.style.display = isStartMenuOpen ? 'block' : 'none';
        if (isStartMenuOpen) {
            playSound('menuOpen');
        }
    });

    // Close Start Menu when clicking outside
    document.addEventListener('click', (e) => {
        if (isStartMenuOpen && !startButton.contains(e.target) && !startMenu.contains(e.target)) {
            isStartMenuOpen = false;
            startMenu.style.display = 'none';
        }
    });

    // Desktop Icons Click Effect
    const desktopIcons = document.querySelectorAll('.desktop-icon');
    desktopIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            desktopIcons.forEach(i => i.style.backgroundColor = 'transparent');
            icon.style.backgroundColor = 'rgba(11, 97, 255, 0.2)';
        });

        icon.addEventListener('dblclick', () => {
            const windowId = icon.dataset.window;
            if (windowId && window.windowManager) {
                window.windowManager.openWindow(windowId);
                playSound('click');
            }
        });
    });

    // Start Menu Items
    document.querySelectorAll('.menu-item').forEach(item => {
        if (item.classList.contains('shutdown')) {
            item.addEventListener('click', () => {
                playSound('shutdown');
                handleShutdown();
                startMenu.style.display = 'none';
                isStartMenuOpen = false;
            });
        } else {
            const windowId = item.dataset.window;
            if (windowId) {
                item.addEventListener('click', () => {
                    window.windowManager.openWindow(windowId);
                    startMenu.style.display = 'none';
                    isStartMenuOpen = false;
                    playSound('click');
                });
            }
        }
    });

    // Initialize WindowManager and RecycleBin
    window.windowManager = new WindowManager();
    window.recycleBin = new RecycleBin();

    // Context Menu Prevention
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        // TODO: Add custom context menu
    });

    // Drag and Drop
    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length > 0) {
            Array.from(e.dataTransfer.files).forEach(file => {
                window.recycleBin.addItem({
                    name: file.name,
                    type: file.type.split('/')[0],
                    size: `${Math.round(file.size / 1024)} KB`
                });
            });
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        const desktop = document.querySelector('.desktop');
        const myDocuments = new MyDocuments();

        // Handle desktop context menu
        desktop.addEventListener('contextmenu', (e) => {
            if (e.target.classList.contains('desktop') || 
                e.target.classList.contains('desktop-icons-container')) {
                e.preventDefault();
                myDocuments.showContextMenu(e);
            }
        });

        // Handle icon context menu
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            icon.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                myDocuments.showItemContextMenu(e, icon);
            });
        });
    });
}

// Shutdown function
function handleShutdown() {
    const shutdownScreen = document.createElement('div');
    shutdownScreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #000;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: white;
        font-family: 'Segoe UI', sans-serif;
    `;

    shutdownScreen.innerHTML = `
        <img src="img/windows98-icons/ico/windows.ico" style="width: 32px; height: 32px; margin-bottom: 20px;">
        <div style="font-size: 24px; margin-bottom: 20px;">Windows is shutting down...</div>
    `;

    document.body.appendChild(shutdownScreen);

    setTimeout(() => {
        shutdownScreen.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 24px; margin-bottom: 20px;">It is now safe to close this window</div>
                <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px;">Close Window</button>
            </div>
        `;
    }, 3000);
} 