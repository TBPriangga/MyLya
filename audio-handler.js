document.addEventListener('DOMContentLoaded', function () {
    // Dapatkan elemen audio
    const backgroundMusic = document.getElementById('backgroundMusic');
    const musicControl = document.getElementById('musicControl');

    // Periksa apakah musik seharusnya diputar dari halaman sebelumnya
    const musicState = {
        playing: localStorage.getItem('musicPlaying') === 'true',
        currentTime: parseFloat(localStorage.getItem('musicCurrentTime') || 0),
        initialized: false
    };

    // Siapkan audio
    function setupAudio() {
        if (backgroundMusic && musicControl) {
            // Atur waktu saat ini jika melanjutkan dari halaman lain
            if (musicState.currentTime > 0) {
                backgroundMusic.currentTime = musicState.currentTime;
            }

            // Perbarui ikon kontrol musik berdasarkan status
            updateMusicControlIcon();

            // Tambahkan event click untuk tombol toggle musik
            musicControl.addEventListener('click', toggleMusic);

            // Tambahkan event touch untuk perangkat mobile
            musicControl.addEventListener('touchstart', function (e) {
                e.preventDefault(); // Mencegah double event di beberapa perangkat
                musicControl.style.transform = 'scale(0.95)';
                musicControl.style.opacity = '0.85';
            });

            musicControl.addEventListener('touchend', function (e) {
                e.preventDefault(); // Mencegah double event
                toggleMusic();
                musicControl.style.transform = '';
                musicControl.style.opacity = '';
            });

            // Coba putar jika seharusnya diputar
            if (musicState.playing) {
                playMusic();
            }

            // Simpan waktu saat ini secara berkala
            setInterval(function () {
                if (musicState.playing && !backgroundMusic.paused) {
                    localStorage.setItem('musicCurrentTime', backgroundMusic.currentTime);
                }
            }, 1000);

            // Tandai sebagai diinisialisasi
            musicState.initialized = true;
        }
    }

    // Fungsi untuk memutar musik
    function playMusic() {
        if (!backgroundMusic) return;

        backgroundMusic.play().then(() => {
            musicState.playing = true;
            localStorage.setItem('musicPlaying', 'true');
            updateMusicControlIcon();
        }).catch(error => {
            console.log("Autoplay gagal:", error);

            // Tambahkan pendengar klik satu kali ke dokumen untuk mengaktifkan audio
            if (!musicState.initialized) {
                document.addEventListener('click', function initiateAudio() {
                    playMusic();
                    document.removeEventListener('click', initiateAudio);
                }, { once: true });

                // Tambahkan juga untuk perangkat sentuh
                document.addEventListener('touchend', function initiateAudioTouch() {
                    playMusic();
                    document.removeEventListener('touchend', initiateAudioTouch);
                }, { once: true });
            }
        });
    }

    // Fungsi untuk toggle musik
    function toggleMusic() {
        if (!backgroundMusic) return;

        try {
            if (musicState.playing) {
                backgroundMusic.pause();
                musicState.playing = false;
                localStorage.setItem('musicPlaying', 'false');
            } else {
                backgroundMusic.play().catch(error => {
                    console.log("Audio play gagal:", error);
                });
                musicState.playing = true;
                localStorage.setItem('musicPlaying', 'true');
            }
            updateMusicControlIcon();
        } catch (e) {
            console.log("Kesalahan kontrol musik:", e);
        }
    }

    // Fungsi untuk memperbarui ikon kontrol musik
    function updateMusicControlIcon() {
        if (!musicControl) return;

        if (musicState.playing) {
            musicControl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/></svg>';
        } else {
            musicControl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 3a5 5 0 0 0-5 5v1h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a6 6 0 0 1 12 0v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1V8a5 5 0 0 0-5-5z"/></svg>';
        }
    }

    // Siapkan audio saat halaman dimuat
    setupAudio();

    // Tangani unload halaman untuk menyimpan posisi saat ini
    window.addEventListener('beforeunload', function () {
        if (backgroundMusic && !backgroundMusic.paused) {
            localStorage.setItem('musicCurrentTime', backgroundMusic.currentTime);
        }
    });

    // Perbaikan untuk perangkat mobile
    function enhanceMobileExperience() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobile && musicControl) {
            // Memperbesar ukuran tombol untuk sentuhan yang lebih mudah
            musicControl.style.width = '50px';
            musicControl.style.height = '50px';
            musicControl.style.bottom = '25px';
            musicControl.style.right = '25px';

            // Pastikan SVG terlihat dengan baik
            const svg = musicControl.querySelector('svg');
            if (svg) {
                svg.style.width = '20px';
                svg.style.height = '20px';
            }

            // Perbaiki masalah izin audio di iOS
            if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                document.addEventListener('touchstart', function iosAudioFix() {
                    // Buat audio dummy dan putar/pause untuk membuka izin audio
                    const dummyAudio = new Audio();
                    dummyAudio.play().then(() => {
                        dummyAudio.pause();
                        document.removeEventListener('touchstart', iosAudioFix);
                    }).catch(() => {
                        // Gagal, tapi tidak apa-apa, kita sudah mencoba
                    });
                }, { once: true });
            }
        }
    }

    // Terapkan perbaikan mobile
    enhanceMobileExperience();
});