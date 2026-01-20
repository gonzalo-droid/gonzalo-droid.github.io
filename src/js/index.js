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

// Back to Top Button functionality
const backToTop = document.getElementById('backToTop');

if (backToTop) {
    // Show/hide button on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.classList.add('active');
        } else {
            backToTop.classList.remove('active');
        }
    });

    // Scroll to top on click
    backToTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Image Lightbox functionality
function openImageLightbox(imageSrc) {
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImage = document.getElementById('lightboxImage');

    if (lightbox && lightboxImage) {
        lightboxImage.src = imageSrc;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeImageLightbox() {
    const lightbox = document.getElementById('imageLightbox');

    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close lightbox with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeImageLightbox();
    }
});
