function notFoundHandler(req, res, next) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error('Error:', err.message);

  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({ error: 'That username or email is already taken.' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Something went wrong on the server.'
  });
}

module.exports = { notFoundHandler, errorHandler };
