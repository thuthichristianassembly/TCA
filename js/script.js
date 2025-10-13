/* ========== Basic interactions and API usage ========== */

/* 1) Hide carousel to reveal video (attempt). If not, carousel remains.
   Note: Many browsers block autoplay for iframes; this is a simple UX tweak:
   We hide the carousel after a short delay to let the video appear where allowed.
*/
document.addEventListener('DOMContentLoaded', function() {
  const carouselWrap = document.getElementById('carouselWrap');
  const videoWrap = document.getElementById('videoWrap');

  // Try to reveal video (simple approach)
  setTimeout(() => {
    // Hide carousel to show video (if browser plays it)
    // If you prefer to force showing carousel by default, remove this line.
    if (carouselWrap) carouselWrap.style.display = 'none';
  }, 1000);

  // Populate service overlay verses from data attributes
  document.querySelectorAll('.service-card').forEach(card => {
    const verse = card.getAttribute('data-verse') || '';
    const overlayP = card.querySelector('.service-overlay p');
    if (overlayP) overlayP.textContent = verse;
  });

  // Prayer form: show a friendly message instead of actual submit (unless user uses Formspree)
  const prayerForm = document.getElementById('prayerForm');
  const prayerMsg = document.getElementById('prayerMsg');
  prayerForm.addEventListener('submit', function(e){
    // allow normal submission if action replaced with real Formspree; otherwise fake demo
    const action = (prayerForm.getAttribute('action') || '');
    if (!action.includes('formspree.io')) {
      e.preventDefault();
      prayerMsg.innerHTML = '<div class="alert alert-success">Thank you. Your prayer request has been recorded (demo).</div>';
      prayerForm.reset();
    } else {
      // let it submit normally
      prayerMsg.innerHTML = '<div class="alert alert-info">Sending...</div>';
    }
  });

  // SMALL: smooth close nav on click (mobile)
  document.querySelectorAll('.nav-link').forEach(a=>{
    a.addEventListener('click', ()=> {
      const bsCollapse = bootstrap.Collapse.getInstance(document.getElementById('navMenu'));
      if (bsCollapse) bsCollapse.hide();
    });
  });

  // Load daily verse
  loadDailyVerse();

  // Quiz setup
  setupQuiz();
});

/* ========== Daily Verse ========== */
/* We'll pick a reference from a small list (so it changes each day) then fetch
   content from bible-api.com (free) to show verse text.
*/
async function loadDailyVerse() {
  const verseEl = document.getElementById('dailyVerse');
  const refEl = document.getElementById('verseRef');

  try {
    // Fetch JSON
    const res = await fetch("../TCA/bibleverse/tamil_verses.json");
    const verses = await res.json();

    // Get day of the year (0-364)
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay) - 1; // 0-based

    // Pick verse for the day
    const verse = verses[dayOfYear % verses.length]; // safely wraps if <365

    // Show in HTML
    refEl.textContent = verse.reference;
    verseEl.textContent = verse.text;

  } catch (err) {
    console.error('Error loading daily verse:', err);
    verseEl.textContent = "Unable to load verse at the moment.";
    refEl.textContent = "";
  }
}

// Call on page load
document.addEventListener('DOMContentLoaded', loadDailyVerse);


/* ========== QUIZ: 10 random questions from question bank ========== */
const questionBank = [
  {q:"Who built the ark?", a:["Noah","Moses","Abraham","David"], correct:0},
  {q:"Where was Jesus born?", a:["Nazareth","Bethlehem","Jerusalem","Capernaum"], correct:1},
  {q:"How many days did Jesus fast in wilderness?", a:["20","30","40","50"], correct:2},
  {q:"Who denied Jesus three times?", a:["Peter","Judas","John","Thomas"], correct:0},
  {q:"Which sea did Moses part?", a:["Mediterranean","Red Sea","Dead Sea","Sea of Galilee"], correct:1},
  {q:"Who is father of John the Baptist?", a:["Joseph","Zechariah","Aaron","Jacob"], correct:1},
  {q:"What did Jesus feed 5000 with?", a:["Loaves & fish","Manna","Bread only","Fish only"], correct:0},
  {q:"Which book comes after Genesis?", a:["Exodus","Leviticus","Numbers","Deuteronomy"], correct:0},
  {q:"Who was thrown into the lion's den?", a:["Shadrach","Meshach","Daniel","Abednego"], correct:2},
  {q:"How many commandments were given to Moses?", a:["8","10","12","15"], correct:1},
  {q:"Who interpreted Pharaoh's dream?", a:["Moses","Joseph","Daniel","Samuel"], correct:1},
  {q:"What is the first book of the New Testament?", a:["Matthew","Mark","Luke","John"], correct:0},
  {q:"Who wrote many of the Psalms?", a:["Solomon","David","Asa","Hezekiah"], correct:1}
];

let quizState = {questions:[], current:0, score:0};

function setupQuiz(){
  const startBtn = document.getElementById('startQuiz');
  const quizWrap = document.getElementById('quizWrap');
  const questionBox = document.getElementById('questionBox');
  const optionsBox = document.getElementById('optionsBox');
  const nextBtn = document.getElementById('nextBtn');
  const scoreEl = document.getElementById('score');

  startBtn.addEventListener('click', ()=> {
    // pick 10 random unique questions
    const shuffled = questionBank.slice().sort(()=>0.5 - Math.random());
    quizState.questions = shuffled.slice(0, Math.min(10, shuffled.length));
    quizState.current = 0;
    quizState.score = 0;
    scoreEl.textContent = '0';
    startBtn.style.display = 'none';
    quizWrap.style.display = 'block';
    nextBtn.disabled = true;
    showQuestion();
  });

  nextBtn.addEventListener('click', ()=> {
    quizState.current++;
    nextBtn.disabled = true;
    if (quizState.current >= quizState.questions.length) {
      // finished
      questionBox.innerHTML = `<div class="alert alert-success">Quiz Complete! Your score: ${quizState.score}/${quizState.questions.length}</div>`;
      optionsBox.innerHTML = '';
      nextBtn.style.display = 'none';
      document.getElementById('startQuiz').style.display = 'inline-block';
      document.getElementById('startQuiz').textContent = 'Restart Quiz';
      return;
    }
    showQuestion();
  });

  function showQuestion(){
    const qObj = quizState.questions[quizState.current];
    questionBox.innerHTML = `<h5>Q${quizState.current+1}. ${qObj.q}</h5>`;
    optionsBox.innerHTML = '';
    qObj.a.forEach((opt, i) => {
      const btn = document.createElement('div');
      btn.className = 'option';
      btn.textContent = opt;
      btn.addEventListener('click', () => {
        // disable further clicks
        Array.from(optionsBox.children).forEach(ch => ch.style.pointerEvents = 'none');
        const correctIndex = qObj.correct;
        if (i === correctIndex) {
          btn.style.background = 'linear-gradient(90deg,var(--gold),var(--gold-dark))';
          btn.style.color = '#fff';
          quizState.score++;
          scoreEl.textContent = quizState.score;
        } else {
          btn.style.background = '#f8d7da';
        }
        // highlight correct
        const correctEl = optionsBox.children[correctIndex];
        if (correctEl) {
          correctEl.style.border = '2px solid #0f0';
        }
        // enable next
        nextBtn.disabled = false;
      });
      optionsBox.appendChild(btn);
    });

    // next button label
    document.getElementById('nextBtn').textContent = (quizState.current === quizState.questions.length - 1) ? 'Finish' : 'Next';
  }
}

