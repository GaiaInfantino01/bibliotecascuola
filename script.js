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

/* ---------------- UTILITIES ---------------- */

function clean(value, fallback = "Non indicato") {
if (value === undefined || value === null) return fallback;

const text = String(value).trim();

return text !== "" ? text : fallback;
}

function normalize(value) {
return clean(value, "").toLowerCase();
}

function getBookId(book) {
return (
clean(book.ISBN, "") ||
clean(book.TITOLO, "") + "-" + clean(book.AUTORE, "")
);
}

/* ---------------- COPERTINE ---------------- */

function getBookCover(book) {

const manualCover =
book.COPERTINA ||
book.Copertina ||
book.copertina ||
"";

if (manualCover.trim() !== "") {
return manualCover;
}

const isbn =
book.ISBN ||
book.isbn ||
"";

if (isbn.trim() !== "") {

```
const cleanIsbn = isbn.replace(/[^0-9Xx]/g, "");

return `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`;
```

}

return "https://placehold.co/140x210?text=No+Cover";
}

/* ---------------- PREFERITI ---------------- */

function getFavorites() {

try {

```
return JSON.parse(
  localStorage.getItem("favorites")
) || [];
```

} catch {

```
return [];
```

}
}

function saveFavorites(favorites) {

localStorage.setItem(
"favorites",
JSON.stringify(favorites)
);
}

/* ---------------- DISPONIBILITÀ ---------------- */

function isBookAvailable(book) {

const disponibilita =
normalize(book.DISPONIBILITA);

if (disponibilita.includes("non")) {
return false;
}

return true;
}

/* ---------------- CARD LIBRO ---------------- */

function createBookCard(book) {

const li = document.createElement("li");

const available =
isBookAvailable(book);

const bookId =
getBookId(book);

const favorites =
getFavorites();

const isFav =
favorites.includes(bookId);

li.className =
"book-item " +
(available
? "disponibile-border"
: "non-disponibile-border");

li.innerHTML = `

```
<div class="book-content">

  <button class="fav-btn">
    ${isFav ? "❤️" : "♡"}
  </button>

  <h3>
    ${clean(book.TITOLO, "Titolo mancante")}
  </h3>

  <p>
    <strong>Autore:</strong>
    ${clean(book.AUTORE)}
  </p>

  <p>
    <strong>Editore:</strong>
    ${clean(book.EDITORE)}
  </p>

  <p>
    <strong>Anno:</strong>
    ${clean(book.ANNO)}
  </p>

  <p>
    <strong>Genere:</strong>
    ${clean(book.GENERE)}
  </p>

  <span class="availability ${available ? "disponibile" : "non-disponibile"}">
    ${available ? "Disponibile" : "Non disponibile"}
  </span>

  <div class="book-details">

    <p><strong>ISBN:</strong> ${clean(book.ISBN)}</p>

    <p><strong>Luogo:</strong> ${clean(book.LUOGO)}</p>

    <p><strong>Pagine:</strong> ${clean(book.PAGINE)}</p>

    <p><strong>Lingua:</strong> ${clean(book.LINGUA)}</p>

    <p><strong>Collocazione:</strong> ${clean(book.COLLOCAZIONE)}</p>

    <p>
      <strong>Abstract:</strong>
      ${clean(book.ABSTRACT, "Non disponibile")}
    </p>

  </div>

</div>

<img
  class="book-cover"
  src="${getBookCover(book)}"
  alt="Copertina"
  onerror="this.src='https://placehold.co/140x210?text=No+Cover'"
>
```

`;

/* DETTAGLI */

li.addEventListener("click", function (event) {

```
if (
  event.target.classList.contains("fav-btn")
) return;

li.classList.toggle("open");
```

});

/* PREFERITI */

const favButton =
li.querySelector(".fav-btn");

favButton.addEventListener("click", function (event) {

```
event.stopPropagation();

let favorites =
  getFavorites();

if (favorites.includes(bookId)) {

  favorites =
    favorites.filter(id => id !== bookId);

  favButton.textContent = "♡";

} else {

  favorites.push(bookId);

  favButton.textContent = "❤️";
}

saveFavorites(favorites);

renderFavorites();
```

});

return li;
}

/* ---------------- RENDER LIBRI ---------------- */

function renderBooks(list) {

resultsList.innerHTML = "";

counter.textContent =
list.length + " libro/i trovato/i";

if (list.length === 0) {

```
resultsList.innerHTML =
  "<li>Nessun libro trovato.</li>";

return;
```

}

list.forEach(book => {

```
resultsList.appendChild(
  createBookCard(book)
);
```

});
}

/* ---------------- GENERI ---------------- */

function populateGenres() {

genreFilter.innerHTML =
'<option value="">Tutti i generi</option>';

const genres = [...new Set(

```
books.map(book =>
  clean(book.GENERE, "")
)
```

)].filter(Boolean).sort();

genres.forEach(genre => {

```
const option =
  document.createElement("option");

option.value = genre;

option.textContent = genre;

genreFilter.appendChild(option);
```

});
}

/* ---------------- FILTRI ---------------- */

function applyFilters() {

const query =
normalize(input.value);

const selectedGenre =
genreFilter.value;

const selectedAvailability =
availabilityFilter.value;

const selectedSort =
sortFilter.value;

let filtered = books.filter(book => {

```
const searchableText =
  Object.values(book)
    .join(" ")
    .toLowerCase();

const available =
  isBookAvailable(book);

const matchesSearch =
  searchableText.includes(query);

const matchesGenre =
  selectedGenre === "" ||
  clean(book.GENERE, "") === selectedGenre;

const matchesAvailability =
  selectedAvailability === "" ||
  (selectedAvailability === "disponibile" && available) ||
  (selectedAvailability === "non disponibile" && !available);

return (
  matchesSearch &&
  matchesGenre &&
  matchesAvailability
);
```

});

if (selectedSort === "titolo") {

```
filtered.sort((a, b) =>
  normalize(a.TITOLO)
    .localeCompare(normalize(b.TITOLO))
);
```

}

if (selectedSort === "autore") {

```
filtered.sort((a, b) =>
  normalize(a.AUTORE)
    .localeCompare(normalize(b.AUTORE))
);
```

}

renderBooks(filtered);
}

/* ---------------- PREFERITI ---------------- */

function renderFavorites() {

favList.innerHTML = "";

const favorites =
getFavorites();

const favoriteBooks =
books.filter(book =>
favorites.includes(getBookId(book))
);

if (favoriteBooks.length === 0) {

```
favList.innerHTML =
  "<li>Nessun preferito.</li>";

return;
```

}

favoriteBooks.forEach(book => {

```
const li =
  document.createElement("li");

li.className =
  "book-item favorite-small";

li.innerHTML = `

  <div class="book-content">

    <h3>
      ${clean(book.TITOLO)}
    </h3>

    <p>
      ${clean(book.AUTORE)}
    </p>

  </div>

  <img
    class="book-cover small-cover"
    src="${getBookCover(book)}"
    alt="Copertina"
    onerror="this.src='https://placehold.co/80x120?text=No+Cover'"
  >
`;

favList.appendChild(li);
```

});
}

/* ---------------- MENSOLA DEL PROF ---------------- */

function renderRecommendedBooks() {

recommendedList.innerHTML = "";

const recommendedBooks =
books.filter(book => {

```
  const value =
    normalize(book.CONSIGLIATO);

  return (
    value === "si" ||
    value === "sì" ||
    value === "yes"
  );
});
```

if (recommendedBooks.length === 0) {

```
recommendedList.innerHTML =
  "<li>Nessun libro consigliato.</li>";

return;
```

}

recommendedBooks.forEach(book => {

```
recommendedList.appendChild(
  createBookCard(book)
);
```

});
}

/* ---------------- CARICAMENTO CSV ---------------- */

function loadBooks() {

Papa.parse(sheetURL, {

```
download: true,

header: true,

skipEmptyLines: true,

complete: function(results) {

  books = results.data;

  populateGenres();

  renderBooks(books);

  renderFavorites();

  renderRecommendedBooks();

  input.addEventListener(
    "input",
    applyFilters
  );

  genreFilter.addEventListener(
    "change",
    applyFilters
  );

  availabilityFilter.addEventListener(
    "change",
    applyFilters
  );

  sortFilter.addEventListener(
    "change",
    applyFilters
  );
},

error: function(error) {

  console.error(error);

  resultsList.innerHTML =
    "<li>Errore nel caricamento del catalogo.</li>";
}
```

});
}

loadBooks();

/* ---------------- MENSOLA TOGGLE ---------------- */

const mensolaButton =
document.getElementById(
"toggle-mensola-prof"
);

const mensolaSection =
document.getElementById(
"mensola-prof"
);

if (mensolaButton && mensolaSection) {

mensolaButton.addEventListener(
"click",
function () {

```
  mensolaSection.classList.toggle("open");

}
```

);
}
