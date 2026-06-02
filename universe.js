// ===== DUST PARTICLES =====
(function createDust() {
  const container = document.getElementById('dustContainer');
  const particleCount = 60;
  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('div');
    p.className = 'dust-particle';
    const size = Math.random() * 4 + 1;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (Math.random() * 15 + 10) + 's';
    p.style.animationDelay = (Math.random() * 20) + 's';
    p.style.opacity = Math.random() * 0.5 + 0.1;
    container.appendChild(p);
  }
})();

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 100) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ===== REVEAL ON SCROLL =====
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
revealElements.forEach(el => revealObserver.observe(el));

 // ===== SHARED AUDIO SYSTEM =====
let currentAudio = null;
let currentMode = null;
let currentTrackItem = null;
let ambienceIndex = 0;
let ambienceOn = false;

const ambienceTracks = [
  'https://mrboylee.github.io/Music/Whispers in the Snow (1).mp3',
  'https://mrboylee.github.io/Music/Wild Boylian Universe Street Song.mp3',
  'https://mrboylee.github.io/Music/Riders in the Dust.mp3',
  'https://mrboylee.github.io/Music/WB Universe Style (4).mp3',
  'https://mrboylee.github.io/Music/Emotional_Pull No Min Woo.mp3',
  'https://mrboylee.github.io/Music/Wild Boylian Universe Saloon Music.mp3',
  'https://mrboylee.github.io/Music/Wild Boylian Universe Restaurant Music.mp3',
  'https://mrboylee.github.io/Music/Whispers of the Dust.mp3',
  'https://mrboylee.github.io/Music/Desert Trails.mp3',
  'https://mrboylee.github.io/Music/Frozen Horizon.mp3',
  'https://mrboylee.github.io/Music/Whispers in the Snow.mp3',
  'https://mrboylee.github.io/Music/West No Min Woo.mp3',
  'https://mrboylee.github.io/Music/WB Universe Style (3).mp3',
  'https://mrboylee.github.io/Music/Dust and Shadows (1).mp3',
  'https://mrboylee.github.io/Music/Riding Shadows (1).mp3'
];

const trackSources = {
  'desert-wind': 'https://mrboylee.github.io/Music/Wild Boylian.mp3',
  'lonesome-trail': 'https://mrboylee.github.io/Music/Fantasmas de Thorncreek (1).mp3',
  'outlaw-dawn': 'https://mrboylee.github.io/Music/Wild Boylian (3).mp3',
  'saloon-midnight': 'https://mrboylee.github.io/Music/Wild Boylian Original Masterpiece.mp3',
  'dust-storm': 'https://mrboylee.github.io/Music/The wind don’t talk… but it remembers..mp3',
  'golden-horizon': 'https://mrboylee.github.io/Music/The_Wild_Never_Dies.mp3'
};

function stopAllAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

function resetJukeboxVisuals() {
  if (currentTrackItem) {
    currentTrackItem.classList.remove('playing');
    currentTrackItem.querySelector('.track-play-btn').innerHTML = '&#9654;';
    currentTrackItem = null;
  }
}

function updateAmbienceButton(isPlaying) {
  const btn = document.getElementById('musicToggle');
  if (!btn) return;
  if (isPlaying) {
    btn.style.borderColor = 'var(--gold)';
    btn.style.color = 'var(--gold)';
  } else {
    btn.style.borderColor = 'rgba(212,168,75,0.4)';
    btn.style.color = 'var(--parchment)';
  }
}

// ===== PLAY NEXT AMBIENCE TRACK =====
function playNextAmbience() {
  stopAllAudio();
  currentMode = 'ambience';
  ambienceOn = true;
  currentAudio = new Audio(ambienceTracks[ambienceIndex]);
  currentAudio.volume = 0.3;
  
  // When this track ends, go to next
  currentAudio.onended = () => {
    ambienceIndex = (ambienceIndex + 1) % ambienceTracks.length;
    playNextAmbience();
  };
  
  currentAudio.play().catch(e => console.log('Audio blocked:', e));
  updateAmbienceButton(true);
}

// ===== AMBIENCE TOGGLE =====
const musicToggle = document.getElementById('musicToggle');

musicToggle.addEventListener('click', () => {
  if (currentMode === 'ambience') {
    // STOP - advance to next track for next time
    stopAllAudio();
    currentMode = null;
    ambienceOn = false;
    ambienceIndex = (ambienceIndex + 1) % ambienceTracks.length;
    updateAmbienceButton(false);
  } else {
    // START - play current track
    stopAllAudio();
    resetJukeboxVisuals();
    playNextAmbience();
  }
});

// ===== JUKEBOX PLAYER =====
const trackItems = document.querySelectorAll('.track-item');

trackItems.forEach(item => {
  item.addEventListener('click', function() {
    const trackKey = this.dataset.track;
    const playBtn = this.querySelector('.track-play-btn');

    if (currentMode === 'jukebox' && currentTrackItem === this) {
      // Stop jukebox, return to ambience
      stopAllAudio();
      resetJukeboxVisuals();
      playNextAmbience();
    } else {
      // Stop ambience, play jukebox
      stopAllAudio();
      resetJukeboxVisuals();
      updateAmbienceButton(false);
      ambienceOn = false;

      currentMode = 'jukebox';
      currentTrackItem = this;
      currentAudio = new Audio(trackSources[trackKey]);
      currentAudio.volume = 0.5;
      currentAudio.play().catch(e => console.log('Playback error:', e));

      this.classList.add('playing');
      playBtn.innerHTML = '&#10074;&#10074;';

      currentAudio.onended = () => {
        this.classList.remove('playing');
        playBtn.innerHTML = '&#9654;';
        currentTrackItem = null;
        playNextAmbience();
      };
    }
  });
});

// ===== LIGHTBOX =====
function openLightbox(item) {
  const lightbox = document.getElementById('lightbox');
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

// ===== PARALLAX HERO =====
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const heroSun = document.querySelector('.hero-sun');
  const clouds = document.querySelectorAll('.cloud');
  const heroContent = document.querySelector('.hero-content');

  if (heroSun) heroSun.style.transform = `translateX(-50%) translateY(${scrolled * 0.3}px)`;
  if (heroContent) heroContent.style.transform = `translateY(${scrolled * 0.2}px)`;
  clouds.forEach((cloud, i) => {
    cloud.style.transform = `translateX(${scrolled * (0.05 * (i + 1))}px)`;
  });
});

// ===== SMOOTH SCROLL FOR NAV =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== MOUSE PARALLAX ON HERO =====
document.querySelector('.hero').addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 20;
  const y = (e.clientY / window.innerHeight - 0.5) * 20;
  const sun = document.querySelector('.hero-sun');
  if (sun) {
    sun.style.marginLeft = x + 'px';
    sun.style.marginTop = y + 'px';
  }
});

// ===== AUTOPLAY ON FIRST USER INTERACTION =====
(function() {
  let musicStarted = false;
  
  function startMusic() {
    if (musicStarted) return;
    musicStarted = true;
    
    const musicToggle = document.getElementById('musicToggle');
    if (musicToggle) {
      musicToggle.click();
      console.log('Music started on user interaction');
    }
    
    ['click', 'touchstart', 'scroll', 'keydown', 'mousemove'].forEach(evt => {
      document.removeEventListener(evt, startMusic);
    });
  }
  
  ['click', 'touchstart', 'scroll', 'keydown', 'mousemove'].forEach(evt => {
    document.addEventListener(evt, startMusic, { once: true });
  });
})();