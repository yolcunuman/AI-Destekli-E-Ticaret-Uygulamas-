import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  adSoyad: {
    type: String,
    required: [true, 'Lütfen ad ve soyadınızı girin']
  },
  email: {
    type: String,
    required: [true, 'Lütfen email adresinizi girin'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Lütfen geçerli bir email adresi girin'
    ]
  },
  sifre: {
    type: String,
    required: [true, 'Lütfen şifrenizi girin'],
    minlength: 6,
    select: false // Varsayılan olarak şifreyi getirme
  },
  rol: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  favoriler: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }
  ]
}, {
  timestamps: true
});

// Kaydetmeden önce şifreyi hash'le
userSchema.pre('save', async function(next) {
  if (!this.isModified('sifre')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.sifre = await bcrypt.hash(this.sifre, salt);
});

// Şifre karşılaştırma metodu
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.sifre);
};

const User = mongoose.model('User', userSchema);
export default User;
