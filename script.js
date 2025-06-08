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

function togglePlay() {
  if (isPlaying) {
    audio.pause();
  } else {
    audio.play().catch(e => console.log("Play error:", e));
  }
  isPlaying = !isPlaying;
  
  if (audioCtx.state === "suspended") {
  audioCtx.resume();
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

audio.addEventListener("ended", nextSong);

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
    ctx.fillStyle = "#1db954";
    ctx.fillRect(x, canvas.height - height, barWidth - 2, height);
  });
}

draw();

document.addEventListener('keydown', (e) => {
  if (e.code === "Space") togglePlay();
  if (e.code === "ArrowRight") nextSong();
  if (e.code === "ArrowLeft") prevSong();
});

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Panggil sekali di awal
