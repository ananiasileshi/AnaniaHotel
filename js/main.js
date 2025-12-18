// ===================================
// GLOBAL FUNCTIONALITY
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupHeaderScroll();
    setupLocationsDropdown();
    setupBookingOverlay();
    setupNewsletterForm();
    setupOffersCarousel();
    setupSmoothScrolling();
    setupFormValidation();
    setupDatePickers();
    setupRoomSelection();
    setupBookingFlow();
}

// ===================================
// HEADER FUNCTIONALITY
// ===================================

function setupHeaderScroll() {
    const header = document.getElementById('globalHeader');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollY = currentScrollY;
    });
}

function setupLocationsDropdown() {
    const locationsToggle = document.getElementById('locationsToggle');
    const locationsMenu = document.getElementById('locationsMenu');
    
    if (locationsToggle && locationsMenu) {
        locationsToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = locationsMenu.classList.contains('active');
            
            // Close all other dropdowns
            closeAllDropdowns();
            
            if (!isActive) {
                locationsMenu.classList.add('active');
                locationsToggle.classList.add('active');
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            locationsMenu.classList.remove('active');
            locationsToggle.classList.remove('active');
        });
        
        // Prevent closing when clicking inside menu
        locationsMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

function closeAllDropdowns() {
    document.querySelectorAll('.locations-menu').forEach(menu => {
        menu.classList.remove('active');
    });
    document.querySelectorAll('.locations-toggle').forEach(toggle => {
        toggle.classList.remove('active');
    });
}


// ===================================
// BOOKING OVERLAY
// ===================================

function setupBookingOverlay() {
    const bookNowBtn = document.getElementById('bookNowBtn');
    const bookPropertyBtn = document.getElementById('bookPropertyBtn');
    const closeBooking = document.getElementById('closeBooking');
    const bookingOverlay = document.getElementById('bookingOverlay');
    const offerCtaBtns = document.querySelectorAll('.offer-cta');
    
    if (bookNowBtn && bookingOverlay) {
        bookNowBtn.addEventListener('click', () => {
            openBookingOverlay();
        });
    }
    
    if (bookPropertyBtn && bookingOverlay) {
        bookPropertyBtn.addEventListener('click', () => {
            openBookingOverlay();
        });
    }
    
    // Handle offer CTA buttons
    offerCtaBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            openBookingOverlay();
        });
    });
    
    if (closeBooking && bookingOverlay) {
        closeBooking.addEventListener('click', () => {
            closeBookingOverlay();
        });
    }
    
    if (bookingOverlay) {
        bookingOverlay.addEventListener('click', (e) => {
            if (e.target === bookingOverlay) {
                closeBookingOverlay();
            }
        });
    }
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && bookingOverlay.classList.contains('active')) {
            closeBookingOverlay();
        }
    });
}

function openBookingOverlay(preselectedData = {}) {
    const bookingOverlay = document.getElementById('bookingOverlay');
    
    if (bookingOverlay) {
        bookingOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Reset to first step
        resetBookingFlow();
        
        // Pre-fill data if provided
        if (preselectedData.location) {
            document.getElementById('location').value = preselectedData.location;
        }
        if (preselectedData.roomType) {
            // Store room type for later use
            bookingOverlay.dataset.roomType = preselectedData.roomType;
        }
        if (preselectedData.promoCode) {
            document.getElementById('codeType').value = 'promo';
            document.getElementById('codeGroup').style.display = 'block';
            document.getElementById('code').value = preselectedData.promoCode;
        }
    }
}

function closeBookingOverlay() {
    const bookingOverlay = document.getElementById('bookingOverlay');
    
    if (bookingOverlay) {
        bookingOverlay.classList.remove('active');
        document.body.style.overflow = '';
        resetBookingFlow();
    }
}

// ===================================
// BOOKING FLOW
// ===================================

let currentBookingStep = 1;
const totalBookingSteps = 4;

function resetBookingFlow() {
    currentBookingStep = 1;
    
    // Hide all steps
    document.querySelectorAll('.booking-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show first step
    document.getElementById('step1').classList.add('active');
    
    // Reset forms
    document.querySelectorAll('.booking-form').forEach(form => {
        form.reset();
    });
    
    // Hide code group
    document.getElementById('codeGroup').style.display = 'none';
}

function setupBookingFlow() {
    const searchForm = document.getElementById('searchForm');
    const guestForm = document.getElementById('guestForm');
    
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearchSubmit);
    }
    
    if (guestForm) {
        guestForm.addEventListener('submit', handleGuestSubmit);
    }
    
    // Code type change handler
    const codeTypeSelect = document.getElementById('codeType');
    if (codeTypeSelect) {
        codeTypeSelect.addEventListener('change', (e) => {
            const codeGroup = document.getElementById('codeGroup');
            if (e.target.value) {
                codeGroup.style.display = 'block';
            } else {
                codeGroup.style.display = 'none';
            }
        });
    }
}

function handleSearchSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const searchData = Object.fromEntries(formData);
    
    // Validate dates
    const checkin = new Date(searchData.checkin);
    const checkout = new Date(searchData.checkout);
    
    if (checkout <= checkin) {
        showError('Check-out date must be after check-in date');
        return;
    }
    
    // Store search data
    window.bookingData = searchData;
    
    // Load available rooms
    loadAvailableRooms(searchData);
    
    // Move to step 2
    goToBookingStep(2);
}

function loadAvailableRooms(searchData) {
    const roomsList = document.getElementById('roomsList');
    
    if (!roomsList) return;
    
    // Mock room data - in real app this would come from API
    const mockRooms = [
        {
            id: 'small-king',
            name: 'Small King',
            description: 'Cozy corner room with industrial windows',
            image: 'assets/images/room-small-king.jpg',
            price: 149,
            size: '25 sq m',
            bedType: 'King',
            occupancy: '2 Guests'
        },
        {
            id: 'loft-suite',
            name: 'Loft Suite',
            description: 'Spacious suite with separate living area',
            image: 'assets/images/room-loft-suite.jpg',
            price: 289,
            size: '45 sq m',
            bedType: 'King',
            occupancy: '3 Guests'
        },
        {
            id: 'bunk-room',
            name: 'Bunk Room',
            description: 'Perfect for groups with bunk beds',
            image: 'assets/images/room-bunk.jpg',
            price: 119,
            size: '20 sq m',
            bedType: 'Bunk Beds',
            occupancy: '4 Guests'
        }
    ];
    
    roomsList.innerHTML = '';
    
    mockRooms.forEach(room => {
        const roomElement = createRoomElement(room, searchData);
        roomsList.appendChild(roomElement);
    });
}

function createRoomElement(room, searchData) {
    const roomDiv = document.createElement('div');
    roomDiv.className = 'room-item';
    
    const nights = calculateNights(searchData.checkin, searchData.checkout);
    const totalPrice = room.price * nights * parseInt(searchData.rooms || 1);
    
    roomDiv.innerHTML = `
        <div class="room-image" style="background-image: url('${room.image}');"></div>
        <div class="room-details">
            <h3 class="room-name">${room.name}</h3>
            <p class="room-description">${room.description}</p>
            <p class="room-specs">${room.size} • ${room.bedType} • ${room.occupancy}</p>
            <p class="room-price">$${room.price}/night • $${totalPrice} total</p>
        </div>
        <button class="select-room-btn" data-room='${JSON.stringify(room)}' data-total="${totalPrice}">
            Select Room
        </button>
    `;
    
    const selectBtn = roomDiv.querySelector('.select-room-btn');
    selectBtn.addEventListener('click', () => {
        selectRoom(room, totalPrice);
    });
    
    return roomDiv;
}

function selectRoom(room, totalPrice) {
    window.bookingData.selectedRoom = room;
    window.bookingData.totalPrice = totalPrice;
    
    // Move to guest details step
    goToBookingStep(3);
}

function handleGuestSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const guestData = Object.fromEntries(formData);
    
    // Validate card number (basic validation)
    const cardNumber = guestData.cardNumber.replace(/\s/g, '');
    if (!/^\d{16}$/.test(cardNumber)) {
        showError('Please enter a valid 16-digit card number');
        return;
    }
    
    // Store guest data
    window.bookingData.guest = guestData;
    
    // Show confirmation
    showBookingConfirmation();
    
    // Move to confirmation step
    goToBookingStep(4);
}

function showBookingConfirmation() {
    const data = window.bookingData;
    
    // Update confirmation summary
    document.getElementById('summaryProperty').textContent = 
        data.location.charAt(0).toUpperCase() + data.location.slice(1);
    document.getElementById('summaryDates').textContent = 
        `${formatDate(data.checkin)} - ${formatDate(data.checkout)}`;
    document.getElementById('summaryGuests').textContent = 
        `${data.guests} Guest${data.guests > 1 ? 's' : ''}`;
    document.getElementById('summaryRoom').textContent = data.selectedRoom.name;
    document.getElementById('summaryTotal').textContent = `$${data.totalPrice}`;
}

function goToBookingStep(stepNumber) {
    // Hide current step
    document.getElementById(`step${currentBookingStep}`).classList.remove('active');
    
    // Show new step
    document.getElementById(`step${stepNumber}`).classList.add('active');
    
    currentBookingStep = stepNumber;
}

function calculateNights(checkin, checkout) {
    const start = new Date(checkin);
    const end = new Date(checkout);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function formatDate(dateString) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// ===================================
// ROOM SELECTION
// ===================================

function setupRoomSelection() {
    // Room cards on property pages
    document.querySelectorAll('.room-card').forEach(card => {
        const bookBtn = card.querySelector('.book-room-btn');
        if (bookBtn) {
            bookBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const roomData = extractRoomData(card);
                openBookingOverlay(roomData);
            });
        }
    });
}

function extractRoomData(card) {
    return {
        location: card.dataset.location || '',
        roomType: card.dataset.roomType || '',
        roomName: card.querySelector('.room-name')?.textContent || ''
    };
}

// ===================================
// FORMS & VALIDATION
// ===================================

function setupFormValidation() {
    // Add real-time validation
    document.querySelectorAll('input[required], select[required]').forEach(field => {
        field.addEventListener('blur', () => {
            validateField(field);
        });
        
        field.addEventListener('input', () => {
            if (field.classList.contains('error')) {
                validateField(field);
            }
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Remove existing error
    removeFieldError(field);
    
    if (!value && field.hasAttribute('required')) {
        isValid = false;
        errorMessage = 'This field is required';
    } else if (field.type === 'email' && !isValidEmail(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
    } else if (field.type === 'tel' && !isValidPhone(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid phone number';
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^[\d\s\-\(\)]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    let errorDiv = field.parentNode.querySelector('.field-error');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        field.parentNode.appendChild(errorDiv);
    }
    
    errorDiv.textContent = message;
}

function removeFieldError(field) {
    field.classList.remove('error');
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

function showError(message) {
    // Create error toast
    const errorToast = document.createElement('div');
    errorToast.className = 'error-toast';
    errorToast.textContent = message;
    
    document.body.appendChild(errorToast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        errorToast.remove();
    }, 3000);
}

// ===================================
// NEWSLETTER
// ===================================

function setupNewsletterForm() {
    const newsletterForm = document.getElementById('newsletterForm');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = newsletterForm.querySelector('input[type="email"]').value;
            
            if (isValidEmail(email)) {
                // Show success message
                showNewsletterSuccess();
                newsletterForm.reset();
                
                // In real app, this would submit to newsletter service
                console.log('Newsletter signup:', email);
            } else {
                showError('Please enter a valid email address');
            }
        });
    }
}

function showNewsletterSuccess() {
    const successMessage = document.createElement('div');
    successMessage.className = 'newsletter-success';
    successMessage.innerHTML = `
        <p>Thank you for subscribing to The A-List!</p>
    `;
    
    const newsletterSection = document.querySelector('.footer-section');
    if (newsletterSection) {
        newsletterSection.appendChild(successMessage);
        
        setTimeout(() => {
            successMessage.remove();
        }, 5000);
    }
}

// ===================================
// DATE PICKERS
// ===================================

function setupDatePickers() {
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    
    if (checkinInput && checkoutInput) {
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        checkinInput.min = today;
        checkoutInput.min = today;
        
        // Update checkout minimum when checkin changes
        checkinInput.addEventListener('change', (e) => {
            const checkinDate = new Date(e.target.value);
            const minCheckout = new Date(checkinDate);
            minCheckout.setDate(minCheckout.getDate() + 1);
            
            checkoutInput.min = minCheckout.toISOString().split('T')[0];
            
            // Clear checkout if it's before new minimum
            if (checkoutInput.value && new Date(checkoutInput.value) <= checkinDate) {
                checkoutInput.value = '';
            }
        });
    }
}

// ===================================
// OFFERS CAROUSEL
// ===================================

function setupOffersCarousel() {
    const carousel = document.getElementById('offersCarousel');
    
    if (carousel) {
        let isDown = false;
        let startX;
        let scrollLeft;
        
        carousel.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - carousel.offsetLeft;
            scrollLeft = carousel.scrollLeft;
        });
        
        carousel.addEventListener('mouseleave', () => {
            isDown = false;
        });
        
        carousel.addEventListener('mouseup', () => {
            isDown = false;
        });
        
        carousel.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - carousel.offsetLeft;
            const walk = (x - startX) * 2;
            carousel.scrollLeft = scrollLeft - walk;
        });
        
        // Add click handlers to offer CTAs
        carousel.querySelectorAll('.offer-cta').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const offerCard = e.target.closest('.offer-card');
                const offerTitle = offerCard.querySelector('h3').textContent;
                
                // Open booking with offer
                openBookingOverlay({
                    promoCode: offerTitle.toUpperCase().replace(/\s+/g, '_')
                });
            });
        });
    }
}

// ===================================
// SMOOTH SCROLLING
// ===================================

function setupSmoothScrolling() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.getElementById('globalHeader').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Hero CTA buttons
    const exploreBtn = document.getElementById('exploreBtn');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
            const locationsSection = document.querySelector('.locations-section');
            if (locationsSection) {
                const headerHeight = document.getElementById('globalHeader').offsetHeight;
                const targetPosition = locationsSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
}

// ===================================
// EVENT HANDLERS
// ===================================

// Event RSVP handlers
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('event-cta')) {
        const eventCard = e.target.closest('.event-card');
        const eventTitle = eventCard.querySelector('h3').textContent;
        
        if (e.target.textContent === 'RSVP') {
            handleEventRSVP(eventTitle);
        } else if (e.target.textContent === 'Buy Tickets') {
            handleEventTickets(eventTitle);
        } else if (e.target.textContent === 'Learn More') {
            handleEventLearnMore(eventTitle);
        } else if (e.target.textContent === 'Free Event') {
            handleFreeEvent(eventTitle);
        }
    }
});

function handleEventRSVP(eventTitle) {
    console.log('RSVP for:', eventTitle);
    // In real app, this would open RSVP modal or navigate to RSVP form
    showError('RSVP functionality coming soon!');
}

function handleEventTickets(eventTitle) {
    console.log('Buy tickets for:', eventTitle);
    // In real app, this would navigate to ticketing platform
    showError('Ticketing coming soon!');
}

function handleEventLearnMore(eventTitle) {
    console.log('Learn more about:', eventTitle);
    // In real app, this would navigate to event detail page
    showError('Event details coming soon!');
}

function handleFreeEvent(eventTitle) {
    console.log('Free event:', eventTitle);
    showError('This is a free event - no registration required!');
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ===================================
// ACCESSIBILITY
// ===================================

// Add keyboard navigation for dropdowns
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        // Handle tab navigation through dropdowns
        const activeDropdown = document.querySelector('.locations-menu.active');
        if (activeDropdown) {
            const focusableElements = activeDropdown.querySelectorAll('a, button');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }
});

// ===================================
// PERFORMANCE OPTIMIZATION
// ===================================

// Lazy load images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.dataset.src;
                if (src) {
                    img.src = src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ===================================
// ERROR HANDLING
// ===================================

window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
    // In production, you might want to send this to an error tracking service
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    // In production, you might want to send this to an error tracking service
});
