export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change',
    expiresIn: '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    refreshExpiresIn: '7d',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  storage: {
    baseUrl: process.env.FILE_BASE_URL || 'http://localhost:9000',
    bucket: process.env.FILE_BUCKET || 'kyc',
  },
});
