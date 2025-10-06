// This script takes inputs froms the input fields and renders them on a table as quotation
// It renders the total quantity and total price of the quotation 
// It equally stores the input on a local storage and seesion storage

// Variable declaration
const messageDiv = document.getElementById("new-bill-message")
const quotationContainer = document.getElementById("quotation-container")
const clientInputName = document.getElementById("client-input-name")
const textArea = document.getElementById("textarea") 
const itemQuantity = document.getElementById("item-quantity") 
const unitPrice = document.getElementById("unit-price") 
// const sendBtn = document.getElementById("send-quotation")
let quotationHtml = "" 
let quotationArray = []

// Eventlisteners for deleting row, quotation, and saving quotation to the local storage
document.addEventListener("click", function(e){
    if (e.target.dataset.delete !== undefined) {
        const index = parseInt(e.target.dataset.delete)
        if (!isNaN(index)){
        deleteRow(index)
        }
    } 
    if (e.target.closest("#send-quotation")) {
        updateTable()
    }

    if (e.target.closest("#save-quotation")) {
        saveQuotation()
    }
    if (e.target.closest ("#delete-quotation")) {
        deleteQuotation()
    }
})

// For scrolling of the quotation table
quotationContainer.insertAdjacentHTML ("afterbegin", quotationHtml)
quotationContainer.scrollTop = quotationContainer.scrollHeight

// For flexibility of the textarea to enhance the UI
const textAreas = document.querySelectorAll ("#textarea, #client-input-name")
    textAreas.forEach(textArea => {
        const minHeight = parseFloat(getComputedStyle(textArea).minHeight) || textArea.offsetHeight
        textArea.dataset.minHeight = minHeight

        // Auto-resize the textarea
        textArea.addEventListener("input", () => {

            textArea.style.height = minHeight + "px"
            const newHeight = Math.min(textArea.scrollHeight, 50)
            textArea.style.height = Math.max(newHeight,minHeight) + "px"
        })

        textArea.addEventListener("focus", () => { 
            let scrolled = false

            const scrollToView = () => {
                textArea.scrollIntoView({ behavior: "smooth", block: "center" })
                scrolled = true
            }

            requestAnimationFrame(scrollToView)

            setTimeout(() => {
                if (!scrolled) scrollToView()
                }, 300)
        })
    })

    // For scrolling the textarea into view when focused
    // textAreas.forEach (textArea => {
    //     textArea.addEventListener ("focus", () => { 
    //         requestAnimationFrame(() => {
    //             textArea.scrollIntoView({
    //                 behavior: "smooth", 
    //                 block: "center", 
    //                 inline: "nearest"
    //             })
    //         })
    //     })
    // })

// Display message if there is no item in the quotationArray
function checkQuotationArray() {
    if (quotationArray.length === 0) {
        messageDiv.style.display = "block"
        messageDiv.innerHTML = `
            <p> No bill of quantity yet!</p>
            <p id="message2"> Please prepare new bill. </p>
        `;
        return;
    } else if (quotationArray.length !== 0) {
        messageDiv.innerHTML = "";
        return;
    }
}

checkQuotationArray()

// Function for adding items to the quotationArray if the item doesn't exist
function addItem() {
    const clientName = clientInputName.value.trim()
    const itemName = textArea.value.trim()
    const qtyMatch = itemQuantity.value.match(/\d+(\.\d+)?/)
    const qtyMatchReturned = qtyMatch ? parseFloat(qtyMatch[0]) : 1
    const qty = itemQuantity.value
    const price = parseFloat(unitPrice.value)

    if (clientName && itemName && !isNaN(price)) {
        quotationArray.push ({
            clientName : clientName,
            itemName: itemName,
            qty: qty,
            qtyMatchReturned: qtyMatchReturned,
            unitPrice: price,
            itemTotalPrice: qtyMatchReturned * price
        })
        checkQuotationArray()
        renderQuotation()
    }
}

// Function that adds the inputs on their respective columns on the table element
// It equally gets the summary; both for total quantity and price
function getQuotation() {
    let totalQuantity = 0
    let totalPrice = 0

    // looping through the array to get the client name
    quotationArray.map((item) =>{
        quotationHtml = ` 
            <div class="quotation-area">
            <div>
                <p id="client-name"> ${item.clientName} </p>
            </div>`
    }).join('')

    // Table section
    quotationHtml += `
        <div class="table-container">
            <table id="table">
                <thead>
                    <tr>
                        <th> S/N </th>
                        <th> Item </th>
                        <th> Qty </th>
                        <th> Unit <span> Price(#) </span> </th>
                        <th> Total <span> Price(#) </span> </th>
                        <th id="delete-column"> Del </th>
                    </tr>
                </thead>
                <tbody>
    `
    // looping through the array to get each item on its respective column
    quotationArray.forEach((item, index) =>{
        const {itemTotalPrice} = item
        totalPrice += itemTotalPrice
        quotationHtml += `
            <tr> 
                <td> ${index + 1} </td>
                <td> ${item.itemName} </td>
                <td> ${item.qty} </td>
                <td> ${item.unitPrice.toLocaleString()} </td>
                <td> ${item.itemTotalPrice.toLocaleString()} </td>
                <td><button data-delete=${index} class="delete-btn"> X </button></td>
            </tr>
        `
    })
    quotationHtml += `</tbody> </table> </div>`
    // looping through the array to get the total quantity
    quotationArray.forEach((item) => {
        const newQuantity = item.qtyMatchReturned
            totalQuantity += newQuantity
    })

    // Summary section
    quotationHtml += `
            <div class="summary">
                <button id="save-quotation"> <i class="fa-solid fa-file-lines"> </i> Save </button>
                <button id="delete-quotation"> <i class="fa-solid fa-trash"></i> Delete </button>
                <h4> Summary </h4> 
                <p class="total-el"> Total Quantity: <span class="total"> ${totalQuantity.toLocaleString()} <span> </p> 
                <p class="total-el"> Total Price: <span class="total"> #${totalPrice.toLocaleString()} <span> </p>
            </div>
        </div>
    `
    if (quotationArray.length === 0) {
        return ""
    }
    return quotationHtml
}

// Function that updates the table each time new row is to be added
function updateTable() {
    checkQuotationArray()
    addItem()
    renderQuotation()
}

// Function that deletes the row selected
function deleteRow(index) {
    if (!confirm("Are you sure you want to delete this item?")) return
    quotationArray.splice(index, 1)
    messageDiv.innerHTML = " "
    checkQuotationArray()
    renderQuotation()
}

// This takes the inputs value and saves them in the session sessionStorage
document.querySelectorAll("input, textarea").forEach (input => {
    input.addEventListener("input", () => {
        sessionStorage.setItem(input.name || input.id, input.value)
    })
})

// This gets the items saved in the session storage and displays them as long as the session has not been closed or ended 
window.addEventListener ("load", function() {
    const savedArray = sessionStorage.getItem("quotationArray")
    if (savedArray){
        quotationArray = JSON.parse(savedArray)
        checkQuotationArray()
        renderQuotation()
    }

    document.querySelectorAll("input, textarea").forEach (input => {
        const key = input.name || input.id
        const savedValue = sessionStorage.getItem(key)
        if (savedValue !== null) {
            input.value = savedValue
        }
    })
})

// This function saves the quotation to the local storage 
function saveQuotation() {

    if (quotationArray.length === 0) {
        alert("No items to save!");
        return;
    }

    // declaring a new object to hold the new quotation
    const newQuotation = {
        id: Date.now(),
        clientName: clientInputName.value.trim(),
        quotation: quotationArray.map(item => ({
            itemName: item.itemName,
            qty: item.qty,
            unitPrice: item.unitPrice,
            itemTotalPrice: item.itemTotalPrice
        })),

        totalQuantity: quotationArray.reduce((sum, i) => sum + parseFloat(i.qtyMatchReturned || 0), 0),
        itemTotalPrice: quotationArray.reduce((sum, i) => sum + i.itemTotalPrice, 0),
        savedAt: Date.now()
    };

    const existingQuotation = JSON.parse(localStorage.getItem("savedQuotationArray")) || [];

    // Preventing duplicate saving of the quotation
    const lastQuotation = existingQuotation[existingQuotation.length - 1]
    if (lastQuotation && JSON.stringify(lastQuotation.quotation) === JSON.stringify(newQuotation.quotation)) {
        alert ("Bill of quantity already saved! No changes made.");
        return;
    }

    if (!confirm("Are you sure you want to save this bill of quantity?")) return;

    existingQuotation.push(newQuotation);

    localStorage.setItem("savedQuotationArray", JSON.stringify(existingQuotation));
    alert("Quotation saved!");
}


// Function that deletes the entire quotation, clear the Dom, quotationArray and the input fields
// It also clears the session storage and resets the height of the textareas
function deleteQuotation() {
    if (!confirm("Are you sure you want to delete this quotation?")) return
    quotationArray = []
    quotationHtml = ""
    quotationContainer.innerHTML = ""
    sessionStorage.clear()
    clientInputName.value = ""
    itemQuantity.value = ""
    unitPrice.value = ""
    textArea.value = ""

    textAreas.forEach(textArea => {
        textArea.style.height = textArea.dataset.minHeight + "px"
    })

    checkQuotationArray()
    renderQuotation()
}

// Function the renders the quotation to the Dom and saves it to the session storage
function renderQuotation() {
    quotationContainer.innerHTML = getQuotation()
    sessionStorage.setItem("currentQuotation", getQuotation())
    sessionStorage.setItem("quotationArray", JSON.stringify(quotationArray))
}