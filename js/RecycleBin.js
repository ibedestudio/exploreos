class RecycleBin {
    constructor() {
        this.items = [];
        this.binElement = document.getElementById('recycle-bin');
        this.contentElement = this.binElement.querySelector('.window-content');
        this.setupContextMenu();
        this.updateBinContent();
    }

    setupContextMenu() {
        // Context menu untuk items di recycle bin
        this.contentElement.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.recycler-item')) {
                e.preventDefault();
                this.showItemContextMenu(e, e.target.closest('.recycler-item'));
            }
        });
    }

    addItem(item) {
        this.items.push({
            ...item,
            deletedDate: new Date().toLocaleString()
        });
        this.updateBinContent();
        this.updateIcon();
    }

    removeItem(index) {
        this.items.splice(index, 1);
        this.updateBinContent();
        this.updateIcon();
    }

    restoreItem(index) {
        const item = this.items[index];
        // Buat icon baru di desktop dengan data-window yang benar
        const desktopIcon = document.createElement('div');
        desktopIcon.className = 'desktop-icon';
        desktopIcon.setAttribute('draggable', 'true');
        
        // Set data-window berdasarkan nama item
        const windowId = item.name.toLowerCase().replace(/\s+/g, '-');
        desktopIcon.setAttribute('data-window', windowId);
        
        // Set icon berdasarkan tipe
        let iconPath;
        switch(item.type.toLowerCase()) {
            case 'folder':
                iconPath = 'img/windows98-icons/ico/directory_closed.ico';
                break;
            case 'text':
                iconPath = 'img/windows98-icons/ico/notepad.ico';
                break;
            default:
                iconPath = 'img/windows98-icons/ico/file.ico';
        }

        desktopIcon.innerHTML = `
            <img src="${iconPath}" alt="${item.name}">
            <span>${item.name}</span>
        `;

        // Tambahkan event listeners
        desktopIcon.addEventListener('dblclick', () => {
            if (window.windowManager) {
                window.windowManager.openWindow(windowId);
            }
        });

        document.querySelector('.desktop').appendChild(desktopIcon);
        
        // Setup drag & drop dan context menu
        window.windowManager.setupDesktopIcons();
        
        // Hapus dari recycle bin
        this.removeItem(index);
        playSound('restore');
    }

    empty() {
        this.items = [];
        this.updateBinContent();
        this.updateIcon();
        playSound('recycle');
    }

    updateBinContent() {
        if (this.items.length === 0) {
            this.contentElement.innerHTML = `
                <div class="recycler-empty-message">
                    <img src="img/windows98-icons/ico/recycle_bin_empty.ico" alt="Empty">
                    <span>Recycle Bin is empty</span>
                </div>
                <div class="recycle-bin-controls">
                    <button id="emptyBin" disabled>Empty Recycle Bin</button>
                    <button id="restoreAll" disabled>Restore All Items</button>
                </div>
            `;
        } else {
            let content = `
                <div class="recycle-bin-controls">
                    <button id="emptyBin">Empty Recycle Bin</button>
                    <button id="restoreAll">Restore All Items</button>
                </div>
                <div class="recycler-items">
            `;
            
            this.items.forEach((item, index) => {
                content += `
                    <div class="recycler-item" data-index="${index}">
                        <img src="img/windows98-icons/ico/file.ico" alt="${item.name}">
                        <div class="file-info">
                            <span class="file-name">${item.name}</span>
                            <span class="file-date">Deleted: ${item.deletedDate}</span>
                            <span class="file-size">Size: ${item.size}</span>
                        </div>
                    </div>
                `;
            });
            
            content += '</div>';
            this.contentElement.innerHTML = content;

            // Add event listeners for buttons
            document.getElementById('emptyBin').addEventListener('click', () => this.empty());
            document.getElementById('restoreAll').addEventListener('click', () => this.restoreAll());
        }
    }

    restoreAll() {
        [...this.items].forEach((_, index) => this.restoreItem(0));
        playSound('restore');
    }

    updateIcon() {
        const desktopIcon = document.querySelector('.desktop-icon[data-window="recycle-bin"] img');
        if (desktopIcon) {
            desktopIcon.src = this.items.length > 0 
                ? 'img/windows98-icons/ico/recycle_bin_full.ico'
                : 'img/windows98-icons/ico/recycle_bin_empty.ico';
        }
    }

    showItemContextMenu(e, itemElement) {
        const index = parseInt(itemElement.dataset.index);
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        
        const menuItems = [
            { text: 'Restore', action: () => this.restoreItem(index) },
            { text: 'Delete Permanently', action: () => this.removeItem(index) }
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

        // Position the context menu
        document.body.appendChild(contextMenu);
        const rect = contextMenu.getBoundingClientRect();
        const x = Math.min(e.clientX, window.innerWidth - rect.width);
        const y = Math.min(e.clientY, window.innerHeight - rect.height);
        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';

        // Remove on click outside
        document.addEventListener('click', function removeMenu() {
            contextMenu.remove();
            document.removeEventListener('click', removeMenu);
        });
    }
} 