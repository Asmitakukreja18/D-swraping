const packagingBases = {
  'wooden': { id: 'wooden', name: 'Handcrafted Wooden Basket', price: 599, img: 'assets/base-wooden.jpg' },
  'acrylic': { id: 'acrylic', name: 'Transparent Acrylic Crate', price: 699, img: 'assets/base-acrylic.jpg' },
  'net': { id: 'net', name: 'Pastel Net & Tulle Wrap', price: 349, img: 'assets/base-net.jpg' },
  'velvet': { id: 'velvet', name: 'Royal Velvet Treasure Trunk', price: 899, img: 'assets/base-velvet.jpg' },
  'satin': { id: 'satin', name: 'Signature Satin Box', price: 449, img: 'assets/gallery-2.jpeg' }
};

const productItemsCatalog = {
  'lipstick': { name: 'Matte Velvet Lipstick', price: 699 },
  'serum': { name: 'Rosewater Glow Serum', price: 899 },
  'eyeshadow': { name: 'Celestial Eye Palette', price: 1199 },
  'truffles': { name: 'Artisanal Chocolate Truffles', price: 499 },
  'cookies': { name: 'Gourmet Butter Cookies', price: 399 },
  'candle': { name: 'Scented Botanical Candle', price: 599 }
};

const hamperAddons = {
  'freshRoses': { name: 'Fresh Red Roses Bouquet', price: 299 },
  'fairyLights': { name: 'Warm LED Fairy Lights', price: 149 },
  'waxSealCard': { name: 'Calligraphy Wax Seal Card', price: 99 }
};

// GET /api/hamper/options
exports.getHamperOptions = (req, res) => {
  res.json({
    success: true,
    bases: Object.values(packagingBases),
    products: productItemsCatalog,
    addons: hamperAddons
  });
};

// POST /api/hamper/calculate
// Backend price verification logic - DO NOT TRUST FRONTEND PRICE BLINDLY
exports.calculateHamperTotal = (req, res) => {
  const { baseId, selectedProducts, selectedAddons } = req.body;

  let totalINR = 0;
  const breakdown = [];

  // 1. Calculate Base Packaging Price
  const base = packagingBases[baseId || 'wooden'];
  if (base) {
    totalINR += base.price;
    breakdown.push({ item: base.name, price: base.price });
  }

  // 2. Calculate Products Price
  if (selectedProducts && typeof selectedProducts === 'object') {
    Object.keys(selectedProducts).forEach(key => {
      const qty = parseInt(selectedProducts[key], 10) || 0;
      if (qty > 0 && productItemsCatalog[key]) {
        const itemCost = productItemsCatalog[key].price * qty;
        totalINR += itemCost;
        breakdown.push({ item: `${productItemsCatalog[key].name} (x${qty})`, price: itemCost });
      }
    });
  }

  // 3. Calculate Add-ons Price
  if (selectedAddons && typeof selectedAddons === 'object') {
    Object.keys(selectedAddons).forEach(key => {
      if (selectedAddons[key] && hamperAddons[key]) {
        totalINR += hamperAddons[key].price;
        breakdown.push({ item: hamperAddons[key].name, price: hamperAddons[key].price });
      }
    });
  }

  const USD_RATE = 85.0;
  const totalUSD = parseFloat((totalINR / USD_RATE).toFixed(2));

  res.json({
    success: true,
    totalINR,
    totalUSD,
    currency: 'INR',
    breakdown
  });
};
