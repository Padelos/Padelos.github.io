
function openPDF(element){
    const pdfDisplay = document.getElementById("pdfDisplay");
    const pdfViewer = document.getElementById("pdfViewer");
    pdfDisplay.src = element.getAttribute("data-pdf");
    pdfViewer.style.display = "flex";
    console.log(`this came ${element.getAttribute("data-pdf")}`);
}

function closePDF(event){
    const pdfViewer = document.getElementById("pdfViewer");
    pdfViewer.style.display = "none";
}