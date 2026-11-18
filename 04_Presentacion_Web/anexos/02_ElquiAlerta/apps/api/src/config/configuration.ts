export default () => ({
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  // Sin '*' por defecto (mejora respecto a EcoPoint)
  allowedOrigins: process.env['ALLOWED_ORIGINS']?.split(',') ?? ['http://localhost:4200'],
  ackTimeoutMinutes: parseInt(process.env['ACK_TIMEOUT_MINUTES'] ?? '15', 10),
  jwt: {
    accessSecret: process.env['JWT_ACCESS_SECRET']!,
    accessExpiresIn: process.env['JWT_ACCESS_EXPIRES_IN'],
    refreshSecret: process.env['JWT_REFRESH_SECRET']!,
    refreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'],
  },
  redis: {
    host: process.env['REDIS_HOST'] ?? 'localhost',
    port: parseInt(process.env['REDIS_PORT'] ?? '6379', 10),
  },
  minio: {
    endpoint: process.env['MINIO_ENDPOINT'] ?? 'localhost',
    port: parseInt(process.env['MINIO_PORT'] ?? '9000', 10),
    useSSL: process.env['MINIO_USE_SSL'] === 'true',
    accessKey: process.env['MINIO_ACCESS_KEY']!,
    secretKey: process.env['MINIO_SECRET_KEY']!,
    bucket: process.env['MINIO_BUCKET'] ?? 'elquialerta',
  },
  sms: {
    url: process.env['SMS_PROVIDER_URL'] || undefined,
    token: process.env['SMS_PROVIDER_TOKEN'] || undefined,
  },
  expo: {
    pushUrl:
      process.env['EXPO_PUSH_URL'] ??
      'https://exp.host/--/api/v2/push/send',
  },
});
