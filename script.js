const WINDOWS_SOUNDS = {
    startup: 'sounds/startup.wav',
    shutdown: 'sounds/shutdown.wav',
    error: 'sounds/error.wav',
    notify: 'sounds/notify.wav',
    click: 'sounds/click.wav',
    minimize: 'sounds/minimize.wav',
    maximize: 'sounds/maximize.wav',
    menuOpen: 'sounds/menu_open.wav',
    recycle: 'sounds/recycle.wav',
    restore: 'sounds/restore.wav'
};

// Fungsi untuk memainkan suara yang lebih reliable
function playSound(soundName) {
    const audio = document.getElementById(soundName + 'Sound');
    if (audio) {
        audio.currentTime = 0; // Reset audio ke awal
        audio.play().catch(err => {
            console.log('Error playing sound:', err);
        });
    }
}

// Update clock
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('clock').textContent = timeString;
}

setInterval(updateClock, 1000);
updateClock();

// Start Menu Toggle
const startButton = document.querySelector('.start-button');
const startMenu = document.getElementById('startMenu');
let isStartMenuOpen = false;

startButton.addEventListener('click', () => {
    isStartMenuOpen = !isStartMenuOpen;
    startMenu.style.display = isStartMenuOpen ? 'block' : 'none';
    if (isStartMenuOpen) {
        playSound('menuOpen');
    }
});

// Close Start Menu when clicking outside
document.addEventListener('click', (e) => {
    if (!startButton.contains(e.target) && !startMenu.contains(e.target)) {
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
});

// Window Management
class WindowManager {
    constructor() {
        this.windows = {};
        this.activeWindow = null;
        this.zIndex = 100;
        
        this.initializeWindows();
        this.setupEventListeners();
        this.setupBrowser();
        this.setupMyDocumentsContextMenu();
        this.setupContextMenus();
        this.setupRPGGame();
        this.activeGames = new Map(); // Untuk menyimpan game yang sedang berjalan
        this.activeIntervals = new Map(); // Untuk menyimpan interval yang sedang berjalan
    }

    initializeWindows() {
        document.querySelectorAll('.window').forEach(window => {
            const id = window.id;
            
            // Set ukuran default untuk setiap jenis window
            switch(id) {
                case 'browser':
                    window.style.width = '800px';
                    window.style.height = '600px';
                    break;
                case 'notepad':
                    window.style.width = '600px';
                    window.style.height = '400px';
                    break;
                case 'my-computer':
                case 'recycle-bin':
                case 'my-documents':
                    window.style.width = '500px';
                    window.style.height = '400px';
                    break;
                default:
                    window.style.width = '500px';
                    window.style.height = '300px';
            }

            this.windows[id] = {
                element: window,
                minimized: false,
                maximized: false,
                position: { x: 50, y: 50 }
            };
            this.setupWindowDragging(window);
        });
    }

    setupEventListeners() {
        // Desktop Icons
        document.querySelectorAll('.desktop-icon, .menu-item').forEach(icon => {
            icon.addEventListener('dblclick', (e) => {
                const windowId = icon.dataset.window;
                if (windowId) {
                    this.openWindow(windowId);
                }
            });
        });

        // Window Controls
        document.querySelectorAll('.window').forEach(window => {
            const controls = window.querySelector('.window-controls');
            controls.querySelector('.minimize').addEventListener('click', () => {
                playSound('minimize');
                this.minimizeWindow(window.id);
            });
            controls.querySelector('.maximize').addEventListener('click', () => {
                playSound('maximize');
                this.maximizeWindow(window.id);
            });
            controls.querySelector('.close').addEventListener('click', () => {
                playSound('click');
                this.closeWindow(window.id);
            });
        });
    }

    setupWindowDragging(window) {
        const header = window.querySelector('.window-header');
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;

        header.addEventListener('mousedown', (e) => {
            if (e.target === header || e.target.parentElement === header) {
                isDragging = true;
                window.style.cursor = 'move';
                
                initialX = e.clientX - window.offsetLeft;
                initialY = e.clientY - window.offsetTop;
                
                // Tambahkan class dragging untuk animasi
                window.classList.add('dragging');
                
                this.activateWindow(window.id);
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                
                // Batasi window agar tidak keluar layar
                currentX = Math.max(
                    -window.offsetWidth + 100, 
                    Math.min(currentX, document.documentElement.clientWidth - 100)
                );
                currentY = Math.max(
                    0, 
                    Math.min(currentY, document.documentElement.clientHeight - 50)
                );
                
                window.style.left = `${currentX}px`;
                window.style.top = `${currentY}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                window.style.cursor = 'default';
                // Hapus class dragging saat selesai
                window.classList.remove('dragging');
                // Tambahkan efek "drop"
                window.style.animation = 'windowDrop 0.1s ease-out';
                setTimeout(() => {
                    window.style.animation = '';
                }, 100);
            }
        });
    }

    openWindow(id) {
        const window = this.windows[id];
        if (window) {
            // Posisikan window di tengah
            const windowElement = window.element;
            const windowWidth = windowElement.offsetWidth || 800; // Default width jika belum diset
            const windowHeight = windowElement.offsetHeight || 600; // Default height jika belum diset
            
            // Hitung posisi tengah
            const left = Math.max(0, (document.documentElement.clientWidth - windowWidth) / 2);
            const top = Math.max(0, (document.documentElement.clientHeight - windowHeight) / 2);
            
            // Set posisi
            windowElement.style.left = `${left}px`;
            windowElement.style.top = `${top}px`;
            
            // Tampilkan window
            windowElement.style.display = 'block';
            
            if (!window.minimized) {
                this.activateWindow(id);
            }
            this.updateTaskbar();
        }
    }

    closeWindow(id) {
        const window = this.windows[id];
        if (window) {
            // Cleanup untuk game
            if (id === 'rpg-game') {
                const gameLoop = this.activeGames.get(id);
                if (gameLoop) {
                    clearInterval(gameLoop);
                    this.activeGames.delete(id);
                }
            }

            // Cleanup untuk interval
            const interval = this.activeIntervals.get(id);
            if (interval) {
                clearInterval(interval);
                this.activeIntervals.delete(id);
            }

            // Cleanup untuk audio
            const audio = window.element.querySelector('audio');
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }

            // Cleanup untuk canvas
            const canvas = window.element.querySelector('canvas');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }

            // Add glitch effect before closing
            window.element.classList.add('closing');
            playSound('click');

            // Wait for animation to finish before hiding
            setTimeout(() => {
                window.element.classList.remove('closing');
                window.element.style.display = 'none';
                window.minimized = false;
                this.updateTaskbar();
            }, 300); // Match animation duration
        }
    }

    minimizeWindow(id) {
        const window = this.windows[id];
        if (window) {
            window.element.style.display = 'none';
            window.minimized = true;
            this.updateTaskbar();
        }
    }

    maximizeWindow(id) {
        const window = this.windows[id];
        if (window) {
            if (!window.maximized) {
                window.position = {
                    x: window.element.offsetLeft,
                    y: window.element.offsetTop
                };
                window.element.style.top = '0';
                window.element.style.left = '0';
                window.element.style.width = '100%';
                window.element.style.height = 'calc(100% - 40px)'; // Account for taskbar
                window.maximized = true;
            } else {
                window.element.style.top = `${window.position.y}px`;
                window.element.style.left = `${window.position.x}px`;
                window.element.style.width = '500px';
                window.element.style.height = '300px';
                window.maximized = false;
            }
        }
    }

    activateWindow(id) {
        const window = this.windows[id];
        if (window) {
            this.zIndex++;
            window.element.style.zIndex = this.zIndex;
            document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
            window.element.classList.add('active');
            this.activeWindow = id;
            this.updateTaskbar();
        }
    }

    updateTaskbar() {
        const taskbarPrograms = document.querySelector('.taskbar-programs');
        taskbarPrograms.innerHTML = '';

        for (const [id, window] of Object.entries(this.windows)) {
            if (window.element.style.display !== 'none' || window.minimized) {
                const button = document.createElement('div');
                button.className = `taskbar-program ${this.activeWindow === id ? 'active' : ''}`;
                const icon = window.element.querySelector('.window-title img').cloneNode(true);
                const text = window.element.querySelector('.window-title').textContent.trim();
                button.appendChild(icon);
                button.appendChild(document.createTextNode(text));

                button.addEventListener('click', () => {
                    if (window.minimized) {
                        window.element.style.display = 'block';
                        window.minimized = false;
                        this.activateWindow(id);
                    } else if (this.activeWindow === id) {
                        this.minimizeWindow(id);
                    } else {
                        this.activateWindow(id);
                    }
                });

                taskbarPrograms.appendChild(button);
            }
        }
    }

    setupBrowser() {
        const browser = document.getElementById('browser');
        const urlInput = browser.querySelector('#urlInput');
        const browserFrame = browser.querySelector('#browserFrame');
        const backBtn = browser.querySelector('.back');
        const forwardBtn = browser.querySelector('.forward');
        const refreshBtn = browser.querySelector('.refresh');
        const homeBtn = browser.querySelector('.home');
        const goBtn = browser.querySelector('.go-btn');

        // Default homepage - menggunakan Google Search
        const homepage = 'https://www.google.com/webhp?igu=1';
        browserFrame.src = homepage;
        urlInput.value = homepage;

        // Navigation functions - perbaikan untuk back/forward
        let history = [];
        let currentIndex = -1;

        const updateNavButtons = () => {
            backBtn.disabled = currentIndex <= 0;
            forwardBtn.disabled = currentIndex >= history.length - 1;
            
            // Update visual style berdasarkan status disabled
            backBtn.style.opacity = backBtn.disabled ? '0.5' : '1';
            forwardBtn.style.opacity = forwardBtn.disabled ? '0.5' : '1';
        };

        const navigateToUrlWithHistory = (url) => {
            // Hapus forward history jika ada
            if (currentIndex < history.length - 1) {
                history = history.slice(0, currentIndex + 1);
            }
            
            history.push(url);
            currentIndex++;
            browserFrame.src = url;
            urlInput.value = url;
            updateNavButtons();
        };

        backBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                browserFrame.src = history[currentIndex];
                urlInput.value = history[currentIndex];
                updateNavButtons();
            }
        });

        forwardBtn.addEventListener('click', () => {
            if (currentIndex < history.length - 1) {
                currentIndex++;
                browserFrame.src = history[currentIndex];
                urlInput.value = history[currentIndex];
                updateNavButtons();
            }
        });

        refreshBtn.addEventListener('click', () => {
            browserFrame.src = browserFrame.src;
        });

        homeBtn.addEventListener('click', () => {
            navigateToUrlWithHistory(homepage);
        });

        // URL navigation
        const navigateToUrl = () => {
            let url = urlInput.value.trim();
            
            if (!url.includes('.') && !url.includes('/')) {
                url = `https://www.google.com/search?igu=1&q=${encodeURIComponent(url)}`;
            } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }

            try {
                navigateToUrlWithHistory(url);
            } catch (e) {
                const searchUrl = `https://www.google.com/search?igu=1&q=${encodeURIComponent(url)}`;
                navigateToUrlWithHistory(searchUrl);
            }
        };

        goBtn.addEventListener('click', navigateToUrl);
        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                navigateToUrl();
            }
        });

        // Update URL when iframe loads
        browserFrame.addEventListener('load', () => {
            try {
                urlInput.value = browserFrame.contentWindow.location.href;
            } catch (e) {
                // Ignore cross-origin errors
            }
        });

        // Tambahkan context menu untuk browser
        browserFrame.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            
            // Dapatkan URL yang di klik kanan
            let targetUrl = '';
            try {
                if (e.target.tagName === 'A') {
                    targetUrl = e.target.href;
                }
            } catch (err) {
                // Handle cross-origin issues
            }

            const menuItems = [
                {
                    label: 'Back',
                    icon: 'https://win98icons.alexmeub.com/icons/png/back-0.png',
                    action: () => browserFrame.contentWindow.history.back()
                },
                {
                    label: 'Forward',
                    icon: 'https://win98icons.alexmeub.com/icons/png/forward-0.png',
                    action: () => browserFrame.contentWindow.history.forward()
                },
                {
                    label: 'Refresh',
                    icon: 'https://win98icons.alexmeub.com/icons/png/refresh-0.png',
                    action: () => browserFrame.src = browserFrame.src
                },
                { type: 'separator' },
                {
                    label: 'Open in New Window',
                    icon: 'https://win98icons.alexmeub.com/icons/png/window_new-0.png',
                    action: () => {
                        const newWindow = window.open(targetUrl || browserFrame.src, '_blank', 
                            'width=800,height=600,menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes');
                    }
                }
            ];

            if (targetUrl) {
                menuItems.push(
                    { type: 'separator' },
                    {
                        label: 'Copy Link',
                        icon: 'https://win98icons.alexmeub.com/icons/png/copy-0.png',
                        action: () => {
                            navigator.clipboard.writeText(targetUrl)
                                .then(() => this.showNotification('Link copied to clipboard'))
                                .catch(() => this.showNotification('Failed to copy link'));
                        }
                    }
                );
            }

            showContextMenu(e.pageX, e.pageY, menuItems);
        });

        // Tambahkan fungsi notifikasi
        this.showNotification = (message) => {
            const notification = document.createElement('div');
            notification.className = 'windows-notification';
            notification.innerHTML = `
                <img src="https://win98icons.alexmeub.com/icons/png/info-0.png" alt="Info">
                <span>${message}</span>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 500);
            }, 3000);
        };

        // Initialize history with homepage
        navigateToUrlWithHistory(homepage);
    }

    setupMyDocumentsContextMenu() {
        const myDocuments = document.getElementById('my-documents');
        const content = myDocuments.querySelector('.window-content');

        // Context menu untuk file/folder
        content.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const item = e.target.closest('.folder-item');
            
            if (item) {
                // Menu untuk file/folder yang diklik
                showContextMenu(e.pageX, e.pageY, [
                    {
                        label: 'Open',
                        icon: 'img/windows98-icons/ico/directory_open-0.ico',
                        action: () => {
                            // Implementasi open file
                            alert('Opening: ' + item.querySelector('span').textContent);
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'Cut',
                        icon: 'img/windows98-icons/ico/cut-0.ico',
                        action: () => {
                            // Implementasi cut
                            alert('Cut: ' + item.querySelector('span').textContent);
                        }
                    },
                    {
                        label: 'Copy',
                        icon: 'img/windows98-icons/ico/copy-0.ico',
                        action: () => {
                            // Implementasi copy
                            alert('Copy: ' + item.querySelector('span').textContent);
                        }
                    },
                    {
                        label: 'Delete',
                        icon: 'img/windows98-icons/ico/delete_file-0.ico',
                        action: () => {
                            if (confirm('Are you sure you want to delete this item?')) {
                                recycleBin.addItem({
                                    name: item.querySelector('span').textContent,
                                    type: 'file',
                                    path: 'My Documents'
                                });
                                item.remove();
                            }
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'Rename',
                        icon: 'img/windows98-icons/ico/rename-0.ico',
                        action: () => {
                            // Implementasi rename
                            const newName = prompt('Enter new name:', item.querySelector('span').textContent);
                            if (newName) {
                                item.querySelector('span').textContent = newName;
                            }
                        }
                    },
                    {
                        label: 'Properties',
                        icon: 'img/windows98-icons/ico/info-0.ico',
                        action: () => {
                            // Implementasi properties
                            alert('Properties of: ' + item.querySelector('span').textContent);
                        }
                    }
                ]);
            } else {
                // Menu untuk area kosong
                showContextMenu(e.pageX, e.pageY, [
                    {
                        label: 'View',
                        icon: 'img/windows98-icons/ico/view_list-0.ico',
                        submenu: [
                            {
                                label: 'Large Icons',
                                icon: 'img/windows98-icons/ico/view_large_icons-0.ico',
                                action: () => {
                                    content.classList.remove('list-view');
                                    content.classList.add('large-icons');
                                }
                            },
                            {
                                label: 'List',
                                icon: 'img/windows98-icons/ico/view_list-0.ico',
                                action: () => {
                                    content.classList.remove('large-icons');
                                    content.classList.add('list-view');
                                }
                            }
                        ]
                    },
                    { type: 'separator' },
                    {
                        label: 'New',
                        icon: 'img/windows98-icons/ico/new-0.ico',
                        submenu: [
                            {
                                label: 'Folder',
                                icon: 'img/windows98-icons/ico/directory_closed-0.ico',
                                action: () => {
                                    const folderName = prompt('Enter folder name:', 'New Folder');
                                    if (folderName) {
                                        const newFolder = document.createElement('div');
                                        newFolder.className = 'folder-item';
                                        newFolder.innerHTML = `
                                            <img src="img/windows98-icons/ico/directory_closed.ico" alt="Folder">
                                            <span>${folderName}</span>
                                        `;
                                        content.appendChild(newFolder);
                                    }
                                }
                            },
                            {
                                label: 'Text Document',
                                icon: 'img/windows98-icons/ico/notepad_file-0.ico',
                                action: () => {
                                    const fileName = prompt('Enter file name:', 'New Text Document.txt');
                                    if (fileName) {
                                        const newFile = document.createElement('div');
                                        newFile.className = 'folder-item';
                                        newFile.innerHTML = `
                                            <img src="img/windows98-icons/ico/notepad_file.ico" alt="Text File">
                                            <span>${fileName}</span>
                                        `;
                                        content.appendChild(newFile);
                                    }
                                }
                            }
                        ]
                    },
                    {
                        label: 'Refresh',
                        icon: 'img/windows98-icons/ico/refresh-0.ico',
                        action: () => {
                            // Implementasi refresh
                            alert('Refreshing view...');
                        }
                    }
                ]);
            }
        });
    }

    setupContextMenus() {
        // Desktop context menu
        document.querySelector('.desktop').addEventListener('contextmenu', (e) => {
            // Jika klik kanan bukan pada icon atau window
            if (!e.target.closest('.desktop-icon') && !e.target.closest('.window')) {
                e.preventDefault();
                showContextMenu(e.pageX, e.pageY, [
                    {
                        label: 'View',
                        icon: 'img/windows98-icons/ico/view_list-0.ico',
                        submenu: [
                            {
                                label: 'Large Icons',
                                icon: 'img/windows98-icons/ico/view_large_icons-0.ico',
                                action: () => document.querySelector('.desktop').classList.add('large-icons')
                            },
                            {
                                label: 'Small Icons',
                                icon: 'img/windows98-icons/ico/view_small_icons-0.ico',
                                action: () => document.querySelector('.desktop').classList.remove('large-icons')
                            }
                        ]
                    },
                    { type: 'separator' },
                    {
                        label: 'Arrange Icons',
                        icon: 'img/windows98-icons/ico/arrange-0.ico',
                        submenu: [
                            {
                                label: 'By Name',
                                action: () => this.arrangeIcons('name')
                            },
                            {
                                label: 'By Type',
                                action: () => this.arrangeIcons('type')
                            }
                        ]
                    },
                    {
                        label: 'Refresh',
                        icon: 'img/windows98-icons/ico/refresh-0.ico',
                        action: () => window.location.reload()
                    },
                    { type: 'separator' },
                    {
                        label: 'Properties',
                        icon: 'img/windows98-icons/ico/display_properties-0.ico',
                        action: () => alert('Display Properties')
                    }
                ]);
            }
        });

        // Start button context menu
        document.querySelector('.start-button').addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showContextMenu(e.pageX, e.pageY, [
                {
                    label: 'Open',
                    icon: 'img/windows98-icons/ico/directory_open-0.ico',
                    action: () => {
                        startMenu.style.display = 'block';
                        isStartMenuOpen = true;
                    }
                },
                {
                    label: 'Explore',
                    icon: 'img/windows98-icons/ico/explorer-0.ico',
                    action: () => this.openWindow('my-computer')
                },
                { type: 'separator' },
                {
                    label: 'Properties',
                    icon: 'img/windows98-icons/ico/taskbar_properties-0.ico',
                    action: () => alert('Taskbar Properties')
                }
            ]);
        });

        // Taskbar context menu
        document.querySelector('.taskbar').addEventListener('contextmenu', (e) => {
            // Jika klik kanan bukan pada start button atau program
            if (!e.target.closest('.start-button') && !e.target.closest('.taskbar-program')) {
                e.preventDefault();
                showContextMenu(e.pageX, e.pageY, [
                    {
                        label: 'Cascade Windows',
                        icon: 'img/windows98-icons/ico/cascade_windows-0.ico',
                        action: () => this.cascadeWindows()
                    },
                    {
                        label: 'Tile Windows Horizontally',
                        icon: 'img/windows98-icons/ico/tile_horizontally-0.ico',
                        action: () => this.tileWindowsHorizontally()
                    },
                    {
                        label: 'Tile Windows Vertically',
                        icon: 'img/windows98-icons/ico/tile_vertically-0.ico',
                        action: () => this.tileWindowsVertically()
                    },
                    { type: 'separator' },
                    {
                        label: 'Show Desktop',
                        icon: 'img/windows98-icons/ico/desktop-0.ico',
                        action: () => this.minimizeAllWindows()
                    },
                    { type: 'separator' },
                    {
                        label: 'Task Manager',
                        icon: 'img/windows98-icons/ico/task_manager-0.ico',
                        action: () => alert('Task Manager')
                    },
                    {
                        label: 'Properties',
                        icon: 'img/windows98-icons/ico/taskbar_properties-0.ico',
                        action: () => alert('Taskbar Properties')
                    }
                ]);
            }
        });

        // Desktop icon context menu
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            icon.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                showContextMenu(e.pageX, e.pageY, [
                    {
                        label: 'Open',
                        icon: 'img/windows98-icons/ico/directory_open-0.ico',
                        action: () => {
                            const windowId = icon.dataset.window;
                            if (windowId) this.openWindow(windowId);
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'Create Shortcut',
                        icon: 'img/windows98-icons/ico/shortcut-0.ico',
                        action: () => alert('Create Shortcut')
                    },
                    {
                        label: 'Delete',
                        icon: 'img/windows98-icons/ico/delete_file-0.ico',
                        action: () => alert('Cannot delete system icons')
                    },
                    {
                        label: 'Rename',
                        icon: 'img/windows98-icons/ico/rename-0.ico',
                        action: () => alert('Cannot rename system icons')
                    },
                    { type: 'separator' },
                    {
                        label: 'Properties',
                        icon: 'img/windows98-icons/ico/info-0.ico',
                        action: () => alert('Properties')
                    }
                ]);
            });
        });
    }

    minimizeAllWindows() {
        Object.keys(this.windows).forEach(id => {
            this.minimizeWindow(id);
        });
    }

    cascadeWindows() {
        let offset = 0;
        Object.keys(this.windows).forEach(id => {
            const window = this.windows[id];
            if (window.element.style.display !== 'none') {
                window.element.style.top = `${50 + offset}px`;
                window.element.style.left = `${50 + offset}px`;
                offset += 30;
                this.activateWindow(id);
            }
        });
    }

    tileWindowsHorizontally() {
        const visibleWindows = Object.keys(this.windows).filter(id => 
            this.windows[id].element.style.display !== 'none'
        );
        const height = (window.innerHeight - 40) / visibleWindows.length;
        
        visibleWindows.forEach((id, index) => {
            const window = this.windows[id];
            window.element.style.top = `${index * height}px`;
            window.element.style.left = '0';
            window.element.style.width = '100%';
            window.element.style.height = `${height}px`;
        });
    }

    tileWindowsVertically() {
        const visibleWindows = Object.keys(this.windows).filter(id => 
            this.windows[id].element.style.display !== 'none'
        );
        const width = window.innerWidth / visibleWindows.length;
        
        visibleWindows.forEach((id, index) => {
            const window = this.windows[id];
            window.element.style.top = '0';
            window.element.style.left = `${index * width}px`;
            window.element.style.width = `${width}px`;
            window.element.style.height = 'calc(100% - 40px)';
        });
    }

    setupRPGGame() {
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 600;
        canvas.height = 360;

        const game = {
            player: {
                x: 300,
                y: 180,
                size: 20,
                speed: 3,
                hp: 100,
                maxHp: 100,
                level: 1,
                exp: 0,
                potions: 3
            },
            enemies: [],
            keys: {},
            isRunning: false
        };

        // Update UI
        function updateUI() {
            document.getElementById('playerHP').textContent = game.player.hp;
            document.getElementById('playerLevel').textContent = game.player.level;
            document.getElementById('playerExp').textContent = game.player.exp;
            document.getElementById('potionCount').textContent = game.player.potions;
        }

        // Draw functions
        function drawPlayer() {
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(game.player.x - game.player.size/2, 
                        game.player.y - game.player.size/2, 
                        game.player.size, game.player.size);
        }

        function drawEnemy(enemy) {
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(enemy.x - enemy.size/2, 
                        enemy.y - enemy.size/2, 
                        enemy.size, enemy.size);
        }

        // Spawn enemy
        function spawnEnemy() {
            const side = Math.floor(Math.random() * 4);
            let x, y;
            
            switch(side) {
                case 0: // top
                    x = Math.random() * canvas.width;
                    y = -20;
                    break;
                case 1: // right
                    x = canvas.width + 20;
                    y = Math.random() * canvas.height;
                    break;
                case 2: // bottom
                    x = Math.random() * canvas.width;
                    y = canvas.height + 20;
                    break;
                case 3: // left
                    x = -20;
                    y = Math.random() * canvas.height;
                    break;
            }

            game.enemies.push({
                x: x,
                y: y,
                size: 20,
                speed: 2
            });
        }

        // Game loop
        const gameLoop = () => {
            if (!game.isRunning) return;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Move player
            if (game.keys['ArrowUp']) game.player.y -= game.player.speed;
            if (game.keys['ArrowDown']) game.player.y += game.player.speed;
            if (game.keys['ArrowLeft']) game.player.x -= game.player.speed;
            if (game.keys['ArrowRight']) game.player.x += game.player.speed;

            // Keep player in bounds
            game.player.x = Math.max(game.player.size/2, Math.min(canvas.width - game.player.size/2, game.player.x));
            game.player.y = Math.max(game.player.size/2, Math.min(canvas.height - game.player.size/2, game.player.y));

            // Move enemies
            game.enemies.forEach(enemy => {
                const dx = game.player.x - enemy.x;
                const dy = game.player.y - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                enemy.x += (dx / dist) * enemy.speed;
                enemy.y += (dy / dist) * enemy.speed;

                // Check collision
                if (dist < (game.player.size + enemy.size) / 2) {
                    game.player.hp -= 10;
                    enemy.x = -100; // Remove enemy
                    updateUI();

                    if (game.player.hp <= 0) {
                        alert('Game Over!');
                        resetGame();
                    }
                }
            });

            // Remove off-screen enemies
            game.enemies = game.enemies.filter(enemy => enemy.x > -50);

            // Spawn new enemy
            if (Math.random() < 0.02) spawnEnemy();

            // Draw everything
            drawPlayer();
            game.enemies.forEach(drawEnemy);
        };

        // Reset game
        function resetGame() {
            game.player.hp = game.player.maxHp;
            game.player.x = canvas.width/2;
            game.player.y = canvas.height/2;
            game.enemies = [];
            updateUI();
        }

        // Event listeners
        window.addEventListener('keydown', e => game.keys[e.key] = true);
        window.addEventListener('keyup', e => game.keys[e.key] = false);

        document.getElementById('usePotion').addEventListener('click', () => {
            if (game.player.potions > 0 && game.player.hp < game.player.maxHp) {
                game.player.hp = Math.min(game.player.maxHp, game.player.hp + 30);
                game.player.potions--;
                updateUI();
            }
        });

        // Start game when window opens
        document.querySelector(`#rpg-game`).addEventListener('show', () => {
            game.isRunning = true;
            resetGame();
            if (!this.activeGames.has('rpg-game')) {
                this.activeGames.set('rpg-game', setInterval(gameLoop, 1000/60));
            }
        });

        // Pause game when window minimizes
        document.querySelector(`#rpg-game .minimize`).addEventListener('click', () => {
            game.isRunning = false;
        });

        // Stop game when window closes
        document.querySelector(`#rpg-game .close`).addEventListener('click', () => {
            game.isRunning = false;
            const gameInterval = this.activeGames.get('rpg-game');
            if (gameInterval) {
                clearInterval(gameInterval);
                this.activeGames.delete('rpg-game');
            }
            resetGame();
        });

        // Add custom show event to window
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const display = mutation.target.style.display;
                    if (display === 'block') {
                        mutation.target.dispatchEvent(new Event('show'));
                    }
                }
            });
        });

        observer.observe(document.querySelector('#rpg-game'), {
            attributes: true
        });

        // Initialize game but don't start
        resetGame();
    }

    setupControlPanel() {
        const controlPanel = document.getElementById('control-panel');
        const displaySettings = document.getElementById('display-settings');

        // Event listeners untuk item Control Panel
        document.querySelectorAll('.control-panel-item').forEach(item => {
            item.addEventListener('click', () => {
                const settingsType = item.dataset.settings;
                switch(settingsType) {
                    case 'display':
                        displaySettings.style.display = 'block';
                        break;
                    case 'sound':
                        this.showSoundSettings();
                        break;
                    case 'theme':
                        this.showThemeSettings();
                        break;
                    case 'mouse':
                        this.showMouseSettings();
                        break;
                }
            });
        });

        // Display Settings
        const wallpaperSelect = document.getElementById('wallpaper-select');
        const backgroundColorInput = document.getElementById('background-color');
        const resolutionSelect = document.getElementById('resolution-select');

        wallpaperSelect.addEventListener('change', () => {
            if (wallpaperSelect.value === 'custom') {
                backgroundColorInput.style.display = 'block';
            } else {
                backgroundColorInput.style.display = 'none';
                switch(wallpaperSelect.value) {
                    case 'default':
                        document.querySelector('.desktop').style.backgroundImage = 'url("https://i.imgur.com/eJLZvNt.jpg")';
                        break;
                    case 'blue':
                        document.querySelector('.desktop').style.background = '#0066cc';
                        break;
                    case 'green':
                        document.querySelector('.desktop').style.background = '#006633';
                        break;
                }
            }
        });

        backgroundColorInput.addEventListener('input', (e) => {
            document.querySelector('.desktop').style.background = e.target.value;
        });

        // Close dialog buttons
        document.querySelectorAll('.close-dialog').forEach(button => {
            button.addEventListener('click', () => {
                button.closest('.dialog').style.display = 'none';
            });
        });

        // Apply and Cancel buttons
        document.querySelectorAll('.dialog .apply-btn').forEach(button => {
            button.addEventListener('click', () => {
                playSound('click');
                button.closest('.dialog').style.display = 'none';
            });
        });

        document.querySelectorAll('.dialog .cancel-btn').forEach(button => {
            button.addEventListener('click', () => {
                button.closest('.dialog').style.display = 'none';
            });
        });
    }
}

// Initialize Window Manager
const windowManager = new WindowManager();

// Context Menu
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    // Add context menu implementation here if desired
});

// Add startup sound
window.addEventListener('load', () => {
    playSound('startup');
});

class RecycleBin {
    constructor() {
        this.items = [];
        this.binElement = document.getElementById('recycle-bin');
        this.contentElement = this.binElement.querySelector('.window-content');
        this.originalLocations = new Map(); // Untuk menyimpan lokasi asli file
        this.setupContextMenu();
    }

    addItem(file) {
        const item = {
            id: Date.now(),
            name: file.name,
            type: file.type,
            date: new Date(),
            size: file.size || '0 KB',
            icon: this.getFileIcon(file.type),
            originalPath: file.path || 'Desktop' // Menyimpan lokasi asli
        };
        
        this.items.push(item);
        this.originalLocations.set(item.id, item.originalPath);
        this.updateBinView();
        this.updateBinIcon();
        
        // Memainkan suara delete
        const deleteSound = new Audio('https://www.winhistory.de/more/winstart/ogg/recycle.ogg');
        deleteSound.play();
        playSound('recycle');
    }

    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.updateBinView();
        this.updateBinIcon();
    }

    emptyBin() {
        if (this.items.length === 0) {
            alert('Recycle Bin is already empty');
            return;
        }

        // Konfirmasi pengosongan Recycle Bin
        if (confirm(`Are you sure you want to permanently delete ${this.items.length} item(s)?`)) {
            this.items = [];
            this.originalLocations.clear();
            this.updateBinView();
            this.updateBinIcon();
            
            // Memainkan suara empty recycle bin
            const emptySound = new Audio('https://www.winhistory.de/more/winstart/ogg/recycle.ogg');
            emptySound.play();
        }
    }

    updateBinView() {
        if (this.items.length === 0) {
            this.contentElement.innerHTML = `
                <div class="recycler-empty-message">
                    <img src="https://win98icons.alexmeub.com/icons/png/recycle_bin_empty-4.png" alt="Empty Bin">
                    <p>Recycle Bin is empty</p>
                </div>
            `;
        } else {
            this.contentElement.innerHTML = this.items.map(item => `
                <div class="recycler-item" data-id="${item.id}">
                    <img src="${item.icon}" alt="${item.type}">
                    <div class="file-info">
                        <span class="file-name">${item.name}</span>
                        <span class="file-date">Deleted on ${item.date.toLocaleDateString()}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    updateBinIcon() {
        const binIcon = document.querySelector('.desktop-icon[data-window="recycle-bin"] img');
        const binWindowIcon = document.querySelector('#recycle-bin .window-title img');
        const iconState = this.items.length > 0 ? 'full' : 'empty';
        
        binIcon.src = `https://win98icons.alexmeub.com/icons/png/recycle_bin_${iconState}-4.png`;
        binWindowIcon.src = `https://win98icons.alexmeub.com/icons/png/recycle_bin_${iconState}-2.png`;
    }

    getFileIcon(type) {
        // Mengembalikan icon yang sesuai berdasarkan tipe file
        const iconMap = {
            'text': 'https://win98icons.alexmeub.com/icons/png/notepad-1.png',
            'image': 'https://win98icons.alexmeub.com/icons/png/image_gif-1.png',
            'default': 'https://win98icons.alexmeub.com/icons/png/document-1.png'
        };
        return iconMap[type] || iconMap.default;
    }

    setupContextMenu() {
        this.contentElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const item = e.target.closest('.recycler-item');
            
            if (item) {
                // Context menu untuk item
                showContextMenu(e.pageX, e.pageY, [
                    {
                        label: 'Restore',
                        icon: 'https://win98icons.alexmeub.com/icons/png/restore-0.png',
                        action: () => this.restoreItem(parseInt(item.dataset.id))
                    },
                    {
                        label: 'Delete Permanently',
                        icon: 'https://win98icons.alexmeub.com/icons/png/delete_file-0.png',
                        action: () => this.deleteItemPermanently(parseInt(item.dataset.id))
                    }
                ]);
            } else {
                // Context menu untuk area kosong
                showContextMenu(e.pageX, e.pageY, [
                    {
                        label: 'Empty Recycle Bin',
                        icon: 'https://win98icons.alexmeub.com/icons/png/recycle_bin_empty-0.png',
                        action: () => this.emptyBin()
                    }
                ]);
            }
        });
    }

    restoreItem(id) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            // Memainkan suara restore
            const restoreSound = new Audio('https://www.winhistory.de/more/winstart/ogg/restore.ogg');
            restoreSound.play();
            playSound('restore');

            // Menampilkan notifikasi restore
            this.showNotification(`Restored "${item.name}" to ${item.originalPath}`);

            this.removeItem(id);
        }
    }

    deleteItemPermanently(id) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            // Konfirmasi penghapusan permanen
            if (confirm(`Are you sure you want to permanently delete "${item.name}"?\nThis item will not be moved to the Recycle Bin and will be permanently lost.`)) {
                this.removeItem(id);
                // Memainkan suara delete
                const deleteSound = new Audio('https://www.winhistory.de/more/winstart/ogg/recycle.ogg');
                deleteSound.play();
            }
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'windows-notification';
        notification.innerHTML = `
            <img src="https://win98icons.alexmeub.com/icons/png/info-0.png" alt="Info">
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Menghilangkan notifikasi setelah 3 detik
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
}

// Initialize RecycleBin
const recycleBin = new RecycleBin();

// Menambahkan fungsi drag and drop untuk desktop
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
        Array.from(e.dataTransfer.files).forEach(file => {
            recycleBin.addItem({
                name: file.name,
                type: file.type.split('/')[0],
                size: `${Math.round(file.size / 1024)} KB`
            });
        });
    }
});

// Helper function untuk context menu dengan icon
function showContextMenu(x, y, items) {
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    
    items.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'context-menu-item';
        
        if (item.icon) {
            const icon = document.createElement('img');
            icon.src = item.icon;
            icon.alt = item.label;
            menuItem.appendChild(icon);
        }
        
        const label = document.createElement('span');
        label.textContent = item.label;
        menuItem.appendChild(label);
        
        menuItem.onclick = () => {
            item.action();
            menu.remove();
        };
        menu.appendChild(menuItem);
    });
    
    document.body.appendChild(menu);
    
    // Remove menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function removeMenu() {
            menu.remove();
            document.removeEventListener('click', removeMenu);
        });
    }, 0);
}

// Tambahkan fungsi shutdown
function shutdownWindows() {
    // Stop all games and intervals
    windowManager.activeGames.forEach(gameLoop => clearInterval(gameLoop));
    windowManager.activeIntervals.forEach(interval => clearInterval(interval));
    
    // Stop all audio
    document.querySelectorAll('audio').forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });

    // Clear all canvases
    document.querySelectorAll('canvas').forEach(canvas => {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    // Play shutdown sound
    const shutdownSound = new Audio(WINDOWS_SOUNDS.shutdown);
    shutdownSound.play();
    playSound('shutdown');

    // Add glitch effect to all windows before shutdown
    Object.keys(windowManager.windows).forEach(id => {
        const window = windowManager.windows[id].element;
        if (window.style.display !== 'none') {
            window.classList.add('closing');
        }
    });

    // Wait for window animations
    setTimeout(() => {
        // Create shutdown screen
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
            opacity: 0;
            transition: opacity 0.5s;
        `;

        shutdownScreen.innerHTML = `
            <img src="img/windows98-icons/ico/windows.ico" style="width: 32px; height: 32px; margin-bottom: 20px;">
            <div style="font-size: 24px; margin-bottom: 20px;">Windows is shutting down...</div>
        `;

        document.body.appendChild(shutdownScreen);

        // Fade in shutdown screen
        requestAnimationFrame(() => {
            shutdownScreen.style.opacity = '1';
        });
    }, 300);
}

// Update Start Menu shutdown button
document.querySelector('.menu-item:last-child').addEventListener('click', () => {
    shutdownWindows();
});

// Add sound to error messages
const originalAlert = window.alert;
window.alert = function(message) {
    playSound('error');
    originalAlert.call(window, message);
};

// Add sound to notifications
function showNotification(message) {
    playSound('notify');
    // ... existing notification code ...
}

// Update menu item untuk Control Panel
document.querySelector('.menu-item[data-window="control-panel"]').addEventListener('click', () => {
    windowManager.openWindow('control-panel');
}); 