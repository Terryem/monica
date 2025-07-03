(function ($) {

  "use strict";

  // init jarallax parallax
  var initJarallax = function () {
    jarallax(document.querySelectorAll(".jarallax"));

    jarallax(document.querySelectorAll(".jarallax-img"), {
      keepImg: true,
    });
  }

  // input spinner
  var initProductQty = function(){

    $('.product-qty').each(function(){

      var $el_product = $(this);
      var quantity = 0;

      $el_product.find('.quantity-right-plus').click(function(e){
          e.preventDefault();
          var quantity = parseInt($el_product.find('.quantity').val());
          $el_product.find('.quantity').val(quantity + 1);
      });

      $el_product.find('.quantity-left-minus').click(function(e){
          e.preventDefault();
          var quantity = parseInt($el_product.find('.quantity').val());
          if(quantity>0){
            $el_product.find('.quantity').val(quantity - 1);
          }
      });

    });

  }

  // init Chocolat light box
	var initChocolat = function () {
		Chocolat(document.querySelectorAll('.image-link'), {
			imageSize: 'contain',
			loop: true,
		})
	}

  // Animate Texts
  var initTextFx = function () {
    $('.txt-fx').each(function () {
      var newstr = '';
      var count = 0;
      var delay = 0;
      var stagger = 10;
      var words = this.textContent.split(/\s/);
      
      $.each( words, function( key, value ) {
        newstr += '<span class="word">';

        for ( var i = 0, l = value.length; i < l; i++ ) {
          newstr += "<span class='letter' style='transition-delay:"+ ( delay + stagger * count ) +"ms;'>"+ value[ i ] +"</span>";
          count++;
        }
        newstr += '</span>';
        newstr += "<span class='letter' style='transition-delay:"+ delay +"ms;'>&nbsp;</span>";
        count++;
      });

      this.innerHTML = newstr;
    });
  }

  // Dynamic Quick View Modal functionality
  var initQuickViewModal = function() {
    let productsData = [];
    let currentProductId = null;

    // Load products data from JSON
    fetch('js/products.json')
      .then(response => response.json())
      .then(data => {
        productsData = data.products;
      })
      .catch(error => {
        console.error('Error loading products data:', error);
      });

    // Handle quick view button clicks
    $(document).on('click', '.quick-view-btn', function() {
      const productId = parseInt($(this).data('product-id'));
      currentProductId = productId;
      const product = productsData.find(p => p.id === productId);
      
      if (product) {
        populateModal(product);
      }
    });

    // Function to populate modal with product data
    function populateModal(product) {
      $('#modalImage').attr('src', product.image).attr('alt', product.name);
      $('#modalTitle').text(product.name);
      $('#modalPrice').text(product.price);
      $('#modalDescription').text(product.description);
      $('#modalColors').text(product.colors);
      $('#modalStyle').text(product.style);
      
      // Handle categories
      const categoriesHtml = product.categories.map(category => 
        `<a href="#" title="categories">${category}</a>`
      ).join(', ');
      $('#modalCategories').html(categoriesHtml);
      
      // Handle stock status
      if (product.inStock) {
        $('#outOfStockBtn').hide();
        $('#addToCartBtn').show();
      } else {
        $('#outOfStockBtn').show();
        $('#addToCartBtn').hide();
      }
      
      // Reset quantity to 1
      $('#quantity_001').val(1);
      
      // Store current product ID for cart functionality
      $('#addToCartBtn').attr('data-current-product-id', product.id);
    }

    // Expose current product ID for cart functionality
    window.getCurrentProductId = function() {
      return currentProductId;
    };
  };

  // Shopping Cart functionality
  var initShoppingCart = function() {
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

    // Update cart badge count
    function updateCartBadge() {
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      const badges = document.querySelectorAll('#cartBadge, .cart-badge-small');
      
      badges.forEach(badge => {
        if (totalItems > 0) {
          badge.textContent = totalItems;
          badge.style.display = 'inline';
        } else {
          badge.style.display = 'none';
        }
      });
    }

    // Add item to cart
    function addToCart(productId, quantity) {
      // Get product data from JSON (assuming it's already loaded)
      fetch('js/products.json')
        .then(response => response.json())
        .then(data => {
          const product = data.products.find(p => p.id === productId);
          if (product) {
            const existingItem = cart.find(item => item.id === productId);
            
            if (existingItem) {
              existingItem.quantity += quantity;
            } else {
              cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity
              });
            }
            
            localStorage.setItem('shoppingCart', JSON.stringify(cart));
            updateCartBadge();
            updateCartModal();
            
            // Show success alert
            alert(`${product.name} added to cart!`);
          }
        });
    }

    // Remove item from cart
    function removeFromCart(productId) {
      console.log('Removing product ID:', productId);
      console.log('Cart before removal:', cart);
      cart = cart.filter(item => item.id !== productId);
      console.log('Cart after removal:', cart);
      localStorage.setItem('shoppingCart', JSON.stringify(cart));
      updateCartBadge();
      updateCartModal();
    }

    // Update cart modal content
    function updateCartModal() {
      const cartItemsContainer = document.getElementById('cartItems');
      const cartSummary = document.getElementById('cartSummary');
      const cartFooter = document.getElementById('cartFooter');
      
      if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-center text-muted" id="emptyCartMessage">Your cart is empty</p>';
        cartSummary.style.display = 'none';
        cartFooter.style.display = 'none';
        return;
      }

      cartSummary.style.display = 'block';
      cartFooter.style.display = 'flex';

      // Generate cart items HTML
      let cartHTML = '';
      let totalPrice = 0;
      let totalItems = 0;

      cart.forEach(item => {
        const itemPrice = parseFloat(item.price.replace(/[^\d.]/g, '')) * item.quantity;
        totalPrice += itemPrice;
        totalItems += item.quantity;

        cartHTML += `
          <div class="cart-item d-flex align-items-center mb-3 p-3 border rounded">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image me-3" style="width: 60px; height: 60px; object-fit: cover;">
            <div class="cart-item-details flex-grow-1">
              <h6 class="mb-1">${item.name}</h6>
              <p class="mb-1 text-muted">${item.price} each</p>
              <div class="quantity-controls d-flex align-items-center">
                <button class="btn btn-sm btn-outline-secondary cart-qty-minus" data-product-id="${item.id}">-</button>
                <span class="mx-2">${item.quantity}</span>
                <button class="btn btn-sm btn-outline-secondary cart-qty-plus" data-product-id="${item.id}">+</button>
              </div>
            </div>
            <div class="cart-item-total me-2">
              <strong>${item.price.replace(/[\d.]/g, '').charAt(0)}${itemPrice}</strong>
            </div>
            <button class="btn btn-sm btn-outline-danger cart-remove" data-product-id="${item.id}">×</button>
          </div>
        `;
      });

      cartItemsContainer.innerHTML = cartHTML;
      document.getElementById('totalItems').textContent = totalItems;
      document.getElementById('totalPrice').textContent = `${cart[0]?.price.replace(/[\d.]/g, '').charAt(0) || 'N'}${totalPrice}`;
    }

    // Event listeners for quantity controls in modal
    $(document).on('click', '.qty-number-plus', function() {
      const input = document.getElementById('quantity_001');
      const currentValue = parseInt(input.value) || 1;
      input.value = currentValue + 1;
    });

    $(document).on('click', '.qty-number-minus', function() {
      const input = document.getElementById('quantity_001');
      const currentValue = parseInt(input.value) || 1;
      if (currentValue > 1) {
        input.value = currentValue - 1;
      }
    });

    // Add to cart button click
    $(document).on('click', '#addToCartBtn', function(e) {
      e.preventDefault();
      const quantity = parseInt(document.getElementById('quantity_001').value) || 1;
      const productId = parseInt($(this).attr('data-current-product-id')) || window.getCurrentProductId();
      
      if (productId !== undefined && productId !== null) {
        addToCart(productId, quantity);
        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('quickViewModal'));
        if (modal) modal.hide();
      }
    });

    // Cart quantity controls
    $(document).on('click', '.cart-qty-plus', function() {
      const productId = parseInt($(this).data('product-id'));
      const item = cart.find(item => item.id === productId);
      if (item) {
        item.quantity += 1;
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
        updateCartBadge();
        updateCartModal();
      }
    });

    $(document).on('click', '.cart-qty-minus', function() {
      const productId = parseInt($(this).data('product-id'));
      const item = cart.find(item => item.id === productId);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
        updateCartBadge();
        updateCartModal();
      }
    });

    // Remove item from cart
    $(document).on('click', '.cart-remove', function() {
      console.log('Remove button clicked');
      const productId = parseInt($(this).data('product-id'));
      console.log('Product ID to remove:', productId);
      removeFromCart(productId);
    });

    // Initialize cart on page load
    updateCartBadge();
    updateCartModal();
  };

  $(document).ready(function () {

    initProductQty();
    initJarallax();
    initChocolat();
    initTextFx();
    initQuickViewModal();
    initShoppingCart();
    initShoppingCart();

    $(".user-items .search-item").click(function () {
      $(".search-box").toggleClass('active');
      $(".search-box .search-input").focus();
    });
    $(".close-button").click(function () {
      $(".search-box").toggleClass('active');
    });

    var breakpoint = window.matchMedia('(max-width:61.93rem)');

    if (breakpoint.matches === false) {
      
      var swiper = new Swiper(".main-swiper", {
        slidesPerView: 1,
        spaceBetween: 48,
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        },
        breakpoints: {
          900: {
            slidesPerView: 2,
            spaceBetween: 48,
          },
        },
      });

      // homepage 2 slider
      var swiper = new Swiper(".thumb-swiper", {
        direction: 'horizontal',
        slidesPerView: 6,
        spaceBetween: 6,
        breakpoints: {
          900: {
            direction: 'vertical',
            spaceBetween: 6,
          },
        },
      });
      var swiper2 = new Swiper(".large-swiper", {
        spaceBetween: 48,
        effect: 'fade',
        slidesPerView: 1,
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        },
        thumbs: {
          swiper: swiper,
        },
      });

    }

    // product single page
    var thumb_slider = new Swiper(".product-thumbnail-slider", {
      slidesPerView: 5,
      spaceBetween: 10,
      // autoplay: true,
      direction: "vertical",
      breakpoints: {
        0: {
          direction: "horizontal"
        },
        992: {
          direction: "vertical"
        },
      },
    });

    // product large
    var large_slider = new Swiper(".product-large-slider", {
      slidesPerView: 1,
      // autoplay: true,
      spaceBetween: 0,
      effect: 'fade',
      thumbs: {
        swiper: thumb_slider,
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
    });

  }); // End of a document

  $(window).load(function(){
    $('.preloader').fadeOut();
  });

})(jQuery);