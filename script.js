const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQwD-BejuTnjrQjm8nq45yUMnPlpqdVCNtN966RAOOQdRhDyBCJMcfjaHdBJDV2UmKNcCt_goyH5S/pub?output=csv";

const resultsList = document.getElementById("results");
const input = document.getElementById("search");
const counter = document.getElementById("counter");
const favList = document.getElementById("favorites-list");
const recommendedList = document.getElementById("recommended-list");

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

function getCover(book) {
  const cover = clean(book.COPERTINA || book.Copertina || book.copertina, "");
  return cover || "https://placehold.co/140x210?text=No+Cover";
}

function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites") || "[]");
}

function saveFavorites(favorites) {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function createBookCard(book) {
  const li = document.createElement("li");
  li.className = "book-item";

  const bookId = getBookId(book);
  const favorites = getFavorites();
  const isFav = favorites.includes(bookId);

  li.innerHTML = `
    <div class="book-content">
      <button class="fav-btn" type="button">${isFav ? "❤️" : "♡"}</button>
      <h3>${clean(book.TITOLO, "Titolo mancante")}</h3>
      <p><strong>Autore:</strong> ${clean(book.AUTORE)}</p>
      <p><strong>Editore:</strong> ${clean(book.EDITORE)}</p>
      <p><strong>Anno:</strong> ${clean(book.ANNO)}</p>
      <p><strong>Genere:</strong> ${clean(book.GENERE)}</p>

      <div class="book-details">
        <p><strong>ISBN:</strong> ${clean(book.ISBN)}</p>
        <p><strong>Luogo:</strong> ${clean(book.LUOGO)}</p>
        <p><strong>Pagine:</strong> ${clean(book.PAGINE)}</p>
        <p><strong>Lingua:</strong> ${clean(book.LINGUA)}</p>
        <p><strong>Collocazione:</strong> ${clean(book.COLLOCAZIONE)}</p>
        <p><strong>Abstract:</strong> ${clean(book.ABSTRACT, "Non disponibile")}</p>
      </div>
    </div>

    <img
      class="book-cover"
      src="${getCover(book)}"
      alt="Copertina"
      onerror="this.src='https://placehold.co/140x210?text=No+Cover'"
    >
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

function renderBooks(list) {
  resultsList.innerHTML = "";

  if (counter) {
    counter.textContent = list.length + " libro/i trovato/i";
  }

  if (list.length === 0) {
    resultsList.innerHTML = "<li>Nessun libro trovato.</li>";
    return;
  }

  list.forEach(book => {
    resultsList.appendChild(createBookCard(book));
  });
}

function searchBooks() {
  const query = normalize(input.value);

  const filtered = books.filter(book => {
    return Object.values(book).join(" ").toLowerCase().includes(query);
  });

  renderBooks(filtered);
}

function renderFavorites() {
  if (!favList) return;

  favList.innerHTML = "";

  const favorites = getFavorites();
  const favoriteBooks = books.filter(book => favorites.includes(getBookId(book)));

  if (favoriteBooks.length === 0) {
    favList.innerHTML = "<li>Nessun preferito.</li>";
    return;
  }

  favoriteBooks.forEach(book => {
    favList.appendChild(createBookCard(book));
  });
}

function renderRecommendedBooks() {
  if (!recommendedList) return;

  recommendedList.innerHTML = "";

  const recommendedBooks = books.filter(book => {
    const value = normalize(book.CONSIGLIATO);
    return value === "si" || value === "sì" || value === "yes";
  });

  if (recommendedBooks.length === 0) {
    recommendedList.innerHTML = "<li>Nessun libro consigliato.</li>";
    return;
  }

  recommendedBooks.forEach(book => {
    recommendedList.appendChild(createBookCard(book));
  });
}

Papa.parse(sheetURL, {
  download: true,
  header: true,
  skipEmptyLines: true,

  complete: function (results) {
    books = results.data.filter(book => clean(book.TITOLO, "") !== "");

    renderBooks(books);
    renderFavorites();
    renderRecommendedBooks();

    if (input) {
      input.addEventListener("input", searchBooks);
    }
  },

  error: function () {
    resultsList.innerHTML = "<li>Errore nel caricamento del catalogo.</li>";
  }
});

const mensolaButton = document.getElementById("toggle-mensola-prof");
const mensolaSection = document.getElementById("mensola-prof");

if (mensolaButton && mensolaSection) {
  mensolaButton.addEventListener("click", function () {
    mensolaSection.classList.toggle("open");
  });
}
