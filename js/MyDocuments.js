class MyDocuments {
    constructor() {
        this.window = document.getElementById('my-documents');
        this.content = this.window.querySelector('.window-content');
        this.folderItems = this.content.querySelector('.folder-items');
        this.clipboard = null;
        this.selectedItems = new Set();
        this.setupContextMenu();
        this.setupItemSelection();
    }

    setupContextMenu() {
        // Desktop context menu
        document.querySelector('.desktop').addEventListener('contextmenu', (e) => {
            if (e.target.classList.contains('desktop') || e.target.classList.contains('desktop-icons-container')) {
                e.preventDefault();
                this.showContextMenu(e);
            }
        });

        // Icon context menu
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            icon.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Select the icon if it's not already selected
                if (!icon.classList.contains('selected')) {
                    document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
                    icon.classList.add('selected');
                }
                
                this.showItemContextMenu(e, icon);
            });
        });
    }

    showContextMenu(e) {
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        
        const menuItems = [
            { 
                text: 'View', 
                icon: 'view',
                submenu: [
                    { text: 'Large Icons', icon: 'view_large', checked: true },
                    { text: 'Small Icons', icon: 'view_small' },
                    { text: 'List', icon: 'view_list' },
                    { text: 'Details', icon: 'view_details' }
                ]
            },
            'separator',
            { 
                text: 'New', 
                icon: 'new',
                submenu: [
                    { text: 'Folder', icon: 'directory_closed', action: () => this.createNewItem('folder') },
                    { text: 'Text Document', icon: 'notepad', action: () => this.createNewItem('text') }
                ]
            },
            'separator',
            { text: 'Paste', icon: 'paste', shortcut: 'Ctrl+V', action: () => this.paste() },
            'separator',
            { text: 'Refresh', icon: 'refresh', action: () => this.refresh() },
            { text: 'Properties', icon: 'properties', action: () => this.showProperties() }
        ];

        this.createContextMenu(contextMenu, menuItems, e);
    }

    showItemContextMenu(e, item) {
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        
        const menuItems = [
            { text: 'Open', action: () => this.openItem(item) },
            { text: 'Cut', action: () => this.cutItem(item) },
            { text: 'Copy', action: () => this.copyItem(item) },
            { text: 'Delete', action: () => this.deleteItem(item) },
            { text: 'Rename', action: () => this.renameItem(item) },
            { text: 'Properties', action: () => this.showItemProperties(item) }
        ];

        this.createContextMenu(contextMenu, menuItems, e);
    }

    createContextMenu(contextMenu, items, e) {
        // Remove existing context menus
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        // Create container for context menu
        const container = document.createElement('div');
        container.className = 'context-menu-container';
        document.body.appendChild(container);
        container.appendChild(contextMenu);

        // Position menu
        const rect = contextMenu.getBoundingClientRect();
        let x = e.clientX;
        let y = e.clientY;

        // Adjust position if menu would go off screen
        if (x + rect.width > window.innerWidth) {
            x = window.innerWidth - rect.width;
        }
        if (y + rect.height > window.innerHeight) {
            y = window.innerHeight - rect.height;
        }

        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;

        // Close menu when clicking outside
        const closeMenu = (e) => {
            if (!contextMenu.contains(e.target)) {
                container.remove();
                document.removeEventListener('click', closeMenu);
                document.removeEventListener('contextmenu', closeMenu);
            }
        };

        document.addEventListener('click', closeMenu);
        document.addEventListener('contextmenu', closeMenu);
    }

    createNewItem(type, container = null) {
        const isDesktop = !container;
        const targetContainer = container || document.querySelector('.desktop-icons-container');
        
        const defaultNames = {
            folder: 'New Folder',
            text: 'New Text Document.txt'
        };

        let newName = defaultNames[type];
        let counter = 1;
        
        // Check for existing items with the same name
        while (this.itemExists(newName, targetContainer)) {
            if (type === 'folder') {
                newName = `New Folder (${counter})`;
            } else {
                newName = `New Text Document (${counter}).txt`;
            }
            counter++;
        }

        const item = document.createElement('div');
        item.className = isDesktop ? 'desktop-icon' : 'folder-item';
        const iconPath = type === 'folder' ? 'directory_closed' : 'notepad';
        
        item.innerHTML = `
            <img src="img/windows98-icons/ico/${iconPath}.ico" alt="${type}">
            <span>${newName}</span>
        `;

        // Add event listeners
        item.addEventListener('dblclick', () => this.openItem(item));
        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.showItemContextMenu(e, item);
        });

        targetContainer.appendChild(item);
        
        // Start rename mode
        setTimeout(() => {
            this.startRename(item);
        }, 100);

        playSound('click');
        return item;
    }

    itemExists(name, container) {
        const items = container.querySelectorAll('.desktop-icon span, .folder-item span');
        return Array.from(items).some(span => span.textContent === name);
    }

    startRename(item) {
        const span = item.querySelector('span');
        const oldName = span.textContent;
        
        // Create input element
        const input = document.createElement('input');
        input.type = 'text';
        input.value = oldName;
        input.className = 'rename-input';
        
        // Style the input
        input.style.position = 'absolute';
        input.style.width = span.offsetWidth + 20 + 'px';
        input.style.zIndex = '1000';
        input.style.background = 'white';
        input.style.border = '1px solid #0053aa';
        input.style.padding = '2px';
        input.style.fontSize = '12px';
        
        // Hide the original span
        span.style.visibility = 'hidden';
        
        // Add input to item
        item.appendChild(input);
        input.focus();
        input.select();

        const finishRename = () => {
            const newName = input.value.trim();
            if (newName && newName !== oldName && !this.itemExists(newName, item.parentElement)) {
                span.textContent = newName;
            }
            span.style.visibility = 'visible';
            input.remove();
            playSound('click');
        };

        // Handle input events
        input.addEventListener('blur', finishRename);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                finishRename();
            } else if (e.key === 'Escape') {
                span.style.visibility = 'visible';
                input.remove();
            }
        });
    }

    openItem(item) {
        const name = item.querySelector('span').textContent;
        const isFolder = item.querySelector('img').src.includes('directory');
        
        if (isFolder) {
            // Buka folder dalam window baru
            const folderWindow = document.createElement('div');
            folderWindow.className = 'window';
            folderWindow.id = `folder-${name.toLowerCase().replace(/\s+/g, '-')}`;
            // ... implementasi folder window
        } else {
            // Buka file dengan Notepad
            if (window.windowManager) {
                const notepad = document.getElementById('notepad');
                if (notepad) {
                    const textarea = notepad.querySelector('textarea');
                    if (textarea) {
                        textarea.value = `Content of ${name}`;
                    }
                    window.windowManager.openWindow('notepad');
                }
            }
        }
        playSound('click');
    }

    cutItem(item) {
        this.clipboard = {
            action: 'cut',
            element: item,
            parent: item.parentElement
        };
        item.style.opacity = '0.5';
        playSound('click');
    }

    copyItem(item) {
        this.clipboard = {
            action: 'copy',
            element: item.cloneNode(true),
            parent: item.parentElement
        };
        playSound('click');
    }

    paste() {
        if (this.clipboard) {
            if (this.clipboard.action === 'cut') {
                this.clipboard.element.style.opacity = '1';
                this.folderItems.appendChild(this.clipboard.element);
                playSound('click');
            } else if (this.clipboard.action === 'copy') {
                const newItem = this.clipboard.element.cloneNode(true);
                // Tambahkan event listeners ke item yang baru
                newItem.addEventListener('dblclick', () => this.openItem(newItem));
                this.folderItems.appendChild(newItem);
                playSound('click');
            }
        }
    }

    deleteItem(item) {
        if (confirm('Are you sure you want to delete this item?')) {
            // Pindahkan ke Recycle Bin
            if (window.recycleBin) {
                window.recycleBin.addItem({
                    name: item.querySelector('span').textContent,
                    type: item.querySelector('img').src.includes('directory') ? 'folder' : 'file',
                    size: '1 KB'
                });
            }
            item.remove();
            playSound('recycle');
        }
    }

    renameItem(item) {
        const span = item.querySelector('span');
        const oldName = span.textContent;
        const newName = prompt('Enter new name:', oldName);
        
        if (newName && newName !== oldName) {
            span.textContent = newName;
            playSound('click');
        }
    }

    showProperties() {
        alert('My Documents Properties\n\nType: System Folder\nLocation: C:\\Documents and Settings\\User\\My Documents');
    }

    showItemProperties(item) {
        const name = item.querySelector('span').textContent;
        const type = item.querySelector('img').src.includes('directory') ? 'File Folder' : 'Text Document';
        const location = 'C:\\Documents and Settings\\User\\My Documents';
        const size = '1 KB';
        const created = new Date().toLocaleString();
        
        alert(`Properties - ${name}\n\nType: ${type}\nLocation: ${location}\nSize: ${size}\nCreated: ${created}`);
    }

    // Tambahkan method untuk menangani drag and drop
    setupDragAndDrop() {
        this.folderItems.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        this.folderItems.addEventListener('drop', (e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                Array.from(files).forEach(file => {
                    this.createNewItem('file', file.name);
                });
            }
        });
    }

    setupItemSelection() {
        this.folderItems.addEventListener('click', (e) => {
            const item = e.target.closest('.folder-item');
            if (!item) return;

            if (!e.ctrlKey) {
                this.selectedItems.clear();
                this.folderItems.querySelectorAll('.folder-item').forEach(i => {
                    i.classList.remove('selected');
                });
            }

            item.classList.toggle('selected');
            if (item.classList.contains('selected')) {
                this.selectedItems.add(item);
            } else {
                this.selectedItems.delete(item);
            }
        });

        // Prevent text selection when clicking items
        this.folderItems.addEventListener('mousedown', (e) => {
            if (e.target.closest('.folder-item')) {
                e.preventDefault();
            }
        });
    }
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.myDocuments = new MyDocuments();
}); 