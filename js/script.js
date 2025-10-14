
document.addEventListener('DOMContentLoaded', function() {
  /* ================== 1) Hide carousel to reveal video ================== */
  const carouselWrap = document.getElementById('carouselWrap');
  const videoWrap = document.getElementById('videoWrap');
  if (carouselWrap) {
    setTimeout(() => {
      carouselWrap.style.display = 'none'; // hides carousel after 1s
    }, 1000);
  }

  /* ================== 2) Service Card Hover for data-verse ================== */
  // const cards = document.querySelectorAll('.service-card');
  // cards.forEach(card => {
  //   const overlayP = card.querySelector('.service-overlay p');
  //   const verse = card.getAttribute('data-verse') || '';
    
  //   // Only show verse on hover
  //   card.addEventListener('mouseenter', () => { overlayP.textContent = verse; });
  //   card.addEventListener('mouseleave', () => { overlayP.textContent = ''; });
  // });

  /* ================== 3) Prayer Form Demo ================== */
  const prayerForm = document.getElementById('prayerForm');
  const prayerMsg = document.getElementById('prayerMsg');
  if (prayerForm) {
    prayerForm.addEventListener('submit', function(e){
      const action = (prayerForm.getAttribute('action') || '');
      if (!action.includes('formspree.io')) {
        e.preventDefault();
        prayerMsg.innerHTML = '<div class="alert alert-success">Thank you. Your prayer request has been recorded (demo).</div>';
        prayerForm.reset();
      } else {
        prayerMsg.innerHTML = '<div class="alert alert-info">Sending...</div>';
      }
    });
  }

  /* ================== 4) Mobile Nav Collapse ================== */
  document.querySelectorAll('.nav-link').forEach(a=>{
    a.addEventListener('click', ()=> {
      const bsCollapse = bootstrap.Collapse.getInstance(document.getElementById('navMenu'));
      if (bsCollapse) bsCollapse.hide();
    });
  });

  /* ================== 5) Load Daily Verse ================== */
  async function loadDailyVerse() {
    const verseEl = document.getElementById('dailyVerse');
    const refEl = document.getElementById('verseRef');
    try {
      // Adjust path: move JSON to same folder as HTML or inside repo
      const res = await fetch("../TCA/bibleverse/tamil_verses.json"); 
      const verses = await res.json();

      const now = new Date();
      const start = new Date(now.getFullYear(),0,0);
      const diff = now - start;
      const oneDay = 1000*60*60*24;
      const dayOfYear = Math.floor(diff/oneDay)-1;

      const verse = verses[dayOfYear % verses.length];
      refEl.textContent = verse.reference;
      verseEl.textContent = verse.text;
    } catch(err) {
      console.error('Error loading daily verse:', err);
      verseEl.textContent = "Unable to load verse at the moment.";
      refEl.textContent = "";
    }
  }
  loadDailyVerse();

  let quizState = {questions:[], current:0, score:0};

  function setupQuiz(){
    const startBtn = document.getElementById('startQuiz');
    const quizWrap = document.getElementById('quizWrap');
    const questionBox = document.getElementById('questionBox');
    const optionsBox = document.getElementById('optionsBox');
    const nextBtn = document.getElementById('nextBtn');
    const scoreEl = document.getElementById('score');

    startBtn.addEventListener('click', ()=> {
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
      if(quizState.current >= quizState.questions.length){
        questionBox.innerHTML = `<div class="alert alert-success">Quiz Complete! Your score: ${quizState.score}/${quizState.questions.length}</div>`;
        optionsBox.innerHTML = '';
        nextBtn.style.display = 'none';
        startBtn.style.display = 'inline-block';
        startBtn.textContent = 'Restart Quiz';
        return;
      }
      showQuestion();
    });

    function showQuestion(){
      const qObj = quizState.questions[quizState.current];
      questionBox.innerHTML = `<h5>Q${quizState.current+1}. ${qObj.q}</h5>`;
      optionsBox.innerHTML = '';
      qObj.a.forEach((opt,i)=>{
        const btn = document.createElement('div');
        btn.className = 'option';
        btn.textContent = opt;
        btn.addEventListener('click', ()=>{
          Array.from(optionsBox.children).forEach(ch=>ch.style.pointerEvents='none');
          const correctIndex = qObj.correct;
          if(i===correctIndex){
            btn.style.background = 'linear-gradient(90deg,var(--gold),var(--gold-dark))';
            btn.style.color = '#fff';
            quizState.score++;
            scoreEl.textContent = quizState.score;
          }else{
            btn.style.background = '#f8d7da';
          }
          const correctEl = optionsBox.children[correctIndex];
          if(correctEl){
            correctEl.style.border='2px solid #0f0';
          }
          nextBtn.disabled = false;
        });
        optionsBox.appendChild(btn);
      });
      nextBtn.textContent = (quizState.current===quizState.questions.length-1)?'Finish':'Next';
    }
  }
  setupQuiz();
});

