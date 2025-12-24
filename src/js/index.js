document.addEventListener('DOMContentLoaded', () => {
    const openPdfLink = document.getElementById('openPdfLink');
    
    openPdfLink.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent the default anchor behavior
        
        const drivePdfUrl = 'https://drive.google.com/file/d/FILE_ID/view?usp=sharing'; // Replace FILE_ID with your actual file ID
        
        // Open the PDF in a new tab
        window.open(drivePdfUrl, '_blank');
    });
});

document.getElementById("year").textContent = new Date().getFullYear();
