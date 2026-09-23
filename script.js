const itemsBody = document.getElementById("itemsBody");
const addItemBtn = document.getElementById("addItemBtn");
const pdfBtn = document.getElementById("pdfBtn");
const printBtn = document.getElementById("printBtn");
const toast = document.getElementById("toast");

function money(n) {
  return "₹ " + Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function parseNumber(text) {
  const cleaned = String(text || "").replace(/[₹,\s]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function updateTotals() {
  let total = 0;
  const rows = [...itemsBody.querySelectorAll("tr.item-row")];

  rows.forEach((row, i) => {
    row.querySelector(".item-no").textContent = i + 1;
    const qty = parseNumber(row.querySelector(".qty-cell")?.textContent);
    const price = parseNumber(row.querySelector(".price-cell")?.textContent);
    const amount = qty * price;
    row.querySelector(".amount-cell").textContent = amount.toFixed(2);
    total += amount;
  });

  document.getElementById("itemsTotal").textContent = total.toFixed(2);
  document.getElementById("subtotal").textContent = money(total);
  document.getElementById("grandTotal").textContent = money(total);

  const received = parseNumber(document.getElementById("received").textContent);
  document.getElementById("balance").textContent = money(total - received);
}

function renumber() {
  [...itemsBody.querySelectorAll("tr.item-row")].forEach((row, i) => {
    row.querySelector(".item-no").textContent = i + 1;
  });
}

addItemBtn.addEventListener("click", () => {
  const row = document.createElement("tr");
  row.className = "item-row";
  row.innerHTML = `
    <td class="center item-no"></td>
    <td class="editable" contenteditable="true">ITEM NAME</td>
    <td class="editable center qty-cell" contenteditable="true">1</td>
    <td class="editable center" contenteditable="true">UNIT</td>
    <td class="editable right price-cell" contenteditable="true">0.00</td>
    <td class="right amount-cell">0.00</td>
  `;
  const totalRow = itemsBody.querySelector(".total-row");
  itemsBody.insertBefore(row, totalRow);
  renumber();
  updateTotals();
  row.querySelector("td:nth-child(2)").focus();
});

itemsBody.addEventListener("input", (e) => {
  if (e.target.closest(".item-row") || e.target.id === "received") updateTotals();
});

document.getElementById("received").addEventListener("input", updateTotals);

printBtn.addEventListener("click", () => window.print());

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

pdfBtn.addEventListener("click", async () => {
  updateTotals();
  showToast("PDF is being prepared...");

  const { jsPDF } = window.jspdf;
  const page = document.getElementById("invoice");

  // Clone the invoice so PDF rendering does not change the live page.
  const clone = page.cloneNode(true);
  clone.style.margin = "0";
  clone.style.boxShadow = "none";
  clone.style.position = "fixed";
  clone.style.left = "-10000px";
  clone.style.top = "0";
  clone.style.width = "210mm";
  clone.style.minHeight = "297mm";
  document.body.appendChild(clone);

  // Remove hover/focus effects in the PDF clone.
  clone.querySelectorAll(".editable").forEach(el => {
    el.style.background = "transparent";
    el.style.boxShadow = "none";
  });

  try {
    const canvas = await html2canvas(clone, {
      scale: 2.2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.96);
    const pageWidth = 210;
    const pageHeight = 297;
    const imgWidth = pageWidth;
    const imgHeight = canvas.height * imgWidth / canvas.width;

    // The template is designed to fit one A4 page.
    pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, Math.min(imgHeight, pageHeight));
    pdf.save("Bill_of_Supply.pdf");
    showToast("PDF downloaded successfully.");
  } catch (err) {
    console.error(err);
    showToast("PDF could not be created. Please try again.");
  } finally {
    clone.remove();
  }
});

updateTotals();
