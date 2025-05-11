// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 70, // Adjust for navbar height
                behavior: 'smooth'
            });
        }
    });
});

// Form handling for the CTA form
document.querySelector('.cta-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get the email value
    const email = this.querySelector('input[type="email"]').value;
    
    // Store email in localStorage to potentially use in signup form
    if (email) {
        localStorage.setItem('flashlearn_email', email);
    }
    
    // Redirect to signup page
    window.location.href = 'signup.html';
});