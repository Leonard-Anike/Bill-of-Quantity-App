// This script is for metric conversion 

// Eventlistener
document.addEventListener ("click", function(e) {
    if (e.target.id === "conversion-btn")
        handleConversion()
})

// Function that handles the conversion logic
function handleConversion() {
    const input = document.getElementById("input").value
    if (input) {
        const conversion1 = ` ${input} feet  =  ${ Number((input) / 3.28084).toFixed(2)} metre`
        const conversion2 = ` ${input} metre  =  ${ Number((input) * 3.28084).toFixed(2)} feet`
        document.getElementById("display-metre").value = conversion1
        document.getElementById("display-feet").value = conversion2
    }
}

// For saving inputs to sessionStorage 
document.querySelectorAll("input").forEach (input => {
    input.addEventListener("input", () => {
        sessionStorage.setItem(input.name || input.id, input.value)
    })
})

// For retrieving inputs after page reloads as long as session has not been closed
window.addEventListener ("load", function() {
    document.querySelectorAll("input").forEach (input => {
        const key = input.name || input.id
        const savedValue = sessionStorage.getItem(key)
        if (savedValue !== null) {
            input.value = savedValue
        }
        handleConversion()
    })
})