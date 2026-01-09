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
    }

    function createBookCard(book) {
      const li = document.createElement("li");
      li.classList.add("book-item");

      const raw = (book.DISPONIBILITA || "").toString().trim().toLowerCase();
      const isDisponibile = raw === "disponibile";
      li.classList.add(isDisponibile ? "disponibile-border" : "non-disponibile-border");
      const disponibilitaClass = isDisponibile ? "disponibile" : "non-disponibile";
      const abstractText = (book.ABSTRACT || "").trim();

      const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
      const isFav = favorites.includes(book.ISBN);
      const favHeart = isFav ? "💖" : "❤️";

      li.innerHTML = `
        <div class="book-main">
          <strong>${book.TITOLO}</strong>
          ${book.AUTORE} – ${book.EDITORE}, ${book.LUOGO} (${book.ANNO})<br>
          <em>${book.GENERE}</em> | ISBN: ${book.ISBN}<br>
          Disponibilità:
          <span class="disponibilita ${disponibilitaClass}">${book.DISPONIBILITA}</span>
          <button class="fav-btn" data-id="${book.ISBN}">${favHeart}</button>
        </div>
        <div class="book-abstract">
          <p>${abstractText || "Abstract non disponibile."}</p>
        </div>
      `;

      li.addEventListener("click", (e) => {
        if (e.target.classList.contains("fav-btn")) return;
        const isOpen = li.classList.contains("open");
        document.querySelectorAll(".book-item.open").forEach(item => item.classList.remove("open"));
        if (!isOpen) li.classList.add("open");
      });

      li.querySelector(".fav-btn").addEventListener("click", (e) => {
        e.stopPropagation(); // evita toggle abstract
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

    // Renderizza tutti i libri all’avvio
    function renderBooks(list) {
      resultsList.innerHTML = "";
      list.forEach(book => resultsList.appendChild(createBookCard(book)));
    }

    renderBooks(books); // iniziale
    renderFavorites(); // iniziale

    // Ricerca live
    input.addEventListener("input", () => {
      const query = input.value.toLowerCase().trim();
      const filtered = books.filter(book =>
        (book.TITOLO || "").toLowerCase().includes(query) ||
        (book.AUTORE || "").toLowerCase().includes(query) ||
        (book.GENERE || "").toLowerCase().includes(query) ||
        (book.EDITORE || "").toLowerCase().includes(query) ||
        (book.ISBN || "").toLowerCase().includes(query)
      );
      renderBooks(filtered);
    });
  },

  error: function (err) {
    console.error("Errore nel leggere il CSV:", err);
  }
});
