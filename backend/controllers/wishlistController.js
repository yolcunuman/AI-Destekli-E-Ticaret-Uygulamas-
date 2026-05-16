import User from '../models/User.js';

// @desc    Favori listesini getir
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favoriler');
    res.json(user.favoriler);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Favorilere ekle
// @route   POST /api/wishlist/:productId
// @access  Private
export const addToWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.favoriler.includes(req.params.productId)) {
      return res.status(400).json({ message: 'Ürün zaten favorilerinizde' });
    }

    user.favoriler.push(req.params.productId);
    await user.save();

    res.json({ message: 'Favorilere eklendi', favoriler: user.favoriler });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Favorilerden çıkar
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.favoriler = user.favoriler.filter(
      (id) => id.toString() !== req.params.productId
    );
    await user.save();

    res.json({ message: 'Favorilerden çıkarıldı', favoriler: user.favoriler });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
