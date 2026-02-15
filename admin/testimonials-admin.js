// Dati globali
let testimonials = [];
let currentRating = 5;

// Elementi DOM
const clientName = document.getElementById('clientName');
const platform = document.getElementById('platform');
const reviewDate = document.getElementById('reviewDate');
const rating = document.getElementById('rating');
const reviewText = document.getElementById('reviewText');
const reviewUrl = document.getElementById('reviewUrl');
const addTestimonialBtn = document.getElementById('addTestimonialBtn');
const exportBtn = document.getElementById('exportBtn');
const tableContainer = document.getElementById('tableContainer');
const messageContainer = document.getElementById('message');
const ratingSelector = document.getElementById('ratingSelector');

// Inizializzazione
document.addEventListener('DOMContentLoaded', function() {
  loadTestimonialsJSON();
  setupEventListeners();
  setDateToToday();
  renderTable();
});

// Carica il JSON dalla configurazione
function loadTestimonialsJSON() {
  fetch('../config/testimonials.json')
    .then(response => response.json())
    .then(data => {
      testimonials = data.testimonials || [];
      showMessage('Configurazione caricata!', 'success');
    })
    .catch(error => {
      console.error('Errore caricamento JSON:', error);
      showMessage('Errore nel caricamento della configurazione', 'error');
      testimonials = [];
    });
}

// Setup event listeners
function setupEventListeners() {
  addTestimonialBtn.addEventListener('click', addTestimonial);
  exportBtn.addEventListener('click', exportJSON);

  // Rating selector
  const stars = ratingSelector.querySelectorAll('.star');
  stars.forEach(star => {
    star.addEventListener('click', function() {
      currentRating = parseInt(this.dataset.rating);
      rating.value = currentRating;
      updateStarDisplay();
    });
  });
}

// Aggiorna visualizzazione stelle
function updateStarDisplay() {
  const stars = ratingSelector.querySelectorAll('.star');
  stars.forEach(star => {
    const starRating = parseInt(star.dataset.rating);
    if (starRating <= currentRating) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
}

// Imposta data di oggi
function setDateToToday() {
  const today = new Date().toISOString().split('T')[0];
  reviewDate.value = today;
}

// Mostra messaggi
function showMessage(text, type) {
  messageContainer.textContent = text;
  messageContainer.className = `message ${type}`;
  setTimeout(() => {
    messageContainer.className = 'message';
  }, 3000);
}

// Aggiungi testimonianza
function addTestimonial() {
  const name = clientName.value.trim();
  const text = reviewText.value.trim();
  const url = reviewUrl.value.trim();
  const date = reviewDate.value;
  const plat = platform.value;
  const rating_val = parseInt(rating.value);

  if (!name || !text || !url || !date) {
    showMessage('Compila tutti i campi obbligatori', 'error');
    return;
  }

  if (rating_val < 1 || rating_val > 5) {
    showMessage('Rating deve essere tra 1 e 5 stelle', 'error');
    return;
  }

  // Crea oggetto testimonianza
  const newTestimonial = {
    name: name,
    text: text,
    rating: rating_val,
    platform: plat,
    url: url,
    date: formatDate(new Date(date))
  };

  testimonials.push(newTestimonial);

  showMessage(`✓ Testimonianza di "${name}" aggiunta!`, 'success');
  resetForm();
  renderTable();
}

// Formato data
function formatDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('it-IT', options);
}

// Elimina testimonianza
function deleteTestimonial(index) {
  if (confirm('Sei sicuro di voler eliminare questa testimonianza?')) {
    testimonials.splice(index, 1);
    showMessage('Testimonianza eliminata', 'success');
    renderTable();
  }
}

// Renderizza tabella testimonianze
function renderTable() {
  let html = '';

  if (testimonials.length === 0) {
    html = `
      <div class="empty-state">
        <div>📭 Nessuna testimonianza</div>
      </div>
    `;
  } else {
    html = `
      <table class="testimonials-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Testo</th>
            <th>Rating</th>
            <th>Piattaforma</th>
            <th>Data</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
    `;

    testimonials.forEach((test, index) => {
      const stars = '★'.repeat(test.rating) + '☆'.repeat(5 - test.rating);
      const platformClass = `platform-${test.platform}`;

      html += `
        <tr>
          <td><strong>${test.name}</strong></td>
          <td><em>"${test.text.substring(0, 50)}${test.text.length > 50 ? '...' : ''}"</em></td>
          <td><span class="stars-display">${stars}</span></td>
          <td><span class="platform-badge ${platformClass}">${test.platform}</span></td>
          <td>${test.date}</td>
          <td>
            <button class="btn-danger" onclick="deleteTestimonial(${index})">🗑️ Elimina</button>
          </td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;
  }

  tableContainer.innerHTML = html;
}

// Esporta JSON
function exportJSON() {
  const dataToExport = {
    testimonials: testimonials
  };

  const dataStr = JSON.stringify(dataToExport, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'testimonials.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showMessage('✓ JSON scaricato! Ricorda di sostituire il file config/testimonials.json', 'success');
}

// Reset form
function resetForm() {
  clientName.value = '';
  reviewText.value = '';
  reviewUrl.value = '';
  platform.value = 'google';
  currentRating = 5;
  rating.value = 5;
  updateStarDisplay();
  setDateToToday();
}

// Inizializza display stelle
updateStarDisplay();
