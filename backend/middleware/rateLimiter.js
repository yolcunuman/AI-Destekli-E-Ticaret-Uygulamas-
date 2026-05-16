import rateLimit from 'express-rate-limit';

// Login ve Register rotaları için Brute-Force koruması (Dakikada max 10 istek)
export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 dakika
  max: 10,
  message: { message: 'Çok fazla giriş denemesi yaptınız. Lütfen 1 dakika sonra tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false,
});
