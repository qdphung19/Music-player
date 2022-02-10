// 1. Render playlist
// 2. Scroll top
// 3. Play, pause, seek
// 4. CD rotate
// 5. Next / prev
// 6. Random
// 7. Next / Repeat when ended
// 8. Active song
// 9. Scroll active song into view
// 10. Play song when click
// 11. Storage

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "Duong";

const player = $(".player");
const heading = $("header h2");
const artist = $("header h3");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const cd = $(".cd");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");

function formatTime(seconds) {
  let min = Math.floor(seconds / 60);
  let sec = Math.ceil(seconds % 60);
  min = min < 10 ? "0" + min : min;
  sec = sec < 10 ? "0" + sec : sec;
  return [min, sec];
}

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: "Bossa pra donato",
      singer: "Claudio Roditi",
      path: "./assets/music/3_claudio_roditi_bossa_pra_donato.mp3",
      image: "./assets/img/claudio.jpg",
    },
    {
      name: "Body and soul",
      singer: "Claudio Roditi",
      path: "./assets/music/2_claudio_roditi_body_and_soul.mp3",
      image: "./assets/img/claudio.jpg",
    },
    {
      name: "Autumn leaves",
      singer: "Bill Evans",
      path: "./assets/music/4_bill_evans_trio_autumn_leaves.mp3",
      image: "./assets/img/bill_evans.jpg",
    },
    {
      name: "Waltz for debby",
      singer: "Bill Evans",
      path: "./assets/music/5_bill_evans_waltz_for_debby.mp3",
      image: "./assets/img/bill_evans.jpg",
    },
    {
      name: "Everything happens to me",
      singer: "Duke Jordan",
      path: "./assets/music/6_everything_happens_to_me.mp3",
      image: "./assets/img/duke_jordan.jpg",
    },
    {
      name: "Take five",
      singer: "Dave Brubeck",
      path: "./assets/music/7_dave_brubeck_take_five.mp3",
      image: "./assets/img/dave_bruck.jpg",
    },
    {
      name: "Dream baby dream",
      singer: "Neneh Cherry",
      path: "./assets/music/8_neneh_cherry_the_thing_dream_baby_dream.mp3",
      image: "./assets/img/neneh_cherry.jpg",
    },
    {
      name: "Prélude au voyage",
      singer: "Asia unit",
      path: "./assets/music/1_Prélude_au_voyage.wav",
      image: "./assets/img/jazz.jpg",
    },
  ],

  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },

  // 1. Render
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
      <div class="song ${
        index === this.currentIndex ? "active" : ""
      }" data-index='${index}'>
      <div class="thumb"
      style="background-image: url('${song.image}')">
      </div>
      <div class="body">
      <h3 class="title">${song.name}</h3>
      <p class="author">${song.singer}</p>
      </div>
      <div class="option">
      <i class="fas fa-ellipsis-h"></i>
      </div>
      </div>
      `;
    });
    console.log(playlist);
    playlist.innerHTML = htmls.join("");
  },
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },
  handleEvents: function () {
    const _this = this;
    const cdWidth = cd.offsetWidth;

    // tourner cd_thumb
    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 30000,
      iterations: Infinity,
    });
    cdThumbAnimate.pause();

    // 2. Zoom le photo quand scroll
    document.onscroll = function () {
      // console.log(window.scrollY);
      // console.log(document.documentElement.scrollTop)
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;
      // console.log(newCdWidth)
      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0; // !!!
      cd.style.opacity = newCdWidth / cdWidth;
    };

    // cliquer play bouton
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    console.log(cdThumbAnimate);

    // pendant play
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };

    // pendant pause
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    // durent-time
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 10000
        );
        progress.value = progressPercent;
        _this.updateTime();
      }
    };

    // seek-time
    progress.onchange = function (e) {
      const seekTime = (e.target.value / 10000) * audio.duration;
      audio.currentTime = seekTime;
    };

    // chansons suivante
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // chansons précédente
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // random
    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      randomBtn.classList.toggle("active", _this.isRandom);
    };

    // repeat
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);
      repeatBtn.classList.toggle("active", _this.isRepeat);
    };

    // chanson suivant quand un chanson fini
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    // écouter cliquer sur playlist
    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:Not(.active)");
      if (songNode && !e.target.closest(".option")) {
        // console.log(e.target);
        // manipuler cliquer sur chanson
        if (songNode) {
          // console.log(songNode.getAttribute("data-index"));
          // console.log(songNode.dataset.index); //type string
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }
        // manipuler cliquer sur option
      }
    };
  },

  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 300);
  },

  loadCurrentSong: function () {
    // console.log(this.currentSong)
    heading.textContent = this.currentSong.name;
    artist.textContent = this.currentSong.singer;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
    // console.log(heading, cdThumb, audio)
  },

  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;

    // Object.assign(this, this.config)
  },

  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex > this.songs.length - 1) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },

  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },

  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);
    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },

  updateTime: function () {
    const timeLeft = audio.duration - audio.currentTime;
    let [min, sec] = formatTime(audio.currentTime);
    $(".time-played").innerHTML = `${min}:${sec}`;
    let [minLeft, secLeft] = formatTime(timeLeft);
    $(".time-left").innerHTML = `${minLeft}:${secLeft}`;
  },

  start: function () {
    // assigner config dans app
    this.loadConfig();
    // définition properties pour object "app"
    this.defineProperties();
    // écouter et manipuler des events/événements
    this.handleEvents();
    // charger le chanson courante
    this.loadCurrentSong();
    // 1. Render/rendre playlist
    this.render();

    // État initial de bouton repeat et random
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);
  },
};
app.start();
setInterval(() => {
  $(".info").classList.toggle("infotoggle");
}, 1000);
