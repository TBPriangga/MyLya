// Script utama untuk animasi bunga
onload = () => {
  // Perbaiki masalah tinggi viewport di mobile
  function setVhVariable() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  // Atur nilai vh
  setVhVariable();

  // Perbarui saat resize
  window.addEventListener('resize', setVhVariable);

  // Optimalkan animasi untuk mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isMobile) {
    // Kurangi kompleksitas animasi untuk performa lebih baik
    reduceAnimationComplexity();
  }

  // Hapus kelas not-loaded setelah delay
  const c = setTimeout(() => {
    document.body.classList.remove("not-loaded");
    clearTimeout(c);
  }, isMobile ? 1500 : 1000); // Berikan sedikit waktu ekstra untuk perangkat mobile
};

// Fungsi untuk mengurangi kompleksitas animasi di perangkat mobile
function reduceAnimationComplexity() {
  // Tambahkan style untuk mengurangi kompleksitas
  const styleOptimizer = document.createElement('style');
  styleOptimizer.textContent = `
    @media (max-width: 768px) {
      /* Sembunyikan sebagian lampu untuk performa lebih baik */
      .flower__light:nth-child(n+5) {
        display: none !important;
      }
      
      /* Kurangi elemen dekoratif */
      .long-g:nth-child(n+4) {
        opacity: 0.6;
      }
      
      /* Sederhanakan animasi rumput */
      .flower__grass__leaf:nth-child(n+5) {
        display: none;
      }
      
      /* Sederhanakan tampilan bunga */
      .flower__line__leaf--5, 
      .flower__line__leaf--6 {
        display: none;
      }
      
      /* Perpanjang durasi animasi untuk performa lebih baik */
      .flower__light {
        animation-duration: 6s !important;
      }
      
      .grow-ans {
        animation-duration: 2.5s !important;
      }
    }
    
    /* Perangkat mobile yang lebih kecil */
    @media (max-width: 480px) {
      .flower {
        transform: scale(0.5) !important;
      }
      
      .long-g {
        transform: scale(0.7) !important;
      }
      
      /* Kurangi lebih banyak elemen */
      .long-g:nth-child(n+3) {
        opacity: 0.4;
      }
    }
  `;

  document.head.appendChild(styleOptimizer);
}

// Fungsi untuk memperbaiki layer tampilan pada perangkat mobile
document.addEventListener('DOMContentLoaded', function () {
  // Perbaiki urutan z-index untuk tampilan yang lebih baik
  const flowers = document.querySelector('.flowers');
  if (flowers) {
    flowers.style.zIndex = '5';
  }

  const night = document.querySelector('.night');
  if (night) {
    night.style.zIndex = '1';
  }

  // Perbaiki tombol kontrol
  const backBtn = document.getElementById('backBtn');
  const musicControl = document.getElementById('musicControl');

  // Perbaiki untuk perangkat sentuh
  const buttons = [backBtn, musicControl];

  buttons.forEach(button => {
    if (!button) return;

    // Tambahkan event touch
    button.addEventListener('touchstart', function () {
      this.style.transform = 'scale(0.95)';
      this.style.opacity = '0.85';
    });

    button.addEventListener('touchend', function () {
      this.style.transform = '';
      this.style.opacity = '';
    });
  });
});