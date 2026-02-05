# Officina Gemmologica - Sito Web

Sito web moderno ed elegante per Officina Gemmologica, laboratorio artigianale di taglio pietre preziose a Roma.

## Struttura del Progetto

```
Officina-Gemmologica/
├── index.html          # Homepage
├── chi-siamo.html      # Pagina Chi Siamo
├── servizi.html        # Pagina Servizi
├── galleria.html       # Galleria/Portfolio
├── contatti.html       # Pagina Contatti
├── css/
│   └── style.css       # Stili principali
├── js/
│   └── main.js         # JavaScript interattivo
├── images/             # Cartella per le immagini
│   └── gallery/        # Immagini della galleria
└── README.md           # Questo file
```

---

## Come Personalizzare il Sito

### 1. Modificare i Colori

Apri `css/style.css` e modifica le variabili all'inizio del file:

```css
:root {
  --color-primary: #1a1a1a;        /* Nero principale */
  --color-accent: #c9a962;         /* Oro/Champagne - colore evidenziato */
  --color-accent-light: #e5d4a1;   /* Oro chiaro */
  /* ... altri colori ... */
}
```

### 2. Aggiungere Immagini

1. Carica le tue immagini nella cartella `images/`
2. Per la galleria, usa la sottocartella `images/gallery/`
3. Modifica il percorso `src` nelle pagine HTML

**Immagini richieste:**
- `images/hero-bg.jpg` - Sfondo hero homepage (1920x1080px consigliato)
- `images/about-preview.jpg` - Immagine sezione about
- `images/chi-siamo-1.jpg` - Pagina Chi Siamo
- `images/chi-siamo-2.jpg` - Pagina Chi Siamo (laboratorio)
- `images/servizio-*.jpg` - Immagini per ogni servizio
- `images/gallery/*.jpg` - Immagini galleria

### 3. Aggiungere Elementi alla Galleria

Nella pagina `galleria.html`, copia un blocco esistente e modifica:

```html
<div class="gallery-item reveal" data-category="gemme">
  <img src="images/gallery/TUA-IMMAGINE.jpg" alt="Descrizione">
  <div class="gallery-overlay">
    <span class="category">Gemme</span>
    <h4>Titolo</h4>
    <p>Descrizione breve</p>
  </div>
</div>
```

**Categorie disponibili:** `gemme`, `anelli`, `collane`, `orecchini`, `altro`

**Per immagini verticali:** aggiungi la classe `tall`
```html
<div class="gallery-item tall reveal" data-category="anelli">
```

### 4. Modificare i Contatti

In `contatti.html`, cerca i commenti `<!-- MODIFICA -->` e aggiorna:
- Indirizzo
- Telefono
- WhatsApp
- Email
- Orari di apertura
- Link social

### 5. Aggiungere Google Maps

1. Vai su [Google Maps](https://maps.google.com)
2. Cerca il tuo indirizzo
3. Clicca "Condividi" > "Incorpora mappa"
4. Copia il codice iframe
5. In `contatti.html`, sostituisci il placeholder della mappa

### 6. Configurare il Form di Contatto

Il form attualmente simula l'invio. Per farlo funzionare realmente:

**Opzione A - Formspree (gratuito, semplice):**
1. Registrati su [formspree.io](https://formspree.io)
2. Crea un nuovo form
3. In `js/main.js`, decommenta il codice Formspree e inserisci il tuo ID

**Opzione B - PHP (richiede hosting con PHP):**
Crea un file `send-mail.php` sul server

### 7. Aggiungere Nuove Sezioni/Pagine

Per creare una nuova pagina:
1. Copia una pagina esistente (es. `servizi.html`)
2. Modifica il contenuto
3. Aggiungi il link nel menu di navigazione in tutte le pagine

---

## Caricamento su Aruba

### Metodo 1: File Manager Aruba
1. Accedi al pannello di controllo Aruba
2. Vai su "File Manager" o "Gestione File"
3. Carica tutti i file nella cartella `public_html` o `htdocs`

### Metodo 2: FTP
1. Usa un client FTP (FileZilla, Cyberduck)
2. Connettiti con le credenziali FTP fornite da Aruba
3. Carica i file nella cartella principale del sito

### Dopo il caricamento:
- Verifica che HTTPS sia attivo (certificato SSL)
- Testa tutte le pagine
- Verifica il form di contatto
- Controlla la visualizzazione mobile

---

## Ottimizzazione Immagini

Prima di caricare le immagini:

1. **Ridimensiona:** max 1920px di larghezza per hero, 800-1200px per altre
2. **Comprimi:** usa [TinyPNG](https://tinypng.com) o [Squoosh](https://squoosh.app)
3. **Formato:** preferisci JPG per foto, PNG per loghi/icone

---

## Supporto Browser

Il sito supporta:
- Chrome (ultime 2 versioni)
- Firefox (ultime 2 versioni)
- Safari (ultime 2 versioni)
- Edge (ultime 2 versioni)
- Mobile: iOS Safari, Chrome Android

---

## Note Tecniche

- **Responsive:** il sito si adatta automaticamente a tutti i dispositivi
- **Performance:** CSS e JS ottimizzati, immagini lazy-loaded
- **SEO:** meta tag configurati, struttura semantica HTML5
- **Accessibilità:** contrasti verificati, navigazione da tastiera

---

## Crediti

- Font: [Google Fonts](https://fonts.google.com) (Playfair Display, Lato)
- Icone: Unicode/Emoji (nessuna dipendenza esterna)

---

## Licenza

Questo sito web è stato creato per Officina Gemmologica.
Tutti i diritti sui contenuti e immagini sono riservati.
