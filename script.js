const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQwD-BejuTnjtnrQjm8nq45yUMnPlpqdVCNtN966RAOOQdRhDyBCJMcfjaHdBJDV2UmKNcCt_goyH5S/pub?output=csv";

const resultsList = document.getElementById("results");
const input = document.getElementById("search");
const counter = document.getElementById("counter");

let books = [];

function clean(value, fallback = "Non indicato") {
  if (value === undefined || value === null) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

function getCover(book) {
  const cover = clean(book.COPERTINA || book.Copertina || book.copertina, "");

  if (cover !== "") {
    return cover;
  }

  return "https://placehold.co/140x210?text=No+Cover";
}

function createBookCard(book) {
  const li = document.createElement("li");
  li.className = "book-item";

  li.innerHTML = `
    <div class="book-content">
      <h3>${clean(book.TITOLO, "Titolo mancante")}</h3>
      <p><strong>Autore:</strong> ${clean(book.AUTORE)}</p>
      <p><strong>Editore:</strong> ${clean(book.EDITORE)}</p>
      <p><strong>Anno:</strong> ${clean(book.ANNO)}</p>
      <p><strong>Genere:</strong> ${clean(book.GENERE)}</p>
      <p><strong>ISBN:</strong> ${clean(book.ISBN)}</p>
    </div>

    <img 
      class="book-cover"
      src="${getCover(book)}"
      alt="Copertina"
      onerror="this.src='https://placehold.co/140x210?text=No+Cover'"
    >
  `;

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
  const query = input.value.toLowerCase();

  const filtered = books.filter(book => {
    return Object.values(book).join(" ").toLowerCase().includes(query);
  });

  renderBooks(filtered);
}

Papa.parse(sheetURL, {
  download: true,
  header: true,
  skipEmptyLines: true,

  complete: function(results) {
    books = results.data.filter(book => clean(book.TITOLO, "") !== "");
    renderBooks(books);

    if (input) {
      input.addEventListener("input", searchBooks);
    }
  },

  error: function(error) {
    console.error(error);
    resultsList.innerHTML = "<li>Errore nel caricamento del catalogo.</li>";
  }
});
