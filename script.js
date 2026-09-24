/* ==========================================================================
   D'S WRAPPING STUDIO — LUXURY INTERACTIVE JAVASCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------------
     1. NAVBAR GLASSMORPHISM & SCROLL OBSERVER
     ------------------------------------------------------------------------ */
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // ScrollSpy active link toggle
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  /* ------------------------------------------------------------------------
     2. MOBILE MENU OVERLAY TOGGLE
     ------------------------------------------------------------------------ */
  const mobileToggleBtn = document.getElementById('mobileToggleBtn');
  const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
  const mobileCloseBtn = document.getElementById('mobileCloseBtn');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (mobileToggleBtn && mobileMenuOverlay && mobileCloseBtn) {
    mobileToggleBtn.addEventListener('click', () => {
      mobileMenuOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    const closeMobileMenu = () => {
      mobileMenuOverlay.classList.remove('active');
      document.body.style.overflow = '';
    };

    mobileCloseBtn.addEventListener('click', closeMobileMenu);

    mobileLinks.forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  /* ------------------------------------------------------------------------
     3. PRODUCT CATEGORY FILTERING
     ------------------------------------------------------------------------ */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      productCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
          card.style.opacity = '0';
        }
      });
    });
  });

  /* ------------------------------------------------------------------------
     4. WISHLIST SYSTEM
     ------------------------------------------------------------------------ */
  let wishlist = JSON.parse(localStorage.getItem('ds_wishlist')) || [];
  const wishlistBtn = document.getElementById('wishlistBtn');
  const wishlistBadge = document.getElementById('wishlistBadge');
  const wishlistModal = document.getElementById('wishlistModal');
  const closeWishlistModal = document.getElementById('closeWishlistModal');
  const wishlistBody = document.getElementById('wishlistBody');
  const enquireWishlistBtn = document.getElementById('enquireWishlistBtn');
  const wishlistToggles = document.querySelectorAll('.product-wishlist-toggle');

  const updateWishlistUI = () => {
    wishlistBadge.textContent = wishlist.length;

    // Update heart icons on cards
    wishlistToggles.forEach(toggle => {
      const id = toggle.getAttribute('data-id');
      const isWishlisted = wishlist.some(item => item.id === id);
      if (isWishlisted) {
        toggle.classList.add('active');
        toggle.innerHTML = '<i class="fa-solid fa-heart"></i>';
      } else {
        toggle.classList.remove('active');
        toggle.innerHTML = '<i class="fa-regular fa-heart"></i>';
      }
    });

    // Populate drawer
    if (wishlist.length === 0) {
      wishlistBody.innerHTML = '<p class="empty-wishlist-text">Your wishlist is currently empty. Click the heart icon on any product to save it here!</p>';
      enquireWishlistBtn.disabled = true;
    } else {
      wishlistBody.innerHTML = wishlist.map(item => `
        <div class="wishlist-item">
          <img src="${item.img}" alt="${item.name}">
          <div class="wishlist-item-info">
            <h5>${item.name}</h5>
            <span class="price-on-request"><i class="fa-solid fa-tag"></i> Price on Request</span>
          </div>
          <button class="remove-wishlist-item" data-id="${item.id}" style="background:none;border:none;color:var(--color-rose);cursor:pointer;margin-left:auto;">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `).join('');
      enquireWishlistBtn.disabled = false;

      // Attach remove handlers inside drawer
      document.querySelectorAll('.remove-wishlist-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          wishlist = wishlist.filter(item => item.id !== id);
          localStorage.setItem('ds_wishlist', JSON.stringify(wishlist));
          updateWishlistUI();
        });
      });
    }
  };

  wishlistToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const id = toggle.getAttribute('data-id');
      const name = toggle.getAttribute('data-name');
      const img = toggle.getAttribute('data-img');

      const index = wishlist.findIndex(item => item.id === id);
      if (index > -1) {
        wishlist.splice(index, 1);
      } else {
        wishlist.push({ id, name, img });
        triggerSparkles();
      }

      localStorage.setItem('ds_wishlist', JSON.stringify(wishlist));
      updateWishlistUI();
    });
  });

  if (wishlistBtn && wishlistModal && closeWishlistModal) {
    wishlistBtn.addEventListener('click', () => {
      wishlistModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    closeWishlistModal.addEventListener('click', () => {
      wishlistModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  if (enquireWishlistBtn) {
    enquireWishlistBtn.addEventListener('click', () => {
      if (wishlist.length === 0) return;
      const itemsList = wishlist.map(i => i.name).join(', ');
      const message = `Hi D's Wrapping Studio! I am interested in these items from my wishlist: ${itemsList}. Please let me know the pricing and options.`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
    });
  }

  updateWishlistUI();

  /* ------------------------------------------------------------------------
     5. SEARCH MODAL & LIVE SEARCH FILTER
     ------------------------------------------------------------------------ */
  const searchBtn = document.getElementById('searchBtn');
  const searchModal = document.getElementById('searchModal');
  const closeSearchModal = document.getElementById('closeSearchModal');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');

  const productsData = [
    { name: "Royal Velvet Golden Hamper", category: "Luxury Hampers", img: "assets/wa-product-1.jpg" },
    { name: "Blush Satin Floral Gift Box", category: "Bouquets & Boxes", img: "assets/wa-product-2.jpg" },
    { name: "Vintage Wooden Artisan Tray", category: "Personalized Gifts", img: "assets/wa-product-3.jpg" },
    { name: "Pastel Net & Pearl Wrap Hamper", category: "Custom Wrapping", img: "assets/wa-product-4.jpg" },
    { name: "Chocoberry Luxe Balloon Basket", category: "Balloon Gifts", img: "assets/wa-product-5.jpg" },
    { name: "Grand Imperial Festive Hamper", category: "Festive Hampers", img: "assets/wa-product-6.jpg" },
    { name: "Executive Corporate Crate", category: "Corporate Gifting", img: "assets/wa-product-7.jpg" },
    { name: "Serene Lavender Spa Hamper", category: "Self-Care & Spa", img: "assets/wa-product-8.jpg" },
    { name: "Golden Ribbon Chocolate Box", category: "Chocolates", img: "assets/wa-product-9.jpg" },
    { name: "Pearl & Bow Trousseau Trunk", category: "Wedding & Trousseau", img: "assets/wa-product-10.jpg" },
    { name: "Baby Shower Keepsake Basket", category: "Baby & Kids Gifts", img: "assets/wa-product-11.jpg" }
  ];

  if (searchBtn && searchModal && closeSearchModal) {
    searchBtn.addEventListener('click', () => {
      searchModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      setTimeout(() => searchInput.focus(), 200);
    });

    closeSearchModal.addEventListener('click', () => {
      searchModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  if (searchInput && searchResults) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (!query) {
        searchResults.innerHTML = '';
        return;
      }

      const matches = productsData.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));

      if (matches.length === 0) {
        searchResults.innerHTML = '<p style="color:var(--color-text-muted);">No products found matching your search.</p>';
      } else {
        searchResults.innerHTML = matches.map(p => `
          <div class="search-result-item" onclick="window.open('https://api.whatsapp.com/send?text=Hi%20D\\'s%20Studio!%20I%20am%20enquiring%20about%20${encodeURIComponent(p.name)}', '_blank')">
            <img src="${p.img}" alt="${p.name}">
            <div>
              <h5 style="font-family:var(--font-serif);font-size:1.1rem;color:var(--color-primary);">${p.name}</h5>
              <span style="font-size:0.75rem;color:var(--color-gold-dark);">${p.category}</span>
            </div>
          </div>
        `).join('');
      }
    });
  }

  /* ------------------------------------------------------------------------
     6. INTERACTIVE HAMPER BUILDER MODAL
     ------------------------------------------------------------------------ */
  const builderModal = document.getElementById('builderModal');
  const openBuilderNavBtn = document.getElementById('openBuilderNavBtn');
  const openBuilderMainBtn = document.getElementById('openBuilderMainBtn');
  const heroCustomBtn = document.getElementById('heroCustomBtn');
  const closeBuilderModal = document.getElementById('closeBuilderModal');

  const stepPanes = [
    document.getElementById('builderStep1'),
    document.getElementById('builderStep2'),
    document.getElementById('builderStep3'),
    document.getElementById('builderStep4')
  ];
  const stepDots = document.querySelectorAll('.step-dot');

  let customHamperState = {
    occasion: '',
    vibe: '',
    items: []
  };

  const openBuilder = () => {
    builderModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  if (openBuilderNavBtn) openBuilderNavBtn.addEventListener('click', openBuilder);
  if (openBuilderMainBtn) openBuilderMainBtn.addEventListener('click', openBuilder);
  if (heroCustomBtn) heroCustomBtn.addEventListener('click', openBuilder);

  if (closeBuilderModal) {
    closeBuilderModal.addEventListener('click', () => {
      builderModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  // Step 1 Options
  document.querySelectorAll('#builderStep1 .option-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('#builderStep1 .option-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      customHamperState.occasion = card.getAttribute('data-val');
      goToStep(2);
    });
  });

  // Step 2 Options
  document.querySelectorAll('#builderStep2 .option-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('#builderStep2 .option-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      customHamperState.vibe = card.getAttribute('data-val');
      goToStep(3);
    });
  });

  // Step 3 Multi Select Options
  document.querySelectorAll('#builderStep3 .option-card.multi').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('selected');
      const val = card.getAttribute('data-val');
      if (card.classList.contains('selected')) {
        if (!customHamperState.items.includes(val)) customHamperState.items.push(val);
      } else {
        customHamperState.items = customHamperState.items.filter(i => i !== val);
      }
    });
  });

  // Add Next button to step 3 manually
  const step3Pane = document.getElementById('builderStep3');
  if (step3Pane && !document.getElementById('toStep4Btn')) {
    const btn = document.createElement('button');
    btn.id = 'toStep4Btn';
    btn.className = 'btn btn-gold btn-full margin-t-20';
    btn.innerHTML = 'Review Hamper Configuration →';
    btn.addEventListener('click', () => {
      if (customHamperState.items.length === 0) {
        alert('Please select at least one item to include in your hamper.');
        return;
      }
      goToStep(4);
    });
    step3Pane.appendChild(btn);
  }

  const goToStep = (stepNum) => {
    stepPanes.forEach((pane, idx) => {
      if (idx === stepNum - 1) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    stepDots.forEach((dot, idx) => {
      if (idx === stepNum - 1) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    if (stepNum === 4) {
      document.getElementById('sumOccasion').textContent = customHamperState.occasion || 'Not specified';
      document.getElementById('sumVibe').textContent = customHamperState.vibe || 'Not specified';
      document.getElementById('sumItems').textContent = customHamperState.items.join(', ') || 'None';
    }
  };

  const sendCustomWhatsAppBtn = document.getElementById('sendCustomWhatsAppBtn');
  if (sendCustomWhatsAppBtn) {
    sendCustomWhatsAppBtn.addEventListener('click', () => {
      const note = document.getElementById('builderNote').value.trim();
      const msg = `Hi D's Wrapping Studio! I would like to order a Custom Hamper with these specifications:\n- Occasion: ${customHamperState.occasion}\n- Vibe: ${customHamperState.vibe}\n- Items: ${customHamperState.items.join(', ')}${note ? `\n- Special Note: ${note}` : ''}`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
      triggerSparkles();
    });
  }

  /* ------------------------------------------------------------------------
     7. GALLERY LIGHTBOX MODAL
     ------------------------------------------------------------------------ */
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.getElementById('lightboxModal');
  const closeLightbox = document.getElementById('closeLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.getAttribute('data-img');
      const caption = item.getAttribute('data-caption');
      lightboxImg.src = img;
      lightboxTitle.textContent = caption;
      lightboxModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  if (closeLightbox) {
    closeLightbox.addEventListener('click', () => {
      lightboxModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  /* ------------------------------------------------------------------------
     8. QUICK VIEW PRODUCT MODAL
     ------------------------------------------------------------------------ */
  const quickViewModal = document.getElementById('quickViewModal');
  const closeQuickView = document.getElementById('closeQuickView');
  const qvImg = document.getElementById('qvImg');
  const qvCategory = document.getElementById('qvCategory');
  const qvTitle = document.getElementById('qvTitle');
  const qvDesc = document.getElementById('qvDesc');
  const qvWaBtn = document.getElementById('qvWaBtn');

  document.querySelectorAll('.quick-view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.product-card');
      const img = card.querySelector('.product-img').src;
      const category = card.querySelector('.product-category').textContent;
      const title = card.querySelector('.product-title').textContent;
      const desc = card.querySelector('.product-desc').textContent;

      qvImg.src = img;
      qvCategory.textContent = category;
      qvTitle.textContent = title;
      qvDesc.textContent = desc;
      qvWaBtn.href = `https://api.whatsapp.com/send?text=Hi%20D's%20Wrapping%20Studio!%20I'm%20interested%20in%20'${encodeURIComponent(title)}'.`;

      quickViewModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  if (closeQuickView) {
    closeQuickView.addEventListener('click', () => {
      quickViewModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  /* ------------------------------------------------------------------------
     9. TESTIMONIAL CAROUSEL
     ------------------------------------------------------------------------ */
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  const sliderDots = document.querySelectorAll('.slider-dots .dot');
  const prevTestimonial = document.getElementById('prevTestimonial');
  const nextTestimonial = document.getElementById('nextTestimonial');
  let currentTestimonial = 0;

  const showTestimonial = (index) => {
    testimonialCards.forEach((card, idx) => {
      card.classList.remove('active');
      sliderDots[idx].classList.remove('active');
      if (idx === index) {
        card.classList.add('active');
        sliderDots[idx].classList.add('active');
      }
    });
    currentTestimonial = index;
  };

  if (prevTestimonial && nextTestimonial) {
    prevTestimonial.addEventListener('click', () => {
      let index = currentTestimonial - 1;
      if (index < 0) index = testimonialCards.length - 1;
      showTestimonial(index);
    });

    nextTestimonial.addEventListener('click', () => {
      let index = (currentTestimonial + 1) % testimonialCards.length;
      showTestimonial(index);
    });

    sliderDots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        const index = parseInt(e.target.getAttribute('data-index'));
        showTestimonial(index);
      });
    });

    // Auto slide every 6 seconds
    setInterval(() => {
      let index = (currentTestimonial + 1) % testimonialCards.length;
      showTestimonial(index);
    }, 6000);
  }

  /* ------------------------------------------------------------------------
     10. ENQUIRY FORM HANDLER WITH CONFETTI
     ------------------------------------------------------------------------ */
  const enquiryForm = document.getElementById('enquiryForm');
  if (enquiryForm) {
    enquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contactName').value;
      const phone = document.getElementById('contactPhone').value;
      const occasion = document.getElementById('contactOccasion').value;
      const budget = document.getElementById('contactBudget').value;
      const category = document.getElementById('contactCategory').value;
      const message = document.getElementById('contactMessage').value;

      triggerSparkles();

      const waMsg = `Hi D's Wrapping Studio!\nMy name is ${name} (${phone}).\nI would like to enquire about:\n- Occasion: ${occasion}\n- Budget: ${budget}\n- Type: ${category}\n${message ? `- Message: ${message}` : ''}`;
      
      alert(`Thank you ${name}! Opening WhatsApp to complete your enquiry with D's Wrapping Studio.`);
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(waMsg)}`, '_blank');
      enquiryForm.reset();
    });
  }

  /* ------------------------------------------------------------------------
     11. SPARKLE CONFETTI HELPER
     ------------------------------------------------------------------------ */
  function triggerSparkles() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C8A96B', '#24352A', '#C98282', '#641F2A']
      });
    }
  }

  /* ------------------------------------------------------------------------
     12. GSAP SCROLL REVEAL ANIMATIONS
     ------------------------------------------------------------------------ */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from('.hero-title', {
      opacity: 0,
      y: 40,
      duration: 1.2,
      ease: 'power3.out'
    });

    gsap.from('.hero-subtext', {
      opacity: 0,
      y: 30,
      duration: 1,
      delay: 0.3,
      ease: 'power3.out'
    });

    gsap.from('.hero-cta-group', {
      opacity: 0,
      y: 20,
      duration: 0.8,
      delay: 0.5,
      ease: 'power3.out'
    });

    gsap.from('.hero-image-frame', {
      opacity: 0,
      scale: 0.9,
      duration: 1.4,
      ease: 'power2.out'
    });

    // Scroll trigger reveals for section headers
    gsap.utils.toArray('.section-title').forEach(title => {
      gsap.from(title, {
        scrollTrigger: {
          trigger: title,
          start: 'top 85%'
        },
        opacity: 0,
        y: 30,
        duration: 0.9,
        ease: 'power2.out'
      });
    });
  }

  /* ==========================================================================
     13. SHOPPING CART, POINTER ZOOM & CHECKOUT DEMO SYSTEM
     ========================================================================== */
  
  // State
  let cart = JSON.parse(localStorage.getItem('ds_cart') || '[]');
  let currentCurrency = localStorage.getItem('ds_currency') || 'INR'; // 'INR' or 'USD'
  const USD_EXCHANGE_RATE = 85.0; // 1 USD = 85 INR

  // Helper: Format Currency
  function formatMoney(amountINR) {
    if (currentCurrency === 'USD') {
      const usdVal = (amountINR / USD_EXCHANGE_RATE).toFixed(2);
      return `$${usdVal}`;
    }
    return `₹${amountINR.toLocaleString('en-IN')}`;
  }

  // Inject Navigation Cart Button if missing
  const navActions = document.querySelector('.nav-actions');
  if (navActions && !document.getElementById('cartBtn')) {
    const cartBtn = document.createElement('button');
    cartBtn.id = 'cartBtn';
    cartBtn.className = 'action-btn relative';
    cartBtn.style.cssText = 'position:relative; background:none; border:none; font-size:1.3rem; color:var(--color-primary-olive); cursor:pointer; padding:6px;';
    cartBtn.title = 'Shopping Cart';
    cartBtn.innerHTML = `
      <i class="fa-solid fa-bag-shopping"></i>
      <span id="cartBadge" class="cart-badge">${cart.reduce((a, b) => a + b.qty, 0)}</span>
    `;
    navActions.insertBefore(cartBtn, navActions.firstChild);
  }

  // Inject Modals into DOM
  injectModalsDOM();

  // Elements
  const cartBtnEl = document.getElementById('cartBtn');
  const cartDrawerOverlay = document.getElementById('cartDrawerOverlay');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const currencyToggleBtn = document.getElementById('currencyToggleBtn');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartSubtotalEl = document.getElementById('cartSubtotalEl');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const checkoutModal = document.getElementById('checkoutModal');
  const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');

  // Event Listeners for Cart Open/Close
  if (cartBtnEl) cartBtnEl.addEventListener('click', openCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (cartDrawerOverlay) {
    cartDrawerOverlay.addEventListener('click', (e) => {
      if (e.target === cartDrawerOverlay) closeCart();
    });
  }

  if (currencyToggleBtn) {
    currencyToggleBtn.addEventListener('click', () => {
      currentCurrency = currentCurrency === 'INR' ? 'USD' : 'INR';
      localStorage.setItem('ds_currency', currentCurrency);
      currencyToggleBtn.innerHTML = `<i class="fa-solid fa-coins"></i> Currency: ${currentCurrency}`;
      updateCartUI();
      if (typeof updateHamperBuilderUI === 'function') updateHamperBuilderUI();
    });
  }

  function openCart() {
    updateCartUI();
    cartDrawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartDrawerOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
  }

  // Global Add to Cart Function
  window.addItemToCart = function(name, priceINR, img, customNote = '') {
    const existingIndex = cart.findIndex(item => item.name === name && item.customNote === customNote);
    if (existingIndex > -1) {
      cart[existingIndex].qty += 1;
    } else {
      cart.push({ id: Date.now() + Math.random(), name, priceINR, img, qty: 1, customNote });
    }
    saveCart();
    updateCartUI();
    openCart();
    triggerSparkles();
  };

  function saveCart() {
    localStorage.setItem('ds_cart', JSON.stringify(cart));
  }

  function updateCartUI() {
    const badge = document.getElementById('cartBadge');
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    if (badge) badge.textContent = totalQty;

    if (!cartItemsList) return;

    if (cart.length === 0) {
      cartItemsList.innerHTML = `
        <div style="text-align:center; padding:40px 20px; color:var(--color-muted-text);">
          <i class="fa-solid fa-basket-shopping" style="font-size:3rem; color:var(--color-champagne); margin-bottom:16px;"></i>
          <h4 style="font-family:var(--font-serif); font-size:1.3rem; color:var(--color-dark-olive);">Your Cart is Empty</h4>
          <p style="font-size:0.88rem; margin-top:6px;">Add bespoke hampers or items to get started!</p>
        </div>
      `;
      if (cartSubtotalEl) cartSubtotalEl.textContent = formatMoney(0);
      return;
    }

    let subtotal = 0;
    cartItemsList.innerHTML = cart.map((item, idx) => {
      const itemTotal = item.priceINR * item.qty;
      subtotal += itemTotal;
      return `
        <div class="cart-item-card">
          <img src="${item.img}" alt="${item.name}" class="cart-item-img" onerror="this.src='assets/gallery-3.jpeg'">
          <div class="cart-item-details">
            <h5 class="cart-item-name">${item.name}</h5>
            ${item.customNote ? `<div style="font-size:0.75rem; color:var(--color-primary-olive); font-style:italic;">${item.customNote}</div>` : ''}
            <div class="cart-item-price">${formatMoney(item.priceINR)} x ${item.qty} = ${formatMoney(itemTotal)}</div>
            <div class="cart-item-qty">
              <button class="qty-btn" onclick="changeQty(${idx}, -1)">-</button>
              <span style="font-weight:700; font-size:0.9rem;">${item.qty}</span>
              <button class="qty-btn" onclick="changeQty(${idx}, 1)">+</button>
            </div>
          </div>
          <button class="cart-item-remove" onclick="removeCartItem(${idx})" title="Remove">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      `;
    }).join('');

    if (cartSubtotalEl) cartSubtotalEl.textContent = formatMoney(subtotal);
  }

  window.changeQty = function(index, delta) {
    if (cart[index]) {
      cart[index].qty += delta;
      if (cart[index].qty <= 0) {
        cart.splice(index, 1);
      }
      saveCart();
      updateCartUI();
    }
  };

  window.removeCartItem = function(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
  };

  // Attach event listener to all static Add to Cart buttons across site
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const name = btn.dataset.name || 'Luxury Hamper Box';
      const price = parseInt(btn.dataset.price || '1999', 10);
      const img = btn.dataset.img || 'assets/gallery-3.jpeg';
      window.addItemToCart(name, price, img);
    });
  });

  // Open Checkout Modal
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        alert('Your cart is empty! Please add items before checking out.');
        return;
      }
      closeCart();
      renderCheckoutSummary();
      checkoutModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }

  if (closeCheckoutBtn) {
    closeCheckoutBtn.addEventListener('click', () => {
      checkoutModal.classList.remove('active');
      document.body.style.overflow = 'auto';
    });
  }

  /* ------------------------------------------------------------------------
     14. POINTER ZOOM PREVIEW MODAL
     ------------------------------------------------------------------------ */
  window.openZoomModal = function(imgSrc, titleText, descText) {
    const zoomModal = document.getElementById('zoomModal');
    const zoomModalImg = document.getElementById('zoomModalImg');
    const zoomModalTitle = document.getElementById('zoomModalTitle');
    const zoomModalDesc = document.getElementById('zoomModalDesc');

    if (zoomModal && zoomModalImg) {
      zoomModalImg.src = imgSrc;
      if (zoomModalTitle) zoomModalTitle.textContent = titleText;
      if (zoomModalDesc) zoomModalDesc.textContent = descText || 'D’s Wrapping Studio Bespoke Packaging Preview';
      zoomModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeZoomBtn = document.getElementById('closeZoomBtn');
  if (closeZoomBtn) {
    closeZoomBtn.addEventListener('click', () => {
      document.getElementById('zoomModal').classList.remove('active');
      document.body.style.overflow = 'auto';
    });
  }

  /* ------------------------------------------------------------------------
     15. BESPOKE HAMPER CREATION STUDIO (on custom-hampers.html)
     ------------------------------------------------------------------------ */
  const hamperBuilderForm = document.getElementById('hamperBuilderContainer');
  if (hamperBuilderForm) {
    initBespokeHamperStudio();
  }

  function initBespokeHamperStudio() {
    let selectedBase = { id: 'wooden', name: 'Handcrafted Wooden Basket', price: 599, img: 'assets/base-wooden.jpg' };
    let selectedProducts = {
      'lipstick': 0,
      'serum': 0,
      'eyeshadow': 0,
      'truffles': 0,
      'cookies': 0,
      'candle': 0
    };

    const productsCatalog = {
      'lipstick': { name: 'Matte Velvet Lipstick', category: 'Makeup & Cosmetics', price: 699, img: 'assets/makeup-set.jpg' },
      'serum': { name: 'Rosewater Glow Serum', category: 'Skincare', price: 899, img: 'assets/makeup-set.jpg' },
      'eyeshadow': { name: 'Celestial Eye Palette', category: 'Makeup & Cosmetics', price: 1199, img: 'assets/makeup-set.jpg' },
      'truffles': { name: 'Artisanal Chocolate Truffles', category: 'Gourmet Treats', price: 499, img: 'assets/gallery-6.jpeg' },
      'cookies': { name: 'Gourmet Butter Cookies', category: 'Gourmet Treats', price: 399, img: 'assets/gallery-10.jpeg' },
      'candle': { name: 'Scented Botanical Candle', category: 'Self-Care', price: 599, img: 'assets/gallery-4.jpeg' }
    };

    let selectedAddons = {
      'freshRoses': false,
      'fairyLights': false,
      'waxSealCard': false
    };

    const addonsCatalog = {
      'freshRoses': { name: 'Fresh Red Roses Bouquet', price: 299 },
      'fairyLights': { name: 'Warm LED Fairy Lights', price: 149 },
      'waxSealCard': { name: 'Calligraphy Wax Seal Card', price: 99 }
    };

    // Render Base Options
    const baseGrid = document.getElementById('baseOptionsGrid');
    if (baseGrid) {
      const bases = [
        { id: 'wooden', name: 'Handcrafted Wooden Basket', price: 599, img: 'assets/base-wooden.jpg', desc: 'Rustic oak wooden trunk with woven rope handles.' },
        { id: 'acrylic', name: 'Transparent Acrylic Crate', price: 699, img: 'assets/base-acrylic.jpg', desc: 'Crystal clear luxury acrylic box with brass latches.' },
        { id: 'net', name: 'Pastel Net & Tulle Wrap', price: 349, img: 'assets/base-net.jpg', desc: 'Elegant blush pink net wrapping with pearl bow ribbon.' },
        { id: 'velvet', name: 'Royal Velvet Treasure Trunk', price: 899, img: 'assets/base-velvet.jpg', desc: 'Deep green velvet box lined with soft satin.' },
        { id: 'satin', name: 'Signature Satin Box', price: 449, img: 'assets/gallery-2.jpeg', desc: 'Handmade luxury satin gift container.' }
      ];

      baseGrid.innerHTML = bases.map(b => `
        <div class="base-card pointer-zoom-card ${b.id === selectedBase.id ? 'selected' : ''}" onclick="selectBase('${b.id}', '${b.name}', ${b.price}, '${b.img}')">
          <button class="zoom-badge-btn" onclick="event.stopPropagation(); openZoomModal('${b.img}', '${b.name}', '${b.desc}')" title="Zoom Out Preview">
            <i class="fa-solid fa-magnifying-glass-plus"></i>
          </button>
          <img src="${b.img}" alt="${b.name}">
          <div class="base-name">${b.name}</div>
          <div class="base-price">${formatMoney(b.price)}</div>
        </div>
      `).join('');
    }

    // Render Products Picker
    const productsGrid = document.getElementById('productsPickerGrid');
    if (productsGrid) {
      productsGrid.innerHTML = Object.keys(productsCatalog).map(key => {
        const item = productsCatalog[key];
        return `
          <div class="product-picker-card pointer-zoom-card">
            <button class="zoom-badge-btn" onclick="openZoomModal('${item.img}', '${item.name}', 'Category: ${item.category}')" title="Zoom Preview">
              <i class="fa-solid fa-magnifying-glass-plus"></i>
            </button>
            <img src="${item.img}" alt="${item.name}" class="product-picker-img">
            <div>
              <div style="font-size:0.7rem; color:var(--color-primary-olive); text-transform:uppercase; font-weight:700;">${item.category}</div>
              <div class="base-name">${item.name}</div>
              <div class="base-price">${formatMoney(item.price)}</div>
            </div>
            <div class="picker-qty-controls">
              <button class="qty-btn" onclick="changeHamperItemQty('${key}', -1)">-</button>
              <span id="hamper_item_qty_${key}" style="font-weight:700;">0</span>
              <button class="qty-btn" onclick="changeHamperItemQty('${key}', 1)">+</button>
            </div>
          </div>
        `;
      }).join('');
    }

    window.selectBase = function(id, name, price, img) {
      selectedBase = { id, name, price, img };
      document.querySelectorAll('.base-card').forEach(el => el.classList.remove('selected'));
      event.currentTarget.classList.add('selected');
      updateHamperBuilderUI();
    };

    window.changeHamperItemQty = function(key, delta) {
      selectedProducts[key] = Math.max(0, (selectedProducts[key] || 0) + delta);
      const qtyEl = document.getElementById(`hamper_item_qty_${key}`);
      if (qtyEl) qtyEl.textContent = selectedProducts[key];
      updateHamperBuilderUI();
    };

    window.toggleAddon = function(key) {
      selectedAddons[key] = !selectedAddons[key];
      updateHamperBuilderUI();
    };

    window.updateHamperBuilderUI = function() {
      const liveList = document.getElementById('previewItemList');
      const liveTotal = document.getElementById('previewTotalEl');
      const liveBaseName = document.getElementById('previewBaseName');

      if (!liveList) return;

      if (liveBaseName) liveBaseName.textContent = selectedBase.name;

      let total = selectedBase.price;
      let itemsHTML = `<li><span>🪵 ${selectedBase.name}</span> <span>${formatMoney(selectedBase.price)}</span></li>`;

      Object.keys(selectedProducts).forEach(k => {
        const qty = selectedProducts[k];
        if (qty > 0) {
          const item = productsCatalog[k];
          const itemCost = item.price * qty;
          total += itemCost;
          itemsHTML += `<li><span>✨ ${item.name} (x${qty})</span> <span>${formatMoney(itemCost)}</span></li>`;
        }
      });

      Object.keys(selectedAddons).forEach(k => {
        if (selectedAddons[k]) {
          const addon = addonsCatalog[k];
          total += addon.price;
          itemsHTML += `<li><span>🌸 ${addon.name}</span> <span>${formatMoney(addon.price)}</span></li>`;
        }
      });

      liveList.innerHTML = itemsHTML;
      if (liveTotal) liveTotal.textContent = formatMoney(total);
    };

    // Add Custom Hamper to Cart
    const addCustomHamperBtn = document.getElementById('addCustomHamperBtn');
    if (addCustomHamperBtn) {
      addCustomHamperBtn.addEventListener('click', () => {
        let total = selectedBase.price;
        let itemNames = [selectedBase.name];

        Object.keys(selectedProducts).forEach(k => {
          if (selectedProducts[k] > 0) {
            total += productsCatalog[k].price * selectedProducts[k];
            itemNames.push(`${productsCatalog[k].name} (x${selectedProducts[k]})`);
          }
        });

        Object.keys(selectedAddons).forEach(k => {
          if (selectedAddons[k]) {
            total += addonsCatalog[k].price;
            itemNames.push(addonsCatalog[k].name);
          }
        });

        const customNote = document.getElementById('hamperCardMessage')?.value || 'Custom Curated Hamper';
        const hamperTitle = `Custom Bespoke Hamper (${selectedBase.name.split(' ')[0]})`;

        window.addItemToCart(hamperTitle, total, selectedBase.img, customNote);
      });
    }

    updateHamperBuilderUI();
  }

  /* ------------------------------------------------------------------------
     16. DYNAMIC DOM INJECTION FOR MODALS
     ------------------------------------------------------------------------ */
  function injectModalsDOM() {
    if (!document.getElementById('cartDrawerOverlay')) {
      const cartDOM = document.createElement('div');
      cartDOM.id = 'cartDrawerOverlay';
      cartDOM.className = 'cart-drawer-overlay';
      cartDOM.innerHTML = `
        <div class="cart-drawer">
          <div class="cart-header">
            <h4 class="cart-title"><i class="fa-solid fa-bag-shopping" style="color:var(--color-champagne);"></i> Shopping Cart</h4>
            <div style="display:flex; align-items:center; gap:12px;">
              <button id="currencyToggleBtn" class="currency-toggle-btn"><i class="fa-solid fa-coins"></i> Currency: ${currentCurrency}</button>
              <button id="closeCartBtn" style="background:none; border:none; font-size:1.5rem; color:var(--color-dark-olive); cursor:pointer;">&times;</button>
            </div>
          </div>
          <div class="free-shipping-tag" style="margin:12px 20px 0;">
            <i class="fa-solid fa-truck-fast"></i> <span>Free Pan-India Doorstep Express Delivery on orders above ₹1499 / $20</span>
          </div>
          <div id="cartItemsList" class="cart-items-list"></div>
          <div class="cart-footer">
            <div class="cart-subtotal-row">
              <span>Subtotal:</span>
              <span id="cartSubtotalEl">₹0</span>
            </div>
            <button id="checkoutBtn" class="btn btn-gold btn-large" style="width:100%;">
              <i class="fa-solid fa-shield-halved"></i> Proceed to Checkout
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(cartDOM);
    }

    if (!document.getElementById('zoomModal')) {
      const zoomDOM = document.createElement('div');
      zoomDOM.id = 'zoomModal';
      zoomDOM.className = 'modal-overlay';
      zoomDOM.innerHTML = `
        <div class="modal-container zoom-modal-container">
          <button id="closeZoomBtn" class="modal-close-btn">&times;</button>
          <img id="zoomModalImg" src="" alt="Preview" class="zoom-modal-img">
          <h3 id="zoomModalTitle" style="font-family:var(--font-serif); font-size:1.6rem; color:var(--color-dark-olive);"></h3>
          <p id="zoomModalDesc" style="font-size:0.9rem; color:var(--color-muted-text); margin-top:6px;"></p>
        </div>
      `;
      document.body.appendChild(zoomDOM);
    }

    if (!document.getElementById('checkoutModal')) {
      const checkoutDOM = document.createElement('div');
      checkoutDOM.id = 'checkoutModal';
      checkoutDOM.className = 'modal-overlay';
      checkoutDOM.innerHTML = `
        <div class="modal-container" style="max-width:700px; padding:30px;">
          <button id="closeCheckoutBtn" class="modal-close-btn">&times;</button>
          <h3 style="font-family:var(--font-serif); font-size:1.8rem; color:var(--color-dark-olive); margin-bottom:6px;">
            <i class="fa-solid fa-lock" style="color:var(--color-champagne);"></i> Secure Pan-India Checkout Demo
          </h3>
          <p style="font-size:0.85rem; color:var(--color-muted-text); margin-bottom:20px;">Complete your address details & payment method demo below.</p>
          
          <div class="checkout-tabs">
            <button class="checkout-tab-btn active" onclick="switchCheckoutTab('addressTab')">1. Address & Pan-India Shipping</button>
            <button class="checkout-tab-btn" onclick="switchCheckoutTab('paymentTab')">2. Payment & Login Demo</button>
          </div>

          <div id="addressTab">
            <form id="shippingAddressForm" onsubmit="event.preventDefault(); switchCheckoutTab('paymentTab');">
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
                <div>
                  <label style="font-size:0.8rem; font-weight:700; color:var(--color-dark-olive);">Full Name *</label>
                  <input required type="text" placeholder="Radhika Sharma" style="width:100%; padding:10px; border-radius:var(--radius-sm); border:1px solid var(--color-border);">
                </div>
                <div>
                  <label style="font-size:0.8rem; font-weight:700; color:var(--color-dark-olive);">WhatsApp Phone *</label>
                  <input required type="tel" placeholder="Enter Phone Number" style="width:100%; padding:10px; border-radius:var(--radius-sm); border:1px solid var(--color-border);">
                </div>
              </div>

              <div style="margin-bottom:12px;">
                <label style="font-size:0.8rem; font-weight:700; color:var(--color-dark-olive);">Street Address / Building / Flat No. *</label>
                <input required type="text" placeholder="Flat 402, Lotus Towers, MG Road" style="width:100%; padding:10px; border-radius:var(--radius-sm); border:1px solid var(--color-border);">
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:20px;">
                <div>
                  <label style="font-size:0.8rem; font-weight:700; color:var(--color-dark-olive);">City *</label>
                  <input required type="text" placeholder="Mumbai" style="width:100%; padding:10px; border-radius:var(--radius-sm); border:1px solid var(--color-border);">
                </div>
                <div>
                  <label style="font-size:0.8rem; font-weight:700; color:var(--color-dark-olive);">State (Pan-India) *</label>
                  <select required style="width:100%; padding:10px; border-radius:var(--radius-sm); border:1px solid var(--color-border);">
                    <option value="">Select State</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi NCR</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Rajasthan">Rajasthan</option>
                  </select>
                </div>
                <div>
                  <label style="font-size:0.8rem; font-weight:700; color:var(--color-dark-olive);">Pincode *</label>
                  <input required type="text" placeholder="400001" style="width:100%; padding:10px; border-radius:var(--radius-sm); border:1px solid var(--color-border);">
                </div>
              </div>

              <button type="submit" class="btn btn-primary-olive" style="width:100%;">Continue to Payment Demo &rarr;</button>
            </form>
          </div>

          <div id="paymentTab" style="display:none;">
            <div style="background:var(--color-soft-cream); padding:16px; border-radius:var(--radius-md); border:1px solid var(--color-border); margin-bottom:16px;">
              <h5 style="font-family:var(--font-serif); font-size:1.1rem; color:var(--color-dark-olive); margin-bottom:8px;">
                <i class="fa-solid fa-user-check" style="color:var(--color-champagne);"></i> Guest / Account Login
              </h5>
              <div style="font-size:0.82rem; color:var(--color-muted-text);">Logged in as: <strong>Guest User (guest@dswrapping.com)</strong></div>
            </div>

            <div class="payment-method-options">
              <div class="payment-opt-card selected" onclick="selectPaymentOpt('upi', this)">
                <i class="fa-solid fa-mobile-screen-button"></i>
                <div style="font-weight:700; font-size:0.85rem;">UPI / GPay</div>
              </div>
              <div class="payment-opt-card" onclick="selectPaymentOpt('card', this)">
                <i class="fa-solid fa-credit-card"></i>
                <div style="font-weight:700; font-size:0.85rem;">Credit/Debit</div>
              </div>
              <div class="payment-opt-card" onclick="selectPaymentOpt('cod', this)">
                <i class="fa-solid fa-hand-holding-dollar"></i>
                <div style="font-weight:700; font-size:0.85rem;">Cash on Delivery</div>
              </div>
            </div>

            <div id="upiBox" class="qr-code-demo">
              <div style="font-weight:700; color:var(--color-primary-olive); margin-bottom:6px;">Scan UPI QR Code to Pay</div>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=dswrapping@upi%26pn=DsWrappingStudio" alt="UPI QR Code Demo">
              <div style="font-size:0.78rem; color:var(--color-muted-text);">Accepts GPay, PhonePe, Paytm & BHIM UPI</div>
            </div>

            <div id="cardBox" style="display:none; margin-bottom:16px;">
              <input type="text" placeholder="Card Number (4532 XXXX XXXX XXXX)" style="width:100%; padding:10px; margin-bottom:8px; border-radius:var(--radius-sm); border:1px solid var(--color-border);">
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                <input type="text" placeholder="MM / YY" style="padding:10px; border-radius:var(--radius-sm); border:1px solid var(--color-border);">
                <input type="password" placeholder="CVV (123)" style="padding:10px; border-radius:var(--radius-sm); border:1px solid var(--color-border);">
              </div>
            </div>

            <div id="codBox" style="display:none; text-align:center; padding:12px; background:#fff; border-radius:var(--radius-md); margin-bottom:16px;">
              <p style="font-size:0.85rem; color:var(--color-primary-olive); font-weight:600;">Pay with Cash upon Pan-India Doorstep Delivery.</p>
            </div>

            <button onclick="placeOrderDemo()" class="btn btn-gold btn-large" style="width:100%;">
              <i class="fa-solid fa-check-double"></i> Place Order Demo Now
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(checkoutDOM);
    }
  }

  window.switchCheckoutTab = function(tabId) {
    document.getElementById('addressTab').style.display = tabId === 'addressTab' ? 'block' : 'none';
    document.getElementById('paymentTab').style.display = tabId === 'paymentTab' ? 'block' : 'none';
    document.querySelectorAll('.checkout-tab-btn').forEach((btn, idx) => {
      btn.classList.toggle('active', (tabId === 'addressTab' && idx === 0) || (tabId === 'paymentTab' && idx === 1));
    });
  };

  window.selectPaymentOpt = function(type, el) {
    document.querySelectorAll('.payment-opt-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    document.getElementById('upiBox').style.display = type === 'upi' ? 'block' : 'none';
    document.getElementById('cardBox').style.display = type === 'card' ? 'block' : 'none';
    document.getElementById('codBox').style.display = type === 'cod' ? 'block' : 'none';
  };

  function renderCheckoutSummary() {
    // optional checkout order summary details
  }

  window.placeOrderDemo = async function() {
    const totalAmountINR = cart.reduce((sum, item) => sum + (item.priceINR * item.qty), 0);
    const customerName = document.querySelector('#shippingAddressForm input[type="text"]')?.value || 'Valued Customer';
    const customerPhone = document.querySelector('#shippingAddressForm input[type="tel"]')?.value || '';
    const streetAddress = document.querySelectorAll('#shippingAddressForm input[type="text"]')[1]?.value || 'Main Street';
    const city = document.querySelectorAll('#shippingAddressForm input[type="text"]')[2]?.value || 'Mumbai';
    const state = document.querySelector('#shippingAddressForm select')?.value || 'Maharashtra';
    const pincode = document.querySelectorAll('#shippingAddressForm input[type="text"]')[3]?.value || '400001';

    const orderPayload = {
      customerName,
      customerPhone,
      shippingAddress: streetAddress,
      city,
      state,
      pincode,
      totalINR: totalAmountINR,
      currency: currentCurrency,
      paymentMethod: 'UPI / Card Demo',
      items: cart
    };

    let orderId = 'DS-' + Math.floor(100000 + Math.random() * 900000);

    try {
      const resp = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.orderCode) orderId = data.orderCode;
      }
    } catch (e) {
      console.log('Backend API offline or local mode, using client order code:', orderId);
    }

    triggerSparkles();
    document.getElementById('checkoutModal').classList.remove('active');

    let invoiceDOM = document.getElementById('invoiceModal');
    if (!invoiceDOM) {
      invoiceDOM = document.createElement('div');
      invoiceDOM.id = 'invoiceModal';
      invoiceDOM.className = 'modal-overlay';
      document.body.appendChild(invoiceDOM);
    }

    invoiceDOM.innerHTML = `
      <div class="modal-container" style="max-width:550px; padding:30px; text-align:center;">
        <div style="width:70px; height:70px; background:#e8f5e9; color:#2e7d32; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:2.2rem; margin:0 auto 16px;">
          ✓
        </div>
        <h3 style="font-family:var(--font-serif); font-size:1.8rem; color:var(--color-dark-olive); margin-bottom:4px;">Order Confirmed & Saved!</h3>
        <p style="font-size:0.88rem; color:var(--color-muted-text); margin-bottom:20px;">Thank you for shopping at D’s Wrapping Studio. Order #${orderId}</p>

        <div class="receipt-invoice-card" style="margin-bottom:20px;">
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--color-border); padding-bottom:8px; margin-bottom:10px; font-weight:700; color:var(--color-dark-olive);">
            <span>Order Receipt</span>
            <span>${orderId}</span>
          </div>
          <div style="font-size:0.85rem; color:var(--color-muted-text); margin-bottom:6px;">
            Customer: <strong>${customerName} (${customerPhone})</strong>
          </div>
          <div style="font-size:0.85rem; color:var(--color-muted-text); margin-bottom:12px;">
            Total Paid / Payable: <strong style="color:var(--color-champagne); font-size:1.1rem;">${formatMoney(totalAmountINR)}</strong>
          </div>
          <div style="font-size:0.8rem; color:var(--color-primary-olive); background:var(--color-warm-ivory); padding:8px; border-radius:var(--radius-sm);">
            🚚 Pan-India Shipping: ${streetAddress}, ${city}, ${state} - ${pincode}<br>
            Estimated Delivery: 3 to 5 Business Days
          </div>
        </div>

        <button onclick="document.getElementById('invoiceModal').classList.remove('active'); document.body.style.overflow='auto';" class="btn btn-primary-olive" style="width:100%;">
          Close & Return to Studio
        </button>
      </div>
    `;

    invoiceDOM.classList.add('active');
    cart = [];
    saveCart();
    updateCartUI();
  };

});

