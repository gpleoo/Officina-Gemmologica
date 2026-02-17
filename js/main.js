/**
 * ============================================
 * OFFICINA GEMMOLOGICA - JavaScript Principale
 * ============================================
 *
 * Questo file contiene tutte le funzionalità interattive del sito.
 * Include: navigazione mobile, animazioni scroll, galleria, form di contatto.
 *
 */

// Attendi che il DOM sia caricato
document.addEventListener('DOMContentLoaded', function() {

  // ============================================
  // PAGE LOADER
  // ============================================
  const pageLoader = document.querySelector('.page-loader');
  if (pageLoader) {
    window.addEventListener('load', function() {
      setTimeout(function() {
        pageLoader.classList.add('hidden');
      }, 500);
    });

    // Fallback: nascondi loader dopo 3 secondi in ogni caso
    setTimeout(function() {
      pageLoader.classList.add('hidden');
    }, 3000);
  }

  // ============================================
  // NAVIGAZIONE MOBILE
  // ============================================
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function() {
      menuToggle.classList.toggle('active');
      nav.classList.toggle('active');
      document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });

    // Chiudi menu quando si clicca su un link
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        menuToggle.classList.remove('active');
        nav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Chiudi menu con ESC
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && nav.classList.contains('active')) {
        menuToggle.classList.remove('active');
        nav.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // ============================================
  // DROPDOWN MENU (MOBILE)
  // ============================================
  const navDropdowns = document.querySelectorAll('.nav-dropdown');

  navDropdowns.forEach(function(dropdown) {
    const toggle = dropdown.querySelector('.dropdown-toggle');

    if (toggle) {
      toggle.addEventListener('click', function(e) {
        e.preventDefault();

        // Su mobile, toggle il dropdown
        if (window.innerWidth <= 768) {
          dropdown.classList.toggle('active');
        }
      });
    }
  });

  // ============================================
  // HEADER SCROLL EFFECT
  // ============================================
  const header = document.querySelector('.header');

  if (header) {
    let lastScroll = 0;

    window.addEventListener('scroll', function() {
      const currentScroll = window.pageYOffset;

      // Aggiungi classe "scrolled" quando si scrolla
      if (currentScroll > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      lastScroll = currentScroll;
    });
  }

  // ============================================
  // ANIMAZIONI SCROLL (REVEAL)
  // ============================================
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  function revealOnScroll() {
    const windowHeight = window.innerHeight;
    const revealPoint = 150;

    revealElements.forEach(function(element) {
      const elementTop = element.getBoundingClientRect().top;

      if (elementTop < windowHeight - revealPoint) {
        element.classList.add('active');
      }
    });
  }

  // Esegui subito e poi su scroll
  revealOnScroll();
  window.addEventListener('scroll', revealOnScroll);

  // ============================================
  // SMOOTH SCROLL PER LINK INTERNI
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');

      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);

        if (target) {
          const headerHeight = header ? header.offsetHeight : 0;
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // ============================================
  // GALLERIA - FILTRI
  // ============================================
  const filterButtons = document.querySelectorAll('.filter-btn');

  if (filterButtons.length > 0) {
    filterButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        // Rimuovi active da tutti i bottoni
        filterButtons.forEach(function(btn) {
          btn.classList.remove('active');
        });

        // Aggiungi active al bottone cliccato
        this.classList.add('active');

        // Filtra gli elementi (ri-query dal DOM per includere quelli caricati da JSON)
        const filter = this.getAttribute('data-filter');
        var currentItems = document.querySelectorAll('.gallery-item');

        currentItems.forEach(function(item) {
          // Rimuovi anche data-load-hidden per mostrare tutti gli item filtrati
          item.removeAttribute('data-load-hidden');
          if (filter === 'all' || item.getAttribute('data-category') === filter) {
            item.style.display = 'block';
            // Riattiva animazione
            item.classList.remove('active');
            setTimeout(function() {
              item.classList.add('active');
            }, 50);
          } else {
            item.style.display = 'none';
          }
        });

        // Nascondi il pulsante "Carica altro" quando un filtro è attivo
        var loadMoreBtn = document.getElementById('galleryLoadMore');
        if (loadMoreBtn) {
          loadMoreBtn.style.display = (filter === 'all') ? 'block' : 'none';
        }
      });
    });
  }

  // ============================================
  // GALLERIA - CONTATORE PER CATEGORIA
  // ============================================
  if (window.OG && window.OG.updateGalleryCounter) {
    window.OG.updateGalleryCounter();
  }

  // ============================================
  // GALLERIA - CARICAMENTO DA JSON
  // ============================================
  window.OG.loadGalleryFromJSON = function(jsonData) {
    Object.keys(jsonData).forEach(function(category) {
      if (Array.isArray(jsonData[category])) {
        jsonData[category].forEach(function(item) {
          var config = Object.assign({}, item, { category: category });
          window.OG.addGalleryItem(config);
        });
      }
    });
  };

  // Carica foto da JSON, poi attiva "Carica altro"
  fetch('config/gallery-items.json')
    .then(r => r.json())
    .then(data => {
      window.OG.loadGalleryFromJSON(data);
      window.OG.initGalleryLoadMore(5);
    })
    .catch(e => console.warn('Errore caricamento galleria:', e));

  // ============================================
  // TESTIMONIANZE - CARICAMENTO E RENDERING
  // ============================================
  window.OG.loadTestimonials = function(jsonData) {
    var extraContainer = document.getElementById('testimonialsExtra');
    var loadMoreBtn = document.getElementById('testimonialsLoadMore');

    if (!extraContainer) return;
    if (!jsonData.testimonials || jsonData.testimonials.length === 0) return;

    // Aggiungi testimonianze nel container nascosto
    jsonData.testimonials.forEach(function(test) {
      var stars = '';
      for (var i = 0; i < test.rating; i++) stars += '\u2605';
      for (var j = test.rating; j < 5; j++) stars += '\u2606';
      var platformClass = 'btn-' + test.platform;

      var html = '<div class="testimonial reveal">' +
        '<p class="testimonial-quote">"' + test.text + '"</p>' +
        '<p class="testimonial-author">- ' + test.name + '</p>' +
        '<p style="font-size: 0.85rem; color: #ffc107; margin: 0.5rem 0;">' + stars + '</p>' +
        '<a href="' + test.url + '" target="_blank" class="testimonial-link ' + platformClass + '">' +
        'Leggi su ' + test.platform.charAt(0).toUpperCase() + test.platform.slice(1) + ' \u2192</a>' +
        '</div>';

      var div = document.createElement('div');
      div.innerHTML = html;
      extraContainer.appendChild(div.firstElementChild);
    });

    // Mostra il pulsante "Vedi altre recensioni"
    if (loadMoreBtn) {
      loadMoreBtn.style.display = 'block';
    }
  };

  // Mostra/nascondi testimonianze extra
  window.OG.showMoreTestimonials = function() {
    var extraContainer = document.getElementById('testimonialsExtra');
    var loadMoreBtn = document.getElementById('testimonialsLoadMore');

    if (extraContainer) {
      extraContainer.classList.add('visible');
      // Attiva animazioni reveal
      extraContainer.querySelectorAll('.reveal').forEach(function(el) {
        el.classList.add('active');
      });
    }
    if (loadMoreBtn) {
      loadMoreBtn.style.display = 'none';
    }
  };

  // Carica testimonianze da JSON
  fetch('config/testimonials.json')
    .then(r => r.json())
    .then(data => window.OG.loadTestimonials(data))
    .catch(e => console.warn('Errore caricamento testimonianze:', e));

  // ============================================
  // GALLERIA - LIGHTBOX
  // ============================================
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const lightboxClose = document.getElementById('lightboxClose');

  if (lightbox && galleryItems.length > 0) {
    galleryItems.forEach(function(item) {
      item.addEventListener('click', function() {
        const img = this.querySelector('img');
        const overlay = this.querySelector('.gallery-overlay');

        if (img && overlay) {
          const title = overlay.querySelector('h4');
          const desc = overlay.querySelector('p');

          lightboxImage.src = img.src;
          lightboxImage.alt = img.alt;
          lightboxTitle.textContent = title ? title.textContent : '';
          lightboxDesc.textContent = desc ? desc.textContent : '';

          lightbox.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    // Chiudi lightbox
    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }

    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
      }
    });
  }

  // ============================================
  // FORM DI CONTATTO
  // ============================================
  const contactForm = document.getElementById('contactForm');
  const formMessage = document.getElementById('formMessage');

  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();

      // Raccogli i dati del form
      const formData = new FormData(contactForm);
      const data = {};
      formData.forEach(function(value, key) {
        data[key] = value;
      });

      // Validazione base
      if (!data.nome || !data.cognome || !data.email || !data.messaggio) {
        showFormMessage('Compila tutti i campi obbligatori.', 'error');
        return;
      }

      if (!isValidEmail(data.email)) {
        showFormMessage('Inserisci un indirizzo email valido.', 'error');
        return;
      }

      if (!data.privacy) {
        showFormMessage('Devi accettare la Privacy Policy per procedere.', 'error');
        return;
      }

      // Simula invio (in produzione, sostituire con chiamata AJAX reale)
      // Per funzionare realmente, configura un servizio come:
      // - Formspree.io
      // - Netlify Forms
      // - Un endpoint PHP/Node.js personalizzato

      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      submitButton.textContent = 'Invio in corso...';
      submitButton.disabled = true;

      // Simula delay di rete
      setTimeout(function() {
        showFormMessage('Grazie per averci contattato! Ti risponderemo il prima possibile.', 'success');
        contactForm.reset();
        submitButton.textContent = originalText;
        submitButton.disabled = false;
      }, 1500);

      /*
      // ESEMPIO DI INTEGRAZIONE REALE CON FORMSPREE:
      fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(response => {
        if (response.ok) {
          showFormMessage('Grazie per averci contattato! Ti risponderemo il prima possibile.', 'success');
          contactForm.reset();
        } else {
          showFormMessage('Si è verificato un errore. Riprova più tardi.', 'error');
        }
        submitButton.textContent = originalText;
        submitButton.disabled = false;
      })
      .catch(error => {
        showFormMessage('Si è verificato un errore. Riprova più tardi.', 'error');
        submitButton.textContent = originalText;
        submitButton.disabled = false;
      });
      */
    });
  }

  function showFormMessage(message, type) {
    if (formMessage) {
      formMessage.textContent = message;
      formMessage.className = 'form-message ' + type;
      formMessage.style.display = 'block';

      // Nascondi dopo 5 secondi
      setTimeout(function() {
        formMessage.style.display = 'none';
      }, 5000);
    }
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // ============================================
  // LAZY LOADING IMMAGINI (opzionale)
  // ============================================
  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    });

    lazyImages.forEach(function(img) {
      imageObserver.observe(img);
    });
  }

  // ============================================
  // ANNO CORRENTE NEL FOOTER
  // ============================================
  const yearElements = document.querySelectorAll('.current-year');
  const currentYear = new Date().getFullYear();

  yearElements.forEach(function(el) {
    el.textContent = currentYear;
  });

  // ============================================
  // PREVENZIONE DOPPIO CLICK SU LINK
  // ============================================
  document.querySelectorAll('a').forEach(function(link) {
    let clicked = false;
    link.addEventListener('click', function(e) {
      if (clicked) {
        e.preventDefault();
        return;
      }
      clicked = true;
      setTimeout(function() {
        clicked = false;
      }, 500);
    });
  });

  // ============================================
  // CONTATORE VISITATORI (disabilitato - counterapi.dev non supporta CORS da GitHub Pages)
  // Per riattivare, sostituire con un servizio compatibile CORS
  // ============================================

  // ============================================
  // DEBUG INFO (rimuovi in produzione)
  // ============================================
  console.log('Officina Gemmologica - Sito caricato correttamente');

});

// ============================================
// UTILITY FUNCTIONS (esportate globalmente)
// ============================================

/**
 * Funzione per aggiungere facilmente nuove immagini alla galleria
 * Usa questa funzione nel file config.js per gestire i contenuti
 */
window.OG = window.OG || {};

window.OG.config = {
  MAX_ITEMS_PER_CATEGORY: {
    gemme: 100,
    anelli: 25,
    collane: 25,
    orecchini: 25,
    altro: 25
  },
  DEFAULT_MAX_ITEMS: 25
};

window.OG.getCountByCategory = function(category) {
  var grid = document.getElementById('galleryGrid');
  if (!grid) return 0;
  return grid.querySelectorAll('.gallery-item[data-category="' + category + '"]').length;
};

window.OG.getCategoryLimit = function(category) {
  return window.OG.config.MAX_ITEMS_PER_CATEGORY[category] || window.OG.config.DEFAULT_MAX_ITEMS;
};

window.OG.updateGalleryCounter = function() {
  var counterEl = document.getElementById('galleryCounter');
  if (!counterEl) return;
  var categories = Object.keys(window.OG.config.MAX_ITEMS_PER_CATEGORY);
  var html = '';
  categories.forEach(function(cat) {
    var count = window.OG.getCountByCategory(cat);
    var limit = window.OG.getCategoryLimit(cat);
    var label = cat.charAt(0).toUpperCase() + cat.slice(1);
    var limitClass = count >= limit ? ' limit-reached' : '';
    html += '<span class="category-count' + limitClass + '">' + label + ': ' + count + '/' + limit + '</span>';
  });
  counterEl.innerHTML = html;
};

window.OG.addGalleryItem = function(options) {
  const defaults = {
    image: '',
    title: '',
    description: '',
    category: 'altro',
    size: 'normal' // normal, tall, wide
  };

  const config = Object.assign({}, defaults, options);
  const grid = document.getElementById('galleryGrid');

  if (grid && config.image) {
    var currentCount = window.OG.getCountByCategory(config.category);
    var limit = window.OG.getCategoryLimit(config.category);

    if (currentCount >= limit) {
      console.warn('Limite galleria raggiunto per la categoria "' + config.category + '": massimo ' + limit + ' immagini consentite.');
      window.OG.updateGalleryCounter();
      return false;
    }

    const item = document.createElement('div');
    item.className = 'gallery-item reveal active';
    if (config.size !== 'normal') {
      item.classList.add(config.size);
    }
    item.setAttribute('data-category', config.category);

    item.innerHTML = '<img src="' + config.image + '" alt="' + config.title + '" loading="lazy">' +
      '<div class="gallery-overlay">' +
      '<span class="category">' + config.category + '</span>' +
      '<h4>' + config.title + '</h4>' +
      '<p>' + config.description + '</p>' +
      '</div>';

    grid.appendChild(item);
    window.OG.updateGalleryCounter();
    return true;
  }

  return false;
};

// ============================================
// GALLERIA - LOAD MORE (mostra primi N, nasconde il resto)
// ============================================
window.OG.initGalleryLoadMore = function(limit) {
  var grid = document.getElementById('galleryGrid');
  var loadMoreBtn = document.getElementById('galleryLoadMore');
  if (!grid || !loadMoreBtn) return;

  var items = grid.querySelectorAll('.gallery-item');
  if (items.length <= limit) {
    loadMoreBtn.style.display = 'none';
    return;
  }

  // Nascondi elementi oltre il limite
  for (var i = limit; i < items.length; i++) {
    items[i].style.display = 'none';
    items[i].setAttribute('data-load-hidden', 'true');
  }

  loadMoreBtn.style.display = 'block';
};

window.OG.showMoreGallery = function() {
  var grid = document.getElementById('galleryGrid');
  var loadMoreBtn = document.getElementById('galleryLoadMore');
  if (!grid) return;

  // Rivela tutti gli elementi nascosti
  var hiddenItems = grid.querySelectorAll('.gallery-item[data-load-hidden]');
  hiddenItems.forEach(function(item) {
    item.style.display = '';
    item.removeAttribute('data-load-hidden');
  });

  if (loadMoreBtn) loadMoreBtn.style.display = 'none';

  // Ri-applica filtro categoria attivo se presente
  var activeFilter = document.querySelector('.filter-btn.active');
  if (activeFilter) {
    var filter = activeFilter.getAttribute('data-filter');
    if (filter && filter !== 'all') {
      grid.querySelectorAll('.gallery-item').forEach(function(item) {
        if (item.getAttribute('data-category') !== filter) {
          item.style.display = 'none';
        }
      });
    }
  }
};
