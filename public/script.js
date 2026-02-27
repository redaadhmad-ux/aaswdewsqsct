const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');
if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
}

const form = document.querySelector('#contact-form');
if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const notice = document.querySelector('#form-notice');

    const payload = Object.fromEntries(new FormData(form).entries());
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    notice.textContent = '';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        notice.textContent = result.errors?.[0] || result.message || 'Submission failed. Please try again.';
        notice.style.color = '#8B0000';
      } else {
        notice.textContent = result.message;
        notice.style.color = '#228B22';
        form.reset();
      }
    } catch (error) {
      notice.textContent = 'Connection issue. Please try again shortly.';
      notice.style.color = '#8B0000';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Inquiry';
    }
  });
}
