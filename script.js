const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQwD-BejuTnjtnrQjm8nq45yUMnPlpqdVCNtN966RAOOQdRhDyBCJMcfjaHdBJDV2UmKNcCt_goyH5S/pub?output=csv";

Papa.parse(sheetURL, {
  download: true,
  header: true,
  skipEmptyLines: true,

  complete: function (results) {
    const books = results.data;

    const input = document.getElementById("search");
    const resultsList = document.getElementById("results");
    const favList = document.getElementById("favorites-list");

    const genreFilter = document.getElementById("genre-filter");
    const availabilityFilter = document.getElementById("availability-filter");
    const sortFilter = document.getElementById("sort-filter");
    const counter = document.getElementById("counter");

    function normalize(value) {
      return (value || "").toString().trim().toLowerCase();
    }

    function renderFavorites() {
      favList.innerHTML = "";
      const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

      books.forEach(book => {
        if (favorites.includes(book.ISBN)) {
          const li = document.createElement("li");
          li.textContent = `${book.TITOLO} – ${book.AUTORE}`;
          favList.appendChild(li);
        }
      });

      if (favorites.length === 0) {
        const li = document.createElement("li");
        li.textContent = "Nessun libro preferito.";
        favList.appendChild(li);
      }
    }

    function createBookCard(book) {
      const li = document.createElement("li");
      li.classList.add("book-item");

      const rawDisponibilita = normalize(book.DISPONIBILITA);
      const isDisponibile = rawDisponibilita === "disponibile";

      li.classList.add(isDisponibile ? "disponibile-border" : "non-disponibile-border");

      const disponibilitaClass = isDisponibile ? "disponibile" : "non-disponibile";
      const abstractText = (book.ABSTRACT || "").trim();

      const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
      const isFav = favorites.includes(book.ISBN);
      const favHeart = isFav ? "💖" : "❤️";

      li.innerHTML = `
        <div class="book-main">
          <strong>${book.TITOLO || "Titolo non disponibile"}</strong>
          ${book.AUTORE || "Autore non disponibile"} – ${book.EDITORE || ""}, ${book.LUOGO || ""} (${book.ANNO || "s.d."})<br>
          <em>${book.GENERE || "Genere non indicato"}</em> | ISBN: ${book.ISBN || "non disponibile"}<br>
          Disponibilità:
          <span class="disponibilita ${disponibilitaClass}">${book.DISPONIBILITA || "Non indicata"}</span>
          <button class="fav-btn" data-id="${book.ISBN}">${favHeart}</button>
        </div>

        <div class="book-abstract">
          <p>${abstractText || "Abstract non disponibile."}</p>
        </div>
      `;

      li.addEventListener("click", (e) => {
        if (e.target.classList.contains("fav-btn")) return;

        const isOpen = li.classList.contains("open");

        document
          .querySelectorAll(".book-item.open")
          .forEach(item => item.classList.remove("open"));

        if (!isOpen) li.classList.add("open");
      });

      li.querySelector(".fav-btn").addEventListener("click", (e) => {
        e.stopPropagation();

        let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        const bookId = e.target.dataset.id;

        if (favorites.includes(bookId)) {
          favorites = favorites.filter(id => id !== bookId);
          e.target.textContent = "❤️";
        } else {
          favorites.push(bookId);
          e.target.textContent = "💖";
        }

        localStorage.setItem("favorites", JSON.stringify(favorites));
        renderFavorites();
      });

      return li;
    }

    function populateGenres() {
      const genres = [...new Set(
        books
          .map(book => book.GENERE)
          .filter(genre => genre && genre.trim() !== "")
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
          normalize(book.GENERE).includes(query) ||
          normalize(book.EDITORE).includes(query) ||
          normalize(book.ISBN).includes(query);

        const matchesGenre =
          selectedGenre === "" || book.GENERE === selectedGenre;

        const matchesAvailability =
          selectedAvailability === "" ||
          normalize(book.DISPONIBILITA) === selectedAvailability;

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

    populateGenres();
    renderBooks(books);
    renderFavorites();

    input.addEventListener("input", applyFilters);
    genreFilter.addEventListener("change", applyFilters);
    availabilityFilter.addEventListener("change", applyFilters);
    sortFilter.addEventListener("change", applyFilters);
  },

  error: function (err) {
    console.error("Errore nel leggere il CSV:", err);
  }
});
