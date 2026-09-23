# Bill of Supply Generator

A simple offline-friendly website for VS Code.

## Run
1. Extract this folder.
2. Open the folder in VS Code.
3. Open `index.html` with Live Server, or double-click `index.html`.
4. Edit any field directly on the bill.
5. Use `+ Add Item` to add more rows.
6. Click `Download PDF` to save an A4 PDF.

## Notes
- The PDF is generated from the edited page and is intended to look like the A4 template.
- The generated PDF is a flattened document (the browser fields are editable before export, not as form fields inside the PDF).
- PDF generation uses jsPDF and html2canvas from CDN, so internet access may be required when first generating the PDF.
- To make it fully offline, download those two libraries locally and change the `<script>` paths in `index.html`.
