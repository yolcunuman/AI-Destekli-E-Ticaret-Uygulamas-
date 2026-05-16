import Joi from 'joi';

// Kullanıcı Kayıt (Register) Doğrulama Şeması
export const validateRegister = (req, res, next) => {
  const schema = Joi.object({
    adSoyad: Joi.string().min(3).max(50).required().messages({
      'string.min': 'Ad Soyad en az 3 karakter olmalıdır.',
      'any.required': 'Ad Soyad alanı zorunludur.',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Lütfen geçerli bir e-posta adresi giriniz.',
      'any.required': 'E-posta alanı zorunludur.',
    }),
    sifre: Joi.string().min(6).required().messages({
      'string.min': 'Şifre en az 6 karakter olmalıdır.',
      'any.required': 'Şifre alanı zorunludur.',
    }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// Kullanıcı Giriş (Login) Doğrulama Şeması
export const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Lütfen geçerli bir e-posta adresi giriniz.',
      'any.required': 'E-posta alanı zorunludur.',
    }),
    sifre: Joi.string().required().messages({
      'any.required': 'Şifre alanı zorunludur.',
    }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};
