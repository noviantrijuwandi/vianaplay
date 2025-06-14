let isShuffle = false;
let isRepeat = false;
const volumeSlider = document.getElementById("volume");
const progressBar = document.getElementById("progress");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");

const audio = document.getElementById("audio");
const currentTitle = document.getElementById("current-title");
const playlistEl = document.getElementById("playlist");
const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");

const songs = [
  { title: "Tatsuya Kitani - Where Our Blue Is - From THE FIRST TAKE (1)", file: "music/lagu1.mp3"},
  { title: "Tetsuya Hirahata - 恋に首輪 (Love on a Leash) (feat. Tatsuya Kitani)", file: "music/lagu2.mp3"},
  { title: "Tatsuya Kitani - Two Drifters - From THE FIRST TAKE", file: "music/lagu3.mp3"}
];

let currentIndex = 0;
let isPlaying = false;

// Load playlist
songs.forEach((song, i) => {
  const li = document.createElement("li");
  li.textContent = song.title;
  li.onclick = () => playSong(i);
  playlistEl.appendChild(li);
});

function playSong(index) {
  currentIndex = index;
  audio.src = songs[currentIndex].file;
  currentTitle.textContent = songs[currentIndex].title;
  highlightCurrent();
  audio.play();
  isPlaying = true;
}
function toggleShuffle() {
  isShuffle = !isShuffle;
  alert("Shuffle: " + (isShuffle ? "ON" : "OFF"));
}
function toggleShuffle() {
  isShuffle = !isShuffle;
  const btn = document.querySelector('button[onclick="toggleShuffle()"]');
  btn.classList.toggle("active", isShuffle);
  btn.textContent = isShuffle ? "🎲" : "🔀";
}



function toggleRepeat() {
  isRepeat = !isRepeat;
  alert("Repeat: " + (isRepeat ? "ON" : "OFF"));
}
function toggleRepeat() {
  isRepeat = !isRepeat;
  const btn = document.querySelector('button[onclick="toggleRepeat()"]');
  btn.classList.toggle("active", isRepeat);
  btn.textContent = isRepeat ? "🔂" : "🔁";
}



volumeSlider.addEventListener("input", () => {
  audio.volume = volumeSlider.value;
});


function togglePlay() {
  if (audio.paused) {
    audio.play().catch(e => console.log("Play error:", e));
    isPlaying = true;
  } else {
    audio.pause();
    isPlaying = false;
  }

  // Aktifkan AudioContext jika dibutuhkan
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  // (Opsional) Ubah teks/icon tombol ▶️⏸️
  const toggleBtn = document.querySelector('button[onclick="togglePlay()"]');
  if (toggleBtn) {
    toggleBtn.textContent = isPlaying ? "⏸️" : "▶️";
  }
}

function nextSong() {
  currentIndex = (currentIndex + 1) % songs.length;
  playSong(currentIndex);
}

function prevSong() {
  currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  playSong(currentIndex);
}

function highlightCurrent() {
  document.querySelectorAll("#playlist li").forEach((el, idx) => {
    el.classList.toggle("active", idx === currentIndex);
  });
}

audio.addEventListener("ended", () => {
  if (isRepeat) {
    playSong(currentIndex);
  } else if (isShuffle) {
    let next;
    do {
      next = Math.floor(Math.random() * songs.length);
    } while (next === currentIndex);
    playSong(next);
  } else {
    nextSong();
  }
});


// Visualizer
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
const source = audioCtx.createMediaElementSource(audio);
source.connect(analyser);
analyser.connect(audioCtx.destination);
analyser.fftSize = 64;

const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

function draw() {
  requestAnimationFrame(draw);
  analyser.getByteFrequencyData(dataArray);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const barWidth = canvas.width / bufferLength;

  dataArray.forEach((value, i) => {
    const height = value / 2;
    const x = i * barWidth;
    ctx.fillStyle = "#f0f0f1";
    ctx.fillRect(x, canvas.height - height, barWidth - 2, height);
  });
}
audio.addEventListener("loadedmetadata", () => {
  progressBar.max = Math.floor(audio.duration);
  durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  progressBar.value = Math.floor(audio.currentTime);
  currentTimeEl.textContent = formatTime(audio.currentTime);
});

progressBar.addEventListener("input", () => {
  audio.currentTime = progressBar.value;
});

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}


draw();

document.addEventListener('keydown', (e) => {
  if (e.code === "Space") togglePlay();
  if (e.code === "ArrowRight") nextSong();
  if (e.code === "ArrowLeft") prevSong();
});

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Panggil sekali di awal

document.querySelector('button[onclick="toggleShuffle()"]').classList.toggle("active", isShuffle);
document.querySelector('button[onclick="toggleRepeat()"]').classList.toggle("active", isRepeat);

