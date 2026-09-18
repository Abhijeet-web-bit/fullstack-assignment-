document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('errorMsg');
  errorEl.classList.remove('show');

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    saveSession(data.token, data.user);
    window.location.href = 'index.html';
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.add('show');
  }
});
