// Consultation form submission
document.addEventListener('DOMContentLoaded', function() {
    const consultationForm = document.getElementById('consultation-request-form');
    
    if (consultationForm) {
        consultationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading state
            const submitBtn = consultationForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            
            // Get form data
            const formData = new FormData(consultationForm);
            
            // Submit form using fetch API
            fetch('/submit-consultation-request', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.innerText = originalBtnText;
                
                if (data.success) {
                    // Show success message
                    showAlert('Success', data.message, 'success');
                    
                    // Redirect to waiting page
                    setTimeout(function() {
                        window.location.href = `/virtual-consultation/waiting?consultation_id=${data.consultation_id}&doctor_name=${encodeURIComponent(data.doctor_name)}`;
                    }, 1000);
                } else {
                    // Show error message
                    showAlert('Error', data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error submitting consultation request:', error);
                submitBtn.disabled = false;
                submitBtn.innerText = originalBtnText;
                showAlert('Error', 'An error occurred while submitting your request. Please try again.', 'error');
            });
        });
    }
});

// Helper function to show alerts
function showAlert(title, message, type) {
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) return;
    
    const alertHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            <strong>${title}:</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    alertContainer.innerHTML = alertHTML;
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        const alert = alertContainer.querySelector('.alert');
        if (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 5000);
} 