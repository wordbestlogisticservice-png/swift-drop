let shipments = JSON.parse(localStorage.getItem('shipments')) || {};
let complaints = JSON.parse(localStorage.getItem('complaints')) || {};

// Tracking Data
const trackingData = {
  'SD123456789': {
    id: 'SD123456789',
    customer: 'John Smith',
    origin: 'New York, NY, USA',
    destination: 'London, UK',
    status: 'in_transit',
    progress: 60,
    location: 'Frankfurt Airport, Germany',
    eta: '2025-01-25',
    customs: false,
    proof: 'proof1.jpg',
    updates: [
      { date: '2025-01-20', location: 'New York, NY', status: 'Picked Up', time: '09:30 AM' },
      { date: '2025-01-21', location: 'JFK Airport', status: 'Cleared Customs', time: '14:15 PM' },
      { date: '2025-01-22', location: 'Frankfurt Airport', status: 'In Transit', time: '08:45 AM' }
    ]
  },
  'SD987654321': {
    id: 'SD987654321',
    customer: 'Sarah Johnson',
    origin: 'Miami, FL, USA',
    destination: 'Sydney, Australia',
    status: 'delivered',
    progress: 100,
    location: 'Delivered - Sydney',
    eta: '2025-01-18',
    customs: true,
    proof: 'proof2.jpg',
    updates: [
      { date: '2025-01-15', location: 'Miami, FL', status: 'Picked Up', time: '10:00 AM' },
      { date: '2025-01-16', location: 'Customs Held - LAX', status: 'On Hold - Customs', time: '15:30 PM' },
      { date: '2025-01-17', location: 'LAX Airport', status: 'Cleared Customs', time: '11:20 AM' },
      { date: '2025-01-18', location: 'Sydney, Australia', status: 'Delivered', time: '09:45 AM' }
    ]
  }
};

// Navigation
function toggleMobileMenu() {
  document.getElementById('navLinks').classList.toggle('active');
}

// Tracking Functions
function trackFromHero() {
  const trackingId = document.getElementById('heroTrackInput').value.toUpperCase().trim();
  if(trackingId) {
    trackPackage(trackingId);
  }
}

function useSample(id) {
  document.getElementById('trackingInput').value = id;
  trackPackage();
}

function trackPackage(id = null) {
  const trackingId = id || document.getElementById('trackingInput').value.toUpperCase().trim();
  if (!trackingId) return alert('Please enter a tracking ID');
  
  const shipments = JSON.parse(localStorage.getItem('shipments') || '{}');
  const shipment = shipments[trackingId] || trackingData[trackingId];
  
  if (shipment) {
    showTrackingResult(shipment);
    showChatBot(trackingId);
  } else {
    document.getElementById('trackResult').innerHTML = `
      <div style="padding: 40px; text-align: center;">
        <i class="fas fa-search" style="font-size: 48px; color: #d1d5db; margin-bottom: 20px;"></i>
        <h3>No package found</h3>
        <p>Try these sample IDs: SD123456789, SD987654321</p>
      </div>
    `;
    document.getElementById('trackResult').style.display = 'block';
  }
}


function showTrackingResult(data) {
  const result = document.getElementById('trackResult');
  result.innerHTML = `
    <div class="result-header">
      <div class="result-status">
        <i class="fas fa-map-marker-alt"></i>
        <span>${getStatusIcon(data.status)} ${data.location || getStatusText(data.status)}</span>
      </div>
      <div class="result-id">
        <strong>Tracking ID:</strong> ${data.id}
      </div>
    </div>
    
    <div class="progress-track">
      <div class="progress-line">
        <div class="progress-fill" style="width: ${data.progress}%"></div>
      </div>
      <div class="progress-stops">
        <div class="stop ${data.progress > 0 ? 'active' : ''}">
          <i class="fas fa-box"></i>
          <span>Picked Up</span>
        </div>
        <div class="stop ${data.progress > 25 ? 'active' : ''}">
          <i class="fas fa-warehouse"></i>
          <span>Processing</span>
        </div>
        <div class="stop ${data.progress > 50 ? 'active' : ''}">
          <i class="fas fa-plane"></i>
          <span>In Transit</span>
        </div>
        <div class="stop ${data.progress > 75 ? 'active' : ''}">
          <i class="fas fa-home"></i>
          <span>Delivered</span>
        </div>
      </div>
    </div>
    
    <div class="result-details">
      <div class="detail-row">
        <span class="detail-label">Customer:</span>
        <span class="detail-value">${data.customer}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">From:</span>
        <span class="detail-value">${data.origin}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">To:</span>
        <span class="detail-value">${data.destination}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">ETA:</span>
        <span class="detail-value">${data.eta}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Customs:</span>
        <span class="detail-value">${data.customs ? '🔄 In Customs Clearance' : '✅ Cleared'}</span>
      </div>
      ${data.proof ? `
        <div class="detail-row">
          <span class="detail-label">Proof:</span>
          <span class="detail-value">
            <img src="${data.proof}" style="width: 80px; height: 60px; object-fit: cover; border-radius: 8px;" onclick="openProof('${data.proof}')">
          </span>
        </div>
      ` : ''}
    </div>
    
    <div class="timeline">
      <h4 style="margin-bottom: 20px; font-size: 18px;">📍 Recent Updates</h4>
      ${data.updates.map(update => `
        <div class="timeline-item">
          <div class="timeline-date">${update.date} ${update.time}</div>
          <div class="timeline-location">${update.location}</div>
          <div class="timeline-status">${update.status}</div>
        </div>
      `).reverse().join('')}
    </div>
    
    <div class="track-actions">
      <button onclick="reportIssue('${data.id}')" class="btn-chat">
        <i class="fas fa-comments"></i> Report Issue
      </button>
    </div>
  `;
  
  result.style.display = 'block';
  result.scrollIntoView({ behavior: 'smooth' });
}

function getStatusIcon(status) {
  const icons = {
    'pending': '⏳',
    'in_transit': '🚚',
    'customs': '🛃',
    'on_hold': '⏸️',
    'delivered': '✅'
  };
  return icons[status] || '📦';
}

function getStatusText(status) {
  const texts = {
    'pending': 'Pending',
    'in_transit': 'In Transit',
    'customs': 'Customs Clearance',
    'on_hold': 'On Hold',
    'delivered': 'Delivered'
  };
  return texts[status] || status;
}

function openProof(src) {
  window.open(src, '_blank');
}

function reportIssue(trackingId) {
  const message = prompt('Describe your issue:');
  if(message) {
    const complaint = {
      id: Date.now(),
      trackingId,
      customer: trackingData[trackingId]?.customer || 'Unknown',
      message,
      date: new Date().toLocaleString(),
      status: 'unread'
    };
    complaints[complaint.id] = complaint;
    localStorage.setItem('complaints', JSON.stringify(complaints));
    alert('Complaint submitted! Admin will respond soon.');
    showChatBot(trackingId);
  }
}

function showChatBot(trackingId) {
  toggleChat();
  document.getElementById('chatMessages').innerHTML += `
    <div class="chat-message bot">
      <div class="message-content">
        <p>📦 Tracking #${trackingId}<br>Current status: ${trackingData[trackingId]?.location || 'Unknown'}</p>
        <p>How can I help with your shipment?</p>
      </div>
      <span class="message-time">Now</span>
    </div>
  `;
}

// Chat Functions
function toggleChat() {
  const chatBox = document.getElementById('chatBox');
  chatBox.style.display = chatBox.style.display === 'block' ? 'none' : 'block';
}

function handleChatKeyPress(e) {
  if (e.key === 'Enter') sendChatMessage();
}

function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  if (!message) return;
  
  document.getElementById('chatMessages').innerHTML += `
    <div class="chat-message user">
      <div class="message-content">
        <p>${message}</p>
      </div>
      <span class="message-time">Now</span>
    </div>
  `;
  
  input.value = '';
  
  setTimeout(() => {
    document.getElementById('chatMessages').innerHTML += `
      <div class="chat-message bot">
        <div class="message-content">
          <p>Thank you for your message. Our team will get back to you soon. Need help with tracking?</p>
        </div>
        <span class="message-time">${new Date().toLocaleTimeString()}</span>
      </div>
    `;
  }, 1000);
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
});

// AOS-like scroll animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Apply to all animated elements
document.querySelectorAll('[data-aos]').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(50px)';
  el.style.transition = 'all 0.6s ease';
  observer.observe(el);
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Form submissions
document.getElementById('contactForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  alert('Thank you! Your message has been sent. We\'ll get back to you soon.');
  this.reset();
});

// Contact form focus effects
document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
  input.addEventListener('focus', function() {
    this.parentElement.style.transform = 'scale(1.02)';
  });
  
  input.addEventListener('blur', function() {
    this.parentElement.style.transform = 'scale(1)';
  });
});

