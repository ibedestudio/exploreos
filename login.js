document.addEventListener('DOMContentLoaded', () => {
    // Hide desktop initially
    const desktop = document.querySelector('.desktop');
    const splashScreen = document.getElementById('splash-screen');
    const loginScreen = document.getElementById('login-screen');
    
    desktop.style.display = 'none';
    loginScreen.style.display = 'none';

    // Show splash screen
    setTimeout(() => {
        document.querySelector('.loading-progress').style.width = '100%';
    }, 100);

    // Show login screen after splash
    setTimeout(() => {
        splashScreen.style.display = 'none';
        loginScreen.style.display = 'flex';
        playSound('startup');
    }, 3000);

    // Login functionality
    const loginBtn = document.getElementById('login-btn');
    const passwordInput = document.getElementById('password');

    function handleLogin() {
        const selectedUser = document.querySelector('.user-account.selected span').textContent;
        if (selectedUser === 'Guest' || passwordInput.value === '1234') {
            playSound('startup');
            loginScreen.style.display = 'none';
            desktop.style.display = 'block';
            initializeDesktop();
        } else {
            playSound('error');
            alert('Incorrect password!');
        }
    }

    loginBtn.addEventListener('click', handleLogin);
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

    // Shutdown from login screen
    const shutdownBtn = document.getElementById('shutdown-btn');
    shutdownBtn.addEventListener('click', () => {
        playSound('shutdown');
        handleShutdown();
    });
}); 