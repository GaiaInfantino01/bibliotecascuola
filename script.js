const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQwD-BejuTnjtnrQjm8nq45yUMnPlpqdVCNtN966RAOOQdRhDyBCJMcfjaHdBJDV2UmKNcCt_goyH5S/pub?output=csv";

const input = document.getElementById("search");
const resultsList = document.getElementById("results");
const favList = document.getElementById("favorites-list");
const genreFilter = document.getElementById("genre-filter");
const availabilityFilter = document.getElementById("availability-filter");
const sortFilter = document.getElementById("sort-filter");
const counter = document.getElementById("counter");

let books = [];

function normalize(value) {
  return (value || "").toString().trim().toLowerCase();
}

function clean(value, fallback = "Non indicato") {
  const text = (value || "").toString().trim();
  return text === "" ? fallback : text;
}

function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

function saveFavorites(favorites) {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function isBookAvailable(book) {
  const disponibilita = normalize(book.DISPONIBILITA);
  const quantita = Number(book.QUANTITA || 0);

  return disponibilita === "disponibile" || quantita > 0;
}

function renderFavorites() {
  favList.innerHTML = "";

  const favorites = getFavorites();
  const favoriteBooks = books.filter(book => favorites.includes(clean(book.ISBN, "")));

  if (favoriteBooks.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Nessun libro preferito.";
    favList.appendChild(li);
    return;
  }

  favoriteBooks.forEach(book => {
    const li = document.createElement("li");
    li.textContent = `${clean(book.TITOLO, "Titolo mancante")} – ${clean(book.AUTORE, "Autore mancante")}`;
    favList.appendChild(li);
  });
}

function createBookCard(book) {
  const li = document.createElement("li");
  li.classList.add("book-item");

  const available = isBookAvailable(book);

  li.classList.add(available ? "disponibile-border" : "non-disponibile-border");

  const disponibilitaClass = available ? "disponibile" : "non-disponibile";
  const disponibilitaText = available ? "Disponibile" : "Non disponibile";

  const isbn = clean(book.ISBN, "");
  const favorites = getFavorites();
  const isFav = favorites.includes(isbn);
  const favHeart = isFav ? "💖" : "❤️";

  li.innerHTML = `
    <div class="book-main">
      <strong>${clean(book.TITOLO, "Titolo mancante")}</strong>

      ${clean(book.AUTORE, "Autore mancante")} – 
      ${clean(book.EDITORE, "Editore non indicato")}, 
      ${clean(book.LUOGO, "Luogo non indicato")} 
      (${clean(book.ANNO, "s.d.")})<br>

      <em>${clean(book.GENERE, "Genere non indicato")}</em> |
      ISBN: ${clean(book.ISBN, "ISBN non disponibile")}<br>

      Collocazione: <strong>${clean(book.COLLOCAZIONE, "Non indicata")}</strong><br>

      Disponibilità:
      <span class="disponibilita ${disponibilitaClass}">${disponibilitaText}</span>

      <button class="fav-btn" data-id="${isbn}" title="Aggiungi ai preferiti">${favHeart}</button>
    </div>

    <div class="book-details">
      <div class="detail-grid">
        <p><strong>Edizione:</strong> ${clean(book.EDIZIONE)}</p>
        <p><strong>Pagine:</strong> ${clean(book.PAGINE)}</p>
        <p><strong>Lingua:</strong> ${clean(book.LINGUA)}</p>
        <p><strong>Quantità:</strong> ${clean(book.QUANTITA)}</p>
        <p><strong>Prestito:</strong> ${clean(book.PRESTITO)}</p>
        <p><strong>Volume:</strong> ${clean(book.VOLUME)}</p>
        <p><strong>Collocazione:</strong> ${clean(book.COLLOCAZIONE)}</p>
        <p><strong>Disponibilità originale:</strong> ${clean(book.DISPONIBILITA)}</p>
      </div>

      <div class="abstract">
        <strong>Abstract:</strong>
        <p>${clean(book.ABSTRACT, "Abstract non disponibile.")}</p>
      </div>
    </div>
  `;

  li.addEventListener("click", function(e) {
    if (e.target.classList.contains("fav-btn")) return;

    const isOpen = li.classList.contains("open");

    document.querySelectorAll(".book-item.open").forEach(item => {
      item.classList.remove("open");
    });

    if (!isOpen) {
      li.classList.add("open");
    }
  });

  const favButton = li.querySelector(".fav-btn");

  favButton.addEventListener("click", function(e) {
    e.stopPropagation();

    const bookId = e.target.dataset.id;

    if (!bookId) {
      alert("Questo libro non ha un ISBN, quindi non può essere salvato nei preferiti.");
      return;
    }

    let favorites = getFavorites();

    if (favorites.includes(bookId)) {
      favorites = favorites.filter(id => id !== bookId);
      e.target.textContent = "❤️";
    } else {
      favorites.push(bookId);
      e.target.textContent = "💖";
    }

    saveFavorites(favorites);
    renderFavorites();
  });

  return li;
}

function renderBooks(list) {
  resultsList.innerHTML = "";

  counter.textContent = `${list.length} libro/i trovato/i`;

  if (list.length === 0) {
    const li = document.createElement("li");
    li.classList.add("book-item");
    li.textContent = "Nessun libro trovato.";
    resultsList.appendChild(li);
    return;
  }

  list.forEach(book => {
    resultsList.appendChild(createBookCard(book));
  });
}

function populateGenres() {
  const genres = [...new Set(
    books
      .map(book => clean(book.GENERE, ""))
      .filter(genre => genre !== "")
  )].sort();

  genres.forEach(genre => {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    genreFilter.appendChild(option);
  });
}

function applyFilters() {
  const query = normalize(input.value);
  const selectedGenre = genreFilter.value;
  const selectedAvailability = availabilityFilter.value;
  const selectedSort = sortFilter.value;

  let filtered = books.filter(book => {
    const matchesSearch =
      normalize(book.TITOLO).includes(query) ||
      normalize(book.AUTORE).includes(query) ||
      normalize(book.EDITORE).includes(query) ||
      normalize(book.ANNO).includes(query) ||
      normalize(book.LUOGO).includes(query) ||
      normalize(book.EDIZIONE).includes(query) ||
      normalize(book.GENERE).includes(query) ||
      normalize(book.ABSTRACT).includes(query) ||
      normalize(book.PAGINE).includes(query) ||
      normalize(book.LINGUA).includes(query) ||
      normalize(book.ISBN).includes(query) ||
      normalize(book.QUANTITA).includes(query) ||
      normalize(book.PRESTITO).includes(query) ||
      normalize(book.DISPONIBILITA).includes(query) ||
      normalize(book.VOLUME).includes(query) ||
      normalize(book.COLLOCAZIONE).includes(query);

    const matchesGenre =
      selectedGenre === "" || book.GENERE === selectedGenre;

    const available = isBookAvailable(book);

    const matchesAvailability =
      selectedAvailability === "" ||
      (selectedAvailability === "disponibile" && available) ||
      (selectedAvailability === "non disponibile" && !available);

    return matchesSearch && matchesGenre && matchesAvailability;
  });

  if (selectedSort === "titolo") {
    filtered.sort((a, b) => normalize(a.TITOLO).localeCompare(normalize(b.TITOLO)));
  }

  if (selectedSort === "autore") {
    filtered.sort((a, b) => normalize(a.AUTORE).localeCompare(normalize(b.AUTORE)));
  }

  if (selectedSort === "anno") {
    filtered.sort((a, b) => Number(a.ANNO || 0) - Number(b.ANNO || 0));
  }

  renderBooks(filtered);
}

resultsList.innerHTML = "<li class='book-item'>Caricamento catalogo...</li>";

Papa.parse(sheetURL, {
  download: true,
  header: true,
  skipEmptyLines: true,

  complete: function(results) {
    books = results.data.filter(book => clean(book.TITOLO, "") !== "");

    populateGenres();
    renderBooks(books);
    renderFavorites();

    input.addEventListener("input", applyFilters);
    genreFilter.addEventListener("change", applyFilters);
    availabilityFilter.addEventListener("change", applyFilters);
    sortFilter.addEventListener("change", applyFilters);
  },

  error: function(error) {
    console.error("Errore nel caricamento del CSV:", error);
    resultsList.innerHTML = "<li class='book-item'>Errore nel caricamento del catalogo.</li>";
  }
});
  error: function(error) {
    console.error("Errore CSV:", error);
    resultsList.innerHTML = "<li class='book-item'>Errore nel caricamento del catalogo.</li>";
  }
});  transition: box-shadow 0.2s ease, background 0.2s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
  position: relative;
}
