const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQwD-BejuTnjtnrQjm8nq45yUMnPlpqdVCNtN966RAOOQdRhDyBCJMcfjaHdBJDV2UmKNcCt_goyH5S/pub?output=csv";

const resultsList = document.getElementById("results");
const counter = document.getElementById("counter");

resultsList.innerHTML = "<li class='book-item'>Caricamento catalogo...</li>";

Papa.parse(sheetURL, {
  download: true,
  header: true,
  skipEmptyLines: true,

  complete: function(results) {
    const books = results.data;

    console.log("Libri caricati:", books);

    resultsList.innerHTML = "";
    counter.textContent = books.length + " libri trovati";

    books.forEach(book => {
      const li = document.createElement("li");
      li.classList.add("book-item");

      li.innerHTML = `
        <div class="book-main">
          <strong>${book.TITOLO || "Titolo mancante"}</strong>
          ${book.AUTORE || "Autore mancante"} – ${book.EDITORE || ""}, ${book.LUOGO || ""} (${book.ANNO || ""})<br>
          <em>${book.GENERE || ""}</em> | ISBN: ${book.ISBN || ""}<br>
          Disponibilità: ${book.DISPONIBILITA || ""}
        </div>
      `;

      resultsList.appendChild(li);
    });
  },

  error: function(error) {
    console.error("Errore CSV:", error);
    resultsList.innerHTML = "<li class='book-item'>Errore nel caricamento del catalogo.</li>";
  }
});  transition: box-shadow 0.2s ease, background 0.2s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
  position: relative;
}
