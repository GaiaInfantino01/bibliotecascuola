const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQwD-BejuTnjtnrQjm8nq45yUMnPlpqdVCNtN966RAOOQdRhDyBCJMcfjaHdBJDV2UmKNcCt_goyH5S/pub?output=csv";

const input = document.getElementById("search");
const resultsList = document.getElementById("results");
const favList = document.getElementById("favorites-list");
const recommendedList = document.getElementById("recommended-list");
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

function getField(book, ...names) {
  for (const name of names) {
    if (book[name] !== undefined && book[name] !== null && String(book[name]).trim() !== "") {
      return book[name];
    }
  }
  return "";
}

function getTitle(book) {
  return getField(book, "TITOLO", "Titolo", "titolo");
}

function getAuthor(book) {
  return getField(book, "AUTORE", "Autore", "autore");
}

function getGenre(book) {
  return getField(book, "GENERE", "Genere", "genere");
}

function getIsbn(book) {
  return getField(book, "ISBN", "Isbn", "isbn");
}

function getBookId(book) {
  return clean(getIsbn(book), "") || `${clean(getTitle(book), "")}-${clean(getAuthor(book), "")}`;
}

/* COPERTINE */
function getBookCover(book) {
  let manualCover = clean(
    getField(book, "COPERTINA", "Copertina", "copertina", "URL COPERTINA", "Url copertina", "url copertina"),
    ""
  );

  if (manualCover !== "") {
    const driveMatch = manualCover.match(/\/d\/([^/]+)/);

    if (driveMatch && driveMatch[1]) {
      manualCover = `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
    }

    return manualCover;
  }

  const isbn = clean(getIsbn(book), "");

  if (isbn !== "") {
    const cleanIsbn = isbn.replace(/[^0-9Xx]/g, "");
    return `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`;
  }

  return "https://placehold.co/140x210?text=No+Cover";
}

/* PREFERITI */
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

/* DISPONIBILITÀ */
function isBookAvailable(book) {
  const disponibilita = normalize(getField(book, "DISPONIBILITA", "Disponibilita", "disponibilita"));
  const quantita = Number(getField(book, "QUANTITA", "Quantita", "quantita") || 0);

  if (disponibilita.includes("non")) return false;
  if (disponibilita.includes("disponibile")) return true;
  if (quantita > 0) return true;

  return false;
}

/* CARD LIBRO */
function createBookCard(book) {
  const li = document.createElement("li");
  const available = isBookAvailable(book);
  const bookId = getBookId(book);
  const favorites = getFavorites();
  const isFav = favorites.includes(bookId);
  const cover = getBookCover(book);

  li.className = `book-item ${available ? "disponibile-border" : "non-disponibile-border"}`;

  li.innerHTML = `
    <button class="fav-btn" type="button">${isFav ? "❤️" : "♡"}</button>

    <div class="book-main">
      <img class="book-cover" src="${cover}" alt="Copertina libro" loading="lazy">

      <div class="book-info">
        <h3>${clean(getTitle(book), "Titolo mancante")}</h3>
        <p><strong>Autore:</strong> ${clean(getAuthor(book), "Autore non indicato")}</p>
        <p><strong>Editore:</strong> ${clean(getField(book, "EDITORE", "Editore", "editore"))}</p>
        <p><strong>Anno:</strong> ${clean(getField(book, "ANNO", "Anno", "anno"), "s.d.")}</p>
        <p><strong>Genere:</strong> ${clean(getGenre(book))}</p>
        <p class="${available ? "disponibile" : "non-disponibile"}">
          ${available ? "Disponibile" : "Non disponibile"}
        </p>
      </div>
    </div>

    <div class="book-details">
      <p><strong>ISBN:</strong> ${clean(getIsbn(book))}</p>
      <p><strong>Luogo:</strong> ${clean(getField(book, "LUOGO", "Luogo", "luogo"))}</p>
      <p><strong>Edizione:</strong> ${clean(getField(book, "EDIZIONE", "Edizione", "edizione"))}</p>
      <p><strong>Pagine:</strong> ${clean(getField(book, "PAGINE", "Pagine", "pagine"))}</p>
      <p><strong>Lingua:</strong> ${clean(getField(book, "LINGUA", "Lingua", "lingua"))}</p>
      <p><strong>Quantità:</strong> ${clean(getField(book, "QUANTITA", "Quantita", "quantita"))}</p>
      <p><strong>Prestito:</strong> ${clean(getField(book, "PRESTITO", "Prestito", "prestito"))}</p>
      <p><strong>Volume:</strong> ${clean(getField(book, "VOLUME", "Volume", "volume"))}</p>
      <p><strong>Collocazione:</strong> ${clean(getField(book, "COLLOCAZIONE", "Collocazione", "collocazione"))}</p>
      <p><strong>Abstract:</strong> ${clean(getField(book, "ABSTRACT", "Abstract", "abstract"), "Abstract non disponibile.")}</p>
    </div>
  `;

  li.addEventListener("click", function (event) {
    if (event.target.classList.contains("fav-btn")) return;
    li.classList.toggle("open");
  });

  const favButton = li.querySelector(".fav-btn");

  favButton.addEventListener("click", function (event) {
    event.stopPropagation();

    let favorites = getFavorites();

    if (favorites.includes(bookId)) {
      favorites = favorites.filter(id => id !== bookId);
      favButton.textContent = "♡";
    } else {
      favorites.push(bookId);
      favButton.textContent = "❤️";
    }

    saveFavorites(favorites);
    renderFavorites();
  });

  return li;
}

/* RENDER LIBRI */
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

/* GENERI */
function populateGenres() {
  genreFilter.innerHTML = `<option value="">Tutti i generi</option>`;

  const genres = [...new Set(
    books
      .map(book => clean(getGenre(book), ""))
      .filter(genre => genre !== "")
  )].sort();

  genres.forEach(genre => {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    genreFilter.appendChild(option);
  });
}

/* FILTRI */
function applyFilters() {
  const query = normalize(input.value);
  const selectedGenre = genreFilter.value;
  const selectedAvailability = availabilityFilter.value;
  const selectedSort = sortFilter.value;

  let filtered = books.filter(book => {
    const searchableText = Object.values(book).join(" ").toLowerCase();
    const available = isBookAvailable(book);

    const matchesSearch = searchableText.includes(query);
    const matchesGenre = selectedGenre === "" || clean(getGenre(book), "") === selectedGenre;
    const matchesAvailability =
      selectedAvailability === "" ||
      (selectedAvailability === "disponibile" && available) ||
      (selectedAvailability === "non disponibile" && !available);

    return matchesSearch && matchesGenre && matchesAvailability;
  });

  if (selectedSort === "titolo") {
    filtered.sort((a, b) => normalize(getTitle(a)).localeCompare(normalize(getTitle(b))));
  }

  if (selectedSort === "autore") {
    filtered.sort((a, b) => normalize(getAuthor(a)).localeCompare(normalize(getAuthor(b))));
  }

  if (selectedSort === "anno") {
    filtered.sort((a, b) =>
      Number(getField(a, "ANNO", "Anno", "anno") || 0) -
      Number(getField(b, "ANNO", "Anno", "anno") || 0)
    );
  }

  renderBooks(filtered);
}

/* PREFERITI */
function renderFavorites() {
  favList.innerHTML = "";

  const favorites = getFavorites();
  const favoriteBooks = books.filter(book => favorites.includes(getBookId(book)));

  if (favoriteBooks.length === 0) {
    favList.innerHTML = `<li>Nessun libro preferito.</li>`;
    return;
  }

  favoriteBooks.forEach(book => {
    const li = document.createElement("li");
    li.className = "book-item favorite-small";
    li.innerHTML = `
      <h3>${clean(getTitle(book), "Titolo mancante")}</h3>
      <p>${clean(getAuthor(book), "Autore non indicato")}</p>
    `;
    favList.appendChild(li);
  });
}

/* MENSOLA DEL PROF */
function renderRecommendedBooks() {
  recommendedList.innerHTML = "";

  const recommendedBooks = books.filter(book => {
    const value = normalize(getField(book, "CONSIGLIATO", "Consigliato", "consigliato"));
    return value === "si" || value === "sì" || value === "yes";
  });

  if (recommendedBooks.length === 0) {
    recommendedList.innerHTML = `<li>Nessun libro consigliato al momento.</li>`;
    return;
  }

  recommendedBooks.forEach(book => {
    const card = createBookCard(book);
    card.classList.add("recommended-card");
    recommendedList.appendChild(card);
  });
}

/* CARICAMENTO */
function loadBooks() {
  resultsList.innerHTML = `<li>Caricamento catalogo...</li>`;

  Papa.parse(sheetURL, {
    download: true,
    header: true,
    skipEmptyLines: true,

    complete: function (results) {
      console.log("CSV caricato:", results);

      if (!results.data || results.data.length === 0) {
        resultsList.innerHTML = `<li class="empty-message">Il catalogo è vuoto o non leggibile.</li>`;
        return;
      }

      books = results.data.filter(book => clean(getTitle(book), "") !== "");

      if (books.length === 0) {
        resultsList.innerHTML = `<li class="empty-message">Nessun libro caricato. Controlla la colonna TITOLO nel foglio Google.</li>`;
        return;
      }

      populateGenres();
      renderBooks(books);
      renderRecommendedBooks();
      renderFavorites();

      input.addEventListener("input", applyFilters);
      genreFilter.addEventListener("change", applyFilters);
      availabilityFilter.addEventListener("change", applyFilters);
      sortFilter.addEventListener("change", applyFilters);
    },

    error: function (error) {
      console.error("Errore nel caricamento del CSV:", error);
      resultsList.innerHTML = `<li class="empty-message">Errore nel caricamento del catalogo.</li>`;
    }
  });
}

loadBooks();

/* TOGGLE MENSOLA */
const mensolaButton = document.getElementById("toggle-mensola-prof");
const mensolaSection = document.getElementById("mensola-prof");

if (mensolaButton && mensolaSection) {
  mensolaButton.addEventListener("click", function () {
    mensolaSection.classList.toggle("open");
  });
}
