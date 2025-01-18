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

function playSound(soundName) {
    try {
        const audio = document.getElementById(soundName + 'Sound');
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(err => console.log('Error playing sound:', err));
        }
    } catch (err) {
        console.log('Error with sound:', err);
    }
} 