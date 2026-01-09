const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQwD-BejuTnjtnrQjm8nq45yUMnPlpqdVCNtN966RAOOQdRhDyBCJMcfjaHdBJDV2UmKNcCt_goyH5S/pub?output=csv";

Papa.parse(sheetURL, {
download: true,
header: true,
skipEmptyLines: true,
complete: function (results) {
const books = results.data;

const input = document.getElementById("search");
const resultsList = document.getElementById("results");

input.addEventListener("input", () => {
const query = input.value.toLowerCase().trim();
resultsList.innerHTML = "";

if (query === "") return;

const filtered = books.filter(book =>
(book.TITOLO || "").toLowerCase().includes(query) ||
(book.AUTORE || "").toLowerCase().includes(query) ||
(book.GENERE || "").toLowerCase().includes(query) ||
(book.EDITORE || "").toLowerCase().includes(query) ||
(book.ISBN || "").toLowerCase().includes(query)
);

if (filtered.length === 0) {
resultsList.innerHTML = "<li>Nessun risultato</li>";
return;
}

filtered.forEach(book => {
const li = document.createElement("li");
li.classList.add("book-item");

const raw = (book.DISPONIBILITA || "").toString().trim().toLowerCase();
const isDisponibile = raw === "disponibile";

li.classList.add(isDisponibile ? "disponibile-border" : "non-disponibile-border");

const disponibilitaClass = isDisponibile ? "disponibile" : "non-disponibile";
const abstractText = (book.ABSTRACT || "").trim();

li.innerHTML = `
<div class="book-main">
   <strong>${book.TITOLO}</strong>
   ${book.AUTORE} – ${book.EDITORE}, ${book.LUOGO} (${book.ANNO})<br>
      <em>${book.GENERE}</em> | ISBN: ${book.ISBN}<br>
         Disponibilità:
         <span class="disponibilita ${disponibilitaClass}">
            ${book.DISPONIBILITA}
         </span>
</div>
<div class="book-abstract">
   <p>${abstractText || "Abstract non disponibile."}</p>
</div>
`;

li.addEventListener("click", () => {
const isOpen = li.classList.contains("open");
document.querySelectorAll(".book-item.open").forEach(item => item.classList.remove("open"));
if (!isOpen) li.classList.add("open");
});

resultsList.appendChild(li);
});
});
},
error: function (err) {
console.error("Errore nel leggere il CSV:", err);
}
});
