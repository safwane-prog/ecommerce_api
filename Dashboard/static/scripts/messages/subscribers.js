document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#subscribers-table tbody");
    const searchInput = document.querySelector("#search-subscribers");
    const paginationControls = document.querySelector(".pagination-controls");
    const paginationInfo = document.querySelector("#pagination-info");

    const ITEMS_PER_PAGE = 10;
    let subscribers = [];
    let currentPage = 1;

    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const fetchSubscribers = async () => {
        try {
            const res = await fetch("/api/subscribe/", {
                credentials: "include"
            });
            const data = await res.json();
            subscribers = data;
            renderTable();
            renderPagination();
        } catch (err) {
            console.error("Error fetching data:", err);
        }
    };

    const deleteSubscriber = async (id) => {
        if (!confirm("Are you sure you want to delete this subscriber?")) return;
        try {
            await fetch(`/api/subscribe/${id}/`, {
                method: "DELETE",
                credentials: "include"
            });
            subscribers = subscribers.filter(sub => sub.id !== id);
            renderTable();
            renderPagination();
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    const renderTable = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filtered = subscribers.filter(sub =>
            sub.email.toLowerCase().includes(searchTerm)
        );

        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const paginated = filtered.slice(start, start + ITEMS_PER_PAGE);

        tableBody.innerHTML = "";

        if (paginated.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4">No subscribers found.</td></tr>`;
        } else {
            paginated.forEach(sub => {
                const date = new Date(sub.subscribed_at).toLocaleDateString();
                const row = `
                    <tr>
                        <td>${sub.email}</td>
                        <td>${date}</td>
                        <td><span class="status active">Active</span></td>
                        <td>
                            <button class="btn-action delete" data-id="${sub.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
                tableBody.insertAdjacentHTML("beforeend", row);
            });
        }

        paginationInfo.textContent = `Showing ${start + 1} to ${Math.min(start + ITEMS_PER_PAGE, filtered.length)} of ${filtered.length} subscribers`;

        // إضافة الحدث لحذف الاشتراك
        document.querySelectorAll(".btn-action.delete").forEach(button => {
            button.addEventListener("click", () => {
                const id = button.getAttribute("data-id");
                deleteSubscriber(id);
            });
        });
    };

    const renderPagination = () => {
        const totalPages = Math.ceil(subscribers.filter(sub =>
            sub.email.toLowerCase().includes(searchInput.value.toLowerCase())
        ).length / ITEMS_PER_PAGE);

        paginationControls.innerHTML = "";

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement("button");
            btn.textContent = i;
            btn.classList.add("btn-pagination");
            if (i === currentPage) btn.classList.add("active");
            btn.addEventListener("click", () => {
                currentPage = i;
                renderTable();
                renderPagination();
            });
            paginationControls.appendChild(btn);
        }
    };

    searchInput.addEventListener("input", () => {
        currentPage = 1;
        renderTable();
        renderPagination();
    });

    fetchSubscribers();
});