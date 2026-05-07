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

function getBookId(book) {
  return clean(book.ISBN, "") || `${clean(book.TITOLO, "")}-${clean(book.AUTORE, "")}`;
}

function getBookCover(book) {
  const isbn = clean(book.ISBN || book.isbn || book.Isbn, "");

  if (isbn !== "") {
    const cleanIsbn = isbn.replace(/[^0-9Xx]/g, "");
    return `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-M.jpg?default=false`;
  }

  return "https://placehold.co/120x180?text=No+Cover";
}

async function getBookCoverFromGoogle(book, imgElement) {
  const titolo = clean(book.TITOLO, "");
  const autore = clean(book.AUTORE, "");

  if (!titolo) {
    imgElement.src = "https://placehold.co/120x180?text=No+Cover";
    return;
  }

  const query = encodeURIComponent(`${titolo} ${autore}`);
  const url = `https://www.googleapis.com/books/v1/volumes?q=${query}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const thumbnail = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;

    if (thumbnail) {
      imgElement.src = thumbnail.replace("http://", "https://");
    } else {
      imgElement.src = "https://placehold.co/120x180?text=No+Cover";
    }
  } catch (error) {
    console.log("Copertina Google Books non trovata:", error);
    imgElement.src = "https://placehold.co/120x180?text=No+Cover";
  }
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

  if (disponibilita.includes("non")) return false;
  if (disponibilita.includes("disponibile")) return true;
  if (quantita > 0) return true;

  return false;
}

function createBookCard(book) {
  const li = document.createElement("li");
  const available = isBookAvailable(book);
  const bookId = getBookId(book);
  const favorites = getFavorites();
  const isFav = favorites.includes(bookId);
  const cover = getBookCover(book);

  li.className = `book-item ${available ? "disponibile-border" : "non-disponibile-border"}`;

  li.innerHTML = `
    <div class="book-content">
      <button class="fav-btn" type="button">${isFav ? "❤️" : "♡"}</button>

      <h3>${clean(book.TITOLO, "Titolo mancante")}</h3>

      <p><strong>Autore:</strong> ${clean(book.AUTORE, "Autore non indicato")}</p>
      <p><strong>Editore:</strong> ${clean(book.EDITORE)}</p>
      <p><strong>Anno:</strong> ${clean(book.ANNO, "s.d.")}</p>
      <p><strong>Genere:</strong> ${clean(book.GENERE)}</p>

      <span class="availability ${available ? "disponibile" : "non-disponibile"}">
        ${available ? "Disponibile" : "Non disponibile"}
      </span>

      <div class="book-details">
        <p><strong>ISBN:</strong> ${clean(book.ISBN)}</p>
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
    </div>

    <img 
      class="book-cover"
      src="${cover}"
      alt="Copertina di ${clean(book.TITOLO, "libro")}"
    >
  `;

  const coverImg = li.querySelector(".book-cover");

  coverImg.addEventListener("error", function () {
    getBookCoverFromGoogle(book, this);
  });

  coverImg.addEventListener("load", function () {
    if (this.naturalWidth <= 1 || this.naturalHeight <= 1) {
      getBookCoverFromGoogle(book, this);
    }
  });

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
    const searchableText = Object.values(book).join(" ").toLowerCase();
    const available = isBookAvailable(book);

    const matchesSearch = searchableText.includes(query);
    const matchesGenre = selectedGenre === "" || clean(book.GENERE, "") === selectedGenre;
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
    li.className = "book-item favorite-small";

    li.innerHTML = `
      <div class="book-content">
        <h3>${clean(book.TITOLO, "Titolo mancante")}</h3>
        <p>${clean(book.AUTORE, "Autore non indicato")}</p>
      </div>

      <img 
        class="book-cover small-cover"
        src="${getBookCover(book)}"
        alt="Copertina di ${clean(book.TITOLO, "libro")}"
      >
    `;

    const coverImg = li.querySelector(".book-cover");

    coverImg.addEventListener("error", function () {
      getBookCoverFromGoogle(book, this);
    });

    favList.appendChild(li);
  });
}

function renderRecommendedBooks() {
  recommendedList.innerHTML = "";

  const recommendedBooks = books.filter(book => {
    const value = normalize(book.CONSIGLIATO);
    return value === "si" || value === "sì" || value === "yes";
  });

  if (recommendedBooks.length === 0) {
    recommendedList.innerHTML = `<li class="empty-message">Nessun libro consigliato al momento.</li>`;
    return;
  }

  recommendedBooks.forEach(book => {
    const card = createBookCard(book);
    card.classList.add("recommended-card");
    recommendedList.appendChild(card);
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

const mensolaButton = document.getElementById("toggle-mensola-prof");
const mensolaSection = document.getElementById("mensola-prof");

if (mensolaButton && mensolaSection) {
  mensolaButton.addEventListener("click", function () {
    mensolaSection.classList.toggle("open");
  });
}
