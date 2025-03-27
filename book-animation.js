// Animasi buku yang ditingkatkan untuk love.html
document.addEventListener('DOMContentLoaded', function () {
    // Variabel
    const book = document.getElementById('book');
    const cover = document.getElementById('cover');
    const pages = document.querySelectorAll('.page:not(.cover):not(.back-cover)');
    const backCover = document.getElementById('backCover');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const coverDesign = document.getElementById('coverDesign');
    const smallHearts = document.getElementById('smallHearts');

    let currentPage = 0;
    const totalPages = pages.length / 2; // Jumlah spread halaman
    let isBookOpen = false;
    let isAnimating = false;

    // Ekspos variabel ke scope global untuk navigasi yang ditingkatkan
    window.currentPage = currentPage;
    window.totalPages = totalPages;

    // Inisialisasi buku
    function initBook() {
        // Tambahkan hati mengambang ke sampul
        addHeartsToDesign(coverDesign, 15);

        // Tambahkan hati kecil mengambang untuk latar belakang
        createSmallHearts();

        // Tambahkan event listener ke sampul
        cover.addEventListener('click', openBook);

        // Tambahkan event listener klik ke tombol navigasi
        prevBtn.addEventListener('click', prevPage);
        nextBtn.addEventListener('click', nextPage);

        // Tambahkan gestur geser untuk mobile
        addSwipeGestures();

        // Tambahkan perspektif mouse 3D
        addMousePerspective();
    }

    // Fungsi untuk menambahkan efek perspektif mouse
    function addMousePerspective() {
        const bookContainer = document.querySelector('.book-container');

        if (!bookContainer) return;

        bookContainer.addEventListener('mousemove', function (e) {
            if (!isBookOpen || isAnimating) return;

            const rect = bookContainer.getBoundingClientRect();
            const x = e.clientX - rect.left; // posisi x dalam elemen
            const y = e.clientY - rect.top;  // posisi y dalam elemen

            // Hitung rotasi berdasarkan posisi mouse
            const xRotation = ((y - rect.height / 2) / rect.height) * 10; // -5 hingga 5 derajat
            const yRotation = ((rect.width / 2 - x) / rect.width) * 10;   // -5 hingga 5 derajat

            // Terapkan rotasi
            book.style.transform = `rotateX(${xRotation}deg) rotateY(${yRotation}deg)`;
        });

        // Reset saat mouse meninggalkan
        bookContainer.addEventListener('mouseleave', function () {
            book.style.transform = 'rotateX(0deg) rotateY(0deg)';
        });
    }

    // Fungsi untuk menambahkan gestur geser
    function addSwipeGestures() {
        const bookContainer = document.querySelector('.book-container');
        let touchStartX = 0;
        let touchEndX = 0;

        bookContainer.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        bookContainer.addEventListener('touchend', function (e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const swipeThreshold = 50; // Jarak minimum untuk geseran

            if (touchEndX < touchStartX - swipeThreshold) {
                // Geser ke kiri - halaman berikutnya
                nextPage();
            }

            if (touchEndX > touchStartX + swipeThreshold) {
                // Geser ke kanan - halaman sebelumnya
                prevPage();
            }
        }
    }

    // Fungsi untuk membuka buku (interaksi pertama)
    function openBook() {
        if (!isBookOpen && !isAnimating) {
            isBookOpen = true;
            isAnimating = true;

            // Tambahkan perspektif ke kontainer utama untuk efek 3D
            document.querySelector('.book-container').style.perspective = '2000px';

            // Buat spread pertama terlihat di belakang sampul
            pages[0].style.display = 'flex';
            pages[1].style.display = 'flex';
            pages[0].style.zIndex = '-1';
            pages[1].style.zIndex = '-1';

            // Tambahkan efek 3D baru untuk pembukaan
            cover.style.transformOrigin = 'left center';
            cover.style.transition = 'transform 1.5s cubic-bezier(0.645, 0.045, 0.355, 1)';
            cover.style.transform = 'rotateY(-180deg)';

            // Tambahkan efek bayangan keriting halaman
            const shadowOverlay = document.createElement('div');
            shadowOverlay.classList.add('page-shadow-overlay');
            shadowOverlay.style.position = 'absolute';
            shadowOverlay.style.top = '0';
            shadowOverlay.style.right = '0';
            shadowOverlay.style.width = '50%';
            shadowOverlay.style.height = '100%';
            shadowOverlay.style.background = 'linear-gradient(to right, rgba(0,0,0,0.1), rgba(0,0,0,0.3))';
            shadowOverlay.style.borderTopRightRadius = '15px';
            shadowOverlay.style.borderBottomRightRadius = '15px';
            shadowOverlay.style.opacity = '0';
            shadowOverlay.style.transition = 'opacity 1.5s';

            cover.appendChild(shadowOverlay);

            setTimeout(() => {
                shadowOverlay.style.opacity = '1';
            }, 100);

            // Putar suara pembalikan halaman
            playPageTurnSound();

            // Tampilkan tekstur kertas selama animasi
            const paperTexture = document.createElement('div');
            paperTexture.classList.add('paper-texture');
            paperTexture.style.position = 'absolute';
            paperTexture.style.top = '0';
            paperTexture.style.left = '50%';
            paperTexture.style.width = '50%';
            paperTexture.style.height = '100%';
            paperTexture.style.background = 'linear-gradient(135deg, #fff8f8 0%, #ffe6ee 100%)';
            paperTexture.style.borderTopRightRadius = '15px';
            paperTexture.style.borderBottomRightRadius = '15px';
            paperTexture.style.transformOrigin = 'left center';
            paperTexture.style.transform = 'rotateY(180deg)';
            paperTexture.style.backfaceVisibility = 'hidden';

            cover.appendChild(paperTexture);

            // Tampilkan spread pertama setelah animasi
            setTimeout(() => {
                cover.style.display = 'none';
                pages[0].style.zIndex = '';
                pages[1].style.zIndex = '';
                updateNavButtons();
                isAnimating = false;

                // Hapus elemen sementara
                shadowOverlay.remove();
                paperTexture.remove();

                // Aktifkan efek glow buku
                const bookWrapper = document.querySelector('.book-wrapper');
                bookWrapper.classList.add('book-glow');
                setTimeout(() => {
                    bookWrapper.classList.remove('book-glow');
                }, 1000);
            }, 1500);
        }
    }

    // Fungsi untuk ke halaman berikutnya
    function nextPage() {
        if (currentPage < totalPages && !isAnimating) {
            isAnimating = true;

            // Jika kita berada di spread terakhir, pergi ke halaman bunga
            if (currentPage === totalPages - 1) {
                // Tambahkan animasi penutupan yang bagus
                const rightPage = pages[currentPage * 2 + 1];

                // Buat efek keriting halaman
                rightPage.style.transformOrigin = 'left center';
                rightPage.style.transition = 'transform 1.2s cubic-bezier(0.645, 0.045, 0.355, 1)';
                rightPage.style.transform = 'rotateY(-180deg)';

                // Tambahkan efek bayangan
                const shadowDiv = document.createElement('div');
                shadowDiv.classList.add('page-turn-shadow');
                shadowDiv.style.position = 'absolute';
                shadowDiv.style.top = '0';
                shadowDiv.style.right = '0';
                shadowDiv.style.width = '50%';
                shadowDiv.style.height = '100%';
                shadowDiv.style.background = 'linear-gradient(to left, rgba(0,0,0,0.15), transparent)';
                shadowDiv.style.opacity = '0';
                shadowDiv.style.transition = 'opacity 0.5s ease';

                rightPage.appendChild(shadowDiv);

                setTimeout(() => {
                    shadowDiv.style.opacity = '1';
                }, 100);

                // Putar suara pembalikan halaman
                playPageTurnSound();

                // Setelah animasi, navigasi ke halaman bunga dengan efek fade out
                setTimeout(() => {
                    // Tambahkan efek fade out ke seluruh body
                    document.body.style.transition = 'opacity 0.8s ease';
                    document.body.style.opacity = '0';

                    setTimeout(() => {
                        window.location.href = 'flower.html';
                    }, 800);
                }, 1000);
                return;
            }

            // Dapatkan halaman kanan saat ini
            const rightPage = pages[currentPage * 2 + 1];
            const nextLeftPage = pages[(currentPage + 1) * 2];
            const nextRightPage = pages[(currentPage + 1) * 2 + 1];

            // Siapkan spread berikutnya untuk berada di belakang halaman saat ini
            nextLeftPage.style.display = 'flex';
            nextRightPage.style.display = 'flex';

            // Buat efek keriting halaman dengan bayangan
            const pageShadow = document.createElement('div');
            pageShadow.classList.add('page-curl-shadow');
            pageShadow.style.position = 'absolute';
            pageShadow.style.top = '0';
            pageShadow.style.left = '0';
            pageShadow.style.width = '100%';
            pageShadow.style.height = '100%';
            pageShadow.style.background = 'linear-gradient(to left, rgba(0,0,0,0.2), transparent 30%)';
            pageShadow.style.borderRadius = 'inherit';
            pageShadow.style.opacity = '0';
            pageShadow.style.transition = 'opacity 0.3s ease';

            rightPage.appendChild(pageShadow);

            setTimeout(() => {
                pageShadow.style.opacity = '1';
            }, 50);

            // Terapkan efek pembalikan halaman 3D lanjutan
            rightPage.style.transformOrigin = 'left center';
            rightPage.style.transition = 'transform 1s cubic-bezier(0.645, 0.045, 0.355, 1), box-shadow 1s cubic-bezier(0.645, 0.045, 0.355, 1)';
            rightPage.style.boxShadow = '-5px 5px 15px rgba(0, 0, 0, 0.2)';
            rightPage.style.zIndex = '10';

            // Efek lipatan halaman
            setTimeout(() => {
                rightPage.style.transform = 'rotateY(-180deg)';
            }, 50);

            // Putar suara pembalikan halaman
            playPageTurnSound();

            // Efek pembalikan halaman yang ditingkatkan dengan partikel
            if (Math.random() > 0.5) {
                createPageTurnParticles();
            }

            // Setelah animasi selesai dengan transisi yang ditingkatkan
            setTimeout(() => {
                // Sembunyikan halaman yang dibalik dan halaman kiri saat ini
                pages[currentPage * 2].style.display = 'none';
                rightPage.style.display = 'none';

                // Reset gaya halaman
                rightPage.style.transform = '';
                rightPage.style.zIndex = '';
                rightPage.style.boxShadow = '';

                // Bersihkan elemen bayangan
                pageShadow.remove();

                // Pindah ke halaman berikutnya
                currentPage++;
                window.currentPage = currentPage; // Update nilai global
                updateNavButtons();
                isAnimating = false;
            }, 1000);
        }
    }

    // Fungsi untuk ke halaman sebelumnya
    function prevPage() {
        if (currentPage > 0 && !isAnimating) {
            isAnimating = true;

            // Dapatkan halaman kiri saat ini dan halaman kanan sebelumnya
            const leftPage = pages[currentPage * 2];
            const prevLeftPage = pages[(currentPage - 1) * 2];
            const prevRightPage = pages[(currentPage - 1) * 2 + 1];

            // Tampilkan spread sebelumnya
            prevLeftPage.style.display = 'flex';
            prevRightPage.style.display = 'flex';

            // Penyiapan yang ditingkatkan untuk animasi dengan efek 3D
            prevRightPage.style.transform = 'rotateY(-180deg)';
            prevRightPage.style.transformOrigin = 'left center';
            prevRightPage.style.transition = 'transform 1s cubic-bezier(0.645, 0.045, 0.355, 1), box-shadow 1s cubic-bezier(0.645, 0.045, 0.355, 1)';
            prevRightPage.style.zIndex = '20';
            prevRightPage.style.boxShadow = '5px 5px 15px rgba(0, 0, 0, 0.2)';

            // Buat efek bayangan lipatan halaman
            const pageShadow = document.createElement('div');
            pageShadow.classList.add('page-curl-shadow-reverse');
            pageShadow.style.position = 'absolute';
            pageShadow.style.top = '0';
            pageShadow.style.left = '0';
            pageShadow.style.width = '100%';
            pageShadow.style.height = '100%';
            pageShadow.style.background = 'linear-gradient(to right, rgba(0,0,0,0.2), transparent 30%)';
            pageShadow.style.borderRadius = 'inherit';
            pageShadow.style.opacity = '0';
            pageShadow.style.transition = 'opacity 0.3s ease';

            prevRightPage.appendChild(pageShadow);

            setTimeout(() => {
                pageShadow.style.opacity = '1';
            }, 50);

            // Efek lipatan halaman (terbalik)
            setTimeout(() => {
                prevRightPage.style.transform = 'rotateY(0deg)';
            }, 50);

            // Putar suara pembalikan halaman
            playPageTurnSound();

            // Setelah animasi selesai
            setTimeout(() => {
                // Sembunyikan halaman saat ini
                leftPage.style.display = 'none';
                pages[currentPage * 2 + 1].style.display = 'none';

                // Reset gaya halaman sebelumnya
                prevRightPage.style.boxShadow = '';
                prevRightPage.style.zIndex = '';

                // Bersihkan elemen bayangan
                pageShadow.remove();

                // Pindah ke halaman sebelumnya
                currentPage--;
                window.currentPage = currentPage; // Update nilai global
                updateNavButtons();
                isAnimating = false;
            }, 1000);
        }
    }

    // Fungsi untuk membuat partikel selama pembalikan halaman
    function createPageTurnParticles() {
        const container = document.querySelector('.book-container');
        const numParticles = 5 + Math.floor(Math.random() * 5);

        for (let i = 0; i < numParticles; i++) {
            const particle = document.createElement('div');
            particle.classList.add('page-particle');

            // Styling
            particle.style.position = 'absolute';
            particle.style.width = (3 + Math.random() * 4) + 'px';
            particle.style.height = (3 + Math.random() * 4) + 'px';
            particle.style.backgroundColor = '#fff';
            particle.style.borderRadius = '50%';
            particle.style.opacity = 0.7 + Math.random() * 0.3;
            particle.style.boxShadow = '0 0 3px rgba(255, 255, 255, 0.7)';

            // Posisi di tepi kanan buku
            particle.style.left = '50%';
            particle.style.top = (30 + Math.random() * 40) + '%';

            // Animasi
            particle.style.transition = 'all ' + (0.8 + Math.random() * 0.4) + 's ease-out';

            container.appendChild(particle);

            // Mulai animasi setelah delay kecil
            setTimeout(() => {
                particle.style.left = (60 + Math.random() * 30) + '%';
                particle.style.top = (10 + Math.random() * 80) + '%';
                particle.style.opacity = '0';
            }, 50);

            // Hapus partikel setelah animasi
            setTimeout(() => {
                particle.remove();
            }, 1200);
        }
    }

    // Fungsi untuk memperbarui status tombol navigasi
    function updateNavButtons() {
        prevBtn.disabled = currentPage === 0;
        nextBtn.disabled = currentPage === totalPages;

        // Jika ada indikator halaman, perbarui
        const currentPageDisplay = document.getElementById('currentPageDisplay');
        const totalPagesDisplay = document.getElementById('totalPagesDisplay');

        if (currentPageDisplay) {
            currentPageDisplay.textContent = currentPage + 1;
        }

        if (totalPagesDisplay) {
            totalPagesDisplay.textContent = totalPages;
        }
    }

    // Ekspos fungsi ke scope global
    window.updateNavButtons = updateNavButtons;

    // Fungsi untuk menambahkan hati dekoratif ke elemen
    function addHeartsToDesign(element, count) {
        const colors = ['#FF80AB', '#FF4081', '#F50057', '#FF80AB', '#FFCDD2'];

        for (let i = 0; i < count; i++) {
            const heart = document.createElement('div');
            heart.classList.add('cover-heart');
            heart.innerHTML = `
                <svg viewBox="0 0 24 24" fill="${colors[Math.floor(Math.random() * colors.length)]}" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
            `;

            heart.style.left = `${Math.random() * 90}%`;
            heart.style.top = `${Math.random() * 90}%`;
            heart.style.transform = `rotate(${Math.random() * 360}deg) scale(${0.5 + Math.random()})`;

            element.appendChild(heart);
        }
    }

    // Fungsi untuk membuat hati kecil mengambang
    function createSmallHearts() {
        const colors = ['#FF80AB', '#FF4081', '#F50057', '#FF80AB', '#FFCDD2'];

        // Kurangi jumlah hati di perangkat mobile
        const isMobile = window.innerWidth <= 768;
        const heartCount = isMobile ? 15 : 30;

        for (let i = 0; i < heartCount; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.classList.add('small-heart');
                heart.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="${colors[Math.floor(Math.random() * colors.length)]}" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                `;

                heart.style.left = `${Math.random() * 100}%`;
                heart.style.setProperty('--drift', Math.random() * 2 - 1);
                heart.style.setProperty('--spin', Math.random() * 3 + 1);
                heart.style.animationDuration = `${Math.random() * 5 + 7}s`;
                heart.style.animationDelay = `${Math.random() * 5}s`;

                smallHearts.appendChild(heart);

                // Hapus setelah animasi
                setTimeout(() => {
                    heart.remove();
                }, 12000);
            }, i * (isMobile ? 500 : 300));
        }

        // Buat hati secara terus menerus, tapi lebih lambat di mobile
        setTimeout(createSmallHearts, isMobile ? 15000 : 10000);
    }

    // Fungsi untuk memutar suara pembalikan halaman
    function playPageTurnSound() {
        try {
            const pageSound = new Audio();
            // Suara pembalikan halaman berkualitas lebih tinggi dalam base64
            pageSound.src = 'data:audio/mp3;base64,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';
            pageSound.volume = 0.3;
            pageSound.play().catch(e => {
                console.log("Suara halaman gagal:", e);
            });
        } catch (e) {
            console.log("Kesalahan suara halaman:", e);
            // Jangan blokir pengalaman jika suara gagal
        }
    }

    // Inisialisasi semua
    initBook();

    // Ekspos fungsi ke scope global
    window.addSwipeGestures = addSwipeGestures;
});

// Peningkatan pengalaman mobile
// Tambahkan kode ini di akhir file book-animation.js Anda

document.addEventListener('DOMContentLoaded', function () {
    // Meningkatkan dukungan sentuh mobile
    function tingkatkanPengalamanMobile() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobile) {
            // Dapatkan elemen
            const book = document.getElementById('book');
            const cover = document.getElementById('cover');
            const pages = document.querySelectorAll('.page');

            // Tambahkan indikator ketuk ke sampul jika belum ada
            if (cover && !document.querySelector('.tap-indicator')) {
                const indikatorKetuk = document.createElement('div');
                indikatorKetuk.classList.add('tap-indicator');
                indikatorKetuk.innerHTML = `
                    <div class="tap-circle"></div>
                    <div class="tap-text">Ketuk untuk membuka</div>
                `;
                cover.appendChild(indikatorKetuk);

                // Tambahkan style untuk indikator ketuk
                const style = document.createElement('style');
                style.textContent = `
                    .tap-indicator {
                        position: absolute;
                        bottom: 50px;
                        left: 50%;
                        transform: translateX(-50%);
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        animation: fade-in-out 2s infinite;
                        pointer-events: none;
                    }
                    .tap-circle {
                        width: 40px;
                        height: 40px;
                        border: 2px solid white;
                        border-radius: 50%;
                        margin-bottom: 10px;
                        position: relative;
                    }
                    .tap-circle:after {
                        content: '';
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 15px;
                        height: 15px;
                        background-color: white;
                        border-radius: 50%;
                        opacity: 0.7;
                    }
                    .tap-text {
                        color: white;
                        font-family: 'Dancing Script', cursive;
                        font-size: 1.2rem;
                    }
                    @keyframes fade-in-out {
                        0%, 100% { opacity: 0.3; }
                        50% { opacity: 1; }
                    }
                `;
                document.head.appendChild(style);
            }

            // Tingkatkan performa dengan mengurangi kompleksitas animasi
            document.querySelectorAll('.flower__light').forEach((light, index) => {
                if (index > 5) {
                    light.style.display = 'none'; // Sembunyikan lampu berlebih
                }
            });

            // Perbaiki masalah 100vh pada browser mobile
            function tetapkanTinggiSebenarnya() {
                let vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);

                // Terapkan ke kontainer yang membutuhkan tinggi penuh
                const elemenTinggiPenuh = [
                    '.book-container',
                    'body',
                    '.loading-overlay',
                    '.night'
                ];

                elemenTinggiPenuh.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(el => {
                        el.style.height = `calc(var(--vh, 1vh) * 100)`;
                    });
                });
            }

            // Tetapkan tinggi awal dan perbarui saat resize
            tetapkanTinggiSebenarnya();
            window.addEventListener('resize', () => {
                tetapkanTinggiSebenarnya();
            });

            // Tambahkan umpan balik sentuh tambahan
            const tombol = document.querySelectorAll('.nav-btn, .next-btn, .back-btn, .music-control');
            tombol.forEach(button => {
                button.addEventListener('touchstart', () => {
                    button.style.transform = 'scale(0.95)';
                    button.style.opacity = '0.85';
                });

                button.addEventListener('touchend', () => {
                    button.style.transform = '';
                    button.style.opacity = '';
                });
            });

            // Perbaiki masalah pemutaran halaman di mobile
            function perbaikiPemutaranHalaman() {
                // Kurangi keterlambatan animasi
                const perbaikanHalaman = document.createElement('style');
                perbaikanHalaman.textContent = `
                    .page {
                        transition: transform 0.6s cubic-bezier(0.645, 0.045, 0.355, 1) !important;
                    }
                    .page-curl-shadow, .page-curl-shadow-reverse {
                        transition: opacity 0.2s ease !important;
                    }
                `;
                document.head.appendChild(perbaikanHalaman);

                // Tambahkan penangan sentuh ke halaman
                if (typeof addSwipeGestures === 'function') {
                    try {
                        addSwipeGestures();
                    } catch (e) {
                        console.log("Tidak dapat menambahkan gestur geser: ", e);
                    }
                }
            }

            // Terapkan perbaikan pemutaran halaman
            perbaikiPemutaranHalaman();

            // Optimalkan animasi bunga untuk mobile
            function optimalkanBunga() {
                if (document.querySelector('.flowers')) {
                    const styleOptimasi = document.createElement('style');
                    styleOptimasi.textContent = `
                        @media (max-width: 768px) {
                            .flower__grass__leaf {
                                display: none;
                            }
                            .flower__grass__leaf:nth-child(-n+4) {
                                display: block;
                            }
                            .long-g {
                                opacity: 0.8;
                            }
                        }
                    `;
                    document.head.appendChild(styleOptimasi);
                }
            }

            // Terapkan optimasi bunga
            optimalkanBunga();
        }
    }

    // Inisialisasi peningkatan mobile
    tingkatkanPengalamanMobile();

    // Tambahkan orientasi landscape handler
    window.addEventListener('orientationchange', function () {
        setTimeout(function () {
            // Berikan waktu untuk browser menyesuaikan
            if (window.orientation === 90 || window.orientation === -90) {
                // Mode landscape
                document.documentElement.style.setProperty('--book-width', '90%');
                document.documentElement.style.setProperty('--book-height', '85vh');
            } else {
                // Mode portrait
                document.documentElement.style.setProperty('--book-width', '95%');
                document.documentElement.style.setProperty('--book-height', '80vh');
            }

            // Perbarui tinggi
            if (typeof tetapkanTinggiSebenarnya === 'function') {
                tetapkanTinggiSebenarnya();
            }
        }, 300);
    });
});

// Perbaikan navigasi buku untuk mobile
document.addEventListener('DOMContentLoaded', function () {
    // Fungsi untuk menambahkan navigasi tetap yang lebih baik
    function tambahkanNavigasiMobileBaik() {
        const navigation = document.querySelector('.navigation');
        const isMobile = window.innerWidth <= 768;

        if (navigation && isMobile) {
            // Tambahkan style untuk navigasi yang lebih baik
            navigation.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            navigation.style.backdropFilter = 'blur(5px)';
            navigation.style.WebkitBackdropFilter = 'blur(5px)';
            navigation.style.padding = '8px 15px';
            navigation.style.borderRadius = '30px';
            navigation.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
            navigation.style.zIndex = '1000';

            // Tambahkan indikator halaman jika belum ada
            if (!document.querySelector('.page-indicator')) {
                const pageIndicator = document.createElement('div');
                pageIndicator.classList.add('page-indicator');
                pageIndicator.innerHTML = '<span id="currentPageDisplay">1</span> / <span id="totalPagesDisplay">3</span>';
                pageIndicator.style.fontSize = '0.9rem';
                pageIndicator.style.margin = '0 10px';
                pageIndicator.style.color = '#666';

                // Sisipkan di antara tombol
                const prevBtn = document.getElementById('prevBtn');
                const nextBtn = document.getElementById('nextBtn');

                if (prevBtn && nextBtn && prevBtn.parentNode) {
                    prevBtn.parentNode.insertBefore(pageIndicator, nextBtn);
                }

                // Update fungsi untuk memperbarui indikator halaman
                const updateNavButtons = window.updateNavButtons;
                if (typeof updateNavButtons === 'function') {
                    window.updateNavButtons = function () {
                        updateNavButtons.apply(this, arguments);

                        const currentPageDisplay = document.getElementById('currentPageDisplay');
                        const totalPagesDisplay = document.getElementById('totalPagesDisplay');

                        if (currentPageDisplay && typeof window.currentPage !== 'undefined') {
                            currentPageDisplay.textContent = window.currentPage + 1;
                        }

                        if (totalPagesDisplay && typeof window.totalPages !== 'undefined') {
                            totalPagesDisplay.textContent = window.totalPages;
                        }
                    };

                    // Panggil sekali untuk inisialisasi
                    window.updateNavButtons();
                }
            }
        }
    }

    // Inisialisasi navigasi yang lebih baik
    tambahkanNavigasiMobileBaik();

    // Perbarui pada resize
    window.addEventListener('resize', tambahkanNavigasiMobileBaik);
});