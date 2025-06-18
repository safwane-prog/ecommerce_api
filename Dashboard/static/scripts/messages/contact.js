document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = '/api/contact-messages/';
    const deleteUrl = (id) => `/api/contact-messages/${id}/`;
    const tableBody = document.querySelector('tbody');
    const searchInput = document.getElementById('search-subscribers');
    const modal = document.getElementById('messageModal');
    const closeModalBtn = document.querySelector('.close-modal');

    let currentPage = 1;
    let searchTerm = '';

    function fetchMessages() {
        fetch(`${apiUrl}?page=${currentPage}&search=${searchTerm}`, {
            credentials: 'include'
        })
        .then(res => res.json())
        .then(data => {
            renderMessages(data.results);
            renderPagination(data.count);
        })
        .catch(err => console.error('Error fetching messages:', err));
    }

    function renderMessages(messages) {
        tableBody.innerHTML = '';
        messages.forEach(msg => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${msg.first_name} ${msg.last_name}</td>
                <td>${msg.email}</td>
                <td>${msg.subject}</td>
                <td>${new Date(msg.created_at).toLocaleDateString()}</td>
                <td><span class="status unread">Unread</span></td>
                <td>
                    <button class="btn-action view" data-id="${msg.id}"><i class="fas fa-eye"></i></button>
                    <button class="btn-action delete" data-id="${msg.id}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        addEventListeners();
    }

    function renderPagination(totalCount) {
        const paginationContainer = document.querySelector('.pagination-controls');
        const totalPages = Math.ceil(totalCount / 10);
        paginationContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = 'btn-pagination' + (i === currentPage ? ' active' : '');
            btn.textContent = i;
            btn.addEventListener('click', () => {
                currentPage = i;
                fetchMessages();
            });
            paginationContainer.appendChild(btn);
        }
    }

    function addEventListeners() {
        document.querySelectorAll('.btn-action.view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                showMessageDetails(id);
            });
        });

        document.querySelectorAll('.btn-action.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                if (confirm('Are you sure you want to delete this message?')) {
                    deleteMessage(id);
                }
            });
        });
    }

    function showMessageDetails(id) {
        fetch(`${apiUrl}${id}/`, {
            credentials: 'include'
        })
        .then(res => res.json())
        .then(data => {
            document.getElementById('modalName').textContent = `${data.first_name} ${data.last_name}`;
            document.getElementById('modalEmail').textContent = data.email;
            document.getElementById('modalSubject').textContent = data.subject;
            document.getElementById('modalMessage').textContent = data.message;
            modal.style.display = 'block';
        })
        .catch(err => console.error('Error fetching message details:', err));
    }

    function deleteMessage(id) {
        fetch(deleteUrl(id), {
            method: 'DELETE',
            credentials: 'include'
        })
        .then(() => {
            fetchMessages();
        })
        .catch(err => console.error('Error deleting message:', err));
    }

    searchInput.addEventListener('input', function () {
        searchTerm = this.value.trim();
        currentPage = 1;
        fetchMessages();
    });

    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    fetchMessages();
});
