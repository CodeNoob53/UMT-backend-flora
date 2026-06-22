export const basicAuth = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth?.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="Admin"');
    return res.status(401).send('Authentication required');
  }

  const [user, password] = Buffer.from(auth.slice(6), 'base64').toString().split(':');

  if (user !== process.env.ADMIN_USER || password !== process.env.ADMIN_PASSWORD) {
    res.set('WWW-Authenticate', 'Basic realm="Admin"');
    return res.status(401).send('Invalid credentials');
  }

  next();
};
