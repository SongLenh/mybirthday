'use strict';

// ==================== PERSONALIZE HERE ====================
// Month: 1 = January, 12 = December. Example: November 12 => 11, 12.
const CONFIG = {
  birthdayMonth: 11,
  birthdayDay: 25,
  birthYear: 2007, // Set your birth year (e.g. 2005) to display your level/age.
  storageKey: 'birthday-exe-wishes-v1'
};
// ==========================================================

const $ = (selector) => document.querySelector(selector);
const currentYear = new Date().getFullYear();
$('#year').textContent = currentYear;

// Responsive navigation
$('#menuToggle').addEventListener('click', () => {
  const open = $('#nav').classList.toggle('open');
  $('#menuToggle').setAttribute('aria-expanded', String(open));
});
document.querySelectorAll('.nav a').forEach(link => link.addEventListener('click', () => {
  $('#nav').classList.remove('open');
  $('#menuToggle').setAttribute('aria-expanded', 'false');
}));

// Boot animation
const bootMessages = [
  '> Initializing birthday.exe...',
  '✓ Loading happy memories...',
  '✓ Compiling another amazing year...',
  '✓ Preparing virtual birthday cake...',
  '✓ Celebration mode activated! 🎉'
];
let bootIndex = 0;
let bootTimer;
function finishBoot() {
  clearInterval(bootTimer);
  $('#boot').classList.add('hidden');
  setTimeout(() => { $('#boot').style.display = 'none'; }, 550);
}
function advanceBoot() {
  if (bootIndex >= bootMessages.length) {
    clearInterval(bootTimer);
    $('#enterBtn').hidden = false;
    return;
  }
  const line = document.createElement('div');
  line.textContent = bootMessages[bootIndex];
  $('#bootLines').appendChild(line);
  bootIndex++;
  $('#bootProgress').style.width = `${bootIndex / bootMessages.length * 100}%`;
}
bootTimer = setInterval(advanceBoot, 440);
advanceBoot();
$('#enterBtn').addEventListener('click', () => { finishBoot(); celebrate(110); });
$('#skipBtn').addEventListener('click', finishBoot);

// Confetti — no dependencies
function celebrate(amount = 80) {
  const colors = ['#ff4cc9', '#9868ff', '#50e6ff', '#56f7ae', '#ffd568'];
  const container = $('#confetti');
  for (let i = 0; i < amount; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.setProperty('--left', `${Math.random() * 100}%`);
    piece.style.setProperty('--color', colors[Math.floor(Math.random() * colors.length)]);
    piece.style.setProperty('--duration', `${2.5 + Math.random() * 3}s`);
    piece.style.setProperty('--rotate', `${Math.random() * 360}deg`);
    piece.style.animationDelay = `${Math.random() * .6}s`;
    container.appendChild(piece);
    setTimeout(() => piece.remove(), 6500);
  }
}

// Age/level display
const hasValidBirthYear = Number.isInteger(CONFIG.birthYear) && CONFIG.birthYear >= 1900 && CONFIG.birthYear <= currentYear;
function birthdayThisYear(year) {
  return new Date(year, CONFIG.birthdayMonth - 1, CONFIG.birthdayDay);
}
function getAge() {
  if (!hasValidBirthYear) return null;
  const now = new Date();
  let age = now.getFullYear() - CONFIG.birthYear;
  if (now < birthdayThisYear(now.getFullYear())) age--;
  return age;
}
const age = getAge();
if (age !== null) {
  $('#heroLevel').textContent = String(age).padStart(2, '0');
  $('#versionText').textContent = `${age}.0`;
}
$('#levelBtn').addEventListener('click', () => celebrate(130));

// Candle interaction
let candleLit = true;
function toggleCandle() {
  candleLit = !candleLit;
  $('#cakeFlame').classList.toggle('off', !candleLit);
  $('#cakeMessage').textContent = candleLit ? 'Make a wish and blow out the candle! 🕯️' : 'Wish granted! May your dreams come true! ✨';
  $('#candleBtn').textContent = candleLit ? '💨 BLOW THE CANDLE' : '🔥 RELIGHT THE CANDLE';
  if (!candleLit) celebrate(100);
}
$('#candleBtn').addEventListener('click', toggleCandle);
$('#interactiveCake').addEventListener('click', toggleCandle);
$('#interactiveCake').addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggleCandle(); }
});

// Countdown to the next birthday (local time)
function updateCountdown() {
  const now = new Date();
  let next = birthdayThisYear(now.getFullYear());
  if (next <= now) next = birthdayThisYear(now.getFullYear() + 1);
  const remaining = Math.max(0, next - now);
  const seconds = Math.floor(remaining / 1000);
  $('#days').textContent = String(Math.floor(seconds / 86400)).padStart(3, '0');
  $('#hours').textContent = String(Math.floor(seconds / 3600) % 24).padStart(2, '0');
  $('#minutes').textContent = String(Math.floor(seconds / 60) % 60).padStart(2, '0');
  $('#seconds').textContent = String(seconds % 60).padStart(2, '0');
  $('#countdownNote').textContent = `Counting down to ${next.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })} 🎂`;
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ABA QR: hide missing image gracefully
const qr = $('#abaQr');
qr.addEventListener('load', () => { qr.hidden = false; $('#qrPlaceholder').hidden = true; });
qr.addEventListener('error', () => { qr.hidden = true; $('#qrPlaceholder').hidden = false; });
if (qr.complete && qr.naturalWidth > 0) { qr.hidden = false; $('#qrPlaceholder').hidden = true; }

// Local guestbook — textContent prevents HTML/script injection
function getWishes() {
  try {
    const data = JSON.parse(localStorage.getItem(CONFIG.storageKey) || '[]');
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

function renderWishes() {
  const wishes = getWishes();
  const list = $('#wishList');

  list.replaceChildren();

  $('#wishCount').textContent =
    `${wishes.length} wish${wishes.length === 1 ? '' : 'es'}`;

  if (!wishes.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-wishes';
    empty.textContent = 'No wishes yet. Be the first to write one! 💜';
    list.appendChild(empty);
    return;
  }

  wishes.slice().reverse().forEach((wish, index) => {
    const article = document.createElement('article');
    article.className = 'wish-item';

    const name = document.createElement('strong');
    name.textContent = wish.name;

    const date = document.createElement('time');
    date.textContent = new Date(wish.date).toLocaleDateString();

    const message = document.createElement('p');
    message.textContent = wish.message;

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️ Delete Wish';
    deleteBtn.className = 'delete-wish-btn';

    deleteBtn.addEventListener('click', () => {
      removeWish(wishes.length - 1 - index);
    });

    article.append(name, date, message, deleteBtn);
    list.appendChild(article);
  });
}

// Remove selected wish
function removeWish(index) {
  if (!confirm('Are you sure you want to delete this wish?')) {
    return;
  }

  const wishes = getWishes();

  wishes.splice(index, 1);

  localStorage.setItem(
    CONFIG.storageKey,
    JSON.stringify(wishes)
  );

  renderWishes();
}

$('#wishForm').addEventListener('submit', event => {
  event.preventDefault();
  const name = $('#wishName').value.trim().slice(0, 40);
  const message = $('#wishMessage').value.trim().slice(0, 300);
  if (!name || !message) return;
  const wishes = getWishes();
  wishes.push({ name, message, date: new Date().toISOString() });
  try {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(wishes.slice(-100)));
    $('#wishForm').reset();
    renderWishes();
    celebrate(45);
  } catch {
    alert('Unable to save your wish. Check your browser storage settings.');
  }
});
renderWishes();
