const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQwD-BejuTnjtnrQjm8nq45yUMnPlpqdVCNtN966RAOOQdRhDyBCJMcfjaHdBJDV2UmKNcCt_goyH5S/pub?output=csv";

const input = document.getElementById("search");
const resultsList = document.getElementById("results");
const favList = document.getElementById("favorites-list");
const genreFilter = document.getElementById("genre-filter");
const availabilityFilter = document.getElementById("availability-filter");
const sortFilter = document.getElementById("sort-filter");
const counter = document.getElementById("counter");

let books = [];

function clean(value, fallback = "Non indicato") {
  const text = value ? String(value).trim() : "";
  return text || fallback;
}

function normalize(value) {
  return clean(value, "").toLowerCase();
}

function getBookId(book) {
  return clean(book.ISBN, "") || clean(book.TITOLO, "") + "-" + clean(book.AUTORE, "");
}

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem("favorites")) || [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites) {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function isBookAvailable(book) {
  const disponibilita = normalize(book.DISPONIBILITA);
  const quantita = Number(book.QUANTITA || 0);

  return disponibilita.includes("disponibile") && !disponibilita.includes("non") || quantita > 0;
}

function createBookCard(book) {
  const li = document.createElement("li");
  li.className = "book-item";

  const available = isBookAvailable(book);
  li.classList.add(available ? "disponibile-border" : "non-disponibile-border");

  const bookId = getBookId(book);
  const favorites = getFavorites();
  const isFav = favorites.includes(bookId);

  li.innerHTML = `
    <button class="fav-btn" data-id="${bookId}" title="Aggiungi ai preferiti">
      ${isFav ? "❤️" : "🤍"}
    </button>

    <div class="book-title">${clean(book.TITOLO, "Titolo mancante")}</div>

    <p class="book-meta">
      <strong>Autore:</strong> ${clean(book.AUTORE, "Autore non indicato")}
    </p>

    <p class="book-meta">
      <strong>Editore:</strong> ${clean(book.EDITORE)} 
      — <strong>Anno:</strong> ${clean(book.ANNO, "s.d.")}
    </p>

    <p class="book-meta">
      <strong>Genere:</strong> ${clean(book.GENERE)}
    </p>

    <p class="book-meta">
      <span class="badge ${available ? "disponibile" : "non-disponibile"}">
        ${available ? "Disponibile" : "Non disponibile"}
      </span>
    </p>

    <div class="book-details">
      <p><strong>ISBN:</strong> ${clean(book.ISBN, "Non disponibile")}</p>
      <p><strong>Luogo:</strong> ${clean(book.LUOGO)}</p>
      <p><strong>Edizione:</strong> ${clean(book.EDIZIONE)}</p>
      <p><strong>Pagine:</strong> ${clean(book.PAGINE)}</p>
      <p><strong>Lingua:</strong> ${clean(book.LINGUA)}</p>
      <p><strong>Quantità:</strong> ${clean(book.QUANTITA)}</p>
      <p><strong>Prestito:</strong> ${clean(book.PRESTITO)}</p>
      <p><strong>Volume:</strong> ${clean(book.VOLUME)}</p>
      <p><strong>Collocazione:</strong> ${clean(book.COLLOCAZIONE)}</p>
      <p><strong>Abstract:</strong> ${clean(book.ABSTRACT, "Abstract non disponibile.")}</p>
    </div>
  `;

  li.addEventListener("click", function (event) {
    if (event.target.classList.contains("fav-btn")) return;

    li.classList.toggle("open");
  });

  li.querySelector(".fav-btn").addEventListener("click", function (event) {
    event.stopPropagation();

    let favorites = getFavorites();

    if (favorites.includes(bookId)) {
      favorites = favorites.filter(id => id !== bookId);
      event.target.textContent = "🤍";
    } else {
      favorites.push(bookId);
      event.target.textContent = "❤️";
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
    resultsList.innerHTML = `<li class="empty-message">Nessun libro trovato.</li>`;
    return;
  }

  list.forEach(book => {
    resultsList.appendChild(createBookCard(book));
  });
}

function populateGenres() {
  genreFilter.innerHTML = `<option value="">Tutti i generi</option>`;

  const genres = [...new Set(
    books
      .map(book => clean(book.GENERE, ""))
      .filter(Boolean)
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
    const searchableText = Object.values(book).join(" ").toLowerCase();

    const matchesSearch = searchableText.includes(query);
    const matchesGenre = selectedGenre === "" || clean(book.GENERE, "") === selectedGenre;

    const available = isBookAvailable(book);
    const matchesAvailability =
      selectedAvailability === "" ||
      selectedAvailability === "disponibile" && available ||
      selectedAvailability === "non disponibile" && !available;

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

function renderFavorites() {
  favList.innerHTML = "";

  const favorites = getFavorites();
  const favoriteBooks = books.filter(book => favorites.includes(getBookId(book)));

  if (favoriteBooks.length === 0) {
    favList.innerHTML = `<li class="empty-message">Nessun libro preferito.</li>`;
    return;
  }

  favoriteBooks.forEach(book => {
    const li = document.createElement("li");
    li.className = "book-item";
    li.innerHTML = `
      <div class="book-title">${clean(book.TITOLO, "Titolo mancante")}</div>
      <p>${clean(book.AUTORE, "Autore non indicato")}</p>
    `;
    favList.appendChild(li);
  });
}

function loadBooks() {
  resultsList.innerHTML = `<li class="empty-message">Caricamento catalogo...</li>`;

  Papa.parse(sheetURL, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      books = results.data.filter(book => clean(book.TITOLO, "") !== "");

      populateGenres();
      renderBooks(books);
      renderFavorites();

      input.addEventListener("input", applyFilters);
      genreFilter.addEventListener("change", applyFilters);
      availabilityFilter.addEventListener("change", applyFilters);
      sortFilter.addEventListener("change", applyFilters);
    },
    error: function (error) {
      console.error("Errore nel caricamento del CSV:", error);
      resultsList.innerHTML = `<li class="error-message">Errore nel caricamento del catalogo.</li>`;
    }
  });
}

loadBooks();
