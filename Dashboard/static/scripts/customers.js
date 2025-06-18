// document.addEventListener('DOMContentLoaded', () => {
//     // Base URL for API
//     const API_BASE_URL = '/api/users/';
    
//     // Elements
//     const addCustomerBtn = document.getElementById('addCustomerBtn');
//     const addCustomerModal = document.getElementById('addCustomerModal');
//     const customerForm = document.getElementById('customerForm');
//     const closeModalBtn = addCustomerModal.querySelector('.btn-close');
//     const cancelBtn = addCustomerModal.querySelector('.btn-cancel');
//     const customersTableBody = document.querySelector('.customers-table tbody');
//     const selectAllCheckbox = document.getElementById('selectAllCustomers');
//     const bulkActionSelect = document.getElementById('bulk-action');
//     const applyBulkBtn = document.querySelector('.btn-apply-bulk');

//     // Fetch all users and populate the table
//     async function fetchUsers() {
//         try {
//             const response = await fetch(`${API_BASE_URL}all/`);
//             if (!response.ok) throw new Error('Failed to fetch users');
//             const users = await response.json();
//             renderUsers(users);
//         } catch (error) {
//             console.error('Error fetching users:', error);
//             alert('Failed to load customers. Please try again.');
//         }
//     }

//     // Render users in the table
//     function renderUsers(users) {
//         customersTableBody.innerHTML = '';
//         users.forEach(user => {
//             const profile = user.userprofile || {};
//             const row = document.createElement('tr');
//             row.innerHTML = `
//                 <td><input type="checkbox" class="customer-checkbox" data-id="${user.id}"></td>
//                 <td class="customer-info">
//                     <img src="${profile.profile_picture || 'https://randomuser.me/api/portraits/lego/1.jpg'}" alt="Customer">
//                     <div>
//                         <h4>${profile.first_name || 'N/A'} ${profile.last_name || 'N/A'}</h4>
//                         <span>ID: #CUS-${user.id}</span>
//                     </div>
//                 </td>
//                 <td>${profile.email || user.email || 'N/A'}</td>
//                 <td>${profile.address || 'N/A'}</td>
//                 <td>0</td> <!-- Placeholder: Orders count not provided in API -->
//                 <td>$0.00</td> <!-- Placeholder: Total spent not provided in API -->
//                 <td>N/A</td> <!-- Placeholder: Last order not provided in API -->
//                 <td><span class="status active">Active</span></td> <!-- Placeholder: Status not provided in API -->
//                 <td class="actions">
//                     <button class="btn-view" data-id="${user.id}"><i class="fas fa-eye"></i></button>
//                     <button class="btn-edit" data-id="${user.id}"><i class="fas fa-edit"></i></button>
//                     <button class="btn-delete" data-id="${user.id}"><i class="fas fa-trash"></i></button>
//                 </td>
//             `;
//             customersTableBody.appendChild(row);
//         });

//         // Add event listeners for delete buttons
//         document.querySelectorAll('.btn-delete').forEach(btn => {
//             btn.addEventListener('click', () => deleteUser(btn.dataset.id));
//         });
//     }

//     // Show add customer modal
//     addCustomerBtn.addEventListener('click', () => {
//         addCustomerModal.style.display = 'block';
//     });

//     // Close modal
//     closeModalBtn.addEventListener('click', () => {
//         addCustomerModal.style.display = 'none';
//         customerForm.reset();
//     });

//     cancelBtn.addEventListener('click', () => {
//         addCustomerModal.style.display = 'none';
//         customerForm.reset();
//     });

//     // Handle form submission to add new customer
//     customerForm.addEventListener('submit', async (e) => {
//         e.preventDefault();
//         const formData = {
//             username: `${customerForm.querySelector('#first-name').value}_${customerForm.querySelector('#last-name').value}`.toLowerCase(),
//             password: customerForm.querySelector('#customer-password').value,
//             email: customerForm.querySelector('#customer-email').value,
//             phone_number: customerForm.querySelector('#customer-phone').value || null,
//             userprofile: {
//                 first_name: customerForm.querySelector('#first-name').value,
//                 last_name: customerForm.querySelector('#last-name').value,
//                 email: customerForm.querySelector('#customer-email').value,
//                 phone: customerForm.querySelector('#customer-phone').value || '',
//                 address: customerForm.querySelector('#customer-address').value || '',
//                 profile_picture: '' // API doesn't handle file uploads in this example
//             }
//         };

//         try {
//             const response = await fetch(`/api/users/admin-register-user/`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(formData),
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.detail || 'Failed to add customer');
//             }

//             alert('Customer added successfully!');
//             addCustomerModal.style.display = 'none';
//             customerForm.reset();
//             fetchUsers(); // Refresh the table
//         } catch (error) {
//             console.error('Error adding customer:', error);
//             alert(`Failed to add customer: ${error.message}`);
//         }
//     });

//     // Delete a user
//     async function deleteUser(userId) {
//         if (!confirm('Are you sure you want to delete this customer?')) return;

//         try {
//             const response = await fetch(`${API_BASE_URL}delete/${userId}/`, {
//                 method: 'DELETE',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//             });

//             if (!response.ok) throw new Error('Failed to delete customer');
//             alert('Customer deleted successfully!');
//             fetchUsers(); // Refresh the table
//         } catch (error) {
//             console.error('Error deleting customer:', error);
//             alert('Failed to delete customer. Please try again.');
//         }
//     }

//     // Handle select all checkbox
//     selectAllCheckbox.addEventListener('change', () => {
//         const checkboxes = document.querySelectorAll('.customer-checkbox');
//         checkboxes.forEach(checkbox => {
//             checkbox.checked = selectAllCheckbox.checked;
//         });
//     });

//     // Handle bulk actions
//     applyBulkBtn.addEventListener('click', async () => {
//         const action = bulkActionSelect.value;
//         const selectedCheckboxes = document.querySelectorAll('.customer-checkbox:checked');
//         const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.dataset.id);

//         if (!action || selectedIds.length === 0) {
//             alert('Please select an action and at least one customer.');
//             return;
//         }

//         if (action === 'delete') {
//             if (!confirm(`Are you sure you want to delete ${selectedIds.length} customer(s)?`)) return;

//             try {
//                 for (const id of selectedIds) {
//                     await fetch(`${API_BASE_URL}delete/${id}/`, {
//                         method: 'DELETE',
//                         headers: {
//                             'Content-Type': 'application/json',
//                         },
//                     });
//                 }
//                 alert('Selected customers deleted successfully!');
//                 fetchUsers(); // Refresh the table
//             } catch (error) {
//                 console.error('Error deleting customers:', error);
//                 alert('Failed to delete customers. Please try again.');
//             }
//         }
//     });

//     // Initial fetch of users
//     fetchUsers();
// });