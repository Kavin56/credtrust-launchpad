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
    adminUrl:
      process.env.ADMIN_DATABASE_URL || 'file:./prisma/admin.db',
    agentUrl:
      process.env.AGENT_DATABASE_URL || 'file:./prisma/agents.db',
  },
  admin: {
    accessKey: process.env.ADMIN_ACCESS_KEY || process.env.ADMIN_SIGNUP_SECRET,
  },
  storage: {
    baseUrl: process.env.FILE_BASE_URL || 'http://localhost:9000',
    bucket: process.env.FILE_BUCKET || 'kyc',
  },
});
