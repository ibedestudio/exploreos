// Fungsi untuk menangani splash screen dan login
function initializeLogin() {
    const desktop = document.querySelector('.desktop');
    const splashScreen = document.getElementById('splash-screen');
    const loginScreen = document.getElementById('login-screen');
    
    // Sembunyikan desktop dan login screen di awal
    desktop.style.display = 'none';
    loginScreen.style.display = 'none';
    splashScreen.style.display = 'flex'; // Pastikan splash screen terlihat

    // Mulai animasi loading
    setTimeout(() => {
        const loadingBar = document.querySelector('.loading-progress');
        if (loadingBar) {
            loadingBar.style.width = '100%';
        }
    }, 100);

    // Tampilkan login screen setelah splash
    setTimeout(() => {
        splashScreen.style.display = 'none';
        loginScreen.style.display = 'flex';
        playSound('startup');
    }, 3000);
}

// Fungsi untuk menangani login
function setupLogin() {
    const loginBtn = document.getElementById('login-btn');
    const passwordInput = document.getElementById('password');
    const shutdownBtn = document.getElementById('shutdown-btn');

    function handleLogin() {
        const selectedUser = document.querySelector('.user-account.selected span').textContent;
        if (selectedUser === 'Guest' || passwordInput.value === '1234') {
            playSound('startup');
            document.getElementById('login-screen').style.display = 'none';
            document.querySelector('.desktop').style.display = 'block';
            initializeDesktop();
        } else {
            playSound('error');
            alert('Incorrect password!');
        }
    }

    // Login button click
    loginBtn.addEventListener('click', handleLogin);

    // Enter key in password input
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    // User account selection
    document.querySelectorAll('.user-account').forEach(account => {
        account.addEventListener('click', () => {
            document.querySelectorAll('.user-account').forEach(a => 
                a.classList.remove('selected')
            );
            account.classList.add('selected');
            
            const isGuest = account.querySelector('span').textContent === 'Guest';
            passwordInput.disabled = isGuest;
            if (isGuest) {
                passwordInput.value = '';
            } else {
                passwordInput.disabled = false;
                passwordInput.focus();
            }
        });
    });

    // Shutdown button
    shutdownBtn.addEventListener('click', () => {
        playSound('shutdown');
        handleShutdown();
    });
}

// Inisialisasi saat DOM sudah dimuat
document.addEventListener('DOMContentLoaded', () => {
    initializeLogin();
    setupLogin();
}); 