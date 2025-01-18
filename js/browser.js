class Browser {
    constructor() {
        this.frame = document.getElementById('browserFrame');
        this.addressInput = document.querySelector('#browser .address-input input');
        this.goButton = document.querySelector('#browser .go-btn');
        this.backButton = document.querySelector('#browser .toolbar-btn[disabled] img[alt="Back"]').parentElement;
        this.forwardButton = document.querySelector('#browser .toolbar-btn[disabled] img[alt="Forward"]').parentElement;
        this.refreshButton = document.querySelector('#browser .toolbar-btn img[alt="Refresh"]').parentElement;
        this.stopButton = document.querySelector('#browser .toolbar-btn img[alt="Stop"]').parentElement;
        this.homeButton = document.querySelector('#browser .toolbar-btn img[alt="Home"]').parentElement;
        
        this.history = [];
        this.currentIndex = -1;
        this.homeUrl = 'https://www.google.com/webhp?igu=1';
        
        this.setupEventListeners();
        this.navigateTo(this.homeUrl);
    }

    setupEventListeners() {
        // Go button click
        this.goButton.addEventListener('click', () => {
            this.navigateTo(this.addressInput.value);
        });

        // Enter key in address bar
        this.addressInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.navigateTo(this.addressInput.value);
            }
        });

        // Navigation buttons
        this.backButton.addEventListener('click', () => this.goBack());
        this.forwardButton.addEventListener('click', () => this.goForward());
        this.refreshButton.addEventListener('click', () => this.refresh());
        this.stopButton.addEventListener('click', () => this.stop());
        this.homeButton.addEventListener('click', () => this.goHome());

        // Frame load events
        this.frame.addEventListener('load', () => {
            this.updateButtons();
            this.updateAddress();
            document.querySelector('#browser .status-text').textContent = 'Done';
        });
    }

    navigateTo(url) {
        // Add http:// if not present
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        try {
            // Update history
            this.history = this.history.slice(0, this.currentIndex + 1);
            this.history.push(url);
            this.currentIndex++;

            // Navigate
            this.frame.src = url;
            this.addressInput.value = url;
            document.querySelector('#browser .status-text').textContent = 'Loading...';
            
            this.updateButtons();
        } catch (error) {
            console.error('Navigation failed:', error);
            document.querySelector('#browser .status-text').textContent = 'Error loading page';
        }
    }

    goBack() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.frame.src = this.history[this.currentIndex];
            this.updateButtons();
        }
    }

    goForward() {
        if (this.currentIndex < this.history.length - 1) {
            this.currentIndex++;
            this.frame.src = this.history[this.currentIndex];
            this.updateButtons();
        }
    }

    refresh() {
        this.frame.src = this.frame.src;
    }

    stop() {
        this.frame.contentWindow.stop();
        document.querySelector('#browser .status-text').textContent = 'Stopped';
    }

    goHome() {
        this.navigateTo(this.homeUrl);
    }

    updateButtons() {
        this.backButton.disabled = this.currentIndex <= 0;
        this.forwardButton.disabled = this.currentIndex >= this.history.length - 1;
    }

    updateAddress() {
        try {
            this.addressInput.value = this.frame.contentWindow.location.href;
        } catch (e) {
            // Handle cross-origin restrictions
            console.log('Could not access frame location');
        }
    }
}

// Initialize browser when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.browser = new Browser();
}); 