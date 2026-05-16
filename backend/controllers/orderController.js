import Order from '../models/Order.js';
import Product from '../models/Product.js';

// @desc    Yeni sipariş oluştur
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req, res) => {
  try {
    const { siparisKalemleri, kargoAdresi, toplamTutar } = req.body;

    if (siparisKalemleri && siparisKalemleri.length === 0) {
      return res.status(400).json({ message: 'Sipariş kalemi bulunamadı' });
    } else {
      // Stok kontrolü ve düşürme
      for (const item of siparisKalemleri) {
        const product = await Product.findById(item.urun);
        if (!product) {
          return res.status(404).json({ message: `${item.isim} bulunamadı` });
        }
        if (product.stokSayisi < item.miktar) {
          return res.status(400).json({ message: `${product.isim} için yeterli stok yok. Kalan stok: ${product.stokSayisi}` });
        }
        product.stokSayisi -= item.miktar;
        await product.save();
      }

      const order = new Order({
        siparisKalemleri,
        kullanici: req.user._id,
        kargoAdresi,
        toplamTutar,
      });

      const createdOrder = await order.save();
      res.status(201).json(createdOrder);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Giriş yapmış kullanıcının siparişlerini getir
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ kullanici: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Tüm siparişleri getir (Admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('kullanici', 'id adSoyad').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Sipariş durumunu güncelle (Admin)
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      const oldStatus = order.siparisDurumu;
      const newStatus = req.body.siparisDurumu || 'Teslim Edildi';

      if (oldStatus !== 'İptal Edildi' && newStatus === 'İptal Edildi') {
        // Stoğu geri iade et
        for (const item of order.siparisKalemleri) {
          const product = await Product.findById(item.urun);
          if (product) {
            product.stokSayisi += item.miktar;
            await product.save();
          }
        }
      }

      order.siparisDurumu = newStatus;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Sipariş bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
