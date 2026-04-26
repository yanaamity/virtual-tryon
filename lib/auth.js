export function verifyAdminAuth(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return false;
  
  const token = authHeader.replace('Bearer ', '');
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  return token === adminPassword;
}
