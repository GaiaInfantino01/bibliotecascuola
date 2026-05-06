
const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQwD-BejuTnjtnrQjm8nq45yUMnPlpqdVCNtN966RAOOQdRhDyBCJMcfjaHdBJDV2UmKNcCt_goyH5S/pub?output=csv";

/* RESET */
* { box-sizing: border-box; }

/* BODY */
body {
  font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  background-color: #fafafa;
  color: #222;
  margin: 0;
}

/* HEADER */
.site-header { width: 100%; background: #000; }
.site-header img { width: 100%; height: auto; display: block; }

/* CONTENITORE */
.container { max-width: 900px; margin: 30px auto; padding: 0 20px; }

/* SEARCH */
#search { width: 100%; padding: 14px 16px; font-size: 16px; border: 1px solid #ccc; border-radius: 8px; margin-bottom: 8px; }
#search:focus { outline: none; border-color: #2a5db0; box-shadow: 0 0 0 2px rgba(42, 93, 176, 0.15); }

/* LISTE */
#results, #favorites-list { list-style: none; padding: 0; margin: 0 0 20px 0; }

/* CARD LIBRO */
.book-item {
  background: #fff;
  border-left: 6px solid #ccc;
  border-radius: 8px;
  padding: 16px 18px;
  margin-bottom: 14px;
  cursor: pointer;
  transition: box-shadow 0.2s ease, background 0.2s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
  position: relative;
}
