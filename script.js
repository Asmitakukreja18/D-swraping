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
      window.open(`https://wa.me/919876543210?text=${encodeURIComponent(message)}`, '_blank');
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
    { name: "The Royal Velvet Luxe Hamper", category: "Luxury Hampers", img: "assets/gallery-3.jpeg" },
    { name: "Blush Romance Bouquet", category: "Bouquets", img: "assets/gallery-9.jpeg" },
    { name: "Personalized Keepsake Tray", category: "Personalized", img: "assets/gallery-2.jpeg" },
    { name: "Serene Self-Care Spa Box", category: "Self-Care", img: "assets/gallery-4.jpeg" },
    { name: "Grand Celebration Hamper", category: "Festive Gifting", img: "assets/gallery-10.jpeg" },
    { name: "Chocoberry Balloon Gift", category: "Balloon Gifts", img: "assets/gallery-5.jpeg" },
    { name: "Signature Corporate Crate", category: "Corporate", img: "assets/gallery-8.jpeg" },
    { name: "Golden Ribbon Chocolate Trunk", category: "Chocolates", img: "assets/gallery-6.jpeg" }
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
          <div class="search-result-item" onclick="window.open('https://wa.me/919876543210?text=Hi%20D\\'s%20Studio!%20I%20am%20enquiring%20about%20${encodeURIComponent(p.name)}', '_blank')">
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
      window.open(`https://wa.me/919876543210?text=${encodeURIComponent(msg)}`, '_blank');
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
      qvWaBtn.href = `https://wa.me/919876543210?text=Hi%20D's%20Wrapping%20Studio!%20I'm%20interested%20in%20'${encodeURIComponent(title)}'.`;

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
      window.open(`https://wa.me/919876543210?text=${encodeURIComponent(waMsg)}`, '_blank');
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

});
