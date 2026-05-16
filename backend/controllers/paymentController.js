export const createPaymentSession = async (req, res) => {
  try {
    const { siparisKalemleri, toplamTutar, kargoAdresi } = req.body;

    // Simülasyon: Iyzico benzeri sahte bir token ve URL dönelim
    const mockToken = "sim_" + Math.random().toString(36).substring(2, 15);
    const mockPaymentPageUrl = `http://localhost:5173/payment-simulation/${mockToken}`;

    res.json({
      success: true,
      token: mockToken,
      paymentPageUrl: mockPaymentPageUrl,
      message: 'Ödeme oturumu (Simülasyon) başarıyla oluşturuldu.'
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Simülasyon: Token geçerli sayalım
    if (!token || !token.startsWith('sim_')) {
      return res.status(400).json({ success: false, message: 'Geçersiz ödeme tokenı.' });
    }

    res.json({
      success: true,
      paymentStatus: 'SUCCESS',
      message: 'Ödeme doğrulandı (Simülasyon).'
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
