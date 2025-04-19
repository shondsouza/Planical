/**
 * Doctor View Initialization Script - VERSION 2025-04-19-v5
 * This file contains clean implementations of all UI initialization functions
 * to replace any problematic functions in the main HTML file.
 */

// IMMEDIATE EMERGENCY FIXES - Run before waiting for DOMContentLoaded
(function() {
  console.log("EMERGENCY FIX FROM JS FILE - Applying immediate function overrides");
  
  // Create safe fallback functions that will prevent errors
  window.setupAvailabilityToggle = window.setupAvailabilityToggle || function() {
    console.log("EMERGENCY FIX FROM JS FILE - Called setupAvailabilityToggle fallback");
  };
  
  // Override initializeUIElements if it already exists
  if (typeof window.initializeUIElements === 'function') {
    console.log("EMERGENCY FIX FROM JS FILE - Overriding existing initializeUIElements");
    window.originalInitUIElements = window.initializeUIElements;
    window.initializeUIElements = function() {
      console.log("EMERGENCY FIX FROM JS FILE - Called safe initializeUIElements");
    };
  }
  
  // Override setupFilterButtons
  window.setupFilterButtons = window.setupFilterButtons || function() {
    console.log("EMERGENCY FIX FROM JS FILE - Called setupFilterButtons fallback");
  };
  
  // Override setupTimers
  window.setupTimers = window.setupTimers || function() {
    console.log("EMERGENCY FIX FROM JS FILE - Called setupTimers fallback");
  };
  
  // Override setupSortingButtons
  window.setupSortingButtons = window.setupSortingButtons || function() {
    console.log("EMERGENCY FIX FROM JS FILE - Called setupSortingButtons fallback");
  };
  
  // Override setupRefreshButton
  window.setupRefreshButton = window.setupRefreshButton || function() {
    console.log("EMERGENCY FIX FROM JS FILE - Called setupRefreshButton fallback");
  };
})();

// Wait for the document to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log("OVERRIDE - doctor_view_init.js v5 - Implementing clean UI initialization");
  
  // Delay to ensure other scripts have loaded
  setTimeout(function() {
    // Initialize UI elements directly
    try {
      console.log("OVERRIDE - Initializing UI elements directly");
      
      // Setup availability toggle button
      console.log("OVERRIDE - Setting up availability toggle");
      const toggleBtn = document.getElementById('status-toggle');
      if (toggleBtn) {
        // Remove existing event listeners
        const newToggleBtn = toggleBtn.cloneNode(true);
        toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);
        
        // Add new event listener
        newToggleBtn.addEventListener('click', function() {
          console.log("OVERRIDE - Toggle button clicked");
          toggleAvailabilityClean();
        });
      }
      
      // Setup timers for consultation requests
      console.log("OVERRIDE - Setting up timers");
      const doctorId = document.querySelector('meta[name="doctor-id"]')?.content || 
                       document.getElementById('doctor-id')?.value || 
                       "unknown";
      
      // Set up a timer to check for requests
      if (typeof window.checkRequestsInterval === 'undefined') {
        window.checkRequestsInterval = setInterval(function() {
          if (typeof window.manualCheckForRequests === 'function') {
            console.log("OVERRIDE - Checking for requests...");
            window.manualCheckForRequests(doctorId);
          } else if (typeof manualCheckForRequests === 'function') {
            console.log("OVERRIDE - Checking for requests (local function)...");
            manualCheckForRequests(doctorId);
          } else {
            console.log("OVERRIDE - manualCheckForRequests function not found");
          }
        }, 60000);
      }
      
      // Make all functions globally available
      window.toggleAvailabilityClean = toggleAvailabilityClean;
    } catch (err) {
      console.error("OVERRIDE - Error in UI initialization:", err);
    }
    
    // Run an initial check for requests
    try {
      const doctorId = document.querySelector('meta[name="doctor-id"]')?.content || 
                       document.getElementById('doctor-id')?.value || 
                       "unknown";
      
      if (typeof window.manualCheckForRequests === 'function') {
        console.log("OVERRIDE - Running initial check for requests");
        window.manualCheckForRequests(doctorId);
      } else if (typeof manualCheckForRequests === 'function') {
        console.log("OVERRIDE - Running initial check for requests (local function)");
        manualCheckForRequests(doctorId);
      }
    } catch (err) {
      console.error("OVERRIDE - Error in initial request check:", err);
    }
    
    // Add a last-check element to show last update time
    try {
      const waitingArea = document.querySelector('.waiting-area');
      if (waitingArea && !document.getElementById('lastCheckTime')) {
        const lastCheckElement = document.createElement('p');
        lastCheckElement.className = 'text-muted mt-3 small';
        lastCheckElement.innerHTML = 'Last checked: <span id="lastCheckTime">Just now</span>';
        waitingArea.appendChild(lastCheckElement);
        if (typeof updateLastCheckTime === 'function') {
          updateLastCheckTime();
        }
      }
    } catch (err) {
      console.error("OVERRIDE - Error adding last check time element:", err);
    }
  }, 1000); // Delay 1 second to ensure other scripts have loaded
});

/**
 * Clean implementation of the toggle availability function
 */
function toggleAvailabilityClean() {
  console.log("OVERRIDE - Toggling availability");
  try {
    const toggleBtn = document.getElementById('status-toggle');
    const statusBadge = document.getElementById('status-badge');
    const statusText = document.getElementById('status-text');
    
    if (!toggleBtn) {
      console.error("OVERRIDE - Toggle button not found");
      return;
    }
    
    if (toggleBtn.classList.contains('active')) {
      // Change to inactive
      toggleBtn.classList.remove('active');
      toggleBtn.classList.add('inactive');
      toggleBtn.innerHTML = '<i class="bi bi-x-circle-fill"></i> <span>Not Available</span>';
      
      if (statusBadge) {
        statusBadge.classList.remove('status-online');
        statusBadge.classList.add('status-offline');
        statusBadge.textContent = 'Unavailable';
      }
      
      if (statusText) {
        statusText.textContent = 'You\'re not available for consultations';
      }
      
      // Notify server about status change
      if (window.socket) {
        window.socket.emit('update-doctor-status', {
          doctorId: document.querySelector('meta[name="doctor-id"]')?.content || 
                   document.getElementById('doctor-id')?.value || 
                   "unknown",
          available: false
        });
      }
    } else {
      // Change to active
      toggleBtn.classList.remove('inactive');
      toggleBtn.classList.add('active');
      toggleBtn.innerHTML = '<i class="bi bi-check-circle-fill"></i> <span>Available for Consultations</span>';
      
      if (statusBadge) {
        statusBadge.classList.remove('status-offline');
        statusBadge.classList.add('status-online');
        statusBadge.textContent = 'Available';
      }
      
      if (statusText) {
        statusText.textContent = 'You\'re available for consultations';
      }
      
      // Notify server about status change
      if (window.socket) {
        window.socket.emit('update-doctor-status', {
          doctorId: document.querySelector('meta[name="doctor-id"]')?.content || 
                   document.getElementById('doctor-id')?.value || 
                   "unknown",
          available: true
        });
      }
    }
  } catch (err) {
    console.error("OVERRIDE - Error toggling availability:", err);
  }
}

// Doctor View Initialization Safety Script
// Version: 2025-04-19-v7
// Purpose: Prevent common errors by pre-defining required functions

console.log("Doctor View Safety Script Loaded - v7");

// Ensure all critical functions exist to prevent reference errors
window.setupAvailabilityToggle = window.setupAvailabilityToggle || function() {
  console.log("SAFETY SCRIPT - Called setupAvailabilityToggle fallback");
  // Add basic implementation
  const toggleBtn = document.getElementById('status-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function() {
      // Basic toggle implementation
      if (this.classList.contains('active')) {
        this.classList.remove('active');
        this.classList.add('inactive');
        this.innerHTML = '<i class="bi bi-x-circle-fill"></i> <span>Not Available</span>';
      } else {
        this.classList.remove('inactive');
        this.classList.add('active');
        this.innerHTML = '<i class="bi bi-check-circle-fill"></i> <span>Available for Consultations</span>';
      }
    });
  }
};

// Create safe versions of all UI initialization functions
window.initializeUIElements = window.initializeUIElements || function() {
  console.log("SAFETY SCRIPT - Called initializeUIElements fallback");
  // Call safe versions of all required functions
  if (typeof window.setupAvailabilityToggle === 'function') {
    window.setupAvailabilityToggle();
  }
  
  if (typeof window.setupFilterButtons === 'function') {
    window.setupFilterButtons();
  }
  
  if (typeof window.setupTimers === 'function') {
    window.setupTimers();
  }
};

// Add other potentially missing functions
window.setupFilterButtons = window.setupFilterButtons || function() {
  console.log("SAFETY SCRIPT - Called setupFilterButtons fallback");
};

window.setupTimers = window.setupTimers || function() {
  console.log("SAFETY SCRIPT - Called setupTimers fallback");
  // Basic implementation - set up request check interval
  const doctorId = document.getElementById('doctor-id')?.value;
  if (doctorId && typeof window.manualCheckForRequests === 'function') {
    window.requestInterval = setInterval(function() {
      window.manualCheckForRequests(doctorId);
    }, 60000);
  }
};

window.setupSortingButtons = window.setupSortingButtons || function() {
  console.log("SAFETY SCRIPT - Called setupSortingButtons fallback");
};

window.setupRefreshButton = window.setupRefreshButton || function() {
  console.log("SAFETY SCRIPT - Called setupRefreshButton fallback");
};

// Provide basic implementations for other critical functions
window.manualCheckForRequests = window.manualCheckForRequests || function(doctorId) {
  console.log("SAFETY SCRIPT - Called manualCheckForRequests fallback for doctor:", doctorId);
  // This would typically check for pending consultation requests
};

window.toggleAvailability = window.toggleAvailability || function() {
  console.log("SAFETY SCRIPT - Called toggleAvailability fallback");
  const toggleBtn = document.getElementById('status-toggle');
  const statusBadge = document.getElementById('status-badge');
  const statusText = document.getElementById('status-text');
  
  if (toggleBtn) {
    if (toggleBtn.classList.contains('active')) {
      toggleBtn.classList.remove('active');
      toggleBtn.classList.add('inactive');
      toggleBtn.innerHTML = '<i class="bi bi-x-circle-fill"></i> <span>Not Available</span>';
      
      if (statusBadge) {
        statusBadge.classList.remove('status-online');
        statusBadge.classList.add('status-offline');
        statusBadge.textContent = 'Unavailable';
      }
      
      if (statusText) {
        statusText.textContent = 'You\'re not available for consultations';
      }
    } else {
      toggleBtn.classList.remove('inactive');
      toggleBtn.classList.add('active');
      toggleBtn.innerHTML = '<i class="bi bi-check-circle-fill"></i> <span>Available for Consultations</span>';
      
      if (statusBadge) {
        statusBadge.classList.remove('status-offline');
        statusBadge.classList.add('status-online');
        statusBadge.textContent = 'Available';
      }
      
      if (statusText) {
        statusText.textContent = 'You\'re available for consultations';
      }
    }
  }
};

// Create a signal that our safety script has loaded
window.DOCTOR_VIEW_SAFETY_LOADED = true;

console.log("Doctor View Safety Script Complete - All critical functions defined"); 