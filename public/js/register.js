document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('errorMsg');
  errorEl.classList.remove('show');

  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    });
    saveSession(data.token, data.user);
    window.location.href = 'index.html';
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.add('show');
  }
});
