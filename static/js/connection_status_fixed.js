/**
 * ConnectionManager - Utility for managing connection status in virtual consultations
 * 
 * This utility provides methods for tracking online/offline status,
 * monitoring Firebase/Firestore connectivity, and implementing 
 * network-aware operations for the consultation system.
 * 
 * FIXED VERSION - April 2025
 */

class ConnectionManager {
  constructor(options = {}) {
    // Debug info
    console.log("Initializing ConnectionManager (Fixed Version)");
    
    // Initialize properties
    this.isOnline = navigator.onLine;
    this.firebaseConnected = false;
    this.firestoreConnected = false;
    this.lastConnectionCheck = new Date();
    this.lastFirebaseSuccess = null;
    this.lastFirestoreSuccess = null;
    this.lastFirebaseFailure = null;
    this.lastFirestoreFailure = null;
    this.diagnostics = {
      connectionChecks: 0,
      successfulChecks: 0,
      failedChecks: 0,
      lastResponseTime: null,
      averageResponseTime: null,
      responseTimes: []
    };
    this.diagnosticsData = {};
    this.networkQuality = 'unknown';
    this.pendingRequests = [];
    this.reconnectAttempts = 0;
    this.isReconnecting = false;
    
    // Store options with defaults
    this.options = options || {};
    this.checkInterval = options.checkInterval || 30000; // Default: 30 seconds
    this.firebaseApp = options.firebaseApp || null;
    this.firebase = this.firebaseApp; // Store reference directly
    this.firestore = options.firestore || (this.firebaseApp ? this.firebaseApp.firestore() : null);
    this.database = null; // Will be set later if realtimeDB is enabled
    this.skipRealtimeDatabase = options.skipRealtimeDatabase || false;
    this.enableOfflinePersistence = options.enableOfflinePersistence || true;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
    
    // Initialize with event listeners
    this.initialize();
  }

  // Initialize connection manager with event listeners
  initialize() {
    try {
      // Set up event listeners for online/offline status
      window.addEventListener('online', this.handleOnlineEvent.bind(this));
      window.addEventListener('offline', this.handleOfflineEvent.bind(this));
      
      // Set up Firebase monitoring
      if (this.firebaseApp) {
        this.setupFirebaseMonitoring();
      }
      
      // Set up periodic connection check
      if (this.checkInterval > 0) {
        this.intervalId = setInterval(() => {
          this.checkConnection();
        }, this.checkInterval);
        
        console.log("Periodic connection check set up (every " + (this.checkInterval / 1000) + " seconds)");
      }
      
      // Perform initial check
      this.checkConnection();
      
      console.log("ConnectionManager initialized successfully");
    } catch (err) {
      console.error("Error initializing ConnectionManager:", err);
    }
  }
  
  // Handler for online event
  handleOnlineEvent() {
    console.log('Browser reports online status');
    this.isOnline = true;
    this.updateConnectionStatus();
    
    // Try to reconnect to Firebase services
    if (this.firebase && this.firestore) {
      this.checkFirestoreConnection();
    }
  }
  
  // Handler for offline event
  handleOfflineEvent() {
    console.log('Browser reports offline status');
    this.isOnline = false;
    this.updateConnectionStatus();
  }

  // Set up Firebase and Firestore monitoring
  setupFirebaseMonitoring() {
    try {
      // If no Firebase app is provided, try to use global Firebase instance
      if (!this.firebase) {
        if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
          console.log("Using global Firebase instance");
          this.firebase = firebase;
        } else {
          console.log("No Firebase instance available");
          return;
        }
      }
      
      // Skip Realtime Database if specified or databaseURL is missing
      if (this.skipRealtimeDatabase) {
        console.log("Skipping Realtime Database connection monitoring (explicitly disabled)");
      } else {
        try {
          // Try to access database reference - will throw error if databaseURL is missing
          this.database = this.firebase.database();
          this.databaseRef = this.database.ref('.info/connected');
          
          // Add listener for connection status
          this.databaseRef.on('value', (snapshot) => {
            const connected = snapshot.val() === true;
            this.firebaseConnected = connected;
            
            if (connected) {
              this.lastFirebaseSuccess = new Date();
            } else {
              this.lastFirebaseFailure = new Date();
            }
            
            this.updateConnectionStatus();
          });
          
          console.log("Firebase Realtime Database monitoring set up");
        } catch (dbError) {
          console.log("Could not monitor Firebase Realtime Database:", dbError);
          this.skipRealtimeDatabase = true;
        }
      }
      
      // Set up Firestore monitoring
      if (this.firebase.firestore) {
        this.firestore = this.firebase.firestore();
        
        // Try to enable offline persistence
        if (this.enableOfflinePersistence) {
          this.enableFirestoreOffline();
        }
        
        // Enable network
        this.firestore.enableNetwork()
          .then(() => {
            console.log("Firestore network enabled");
            this.checkFirestoreConnection();
          })
          .catch(err => {
            console.warn("Could not enable Firestore network:", err);
          });
      }
    } catch (error) {
      console.error("Error setting up Firebase monitoring:", error);
    }
  }

  // Enable offline persistence for Firestore
  enableFirestoreOffline() {
    if (!this.firestore) return;
    
    try {
      this.firestore.enablePersistence({synchronizeTabs: true})
        .then(() => {
          console.log("Firestore offline persistence enabled");
        })
        .catch(error => {
          if (error.code === 'failed-precondition') {
            console.warn('Multiple tabs open, persistence enabled in first tab only');
          } else if (error.code === 'unimplemented') {
            console.warn('Browser does not support offline persistence');
          } else {
            console.error('Error enabling offline persistence:', error);
          }
        });
    } catch (error) {
      console.error("Exception in enableFirestoreOffline:", error);
    }
  }
  
  // Check overall connection status
  checkConnection() {
    // Update browser online status
    this.isOnline = navigator.onLine;
    
    // Update timestamp
    this.lastConnectionCheck = new Date();
    this.diagnostics.connectionChecks++;
    
    // Check Firestore if available
    if (this.firestore && this.isOnline) {
      this.checkFirestoreConnection();
    }
    
    // Update connection status
    this.updateConnectionStatus();
    
    return this.getStatus();
  }
  
  // Check if Firestore is connected by making a small query
  checkFirestoreConnection() {
    if (!this.firestore) return Promise.resolve(false);
    
    try {
      // Use a small query to check connection
      const startTime = Date.now();
      
      return this.firestore.collection('system')
        .doc('status')
        .get()
        .then(() => {
          const responseTime = Date.now() - startTime;
          
          // Update status
          this.firestoreConnected = true;
          this.lastFirestoreSuccess = new Date();
          this.diagnostics.successfulChecks++;
          this.diagnostics.lastResponseTime = responseTime;
          
          // Track response times
          this.diagnostics.responseTimes.push(responseTime);
          if (this.diagnostics.responseTimes.length > 10) {
            this.diagnostics.responseTimes.shift(); // Keep only last 10
          }
          
          // Calculate average
          const sum = this.diagnostics.responseTimes.reduce((a, b) => a + b, 0);
          this.diagnostics.averageResponseTime = sum / this.diagnostics.responseTimes.length;
          
          // Determine network quality
          if (responseTime < 300) {
            this.networkQuality = 'good';
          } else if (responseTime < 1000) {
            this.networkQuality = 'moderate';
          } else {
            this.networkQuality = 'poor';
          }
          
          this.updateConnectionStatus();
          return true;
        })
        .catch(error => {
          console.warn('Firestore connection check failed:', error);
          this.firestoreConnected = false;
          this.lastFirestoreFailure = new Date();
          this.diagnostics.failedChecks++;
          this.updateConnectionStatus();
          return false;
        });
    } catch (error) {
      console.error("Error checking Firestore connection:", error);
      this.firestoreConnected = false;
      this.updateConnectionStatus();
      return Promise.resolve(false);
    }
  }
  
  // Get the overall connection status
  getOverallStatus() {
    if (!this.isOnline) {
      return 'offline';
    }
    
    if (this.firebase) {
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
  
  // Get the complete status object
  getStatus() {
    return {
      isOnline: this.isOnline,
      firebaseConnected: this.firebaseConnected,
      firestoreConnected: this.firestoreConnected,
      overallStatus: this.getOverallStatus(),
      lastCheck: this.lastConnectionCheck,
      lastSuccess: this.lastFirestoreSuccess,
      lastFailure: this.lastFirestoreFailure,
      pendingRequests: this.pendingRequests ? this.pendingRequests.length : 0,
      networkQuality: this.networkQuality,
      diagnostics: this.diagnostics
    };
  }
  
  // Check if there is any successful connection
  getOverallConnected() {
    return this.isOnline && (this.firebaseConnected || this.firestoreConnected);
  }
  
  // Update connection status and trigger callbacks
  updateConnectionStatus() {
    const status = this.getStatus();
    
    // Trigger callback if provided
    if (this.options.onStatusChange) {
      try {
        this.options.onStatusChange(status);
      } catch (err) {
        console.error("Error in status change callback:", err);
      }
    }
    
    return status;
  }
  
  // Queue a request to be executed when back online
  queueRequest(request) {
    if (!this.pendingRequests) {
      this.pendingRequests = [];
    }
    
    // Generate request ID if not provided
    if (!request.id) {
      request.id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    request.timestamp = new Date();
    this.pendingRequests.push(request);
    
    console.log(`Request queued for later execution:`, request);
    
    // Try storing in localStorage for persistence
    try {
      let storedRequests = JSON.parse(localStorage.getItem('pendingRequests') || '[]');
      storedRequests.push({
        id: request.id,
        type: request.type,
        data: request.data,
        timestamp: request.timestamp
      });
      localStorage.setItem('pendingRequests', JSON.stringify(storedRequests));
    } catch (e) {
      console.warn('Could not persist request to localStorage:', e);
    }
    
    return request.id;
  }
  
  // Process pending requests when back online
  processPendingRequests() {
    if (!this.getOverallConnected() || !this.pendingRequests || this.pendingRequests.length === 0) {
      return;
    }
    
    console.log(`Processing ${this.pendingRequests.length} pending requests`);
    
    // Get additional requests from localStorage
    try {
      const storedRequests = JSON.parse(localStorage.getItem('pendingRequests') || '[]');
      if (storedRequests.length > 0) {
        // Add any requests not already in memory
        const existingIds = this.pendingRequests.map(req => req.id);
        for (const storedReq of storedRequests) {
          if (!existingIds.includes(storedReq.id)) {
            this.pendingRequests.push(storedReq);
          }
        }
      }
      
      // Clear localStorage
      localStorage.removeItem('pendingRequests');
    } catch (e) {
      console.warn('Error processing stored requests:', e);
    }
    
    // Process each request
    const requests = [...this.pendingRequests];
    this.pendingRequests = []; // Clear queue
    
    requests.forEach(request => {
      console.log(`Processing queued request:`, request);
      
      try {
        // Handle based on request type
        switch (request.type) {
          case 'firestore-set':
            if (this.firestore) {
              const docRef = this.firestore.collection(request.data.collection).doc(request.data.docId);
              docRef.set(request.data.data, { merge: true })
                .then(() => {
                  console.log(`Request completed: ${request.id}`);
                  if (request.callback) request.callback(null, true);
                })
                .catch(error => {
                  console.error(`Error processing request: ${request.id}`, error);
                  if (request.callback) request.callback(error, false);
                  this.queueRequest(request); // Re-queue on failure
                });
            }
            break;
            
          case 'api-call':
            fetch(request.data.url, request.data.options)
              .then(response => {
                if (!response.ok) throw new Error(`HTTP error ${response.status}`);
                return response.json();
              })
              .then(data => {
                console.log(`Request completed: ${request.id}`);
                if (request.callback) request.callback(null, data);
              })
              .catch(error => {
                console.error(`Error processing request: ${request.id}`, error);
                if (request.callback) request.callback(error, null);
                this.queueRequest(request); // Re-queue on failure
              });
            break;
            
          case 'custom':
            if (typeof request.execute === 'function') {
              request.execute(request.data)
                .then(result => {
                  console.log(`Request completed: ${request.id}`);
                  if (request.callback) request.callback(null, result);
                })
                .catch(error => {
                  console.error(`Error processing request: ${request.id}`, error);
                  if (request.callback) request.callback(error, null);
                  this.queueRequest(request); // Re-queue on failure
                });
            }
            break;
            
          default:
            console.warn(`Unknown request type: ${request.type}`);
        }
      } catch (error) {
        console.error(`Error processing request ${request.id}:`, error);
        if (request.callback) request.callback(error, null);
      }
    });
  }
  
  // Clean up resources
  destroy() {
    console.log("Destroying ConnectionManager");
    
    // Remove event listeners
    window.removeEventListener('online', this.handleOnlineEvent.bind(this));
    window.removeEventListener('offline', this.handleOfflineEvent.bind(this));
    
    // Clear interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    // Clean up Firebase listeners
    if (this.databaseRef) {
      try {
        this.databaseRef.off('value');
      } catch (err) {
        console.warn('Error removing database listener:', err);
      }
    }
    
    // Disable Firestore network
    if (this.firestore) {
      try {
        this.firestore.disableNetwork()
          .catch(err => console.warn('Error disabling Firestore network:', err));
      } catch (err) {
        console.warn('Error disabling Firestore:', err);
      }
    }
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConnectionManager;
} 