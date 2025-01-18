class WindowManager {
    constructor() {
        this.windows = {};
        this.activeWindow = null;
        this.zIndex = 100;
        this.draggedIcon = null;
        
        this.initializeWindows();
        this.setupEventListeners();
        this.setupDesktopIcons();
        this.setupContextMenus();
        
        // Tutup semua window saat inisialisasi
        document.querySelectorAll('.window').forEach(window => {
            window.style.display = 'none';
        });
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
                case 'control-panel':
                    window.style.width = '500px';
                    window.style.height = '400px';
                    break;
                case 'rpg-game':
                    window.style.width = '640px';
                    window.style.height = '480px';
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

            // Activate window on click
            window.addEventListener('mousedown', () => {
                this.activateWindow(window.id);
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
                
                window.classList.add('dragging');
                this.activateWindow(window.id);
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                
                // Prevent window from being dragged outside viewport
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
                window.classList.remove('dragging');
            }
        });
    }

    openWindow(id) {
        const window = this.windows[id];
        if (window) {
            const windowElement = window.element;
            
            // Reset window state
            if (window.minimized) {
                window.minimized = false;
            }
            
            // Calculate center position
            const windowWidth = parseInt(windowElement.style.width) || 500;
            const windowHeight = parseInt(windowElement.style.height) || 300;
            const left = Math.max(0, (document.documentElement.clientWidth - windowWidth) / 2);
            const top = Math.max(0, (document.documentElement.clientHeight - windowHeight) / 2);
            
            // Position window
            windowElement.style.left = `${left}px`;
            windowElement.style.top = `${top}px`;
            
            // Show window
            windowElement.style.display = 'block';
            this.activateWindow(id);
            this.updateTaskbar();
            
            // Play sound
            playSound('maximize');
        }
    }

    closeWindow(id) {
        const window = this.windows[id];
        if (window) {
            window.element.classList.add('closing');
            
            setTimeout(() => {
                window.element.classList.remove('closing');
                window.element.style.display = 'none';
                window.minimized = false;
                this.updateTaskbar();
            }, 300);
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
                window.element.style.height = 'calc(100% - 40px)';
                window.maximized = true;
            } else {
                window.element.style.top = `${window.position.y}px`;
                window.element.style.left = `${window.position.x}px`;
                window.element.style.width = '';
                window.element.style.height = '';
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

    setupDesktopIcons() {
        const desktopIcons = document.querySelectorAll('.desktop-icon');
        
        desktopIcons.forEach(icon => {
            // Drag and Drop untuk desktop icons
            icon.setAttribute('draggable', 'true');
            
            icon.addEventListener('dragstart', (e) => {
                this.draggedIcon = icon;
                icon.classList.add('dragging');
                e.dataTransfer.setData('text/plain', ''); // Diperlukan untuk Firefox
            });

            icon.addEventListener('dragend', () => {
                icon.classList.remove('dragging');
                this.draggedIcon = null;
            });

            // Context menu untuk desktop icons
            icon.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showIconContextMenu(e, icon);
            });
        });

        // Drop zone untuk desktop
        document.querySelector('.desktop').addEventListener('dragover', (e) => {
            e.preventDefault();
            if (this.draggedIcon) {
                const x = e.clientX;
                const y = e.clientY;
                this.draggedIcon.style.left = `${x - this.draggedIcon.offsetWidth / 2}px`;
                this.draggedIcon.style.top = `${y - this.draggedIcon.offsetHeight / 2}px`;
            }
        });
    }

    setupContextMenus() {
        // Context menu untuk desktop
        document.querySelector('.desktop').addEventListener('contextmenu', (e) => {
            if (e.target.classList.contains('desktop')) {
                e.preventDefault();
                this.showDesktopContextMenu(e);
            }
        });

        // Tutup context menu saat klik di luar
        document.addEventListener('click', () => {
            const contextMenu = document.querySelector('.context-menu');
            if (contextMenu) {
                contextMenu.remove();
            }
        });
    }

    showIconContextMenu(e, icon) {
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        
        const menuItems = [
            { text: 'Open', action: () => this.openWindow(icon.dataset.window) },
            { text: 'Delete', action: () => this.deleteIcon(icon) },
            { text: 'Properties', action: () => this.showProperties(icon) }
        ];

        menuItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'context-menu-item';
            menuItem.textContent = item.text;
            menuItem.addEventListener('click', (e) => {
                e.stopPropagation();
                item.action();
                contextMenu.remove();
            });
            contextMenu.appendChild(menuItem);
        });

        this.positionContextMenu(e, contextMenu);
    }

    showDesktopContextMenu(e) {
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        
        const menuItems = [
            { text: 'View', submenu: ['Large Icons', 'Small Icons', 'List'] },
            { text: 'Sort By', submenu: ['Name', 'Size', 'Type', 'Date'] },
            { text: 'Refresh', action: () => window.location.reload() },
            { text: 'New', submenu: ['Folder', 'Text Document', 'Shortcut'] },
            { text: 'Properties', action: () => this.showDesktopProperties() }
        ];

        menuItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'context-menu-item';
            menuItem.textContent = item.text;
            
            if (item.submenu) {
                menuItem.classList.add('has-submenu');
                const submenu = document.createElement('div');
                submenu.className = 'submenu';
                
                item.submenu.forEach(subItem => {
                    const subMenuItem = document.createElement('div');
                    subMenuItem.className = 'submenu-item';
                    subMenuItem.textContent = subItem;
                    submenu.appendChild(subMenuItem);
                });
                
                menuItem.appendChild(submenu);
            } else if (item.action) {
                menuItem.addEventListener('click', (e) => {
                    e.stopPropagation();
                    item.action();
                    contextMenu.remove();
                });
            }
            
            contextMenu.appendChild(menuItem);
        });

        this.positionContextMenu(e, contextMenu);
    }

    positionContextMenu(e, contextMenu) {
        // Hapus menu konteks yang sudah ada
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        document.body.appendChild(contextMenu);

        // Posisikan menu
        let x = e.clientX;
        let y = e.clientY;

        // Pastikan menu tidak keluar dari viewport
        if (x + contextMenu.offsetWidth > window.innerWidth) {
            x = window.innerWidth - contextMenu.offsetWidth;
        }
        if (y + contextMenu.offsetHeight > window.innerHeight) {
            y = window.innerHeight - contextMenu.offsetHeight;
        }

        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
    }

    deleteIcon(icon) {
        // Implementasi delete icon
        if (icon.dataset.window === 'recycle-bin') {
            playSound('recycle');
            window.recycleBin.empty();
        } else {
            playSound('recycle');
            window.recycleBin.addItem({
                name: icon.querySelector('span').textContent,
                type: 'shortcut',
                size: '1 KB'
            });
            icon.remove();
        }
    }

    showProperties(icon) {
        // Implementasi properties dialog
        const name = icon.querySelector('span').textContent;
        const type = 'Shortcut';
        const location = 'C:\\Desktop';
        const size = '1 KB';
        
        alert(`Properties for ${name}:\nType: ${type}\nLocation: ${location}\nSize: ${size}`);
    }

    showDesktopProperties() {
        // Implementasi desktop properties
        alert('Desktop Properties\nTheme: Windows Classic\nResolution: 1920x1080\nColor depth: 32-bit');
    }

    // Tambahkan fungsi untuk My Documents context menu
    setupMyDocumentsContextMenu() {
        const myDocuments = document.getElementById('my-documents');
        if (myDocuments) {
            const content = myDocuments.querySelector('.window-content');
            
            content.addEventListener('contextmenu', (e) => {
                if (e.target === content || e.target.classList.contains('folder-items')) {
                    e.preventDefault();
                    this.showMyDocumentsContextMenu(e);
                }
            });
        }
    }

    showMyDocumentsContextMenu(e) {
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        
        const menuItems = [
            { text: 'New', submenu: [
                { text: 'Folder', action: () => this.createNewFolder() },
                { text: 'Text Document', action: () => this.createNewTextFile() }
            ]},
            { text: 'View', submenu: ['Large Icons', 'Small Icons', 'List'] },
            { text: 'Sort By', submenu: ['Name', 'Size', 'Type', 'Date'] },
            { text: 'Refresh', action: () => this.refreshMyDocuments() }
        ];

        this.createContextMenu(contextMenu, menuItems, e);
    }

    createNewFolder() {
        const folderName = prompt('Enter folder name:', 'New Folder');
        if (folderName) {
            const folderItem = document.createElement('div');
            folderItem.className = 'folder-item';
            folderItem.innerHTML = `
                <img src="img/windows98-icons/ico/directory_closed.ico" alt="Folder">
                <span>${folderName}</span>
            `;
            document.querySelector('#my-documents .folder-items').appendChild(folderItem);
        }
    }

    createNewTextFile() {
        const fileName = prompt('Enter file name:', 'New Text Document.txt');
        if (fileName) {
            const fileItem = document.createElement('div');
            fileItem.className = 'folder-item';
            fileItem.innerHTML = `
                <img src="img/windows98-icons/ico/notepad.ico" alt="Text File">
                <span>${fileName}</span>
            `;
            document.querySelector('#my-documents .folder-items').appendChild(fileItem);
        }
    }
} 