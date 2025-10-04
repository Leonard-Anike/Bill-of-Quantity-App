// This scripts display the quotation saved to the localstorage
// It offers delete function for deleting the saved quotation
// It also offers download function for downloading the saved quotation using js auto-table

// Function that displays quotation save
const messageDiv = document.getElementById("message");
function displayQuotation() {
    const viewModeContainer = document.querySelector(".view-mode");
    const savedQuotation = JSON.parse(localStorage.getItem("savedQuotationArray")) || [];

    viewModeContainer.innerHTML = "";

    if (savedQuotation.length === 0) {
        messageDiv.innerHTML = "<p> No bill of quantity found.</p>";
        return;
    }

    // This Shows newest first
    savedQuotation.sort((a, b) => b.savedAt - a.savedAt);

    viewModeContainer.innerHTML = savedQuotation.map((item) => {
        messageDiv.style.display = "none";

        // Formatting date to Nigerian format
        const date = new Date(item.savedAt).toLocaleString();

        // This builds table rows
    
        const rows = item.quotation.map((row, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${row.itemName}</td>
                <td>${row.qty}</td>
                <td>${row.unitPrice.toLocaleString()}</td>
                <td>${row.itemTotalPrice.toLocaleString()}</td>
            </tr>
        `).join("");

        return `
            <div class="quotation-container">
                <div class="letterheader">
                    <img src="image/NNAMENE LH.jpg" alt="Letterhead" />
                </div>
                <div class="saved-quotation">
                    
                    <h3 id="client-name"> ${item.clientName || "N/A"}</h3>
                    <p id="date"><strong> Saved on:</strong> ${date}</p>
                    
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>S/N</th>
                                    <th>Item</th>
                                    <th>Qty</th>
                                    <th>Unit Price (₦)</th>
                                    <th>Total Price (₦)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rows}
                            </tbody>
                        </table>
                    </div>

                    <div class="summary">
                        <div class="total-el"> 
                            <p><strong>Total Quantity: </strong></p>
                            <p><span> ${item.totalQuantity.toLocaleString()} </span></p>
                        </div>
                        <div class="total-el"> 
                            <p><strong>Total Price: </strong></p>
                            <p><span> #${item.itemTotalPrice.toLocaleString()} </span></p>
                        </div>
                    </div>
                    <div class="action-btn">
                        <button 
                            aria-label="Delete Saved Bill" 
                            class="delete-quotation-btn"
                            data-id="${item.id}">
                            <i class="fa-solid fa-trash"></i> 
                            Delete
                        </button>
                        <button 
                            aria-label="Download PDF" 
                            class="download-quotation-btn" 
                            data-id="${item.id}"> 
                            <i class="fa-solid fa-download"></i> 
                            Download PDF
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

// Event listeners for delete and download btn
document.addEventListener ("click", function(e) {
    const deleteBtn = e.target.closest(".delete-quotation-btn")
    if (deleteBtn) {
        if (!confirm("Are you sure you want to delete this quotation?")) return
        const id = Number(deleteBtn.dataset.id)
        deleteQuotation(id)
    }

    const downloadBtn = e.target.closest(".download-quotation-btn")
    if (downloadBtn) {
        if (!confirm("Are you sure you want to download this quotation?")) return
        const id = Number(downloadBtn.dataset.id)
        downloadQuotation(id)    
    }
})


// Function to delete quotation

function deleteQuotation(id) {
    let savedQuotations = JSON.parse(localStorage.getItem("savedQuotationArray")) || [] 
        savedQuotations = savedQuotations.filter(item => item.id !== id)
        localStorage.setItem("savedQuotationArray", JSON.stringify(savedQuotations))
        displayQuotation()
    if (savedQuotations.length === 0) {
        messageDiv.style.display = "block";
    }
}

// Function to download quotation as PDF using js auto-table

function downloadQuotation(id) {
    const savedQuotations = JSON.parse(localStorage.getItem("savedQuotationArray")) || [];
    const q = savedQuotations.find(item => item.id === id);

    if (!q) {
        console.error("Quotation not found for id:", id);
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("DejaVuSans", "normal");

     // This loads and adds letterhead image
    let img = new Image();
    img.src = "image/NNAMENE LH.jpg";
    img.onload = function () {
    // This adds image at top (x=0, y=0, width=210)
    doc.addImage(img, "JPEG", 0, 0, 210, 50);

    // This defines max width (pageWidth - margins)
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const maxWidth = pageWidth - margin * 2;
    
    // This prints Date in Nigerian format at top right
    doc.setFontSize(11);
    doc.setTextColor("#000000");
    function formatDate (dateInput) {
        const date = new Date(dateInput);
        
        const day = date.toLocaleString("en-NG", { day: "2-digit" });
        const month = date.toLocaleString("en-NG", { month: "long" });
        const year = date.getFullYear();

        return `${day} ${month}, ${year}`;
    }
    const dateWidth = doc.getTextWidth(formatDate(new Date()));
    doc.text(`${formatDate(new Date())}`, pageWidth - 14 - dateWidth, 45);

    // This prints Header
    doc.setFontSize(18);
    doc.setTextColor("#00695C");
    doc.text("BILL OF QUANTITY", pageWidth / 2, 68, { align: "center" });

    // This splits client name into multiple lines and prints it
    doc.setFontSize(13);
    doc.setTextColor("#359c3a");
    const billDescription = doc.splitTextToSize(`${q.clientName || "N/A"}`, maxWidth );
    doc.text(billDescription, pageWidth / 2, 82, { align: "center" });

    // This calculates client name lineheight for table auto adjustment
    let lineHeight;
    if (typeof doc.getTextDimensions === "function") {
        lineHeight = doc.getTextDimensions("Ay").h;
    } else {
        lineHeight = 13 * 1.15;
    }

    // Variable declaration of where table will be printed from vertically after client name
    let nextY = 82 + billDescription.length * lineHeight + 8;

    // Table data
    const tableData = q.quotation.map((item, index) => [
        index + 1,
        item.itemName,
        item.qty,
        item.unitPrice.toLocaleString(),
        item.itemTotalPrice.toLocaleString()
    ]);

    // This prints the table
    doc.autoTable({
        startY: nextY,
        head: [["S/N", "Item", "Qantity", "Unit Price (#)", "Total Price (#)"]],
        body: tableData,
        theme: "grid",
        styles: { 
            font: "DejaVuSans", 
            fontSize: 10, 
            textColor: "#000000", 
            fillColor: "#FFFFFF", 
            cellPadding: 3,  
            overflow: "linebreak",
            lineColor: "#000000", 
            lineWidth: 0.4, 
            halign: "center"
        },
        headStyles: { 
            fontSize: 14, 
            fontStyle: "bold", 
            fillColor: "#1a9666", 
            textColor: "#FFFFFF" 
        },
        bodyStyles: { fontStyle: "bold", fontSize: 11},
        alternateRowStyles: { fillColor: "#F5F5F5" },
        columnStyles: { 
            0 : { cellWidth: "auto", minCellWidth: 15 }, 
            1 : { cellWidth: "auto" },
            2 : { cellWidth: "auto", minCellWidth: 25 }, 
            3 : { cellWidth: "auto", minCellWidth: 39 }, 
            4 : { cellWidth: "auto", minCellWidth: 43 } 
            }
    });


    // Summary
    let finalY = doc.lastAutoTable.finalY + 10;
    if (finalY > 260) {
        doc.addPage();
        finalY = 20;
    }


/** 
     * Draws a label and a value either side-by-side or right-aligned.
     * 
     * @param {jsPDF} doc - The jsPDF document
     * @param {string} label - The label text (e.g., "Total Price:")
     * @param {string} value - The value text (e.g., "₦250,000")
     * @param {number} x - X position (left margin)
     * @param {number} y - Y position (vertical placement)
     * @param {"inline"|"right"} align - Layout mode ("inline" places value next to label, "right" aligns it to right margin)
     * @param {number} pageWidth - PDF width in mm (default A4 = 210)
     * @param {number} marginRight - Right margin in mm (default = 14)
 */

function drawLabelValue(doc, label, value, x, y, align = "inline", pageWidth = 210, marginRight = 14) {
  // Label
  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(14);
  doc.setTextColor("#0D47A1");
  doc.text(label, x, y);

  // Value
  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(12);
  doc.setTextColor("#000000");

  if (align === "inline") {
    // This Places value right after label
    const labelWidth = doc.getTextWidth(label);
    doc.text(value, x + labelWidth + 10, y);
  } else if (align === "right") {
    // This Aligns value to right margin
    const valueWidth = doc.getTextWidth(value);
    doc.text(value, pageWidth - marginRight - valueWidth, y);
  }
}

const NAIRA = "\u20A6";

// Right-aligned layout
drawLabelValue(doc, "Total Quantity:", q.totalQuantity.toLocaleString(), 14, finalY + 10, "right");
drawLabelValue(doc, "Total Price:", `${NAIRA}${q.itemTotalPrice.toLocaleString()}`, 14, finalY + 20, "right");

// This saves the pdf with the client name
const filename = `${(q.clientName || "quotation").replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}_Quotation.pdf`;
doc.save(filename);

}}

// Initial call to display any saved quotations when the page loads
displayQuotation()