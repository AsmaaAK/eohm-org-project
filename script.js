// الثيم من هنا

const themeToggle = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme') || 'light';

document.documentElement.setAttribute('data-theme', currentTheme);

themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  const icon = themeToggle.querySelector('.theme-toggle__icon');
  icon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
});

const icon = themeToggle.querySelector('.theme-toggle__icon');
icon.textContent = currentTheme === 'dark' ? '☀️' : '🌙';



// البحث من هنا
const searchBtn = document.getElementById('search-btn');
const searchModal = document.getElementById('search-modal');
const searchClose = document.getElementById('search-close');
const searchInput = document.getElementById('search-input');

searchBtn.addEventListener('click', () => {
  searchModal.classList.add('active');
  searchInput.focus();
});

searchClose.addEventListener('click', () => {
  searchModal.classList.remove('active');
});

searchModal.addEventListener('click', (e) => {
  if (e.target === searchModal) {
    searchModal.classList.remove('active');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && searchModal.classList.contains('active')) {
    searchModal.classList.remove('active');
  }
});

searchInput.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  console.log('Searching for:', searchTerm);
});


const searchableElements = document.querySelectorAll(
  '.project-card__title, .project-card__description, ' +
  '.report-card__title, .report-card__excerpt'
);

searchInput.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();

  searchableElements.forEach(el => {
    const card = el.closest('article');
    if (el.textContent.toLowerCase().includes(searchTerm)) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
});

//  من هنا الخريطة

document.addEventListener('DOMContentLoaded', () => {
  const map = L.map('contact-map').setView([15.36944, 44.19101], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © OpenStreetMap contributors',
    maxZoom: 18,
  }).addTo(map);

  L.marker([15.36944, 44.19101])
    .addTo(map)
    .bindPopup('EOHM Office<br>Sana\'a, Yemen')
    .openPopup();
});

// من هنا التحقق من نموذج التواصل
document.getElementById('contact-form').addEventListener('submit', function (e) {
  const name = document.getElementById('name');
  const email = document.getElementById('email');
  const subject = document.getElementById('subject');
  const message = document.getElementById('message');

  let valid = true;
  let errorMsg = '';

  if (name.value.trim() === '') {
    errorMsg += 'Please enter your full name.\n';
    valid = false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.value.trim())) {
    errorMsg += 'Please enter a valid email address.\n';
    valid = false;
  }

  if (subject.value === '') {
    errorMsg += 'Please select a subject.\n';
    valid = false;
  }

  if (message.value.trim().length < 10) {
    errorMsg += 'Message must be at least 10 characters long.\n';
    valid = false;
  }

  if (!valid) {
    alert(errorMsg); 
    e.preventDefault(); 
  }
});


