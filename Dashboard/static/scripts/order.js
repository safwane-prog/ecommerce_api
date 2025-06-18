document.addEventListener('DOMContentLoaded', function() {
    // View Order Details
    const viewButtons = document.querySelectorAll('.btn-view');
    const orderDetailModal = document.getElementById('orderDetailModal');
    const closeModalBtn = orderDetailModal.querySelector('.btn-close');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            orderDetailModal.classList.add('show');
        });
    });
    
    // Close modal
    closeModalBtn.addEventListener('click', function() {
        orderDetailModal.classList.remove('show');
    });
    
    // Close modal when clicking outside
    orderDetailModal.addEventListener('click', function(e) {
        if (e.target === orderDetailModal) {
            orderDetailModal.classList.remove('show');
        }
    });
    
    // Refresh button
    const refreshBtn = document.querySelector('.btn-refresh');
    refreshBtn.addEventListener('click', function() {
        // In a real app, this would refresh the data from the server
        alert('Refreshing order data...');
    });
    
    // Export button
    const exportBtn = document.querySelector('.btn-export');
    exportBtn.addEventListener('click', function() {
        // In a real app, this would export the orders
        alert('Exporting orders to CSV...');
    });
    
    // Apply filters
    const applyFiltersBtn = document.querySelector('.btn-apply');
    applyFiltersBtn.addEventListener('click', function() {
        const status = document.getElementById('order-status').value;
        const date = document.getElementById('order-date').value;
        const payment = document.getElementById('payment-status').value;
        
        alert(`Filters applied:\nStatus: ${status}\nDate: ${date}\nPayment: ${payment}\nIn a real app, this would filter the orders table.`);
    });
    
    // Reset filters
    const resetFiltersBtn = document.querySelector('.btn-reset');
    resetFiltersBtn.addEventListener('click', function() {
        document.getElementById('order-status').value = 'all';
        document.getElementById('order-date').value = 'all';
        document.getElementById('payment-status').value = 'all';
        alert('Filters reset');
    });
    
    // Bulk actions
    const bulkActionSelect = document.getElementById('bulk-action');
    const applyBulkBtn = document.querySelector('.btn-apply-bulk');
    
    applyBulkBtn.addEventListener('click', function() {
        const action = bulkActionSelect.value;
        if (!action) {
            alert('Please select a bulk action');
            return;
        }
        
        const selectedOrders = document.querySelectorAll('.orders-table tbody input[type="checkbox"]:checked');
        if (selectedOrders.length === 0) {
            alert('Please select at least one order');
            return;
        }
        
        alert(`Applying "${action}" to ${selectedOrders.length} selected orders...`);
    });
    
    // Select all orders checkbox
    const selectAllCheckbox = document.getElementById('selectAllOrders');
    const orderCheckboxes = document.querySelectorAll('.orders-table tbody input[type="checkbox"]');
    
    selectAllCheckbox.addEventListener('change', function() {
        orderCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
    });
    
    // Add order note
    const addNoteBtn = document.querySelector('.btn-add-note');
    addNoteBtn.addEventListener('click', function() {
        const noteTextarea = document.querySelector('.add-note textarea');
        const noteText = noteTextarea.value.trim();
        
        if (noteText) {
            const notesList = document.querySelector('.notes-list');
            const now = new Date();
            const dateString = now.toLocaleDateString() + ' at ' + now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            const noteElement = document.createElement('div');
            noteElement.className = 'note';
            noteElement.innerHTML = `
                <div class="note-header">
                    <span class="note-date">${dateString}</span>
                    <span class="note-author">by John Doe (Admin)</span>
                </div>
                <div class="note-content">${noteText}</div>
            `;
            
            notesList.prepend(noteElement);
            noteTextarea.value = '';
        }
    });
    
    // Update order status
    const updateStatusBtn = document.querySelector('.btn-update-status');
    updateStatusBtn.addEventListener('click', function() {
        const statusSelect = document.getElementById('update-status');
        const newStatus = statusSelect.value;
        
        if (!newStatus) {
            alert('Please select a status');
            return;
        }
        
        alert(`Updating order status to "${newStatus}"...`);
    });
    
    // Print invoice
    const printBtn = document.querySelector('.btn-print');
    printBtn.addEventListener('click', function() {
        alert('Printing invoice...');
    });
    
    // Send email
    const sendEmailBtn = document.querySelector('.btn-send-email');
    sendEmailBtn.addEventListener('click', function() {
        alert('Sending email to customer...');
    });
});