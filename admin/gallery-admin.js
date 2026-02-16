// Configurazione dei limiti per categoria
const CATEGORY_LIMITS = {
  gemme: 100,
  anelli: 15,
  collane: 15,
  orecchini: 15,
  altro: 15
};

const CATEGORY_LABELS = {
  gemme: 'Gemme',
  anelli: 'Anelli',
  collane: 'Collane',
  orecchini: 'Orecchini',
  altro: 'Altro'
};

// Dati globali
let galleryData = {};
let currentCategory = 'gemme';
let imageFileData = null;

// Elementi DOM
const categorySelect = document.getElementById('categorySelect');
const addPhotoBtn = document.getElementById('addPhotoBtn');
const exportBtn = document.getElementById('exportBtn');
const imageFile = document.getElementById('imageFile');
const imageTitle = document.getElementById('imageTitle');
const imageDescription = document.getElementById('imageDescription');
const imageSize = document.getElementById('imageSize');
const tableContainer = document.getElementById('tableContainer');
const messageContainer = document.getElementById('message');
const counterText = document.getElementById('counterText');
const categoryLabel = document.getElementById('categoryLabel');

// Inizializzazione
document.addEventListener('DOMContentLoaded', function() {
  loadGalleryJSON();
  setupEventListeners();
  updateCounter();
  renderTable();
});

// Carica il JSON dalla configurazione
function loadGalleryJSON() {
  fetch('config/gallery-items.json')
    .then(response => {
      if (!response.ok) throw new Error('File non trovato');
      return response.json();
    })
    .then(data => {
      galleryData = data;
      showMessage('Configurazione caricata!', 'info');
      updateCounter();
      renderTable();
    })
    .catch(error => {
      console.warn('Caricamento JSON non riuscito (normale se apri il file dal PC):', error);
      showMessage('Nessuna configurazione trovata — puoi iniziare ad aggiungere foto', 'info');
      // Crea struttura vuota se il file non esiste o fetch non è supportato
      galleryData = {
        gemme: [],
        anelli: [],
        collane: [],
        orecchini: [],
        altro: []
      };
      updateCounter();
      renderTable();
    });
}

// Setup event listeners
function setupEventListeners() {
  categorySelect.addEventListener('change', function(e) {
    currentCategory = e.target.value;
    categoryLabel.textContent = CATEGORY_LABELS[currentCategory];
    updateCounter();
    renderTable();
    resetForm();
  });

  addPhotoBtn.addEventListener('click', addPhoto);
  exportBtn.addEventListener('click', exportJSON);

  imageFile.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        imageFileData = {
          name: file.name,
          data: event.target.result
        };
      };
      reader.readAsDataURL(file);
    }
  });
}

// Mostra messaggi
function showMessage(text, type) {
  messageContainer.textContent = text;
  messageContainer.className = `message ${type}`;
  setTimeout(() => {
    messageContainer.className = 'message';
  }, 3000);
}

// Aggiorna contatore
function updateCounter() {
  const count = galleryData[currentCategory]?.length || 0;
  const limit = CATEGORY_LIMITS[currentCategory];
  counterText.textContent = `${count}/${limit}`;

  // Cambia colore se vicino al limite
  const counter = document.getElementById('counterContainer');
  counter.classList.remove('warning', 'full');
  if (count >= limit) {
    counter.classList.add('full');
  } else if (count >= limit * 0.8) {
    counter.classList.add('warning');
  }
}

// Aggiungi foto
function addPhoto() {
  const title = imageTitle.value.trim();
  const description = imageDescription.value.trim();
  const size = imageSize.value;

  if (!title) {
    showMessage('Per favore inserisci un titolo', 'error');
    return;
  }

  if (!imageFileData) {
    showMessage('Per favore seleziona un\'immagine', 'error');
    return;
  }

  const count = galleryData[currentCategory]?.length || 0;
  const limit = CATEGORY_LIMITS[currentCategory];

  if (count >= limit) {
    showMessage(`Limite raggiunto! Massimo ${limit} foto per questa categoria`, 'error');
    return;
  }

  // Crea oggetto foto
  const newPhoto = {
    image: `images/gallery/${imageFileData.name}`,
    title: title,
    description: description,
    size: size
  };

  // Aggiungi alla categoria
  if (!galleryData[currentCategory]) {
    galleryData[currentCategory] = [];
  }
  galleryData[currentCategory].push(newPhoto);

  showMessage(`✓ Foto "${title}" aggiunta!`, 'success');
  resetForm();
  updateCounter();
  renderTable();
}

// Elimina foto
function deletePhoto(index) {
  if (confirm('Sei sicuro di voler eliminare questa foto?')) {
    galleryData[currentCategory].splice(index, 1);
    showMessage('Foto eliminata', 'success');
    updateCounter();
    renderTable();
  }
}

// Renderizza tabella foto
function renderTable() {
  const photos = galleryData[currentCategory] || [];
  let html = '';

  if (photos.length === 0) {
    html = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <p>Nessuna foto in questa categoria</p>
      </div>
    `;
  } else {
    html = `
      <table class="gallery-table">
        <thead>
          <tr>
            <th>Anteprima</th>
            <th>Titolo</th>
            <th>Descrizione</th>
            <th>Dimensione</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
    `;

    photos.forEach((photo, index) => {
      const sizeLabel = {
        normal: 'Normale',
        tall: 'Verticale',
        wide: 'Orizzontale'
      }[photo.size] || photo.size;

      html += `
        <tr>
          <td>
            <img src="${photo.image}" alt="${photo.title}" class="item-thumbnail" onerror="this.style.background='linear-gradient(45deg, #ddd, #eee)'">
          </td>
          <td>
            <div class="item-title">${photo.title}</div>
          </td>
          <td>
            <div class="item-description">${photo.description || '—'}</div>
          </td>
          <td>${sizeLabel}</td>
          <td>
            <div class="actions">
              <button class="btn-danger" onclick="deletePhoto(${index})">🗑️ Elimina</button>
            </div>
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
  const dataStr = JSON.stringify(galleryData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gallery-items.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showMessage('✓ JSON scaricato! Ricorda di sostituire il file config/gallery-items.json', 'success');
}

// Reset form
function resetForm() {
  imageFile.value = '';
  imageTitle.value = '';
  imageDescription.value = '';
  imageSize.value = 'normal';
  imageFileData = null;
}
