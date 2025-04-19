/**
 * ConnectionManager - Utility for managing connection status in virtual consultations
 * 
 * This utility provides methods for tracking online/offline status,
 * monitoring Firebase/Firestore connectivity, and implementing 
 * network-aware operations for the consultation system.
 */

class ConnectionManager {
  constructor() {
    this.online = navigator.onLine;
    this.firebaseConnected = false;
    this.firestoreConnected = false;
    this.lastChecked = new Date();
    this.checkInterval = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000; 
    this.firebase = null; // Reference to the Firebase app
    this.firestore = null; // Reference to Firestore
    this.databaseRef = null; // Reference to Firebase Realtime Database

    // Diagnostics data
    this.diagnostics = {
      lastChecked: new Date(),
      lastOnline: navigator.onLine ? new Date() : null,
      lastOffline: navigator.onLine ? null : new Date(),
      connectionChecks: 0,
      reconnectAttempts: 0,
      errors: []
    };

    // Default options
    this.options = {
      checkInterval: 30000,
      onStatusChange: null,
      onReconnect: null,
      onDisconnect: null,
      firebaseApp: null,
      enableOfflinePersistence: true,
      enableBackgroundSync: true,
      skipRealtimeDatabase: false // Option to skip Realtime Database connection
    };

    // Initialize listener for online/offline status
    this.setupListeners();
  }

  // Initialize the connection manager
  init(options) {
    console.log("Initializing ConnectionManager");
    
    // Merge options with defaults
    this.options = {
      ...this.options,
      ...options
    };
    
    // Store Firebase app instance
    this.firebase = this.options.firebaseApp;
    
    // Set up Firebase monitoring if Firebase app is provided
    this.setupFirebaseMonitoring();
    
    // Set up periodic connection check
    if (this.options.checkInterval > 0) {
      this.checkInterval = setInterval(() => {
        this.checkConnection();
      }, this.options.checkInterval);
      
      console.log("Periodic connection check set up (every " + (this.options.checkInterval / 1000) + " seconds)");
    }
    
    // Perform initial check
    this.checkConnection();
    
    // Enable offline persistence for Firestore if supported
    if (this.options.enableOfflinePersistence && this.firebase && typeof this.firebase.firestore === 'function') {
      this.enableOfflinePersistence();
    }
    
    console.log("ConnectionManager initialized successfully");
    return this;
  }

  setupFirebaseMonitoring() {
    try {
      if (!this.firebase) {
        console.log("No Firebase app provided to ConnectionManager");
        
        // Use global Firebase instance if available
        if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
          console.log("Using global Firebase instance");
          this.firebase = firebase;
        } else {
          return; // Cannot monitor Firebase without an instance
        }
      }
      
      // Skip Realtime Database if specified in options or if databaseURL is missing
      if (this.options.skipRealtimeDatabase) {
        console.log("Skipping Realtime Database connection monitoring (explicitly disabled)");
      } else {
        try {
          // Try to access the database reference - this will throw an error if databaseURL is missing
          this.databaseRef = this.firebase.database().ref('.info/connected');
          
          // Add listener for connection status
          this.databaseRef.on('value', (snapshot) => {
            const connected = snapshot.val() === true;
            this.firebaseConnected = connected;
            this.updateConnectionStatus();
          });
          
          console.log("Firebase Realtime Database monitoring set up");
        } catch (dbError) {
          console.log("Could not monitor Firebase Realtime Database, falling back to Firestore:", dbError);
          // Set this option so we don't try to use the database again
          this.options.skipRealtimeDatabase = true;
        }
      }
      
      // Always try to monitor Firestore
      if (this.firebase.firestore) {
        this.firestore = this.firebase.firestore();
        
        // Try to enable the network for Firestore
        try {
          this.firestore.enableNetwork().then(() => {
            console.log("Firestore network enabled");
            this.checkFirestoreConnection();
          });
        } catch (err) {
          console.warn("Could not enable Firestore network:", err);
        }
      }
    } catch (error) {
      console.error("Error setting up Firebase monitoring:", error);
    }
  }

  /**
   * Setup background sync for offline operations
   */
  setupBackgroundSync() {
    try {
      navigator.serviceWorker.ready.then(registration => {
        // Register sync event
        registration.sync.register('sync-pending-requests')
          .then(() => console.log('Background sync registered'))
          .catch(err => console.error('Background sync registration failed:', err));
      });
    } catch (error) {
      console.warn('Background sync setup failed:', error);
    }
  }
  
  /**
   * Setup network quality monitoring
   */
  setupNetworkQualityMonitoring() {
    if ('connection' in navigator) {
      // Use Network Information API if available
      const connection = navigator.connection;
      
      const updateNetworkQuality = () => {
        // Determine network quality based on connection type and effective type
        if (connection.type === 'wifi' || connection.type === 'ethernet') {
          this.networkQuality = 'good';
        } else if (connection.effectiveType === '4g') {
          this.networkQuality = 'good';
        } else if (connection.effectiveType === '3g') {
          this.networkQuality = 'moderate';
        } else {
          this.networkQuality = 'poor';
        }
        
        this.diagnosticsData.connection = {
          type: connection.type,
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        };
        
        console.log(`Network quality: ${this.networkQuality}`, this.diagnosticsData.connection);
      };
      
      // Listen for connection changes
      connection.addEventListener('change', updateNetworkQuality);
      updateNetworkQuality(); // Initial check
    } else {
      // Fallback to basic online/offline status
      this.networkQuality = this.online ? 'unknown' : 'poor';
    }
  }
  
  /**
   * Check overall connection status
   */
  checkConnection() {
    // Check browser connection
    this.online = navigator.onLine;
    
    // Update timestamp
    this.lastChecked = new Date();
    this.diagnosticsData.lastConnectionCheck = new Date();
    
    // Check firestore if needed
    if (this.firebase && this.online) {
      this.checkFirestoreConnection();
    }
    
    this.updateStatus();
    return this.getStatus();
  }
  
  /**
   * Check if we have any successful connection
   */
  getOverallConnected() {
    return this.online && (this.firebaseConnected || this.firestoreConnected);
  }
  
  /**
   * Check Firestore connection by performing a small query
   */
  checkFirestoreConnection() {
    if (!this.firebase) return Promise.resolve(false);
    
    try {
      const db = this.firebase.firestore();
      
      // Measure response time for diagnostics
      const startTime = performance.now();
      
      // Use a small lightweight collection to test connection
      return db.collection('system')
        .doc('status')
        .get()
        .then(() => {
          const endTime = performance.now();
          const responseTime = endTime - startTime;
          
          this.firestoreConnected = true;
          this.lastSuccessfulConnection = new Date();
          this.diagnosticsData.lastFirestoreSuccess = new Date();
          this.diagnosticsData.firestoreResponseTime = responseTime;
          
          // Update network quality based on response time
          if (responseTime < 500) {
            this.networkQuality = 'good';
          } else if (responseTime < 2000) {
            this.networkQuality = 'moderate';
          } else {
            this.networkQuality = 'poor';
          }
          
          this.updateStatus();
          return true;
        })
        .catch(error => {
          console.warn('Firestore connection check failed:', error);
          this.firestoreConnected = false;
          this.diagnosticsData.lastFirestoreFailure = new Date();
          this.diagnosticsData.firestoreError = error.message;
          this.updateStatus();
          return false;
        });
    } catch (error) {
      console.error("Error checking Firestore connection:", error);
      this.firestoreConnected = false;
      this.diagnosticsData.firestoreCheckError = error.message;
      this.updateStatus();
      return Promise.resolve(false);
    }
  }
  
  /**
   * Attempt to reconnect to Firebase/Firestore
   */
  attemptReconnect() {
    if (!this.firebase || this.reconnectAttempts >= this.maxReconnectAttempts) {
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.warn(`Maximum reconnection attempts (${this.maxReconnectAttempts}) reached`);
        
        if (this.options.onReconnectFailed) {
          this.options.onReconnectFailed({
            attempts: this.reconnectAttempts,
            maxAttempts: this.maxReconnectAttempts,
            diagnostics: this.diagnosticsData
          });
        }
      }
      this.isReconnecting = false;
      return Promise.resolve(false);
    }
    
    this.isReconnecting = true;
    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    // Update diagnostics
    this.diagnosticsData.reconnectAttempt = {
      number: this.reconnectAttempts,
      timestamp: new Date(),
      online: navigator.onLine
    };
    
    try {
      const db = this.firebase.firestore();
      
      return db.enableNetwork()
        .then(() => {
          console.log('Firestore network re-enabled successfully');
          
          // Test the connection by making a simple query
          return db.collection('system').doc('status').get()
            .then(() => {
              this.firestoreConnected = true;
              this.lastSuccessfulConnection = new Date();
              this.diagnosticsData.lastSuccessfulReconnect = new Date();
              console.log('Reconnection successful');
              this.updateStatus();
              
              // Reset reconnect attempts counter on success
              this.reconnectAttempts = 0;
              this.isReconnecting = false;
              
              if (this.options.onReconnect) {
                this.options.onReconnect('firestore');
              }
              
              // Process any pending requests
              this.processPendingRequests();
              
              return true;
            })
            .catch(error => {
              console.warn('Connection test after reconnect failed:', error);
              this.firestoreConnected = false;
              this.diagnosticsData.reconnectTestFailure = {
                timestamp: new Date(),
                error: error.message
              };
              this.updateStatus();
              this.isReconnecting = false;
              return false;
            });
        })
        .catch(error => {
          console.error('Error re-enabling Firestore network:', error);
          this.diagnosticsData.reconnectFailure = {
            timestamp: new Date(),
            error: error.message,
            attempt: this.reconnectAttempts
          };
          
          // Calculate backoff delay (exponential backoff with jitter)
          const baseDelay = Math.min(1000 * (2 ** this.reconnectAttempts), 30000);
          const jitter = Math.random() * 1000; // Add up to 1 second of random jitter
          const backoffDelay = baseDelay + jitter;
          
          console.log(`Will retry in ${Math.round(backoffDelay/1000)} seconds`);
          
          // Schedule next retry
          setTimeout(() => {
            this.isReconnecting = false;
            this.attemptReconnect();
          }, backoffDelay);
          
          return false;
        });
    } catch (err) {
      console.error("Exception in attemptReconnect:", err);
      this.diagnosticsData.reconnectException = {
        timestamp: new Date(),
        error: err.message
      };
      this.isReconnecting = false;
      return Promise.resolve(false);
    }
  }
  
  /**
   * Queue a request to be executed when back online
   * @param {Object} request Object with type, data, and callback
   */
  queueRequest(request) {
    if (!request.id) {
      request.id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    request.timestamp = new Date();
    this.pendingRequests.push(request);
    
    console.log(`Request queued for later execution (${request.type}):`, request.id);
    
    // Store in localStorage for persistence
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
  
  /**
   * Process any pending requests that were queued while offline
   */
  processPendingRequests() {
    if (!this.getOverallConnected() || this.pendingRequests.length === 0) {
      return;
    }
    
    console.log(`Processing ${this.pendingRequests.length} pending requests`);
    
    // Get stored requests from localStorage as well
    try {
      const storedRequests = JSON.parse(localStorage.getItem('pendingRequests') || '[]');
      if (storedRequests.length > 0) {
        console.log(`Found ${storedRequests.length} stored requests in localStorage`);
        
        // Merge with in-memory requests, avoiding duplicates by ID
        const existingIds = this.pendingRequests.map(req => req.id);
        for (const storedReq of storedRequests) {
          if (!existingIds.includes(storedReq.id)) {
            this.pendingRequests.push(storedReq);
          }
        }
      }
    } catch (e) {
      console.warn('Error processing stored requests:', e);
    }
    
    // Process each request
    const requestsToProcess = [...this.pendingRequests];
    this.pendingRequests = []; // Clear queue
    
    // Clear localStorage
    try {
      localStorage.removeItem('pendingRequests');
    } catch (e) {
      console.warn('Error clearing stored requests:', e);
    }
    
    // Process each request
    requestsToProcess.forEach(request => {
      console.log(`Processing queued request: ${request.type} (${request.id})`);
      
      try {
        // Execute based on request type
        switch (request.type) {
          case 'firestore-set':
            if (this.firebase) {
              const db = this.firebase.firestore();
              const docRef = db.collection(request.data.collection).doc(request.data.docId);
              
              docRef.set(request.data.data, { merge: true })
                .then(() => {
                  console.log(`Processed queued Firestore set: ${request.id}`);
                  if (request.callback) request.callback(null, true);
                })
                .catch(error => {
                  console.error(`Error processing queued Firestore set: ${request.id}`, error);
                  if (request.callback) request.callback(error, false);
                  
                  // Re-queue on failure
                  this.queueRequest(request);
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
                console.log(`Processed queued API call: ${request.id}`);
                if (request.callback) request.callback(null, data);
              })
              .catch(error => {
                console.error(`Error processing queued API call: ${request.id}`, error);
                if (request.callback) request.callback(error, null);
                
                // Re-queue if server error (>=500) or network error
                if (error.name === 'TypeError' || (error.status && error.status >= 500)) {
                  this.queueRequest(request);
                }
              });
            break;
            
          case 'custom':
            // Custom handler provided by the application
            if (typeof request.execute === 'function') {
              try {
                request.execute(request.data)
                  .then(result => {
                    console.log(`Processed custom request: ${request.id}`);
                    if (request.callback) request.callback(null, result);
                  })
                  .catch(error => {
                    console.error(`Error processing custom request: ${request.id}`, error);
                    if (request.callback) request.callback(error, null);
                    
                    // Re-queue on failure
                    this.queueRequest(request);
                  });
              } catch (error) {
                console.error(`Exception in custom request handler: ${request.id}`, error);
                if (request.callback) request.callback(error, null);
              }
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
  
  /**
   * Enable offline persistence for Firestore
   */
  enableOfflinePersistence() {
    if (!this.firebase) return Promise.reject(new Error('Firebase not initialized'));
    
    try {
      const db = this.firebase.firestore();
      return db.enablePersistence({synchronizeTabs: true})
        .then(() => {
          console.log('Firestore offline persistence enabled');
          this.diagnosticsData.persistenceEnabled = true;
          return true;
        })
        .catch(error => {
          if (error.code === 'failed-precondition') {
            console.warn('Multiple tabs open, offline persistence enabled in first tab only');
            this.diagnosticsData.persistenceStatus = 'multiple-tabs';
          } else if (error.code === 'unimplemented') {
            console.warn('Browser does not support offline persistence');
            this.diagnosticsData.persistenceStatus = 'unsupported';
          } else {
            console.error('Error enabling offline persistence:', error);
            this.diagnosticsData.persistenceStatus = 'error';
            this.diagnosticsData.persistenceError = error.message;
          }
          return false;
        });
    } catch (error) {
      console.error("Exception in enableOfflinePersistence:", error);
      this.diagnosticsData.persistenceException = error.message;
      return Promise.resolve(false);
    }
  }
  
  /**
   * Get network diagnostics data
   */
  getDiagnostics() {
    return {
      ...this.diagnosticsData,
      currentStatus: this.getStatus(),
      pendingRequests: this.pendingRequests.length,
      networkQuality: this.networkQuality,
      reconnectAttempts: this.reconnectAttempts,
      userAgent: navigator.userAgent,
      timestamp: new Date()
    };
  }
  
  /**
   * Update connection status and trigger callback
   */
  updateStatus() {
    const previousStatus = this.getStatus();
    const currentStatus = {
      isOnline: this.online,
      firebaseConnected: this.firebaseConnected,
      firestoreConnected: this.firestoreConnected,
      overallStatus: this.getOverallStatus(),
      lastSuccessful: this.lastSuccessfulConnection,
      lastAttempt: this.lastChecked,
      networkQuality: this.networkQuality
    };
    
    // Call status change callback if provided and status changed
    if (this.options.onStatusChange && 
        (previousStatus.overallStatus !== currentStatus.overallStatus ||
         previousStatus.isOnline !== currentStatus.isOnline ||
         previousStatus.firebaseConnected !== currentStatus.firebaseConnected ||
         previousStatus.firestoreConnected !== currentStatus.firestoreConnected ||
         previousStatus.networkQuality !== currentStatus.networkQuality)) {
      this.options.onStatusChange(currentStatus);
    }
  }
  
  /**
   * Get current connection status
   */
  getStatus() {
    return {
      isOnline: this.online,
      firebaseConnected: this.firebaseConnected,
      firestoreConnected: this.firestoreConnected,
      overallStatus: this.getOverallStatus(),
      lastSuccessful: this.lastSuccessfulConnection,
      lastAttempt: this.lastChecked,
      pendingRequests: this.pendingRequests.length,
      networkQuality: this.networkQuality,
      isReconnecting: this.isReconnecting
    };
  }
  
  /**
   * Get overall connection status
   */
  getOverallStatus() {
    if (!this.online) {
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
    
    return this.online ? 'connected' : 'offline';
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
    console.log("Destroying ConnectionManager");
    
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    
    this.stopPeriodicCheck();
    
    if (this.firebase) {
      try {
        // Disconnect from Firebase Database if we were using it
        try {
          const connRef = this.firebase.database().ref('.info/connected');
          connRef.off('value');
        } catch (dbErr) {
          console.warn('Error removing Firebase Database connection listener:', dbErr);
        }
        
        // Disable Firestore network
        try {
          const db = this.firebase.firestore();
          db.disableNetwork().catch(err => {
            console.warn('Error disabling Firestore network:', err);
          });
        } catch (fsErr) {
          console.warn('Error cleaning up Firestore:', fsErr);
        }
      } catch (err) {
        console.warn('Error during ConnectionManager cleanup:', err);
      }
    }
  }

  // Update the overall connection status and call the callback if status changed
  updateConnectionStatus() {
    const previousStatus = this.getStatus();
    const currentStatus = {
      online: this.online,
      firebaseConnected: this.firebaseConnected,
      firestoreConnected: this.firestoreConnected,
      overallConnected: this.getOverallConnected(),
      lastChecked: this.lastChecked,
      networkQuality: this.networkQuality || 'unknown'
    };
    
    // Calculate overall status
    const statusChanged = previousStatus.online !== currentStatus.online || 
                          previousStatus.firebaseConnected !== currentStatus.firebaseConnected ||
                          previousStatus.firestoreConnected !== currentStatus.firestoreConnected ||
                          previousStatus.overallConnected !== currentStatus.overallConnected;
    
    if (statusChanged && this.options.onStatusChange) {
      console.log("Connection status changed:", currentStatus);
      this.options.onStatusChange(currentStatus);
    }
    
    // Update diagnostics
    this.diagnostics.lastChecked = new Date();
    if (currentStatus.online) {
      this.diagnostics.lastOnline = new Date();
    } else {
      this.diagnostics.lastOffline = new Date();
    }
    
    return currentStatus;
  }

  // Set up browser online/offline event listeners
  setupListeners() {
    // Handle online event
    window.addEventListener('online', () => {
      console.log('Browser reports online status');
      this.online = true;
      this.updateConnectionStatus();
      
      // Attempt to reconnect to Firebase services if we have them
      if (this.firebase) {
        this.reconnectFirestore();
      }
    });
    
    // Handle offline event
    window.addEventListener('offline', () => {
      console.log('Browser reports offline status');
      this.online = false;
      this.updateConnectionStatus();
    });
    
    // Check connection when tab becomes visible
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab became visible, checking connection...');
        this.checkConnection();
      }
    });
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConnectionManager;
} 