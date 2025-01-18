document.addEventListener('DOMContentLoaded', () => {
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

    document.querySelectorAll('.user-account').forEach(account => {
        const userIcon = account.querySelector('img');
        const defaultSrc = userIcon.src;

        account.addEventListener('mouseenter', () => {
            userIcon.src = defaultSrc.replace('.png', '_hover.png'); // Ganti gambar saat hover
        });

        account.addEventListener('mouseleave', () => {
            userIcon.src = defaultSrc; // Kembali ke gambar default saat tidak hover
        });

        account.addEventListener('click', () => {
            document.querySelectorAll('.user-account').forEach(a => {
                a.classList.remove('selected');
                const icon = a.querySelector('img');
                icon.src = icon.src.replace('_selected', '');
            });
            account.classList.add('selected');

            const userType = account.getAttribute('data-user');
            if (userType === 'ibedes') {
                userIcon.src = 'img/user-ibedes_selected.png';
            } else {
                userIcon.src = 'https://cdn.pixabay.com/photo/2024/03/11/19/15/ai-generated-8627457_1280.png';
            }

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

    const shutdownBtn = document.getElementById('shutdown-btn');
    shutdownBtn.addEventListener('click', () => {
        playSound('shutdown');
        handleShutdown();
    });
}); 