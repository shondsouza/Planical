/**
 * Admin Dashboard JavaScript Functions
 */

// Global variables
let doctorsList = [];
let usersList = [];
let pendingApprovals = [];

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
  // Initialize dashboard
  fetchDashboardData();
  
  // Fetch users and doctors data
  fetchAllUsers();
  fetchDoctorApprovals();
  
  // Initialize event listeners
  initEventListeners();
});

/**
 * Initialize all event listeners
 */
function initEventListeners() {
  // User search functionality
  const userSearch = document.getElementById('user-search');
  if (userSearch) {
    userSearch.addEventListener('input', function() {
      filterUsers(this.value);
    });
  }
  
  // Settings form
  const settingsForm = document.getElementById('settings-form');
  if (settingsForm) {
    settingsForm.addEventListener('submit', function(e) {
      e.preventDefault();
      saveSettings();
    });
  }
}

/**
 * Fetch dashboard overview data
 */
function fetchDashboardData() {
  // Make AJAX request to fetch dashboard data
  fetch('/admin/dashboard-data')
    .then(response => response.json())
    .then(data => {
      // Update dashboard stats
      updateDashboardStats(data);
      // Update activities list
      updateActivitiesList(data.recent_activities);
    })
    .catch(error => {
      console.error('Error fetching dashboard data:', error);
      // Use mock data as fallback
      updateDashboardWithMockData();
    });
}

/**
 * Update dashboard with mock data (fallback)
 */
function updateDashboardWithMockData() {
  // Mock data for dashboard
  const mockData = {
    total_users: 157,
    total_doctors: 24,
    pending_approvals: 5,
    total_consultations: 83,
    recent_activities: [
      {
        activity: 'New doctor registration',
        user: 'Dr. Sarah Johnson',
        date: '2023-04-12',
        status: 'pending'
      },
      {
        activity: 'Consultation completed',
        user: 'Dr. Michael Chen',
        date: '2023-04-11',
        status: 'completed'
      },
      {
        activity: 'User account updated',
        user: 'John Smith',
        date: '2023-04-10',
        status: 'completed'
      },
      {
        activity: 'Doctor approval',
        user: 'Dr. Emily Rodriguez',
        date: '2023-04-09',
        status: 'approved'
      }
    ]
  };
  
  // Update stats with mock data
  updateDashboardStats(mockData);
  // Update activities with mock data
  updateActivitiesList(mockData.recent_activities);
}

/**
 * Update dashboard statistics
 */
function updateDashboardStats(data) {
  // Update total users
  const totalUsersElement = document.getElementById('total-users');
  if (totalUsersElement) {
    totalUsersElement.textContent = data.total_users || 0;
  }
  
  // Update total doctors
  const totalDoctorsElement = document.getElementById('total-doctors');
  if (totalDoctorsElement) {
    totalDoctorsElement.textContent = data.total_doctors || 0;
  }
  
  // Update pending approvals
  const pendingApprovalsElement = document.getElementById('pending-approvals');
  if (pendingApprovalsElement) {
    pendingApprovalsElement.textContent = data.pending_approvals || 0;
  }
  
  // Update total consultations
  const totalConsultationsElement = document.getElementById('total-consultations');
  if (totalConsultationsElement) {
    totalConsultationsElement.textContent = data.total_consultations || 0;
  }
}

/**
 * Update the activities list in the dashboard
 */
function updateActivitiesList(activities) {
  const activitiesTable = document.getElementById('activities-table');
  if (!activitiesTable) return;
  
  if (!activities || activities.length === 0) {
    activitiesTable.innerHTML = '<tr><td colspan="4" class="text-center py-3">No recent activities found</td></tr>';
    return;
  }
  
  let activitiesHTML = '';
  activities.forEach(activity => {
    let statusClass = '';
    switch(activity.status) {
      case 'pending':
        statusClass = 'bg-warning text-dark';
        break;
      case 'approved':
        statusClass = 'bg-success';
        break;
      case 'completed':
        statusClass = 'bg-info';
        break;
      default:
        statusClass = 'bg-secondary';
    }
    
    activitiesHTML += `
      <tr>
        <td>${activity.activity}</td>
        <td>${activity.user}</td>
        <td>${activity.date}</td>
        <td><span class="badge ${statusClass}">${activity.status}</span></td>
      </tr>
    `;
  });
  
  activitiesTable.innerHTML = activitiesHTML;
}

/**
 * Fetch all users
 */
function fetchAllUsers() {
  // Make AJAX request to fetch all users
  fetch('/admin/users')
    .then(response => response.json())
    .then(data => {
      usersList = data.users || [];
      updateUsersTable(usersList);
    })
    .catch(error => {
      console.error('Error fetching users:', error);
      // Use mock data as fallback
      fetchMockUsers();
    });
}

/**
 * Fetch mock users (fallback)
 */
function fetchMockUsers() {
  const mockUsers = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      role: 'patient',
      status: 'active'
    },
    {
      id: '2',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@example.com',
      role: 'doctor',
      status: 'pending'
    },
    {
      id: '3',
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      role: 'patient',
      status: 'active'
    },
    {
      id: '4',
      name: 'Dr. Michael Chen',
      email: 'michael.chen@example.com',
      role: 'doctor',
      status: 'active'
    },
    {
      id: '5',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      status: 'active'
    }
  ];
  
  usersList = mockUsers;
  updateUsersTable(usersList);
}

/**
 * Update the users table
 */
function updateUsersTable(users) {
  const usersTable = document.getElementById('users-table');
  if (!usersTable) return;
  
  if (users.length === 0) {
    usersTable.innerHTML = '<tr><td colspan="5" class="text-center py-3">No users found</td></tr>';
    return;
  }
  
  let usersHTML = '';
  users.forEach(user => {
    let roleBadge = '';
    let statusBadge = '';
    
    switch(user.role) {
      case 'admin':
        roleBadge = '<span class="badge bg-danger">Admin</span>';
        break;
      case 'doctor':
        roleBadge = '<span class="badge bg-primary">Doctor</span>';
        break;
      case 'patient':
        roleBadge = '<span class="badge bg-success">Patient</span>';
        break;
    }
    
    switch(user.status) {
      case 'active':
        statusBadge = '<span class="badge bg-success">Active</span>';
        break;
      case 'pending':
        statusBadge = '<span class="badge bg-warning text-dark">Pending</span>';
        break;
      case 'inactive':
        statusBadge = '<span class="badge bg-secondary">Inactive</span>';
        break;
    }
    
    usersHTML += `
      <tr>
        <td>
          <div class="d-flex align-items-center">
            <div class="avatar">${user.name.charAt(0)}</div>
            <div class="ms-2">${user.name}</div>
          </div>
        </td>
        <td>${user.email}</td>
        <td>${roleBadge}</td>
        <td>${statusBadge}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary me-1" onclick="editUser('${user.id}')">Edit</button>
          ${user.role !== 'admin' ? `<button class="btn btn-sm btn-outline-danger" onclick="deleteUser('${user.id}')">Delete</button>` : ''}
        </td>
      </tr>
    `;
  });
  
  usersTable.innerHTML = usersHTML;
}

/**
 * Fetch doctor approval requests
 */
function fetchDoctorApprovals() {
  // Make AJAX request to fetch doctor approvals
  fetch('/admin/doctor-approvals')
    .then(response => response.json())
    .then(data => {
      pendingApprovals = data.approvals || [];
      updateDoctorApprovalsTable(pendingApprovals);
    })
    .catch(error => {
      console.error('Error fetching doctor approvals:', error);
      // Use mock data as fallback
      fetchMockDoctorApprovals();
    });
}

/**
 * Fetch mock doctor approvals (fallback)
 */
function fetchMockDoctorApprovals() {
  const mockApprovals = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@example.com',
      date: '2023-04-12',
      status: 'pending'
    },
    {
      id: '2',
      name: 'Dr. Robert Williams',
      email: 'robert.williams@example.com',
      date: '2023-04-11',
      status: 'pending'
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      email: 'emily.rodriguez@example.com',
      date: '2023-04-09',
      status: 'approved'
    },
    {
      id: '4',
      name: 'Dr. James Wilson',
      email: 'james.wilson@example.com',
      date: '2023-04-08',
      status: 'rejected'
    }
  ];
  
  pendingApprovals = mockApprovals;
  updateDoctorApprovalsTable(pendingApprovals);
}

/**
 * Update the doctor approvals table
 */
function updateDoctorApprovalsTable(approvals) {
  const doctorApprovalsTable = document.getElementById('doctor-approvals-table');
  if (!doctorApprovalsTable) return;
  
  if (approvals.length === 0) {
    doctorApprovalsTable.innerHTML = '<tr><td colspan="5" class="text-center py-3">No doctor approval requests found</td></tr>';
    return;
  }
  
  let approvalsHTML = '';
  approvals.forEach(approval => {
    let statusBadge = '';
    let actionButtons = '';
    
    switch(approval.status) {
      case 'pending':
        statusBadge = '<span class="status-badge status-pending">Pending</span>';
        actionButtons = `
          <button class="btn btn-sm btn-success me-1" onclick="approveDoctor('${approval.id}')">Approve</button>
          <button class="btn btn-sm btn-danger" onclick="rejectDoctor('${approval.id}')">Reject</button>
        `;
        break;
      case 'approved':
        statusBadge = '<span class="status-badge status-approved">Approved</span>';
        actionButtons = `
          <button class="btn btn-sm btn-danger" onclick="revokeDoctor('${approval.id}')">Revoke</button>
        `;
        break;
      case 'rejected':
        statusBadge = '<span class="status-badge status-rejected">Rejected</span>';
        actionButtons = `
          <button class="btn btn-sm btn-success" onclick="approveDoctor('${approval.id}')">Approve</button>
        `;
        break;
    }
    
    approvalsHTML += `
      <tr>
        <td>
          <div class="doctor-info">
            <div class="avatar">${approval.name.charAt(0)}</div>
            <div>${approval.name}</div>
          </div>
        </td>
        <td>${approval.email}</td>
        <td>${approval.date}</td>
        <td>${statusBadge}</td>
        <td>${actionButtons}</td>
      </tr>
    `;
  });
  
  doctorApprovalsTable.innerHTML = approvalsHTML;
}

/**
 * Filter users based on search term
 */
function filterUsers(searchTerm) {
  if (!searchTerm) {
    updateUsersTable(usersList);
    return;
  }
  
  searchTerm = searchTerm.toLowerCase();
  const filteredUsers = usersList.filter(user => {
    return (
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.role.toLowerCase().includes(searchTerm)
    );
  });
  
  updateUsersTable(filteredUsers);
}

/**
 * Approve a doctor
 */
function approveDoctor(doctorId) {
  // Show loading indicator
  showNotification('Processing approval...', 'info');
  
  // Make AJAX request to approve doctor
  fetch(`/approve-doctor/${doctorId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      showNotification('Doctor approved successfully', 'success');
      fetchDoctorApprovals(); // Refresh the approvals list
      fetchAllUsers(); // Refresh the users list
    } else {
      showNotification(`Error: ${data.message}`, 'error');
    }
  })
  .catch(error => {
    console.error('Error approving doctor:', error);
    showNotification('An error occurred while approving doctor', 'error');
  });
}

/**
 * Reject a doctor
 */
function rejectDoctor(doctorId) {
  // Prompt for rejection reason
  const reason = prompt('Please provide a reason for rejection:');
  if (!reason) return; // Cancelled by user
  
  // Show loading indicator
  showNotification('Processing rejection...', 'info');
  
  // Make AJAX request to reject doctor
  fetch(`/reject-doctor/${doctorId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    },
    body: JSON.stringify({
      reason: reason
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      showNotification('Doctor rejected successfully', 'success');
      fetchDoctorApprovals(); // Refresh the approvals list
      fetchAllUsers(); // Refresh the users list
    } else {
      showNotification(`Error: ${data.message}`, 'error');
    }
  })
  .catch(error => {
    console.error('Error rejecting doctor:', error);
    showNotification('An error occurred while rejecting doctor', 'error');
  });
}

/**
 * Revoke a doctor's approval
 */
function revokeDoctor(doctorId) {
  if (!confirm('Are you sure you want to revoke this doctor\'s approval?')) {
    return;
  }
  
  // Show loading indicator
  showNotification('Processing revocation...', 'info');
  
  // Make AJAX request to revoke doctor approval
  fetch(`/revoke-doctor/${doctorId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      showNotification('Doctor approval revoked successfully', 'success');
      fetchDoctorApprovals(); // Refresh the approvals list
      fetchAllUsers(); // Refresh the users list
    } else {
      showNotification(`Error: ${data.message}`, 'error');
    }
  })
  .catch(error => {
    console.error('Error revoking doctor approval:', error);
    showNotification('An error occurred while revoking doctor approval', 'error');
  });
}

/**
 * Edit a user
 */
function editUser(userId) {
  // Redirect to user edit page
  window.location.href = `/admin/edit-user/${userId}`;
}

/**
 * Delete a user
 */
function deleteUser(userId) {
  if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
    return;
  }
  
  // Show loading indicator
  showNotification('Processing deletion...', 'info');
  
  // Make AJAX request to delete user
  fetch(`/admin/delete-user/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      showNotification('User deleted successfully', 'success');
      fetchAllUsers(); // Refresh the users list
    } else {
      showNotification(`Error: ${data.message}`, 'error');
    }
  })
  .catch(error => {
    console.error('Error deleting user:', error);
    showNotification('An error occurred while deleting user', 'error');
  });
}

/**
 * Save settings
 */
function saveSettings() {
  const settingsForm = document.getElementById('settings-form');
  if (!settingsForm) return;
  
  const formData = new FormData(settingsForm);
  
  // Show loading indicator
  showNotification('Saving settings...', 'info');
  
  // Make AJAX request to save settings
  fetch('/admin/save-settings', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      showNotification('Settings saved successfully', 'success');
    } else {
      showNotification(`Error: ${data.message}`, 'error');
    }
  })
  .catch(error => {
    console.error('Error saving settings:', error);
    showNotification('An error occurred while saving settings', 'error');
  });
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
  // Create notification element if it doesn't exist
  let notification = document.getElementById('notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = 'notification';
    document.body.appendChild(notification);
  }
  
  // Set notification type and message
  notification.className = 'notification';
  notification.classList.add(`notification-${type}`);
  notification.innerHTML = message;
  
  // Show notification
  notification.classList.add('show');
  
  // Hide notification after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
} 