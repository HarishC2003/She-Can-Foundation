/**
 * SHE CAN FOUNDATION — INTERACTIVE PROGRAM LOGIC
 * Handles:
 * 1. Mobile Menu Toggling
 * 2. Active Section Scrollspy
 * 3. Volunteer & Donate Modals (Open/Close)
 * 4. Interactive Donation Amount Selector Widget
 * 5. Mock Form Submissions and Success Toast Notifications
 */

document.addEventListener('DOMContentLoaded', () => {
    // Current state variables
    let currentDonationAmount = 1000; // Default amount matching active button

    // ---------------------------------------------------------
    // 1. MOBILE NAVIGATION MENU
    // ---------------------------------------------------------
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when a nav link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Toggle solid background header on scroll
    const header = document.querySelector('.app-header');
    const handleHeaderScroll = () => {
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    };
    window.addEventListener('scroll', handleHeaderScroll);
    handleHeaderScroll(); // Trigger immediately in case page is already scrolled on load

    // ---------------------------------------------------------
    // 2. SCROLLSPY (ACTIVE NAV INDICATOR)
    // ---------------------------------------------------------
    const sections = document.querySelectorAll('section[id]');
    
    const scrollActive = () => {
        const scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120; // Offset to match sticky navigation bar height
            const sectionId = current.getAttribute('id');
            const targetLink = document.querySelector(`.nav-menu a[href*=${sectionId}]`);

            if (targetLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    targetLink.classList.add('active');
                } else {
                    targetLink.classList.remove('active');
                }
            }
        });
    };
    window.addEventListener('scroll', scrollActive);

    // ---------------------------------------------------------
    // 3. VOLUNTEER & DONATE MODALS (OPEN / CLOSE LOGIC)
    // ---------------------------------------------------------
    const volunteerModal = document.getElementById('volunteerModal');
    const donateModal = document.getElementById('donateModal');
    
    const openVolunteerBtns = document.querySelectorAll('.open-volunteer-btn');
    const openDonateBtns = document.querySelectorAll('.open-donate-btn');
    
    const closeVolunteerModalBtn = document.getElementById('closeVolunteerModal');
    const closeDonateModalBtn = document.getElementById('closeDonateModal');
    const modalAmountDisplay = document.getElementById('modalAmountDisplay');

    // Utility function to open a modal
    const openModal = (modalElement) => {
        if (modalElement) {
            modalElement.classList.add('active');
            document.body.style.overflow = 'hidden'; // Stop background scrolling
        }
    };

    // Utility function to close a modal
    const closeModal = (modalElement) => {
        if (modalElement) {
            modalElement.classList.remove('active');
            document.body.style.overflow = ''; // Restore background scrolling
        }
    };

    // Volunteer Modal Event Listeners
    openVolunteerBtns.forEach(btn => {
        btn.addEventListener('click', () => openModal(volunteerModal));
    });
    if (closeVolunteerModalBtn) {
        closeVolunteerModalBtn.addEventListener('click', () => closeModal(volunteerModal));
    }

    // Donate Modal Event Listeners (Triggers donation selection display refresh)
    openDonateBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (modalAmountDisplay) {
                modalAmountDisplay.textContent = `₹${Number(currentDonationAmount).toLocaleString('en-IN')}`;
            }
            openModal(donateModal);
        });
    });
    if (closeDonateModalBtn) {
        closeDonateModalBtn.addEventListener('click', () => closeModal(donateModal));
    }

    // Close modals when clicking on background overlays
    [volunteerModal, donateModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal(modal);
                }
            });
        }
    });

    // Close active modal on ESC keypress
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (volunteerModal && volunteerModal.classList.contains('active')) {
                closeModal(volunteerModal);
            }
            if (donateModal && donateModal.classList.contains('active')) {
                closeModal(donateModal);
            }
        }
    });

    // ---------------------------------------------------------
    // 4. INTERACTIVE DONATION SELECTION WIDGET
    // ---------------------------------------------------------
    const amountBtns = document.querySelectorAll('.amount-btn');
    const customAmountInput = document.getElementById('customAmountInput');
    const proceedDonateBtn = document.getElementById('proceedDonateBtn');

    if (amountBtns.length > 0) {
        amountBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active states
                amountBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Clear input
                if (customAmountInput) customAmountInput.value = '';
                
                // Update amount state
                currentDonationAmount = Number(btn.getAttribute('data-amount'));
            });
        });
    }

    if (customAmountInput) {
        customAmountInput.addEventListener('input', () => {
            // Remove active states from buttons
            amountBtns.forEach(b => b.classList.remove('active'));
            
            // Update amount state based on input
            const inputVal = Number(customAmountInput.value);
            if (inputVal > 0) {
                currentDonationAmount = inputVal;
            } else {
                currentDonationAmount = 0;
            }
        });
    }

    if (proceedDonateBtn) {
        proceedDonateBtn.addEventListener('click', () => {
            if (currentDonationAmount < 100) {
                showNotification('⚠️ Minimum donation amount is ₹100.', 'warning');
                return;
            }
            if (modalAmountDisplay) {
                modalAmountDisplay.textContent = `₹${Number(currentDonationAmount).toLocaleString('en-IN')}`;
            }
            openModal(donateModal);
        });
    }

    // ---------------------------------------------------------
    // 5. FORM SUBMISSIONS & NOTIFICATION TOAST SYSTEM
    // ---------------------------------------------------------
    const volunteerForm = document.getElementById('volunteerForm');
    const contactForm = document.getElementById('contactForm');
    const donateForm = document.getElementById('donateForm');

    if (volunteerForm) {
        volunteerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('volunteerName').value;
            const email = document.getElementById('volunteerEmail').value;
            const skill = document.getElementById('volunteerSkill').value;
            const note = document.getElementById('volunteerNote').value;
            
            closeModal(volunteerModal);
            
            try {
                const response = await fetch('/api/volunteer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, skill, note })
                });
                const result = await response.json();
                
                if (response.ok) {
                    showNotification(`✨ Thank you, ${name}! Your volunteer registration was saved in our database.`, 'success');
                    volunteerForm.reset();
                } else {
                    showNotification(`⚠️ Submission failed: ${result.message || 'Error occurred.'}`, 'warning');
                }
            } catch (err) {
                console.error('Fetch error:', err);
                showNotification('❌ Connection failed. Check backend server and .env connection credentials.', 'warning');
            }
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('contactName').value;
            const email = document.getElementById('contactEmail').value;
            const message = document.getElementById('contactMessage').value;
            
            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, message })
                });
                const result = await response.json();
                
                if (response.ok) {
                    showNotification('✨ Form Submitted Successfully! We will be in touch.', 'success');
                    contactForm.reset();
                } else {
                    showNotification(`⚠️ Submission failed: ${result.message || 'Error occurred.'}`, 'warning');
                }
            } catch (err) {
                console.error('Fetch error:', err);
                showNotification('❌ Connection failed. Check backend server and .env connection credentials.', 'warning');
            }
        });
    }

    if (donateForm) {
        donateForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('donorName').value;
            const email = document.getElementById('donorEmail').value;
            const formattedAmount = Number(currentDonationAmount).toLocaleString('en-IN');
            
            closeModal(donateModal);
            showNotification(`❤️ Heartfelt thanks, ${name}! Your donation of ₹${formattedAmount} was received. A receipt has been sent to ${email}.`, 'success');
            donateForm.reset();
            if (customAmountInput) customAmountInput.value = '';
            // Reset to default active amount
            amountBtns.forEach(b => b.classList.remove('active'));
            const defaultBtn = document.querySelector('.amount-btn[data-amount="1000"]');
            if (defaultBtn) defaultBtn.classList.add('active');
            currentDonationAmount = 1000;
        });
    }

    // Premium Slide-In Toast Notification
    function showNotification(message, type = 'success') {
        const oldToast = document.querySelector('.toast-notification');
        if (oldToast) oldToast.remove();

        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-message">${message}</span>
            </div>
        `;

        // Style the toast notification inline for high flexibility
        const successBg = '#0c1b30'; // Navy theme
        const warningBg = '#e60000'; // Red theme
        
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: type === 'success' ? successBg : warningBg,
            color: '#ffffff',
            padding: '16px 24px',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(12, 27, 48, 0.2)',
            zIndex: '9999',
            fontFamily: "'Outfit', sans-serif",
            fontSize: '0.95rem',
            fontWeight: '500',
            maxWidth: '420px',
            opacity: '0',
            transform: 'translateY(20px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        });

        document.body.appendChild(toast);

        // Slide-in
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 10);

        // Slide-out and remove
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 6000);
    }
});
