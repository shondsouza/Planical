/**
 * ConnectionManager - Utility for managing connection status in virtual consultations
 * 
 * This utility provides methods for tracking online/offline status,
 * monitoring Firebase/Firestore connectivity, and implementing 
 * network-aware operations for the consultation system.
 */

class ConnectionManager {
  constructor(options = {}) {
    this.options = {
      onStatusChange: null,
      onReconnect: null,
      onDisconnect: null,
      checkInterval: 30000, // 30 seconds
      firebaseApp: null,
      ...options
    };
    
    this.isOnline = navigator.onLine;
    this.firebaseConnected = false;
    this.firestoreConnected = false;
    this.checkIntervalId = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    
    // Initialize
    this.init();
  }
  
  /**
   * Initialize connection manager and event listeners
   */
  init() {
    // Add browser online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Set up Firebase connection monitoring if Firebase is provided
    if (this.options.firebaseApp) {
      this.setupFirebaseMonitoring();
    }
    
    // Start periodic connection check
    this.startPeriodicCheck();
    
    // Initial check
    this.checkConnection();
  }
  
  /**
   * Set up Firebase connection monitoring
   */
  setupFirebaseMonitoring() {
    const db = firebase.firestore();
    
    // Monitor Firestore connection
    db.enableNetwork().then(() => {
      console.log('Firestore network enabled');
      
      // Set up connection state listener
      const connRef = firebase.database().ref('.info/connected');
      connRef.on('value', (snap) => {
        this.firebaseConnected = snap.val() === true;
        this.updateStatus();
        
        if (this.firebaseConnected) {
          console.log('Firebase connected');
          this.reconnectAttempts = 0;
          if (this.options.onReconnect) {
            this.options.onReconnect('firebase');
          }
        } else {
          console.log('Firebase disconnected');
          if (this.options.onDisconnect) {
            this.options.onDisconnect('firebase');
          }
        }
      });
    }).catch(error => {
      console.error('Error enabling Firestore network:', error);
      this.firestoreConnected = false;
      this.updateStatus();
    });
  }
  
  /**
   * Start periodic connection check
   */
  startPeriodicCheck() {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
    }
    
    this.checkIntervalId = setInterval(() => {
      this.checkConnection();
    }, this.options.checkInterval);
  }
  
  /**
   * Stop periodic connection check
   */
  stopPeriodicCheck() {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
    }
  }
  
  /**
   * Handle browser online event
   */
  handleOnline() {
    console.log('Browser reports online status');
    this.isOnline = true;
    this.updateStatus();
    this.checkConnection();
    
    // Attempt to reconnect Firebase
    if (this.options.firebaseApp && !this.firebaseConnected) {
      this.attemptReconnect();
    }
  }
  
  /**
   * Handle browser offline event
   */
  handleOffline() {
    console.log('Browser reports offline status');
    this.isOnline = false;
    this.updateStatus();
  }
  
  /**
   * Check overall connection status
   */
  checkConnection() {
    // Check browser connection
    this.isOnline = navigator.onLine;
    
    // Check firestore if needed
    if (this.options.firebaseApp && this.isOnline) {
      this.checkFirestoreConnection();
    }
    
    this.updateStatus();
    return this.getStatus();
  }
  
  /**
   * Check Firestore connection by performing a small query
   */
  checkFirestoreConnection() {
    if (!this.options.firebaseApp) return;
    
    const db = firebase.firestore();
    
    // Use a small lightweight collection to test connection
    db.collection('system')
      .doc('status')
      .get()
      .then(() => {
        this.firestoreConnected = true;
        this.updateStatus();
      })
      .catch(error => {
        console.warn('Firestore connection check failed:', error);
        this.firestoreConnected = false;
        this.updateStatus();
      });
  }
  
  /**
   * Attempt to reconnect to Firebase/Firestore
   */
  attemptReconnect() {
    if (!this.options.firebaseApp || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return false;
    }
    
    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    const db = firebase.firestore();
    return db.enableNetwork()
      .then(() => {
        console.log('Firestore network re-enabled successfully');
        this.firestoreConnected = true;
        this.updateStatus();
        return true;
      })
      .catch(error => {
        console.error('Error re-enabling Firestore network:', error);
        
        // Calculate backoff delay
        const backoffDelay = Math.min(1000 * (2 ** this.reconnectAttempts), 30000);
        console.log(`Will retry in ${backoffDelay/1000} seconds`);
        
        // Schedule next retry
        setTimeout(() => {
          this.attemptReconnect();
        }, backoffDelay);
        
        return false;
      });
  }
  
  /**
   * Enable offline persistence for Firestore
   */
  enableOfflinePersistence() {
    if (!this.options.firebaseApp) return Promise.reject(new Error('Firebase not initialized'));
    
    const db = firebase.firestore();
    return db.enablePersistence({synchronizeTabs: true})
      .then(() => {
        console.log('Firestore offline persistence enabled');
        return true;
      })
      .catch(error => {
        if (error.code === 'failed-precondition') {
          console.warn('Multiple tabs open, offline persistence enabled in first tab only');
        } else if (error.code === 'unimplemented') {
          console.warn('Browser does not support offline persistence');
        } else {
          console.error('Error enabling offline persistence:', error);
        }
        return false;
      });
  }
  
  /**
   * Update connection status and trigger callback
   */
  updateStatus() {
    const previousStatus = this.getStatus();
    const currentStatus = {
      isOnline: this.isOnline,
      firebaseConnected: this.firebaseConnected,
      firestoreConnected: this.firestoreConnected,
      overallStatus: this.getOverallStatus()
    };
    
    // Call status change callback if provided and status changed
    if (this.options.onStatusChange && 
        (previousStatus.overallStatus !== currentStatus.overallStatus ||
         previousStatus.isOnline !== currentStatus.isOnline)) {
      this.options.onStatusChange(currentStatus);
    }
  }
  
  /**
   * Get current connection status
   */
  getStatus() {
    return {
      isOnline: this.isOnline,
      firebaseConnected: this.firebaseConnected,
      firestoreConnected: this.firestoreConnected,
      overallStatus: this.getOverallStatus()
    };
  }
  
  /**
   * Get overall connection status
   */
  getOverallStatus() {
    if (!this.isOnline) {
      return 'offline';
    }
    
    if (this.options.firebaseApp) {
      if (this.firebaseConnected && this.firestoreConnected) {
        return 'connected';
      } else if (this.firebaseConnected || this.firestoreConnected) {
        return 'partially-connected';
      } else {
        return 'disconnected';
      }
    }
    
    return this.isOnline ? 'connected' : 'offline';
  }
  
  /**
   * Add an event handler for status changes
   */
  onStatusChange(callback) {
    this.options.onStatusChange = callback;
  }
  
  /**
   * Clean up connection manager
   */
  destroy() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    
    this.stopPeriodicCheck();
    
    if (this.options.firebaseApp) {
      try {
        const connRef = firebase.database().ref('.info/connected');
        connRef.off('value');
      } catch (err) {
        console.warn('Error removing Firebase connection listener:', err);
      }
    }
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConnectionManager;
} 