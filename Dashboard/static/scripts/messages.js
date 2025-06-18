document.addEventListener('DOMContentLoaded', function() {
    // Tab Switching Functionality
    const tabNavItems = document.querySelectorAll('.tab-nav li');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabNavItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all tabs and panes
            tabNavItems.forEach(tab => tab.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding pane
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Delete Confirmation for Subscribers
    const deleteButtons = document.querySelectorAll('.btn-action.delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this item?')) {
                const row = this.closest('tr');
                row.style.opacity = '0';
                setTimeout(() => {
                    row.remove();
                }, 300);
            }
        });
    });
    
    // Archive Message Functionality
    const archiveButtons = document.querySelectorAll('.btn-action.archive');
    archiveButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const row = this.closest('tr');
            const statusCell = row.querySelector('.status');
            
            if (statusCell.classList.contains('read')) {
                statusCell.textContent = 'Archived';
                statusCell.className = 'status archived';
                this.innerHTML = '<i class="fas fa-undo"></i>';
                this.classList.remove('archive');
                this.classList.add('unarchive');
            } else if (statusCell.classList.contains('archived')) {
                statusCell.textContent = 'Read';
                statusCell.className = 'status read';
                this.innerHTML = '<i class="fas fa-archive"></i>';
                this.classList.remove('unarchive');
                this.classList.add('archive');
            }
        });
    });
    
    // Review Approval/Rejection
    const approveButtons = document.querySelectorAll('.btn-action.approve');
    const rejectButtons = document.querySelectorAll('.btn-action.reject');
    
    approveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const statusCell = row.querySelector('.status');
            statusCell.textContent = 'Approved';
            statusCell.className = 'status approved';
        });
    });
    
    rejectButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const statusCell = row.querySelector('.status');
            statusCell.textContent = 'Rejected';
            statusCell.className = 'status rejected';
        });
    });
    
    // Export Subscribers
    const exportButton = document.querySelector('.btn-export');
    if (exportButton) {
        exportButton.addEventListener('click', function() {
            alert('Subscribers list exported successfully!');
        });
    }
});