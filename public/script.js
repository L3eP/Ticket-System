// Global variables for pagination and sorting
let currentPage = 1;
let pageSize = 10;
let totalPages = 1;
let sortColumn = 'date_terlapor';
let sortDirection = 'desc';
let allTickets = [];

// Navigation functions
function showForm() {
    document.getElementById('formSection').style.display = 'block';
    document.getElementById('tableSection').style.display = 'none';
}

function showTable() {
    document.getElementById('formSection').style.display = 'none';
    document.getElementById('tableSection').style.display = 'block';
    loadTickets();
}

// Form handling
document.getElementById('ticketForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    try {
        const response = await fetch('/api/tickets', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            alert('Ticket created successfully!');
            e.target.reset();
            showTable();
        } else {
            const error = await response.json();
            alert('Error: ' + error.message);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// Load tickets with filtering and pagination
async function loadTickets() {
    try {
        const response = await fetch('/api/tickets');
        allTickets = await response.json();
        
        // Apply filters
        const filteredTickets = applyFilters(allTickets);
        
        // Apply sorting
        const sortedTickets = sortTickets(filteredTickets);
        
        // Update pagination
        updatePagination(sortedTickets);
        
        // Get current page data
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const currentPageData = sortedTickets.slice(startIndex, endIndex);
        
        // Update table
        updateTable(currentPageData);
        
    } catch (error) {
        alert('Error loading tickets: ' + error.message);
    }
}

// Apply filters
function applyFilters(tickets) {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const priorityFilter = document.getElementById('priorityFilter').value;
    const picFilter = document.getElementById('picFilter').value;
    const aktivitasFilter = document.getElementById('aktivitasFilter').value;
    const subNodeFilter = document.getElementById('subNodeFilter').value;
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;

    return tickets.filter(ticket => {
        const matchesSearch = !searchTerm || 
            ticket.status.toLowerCase().includes(searchTerm) ||
            ticket.priority.toLowerCase().includes(searchTerm) ||
            ticket.pic.toLowerCase().includes(searchTerm) ||
            ticket.aktivitas.toLowerCase().includes(searchTerm) ||
            ticket.sub_node.toLowerCase().includes(searchTerm) ||
            ticket.lokasi.toLowerCase().includes(searchTerm) ||
            (ticket.info && ticket.info.toLowerCase().includes(searchTerm));

        const matchesStatus = !statusFilter || ticket.status === statusFilter;
        const matchesPriority = !priorityFilter || ticket.priority === priorityFilter;
        const matchesPic = !picFilter || ticket.pic === picFilter;
        const matchesAktivitas = !aktivitasFilter || ticket.aktivitas === aktivitasFilter;
        const matchesSubNode = !subNodeFilter || ticket.sub_node === subNodeFilter;

        const ticketDate = new Date(ticket.date_terlapor);
        const matchesDateFrom = !dateFrom || ticketDate >= new Date(dateFrom);
        const matchesDateTo = !dateTo || ticketDate <= new Date(dateTo + 'T23:59:59');

        return matchesSearch && matchesStatus && matchesPriority && 
               matchesPic && matchesAktivitas && matchesSubNode && 
               matchesDateFrom && matchesDateTo;
    });
}

// Sort tickets
function sortTickets(tickets) {
    return tickets.sort((a, b) => {
        let valueA = a[sortColumn];
        let valueB = b[sortColumn];

        // Handle date sorting
        if (sortColumn.includes('date')) {
            valueA = new Date(valueA);
            valueB = new Date(valueB);
        } else {
            // Handle string sorting
            valueA = String(valueA).toLowerCase();
            valueB = String(valueB).toLowerCase();
        }

        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
}

// Update pagination
function updatePagination(tickets) {
    totalPages = Math.ceil(tickets.length / pageSize);
    
    document.getElementById('totalRecords').textContent = tickets.length;
    document.getElementById('startRecord').textContent = tickets.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    document.getElementById('endRecord').textContent = Math.min(currentPage * pageSize, tickets.length);
    document.getElementById('currentPage').textContent = `Page ${currentPage} of ${totalPages}`;

    // Update button states
    document.getElementById('firstPage').disabled = currentPage === 1;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
    document.getElementById('lastPage').disabled = currentPage === totalPages;
}

// Update table
function updateTable(tickets) {
    const tbody = document.getElementById('ticketTableBody');
    tbody.innerHTML = '';
    
    tickets.forEach(ticket => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="status-${ticket.status.toLowerCase()}">${ticket.status}</td>
            <td class="priority-${ticket.priority.toLowerCase()}">${ticket.priority}</td>
            <td>${ticket.pic}</td>
            <td>${ticket.aktivitas}</td>
            <td>${ticket.sub_node}/${ticket.lokasi}</td>
            <td>${ticket.info || ''}</td>
            <td>
                ${ticket.evidence ? 
                    `<button class="action-btn view-btn" onclick="viewImage('${ticket.evidence}')">View</button>` : 
                    'No image'}
            </td>
            <td>${formatDate(ticket.date_terlapor)}</td>
            <td>${formatDate(ticket.date_selesai)}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editTicket(${ticket.id})">Ubah</button>
                <button class="action-btn delete-btn" onclick="deleteTicket(${ticket.id})">Hapus</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Event Listeners for filters and pagination
document.getElementById('searchInput').addEventListener('input', () => {
    currentPage = 1;
    loadTickets();
});

document.getElementById('statusFilter').addEventListener('change', () => {
    currentPage = 1;
    loadTickets();
});

document.getElementById('priorityFilter').addEventListener('change', () => {
    currentPage = 1;
    loadTickets();
});

document.getElementById('picFilter').addEventListener('change', () => {
    currentPage = 1;
    loadTickets();
});

document.getElementById('aktivitasFilter').addEventListener('change', () => {
    currentPage = 1;
    loadTickets();
});

document.getElementById('subNodeFilter').addEventListener('change', () => {
    currentPage = 1;
    loadTickets();
});

document.getElementById('dateFrom').addEventListener('change', () => {
    currentPage = 1;
    loadTickets();
});

document.getElementById('dateTo').addEventListener('change', () => {
    currentPage = 1;
    loadTickets();
});

document.getElementById('pageSize').addEventListener('change', (e) => {
    pageSize = parseInt(e.target.value);
    currentPage = 1;
    loadTickets();
});

// Pagination buttons
document.getElementById('firstPage').addEventListener('click', () => {
    currentPage = 1;
    loadTickets();
});

document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadTickets();
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        loadTickets();
    }
});

document.getElementById('lastPage').addEventListener('click', () => {
    currentPage = totalPages;
    loadTickets();
});

// Sorting
document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
        const column = th.dataset.sort;
        if (sortColumn === column) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortColumn = column;
            sortDirection = 'asc';
        }
        loadTickets();
    });
});

// Export functions
function exportToCSV() {
    const filteredTickets = applyFilters(allTickets);
    const sortedTickets = sortTickets(filteredTickets);
    
    const headers = ['ID', 'Status', 'Priority', 'PIC', 'Aktivitas', 'Sub-Node', 'Lokasi', 'Info', 'Date Terlapor', 'Date Selesai'];
    let csv = headers.join(',') + '\n';

    sortedTickets.forEach(ticket => {
        const values = [
            ticket.id,
            ticket.status,
            ticket.priority,
            ticket.pic,
            ticket.aktivitas,
            ticket.sub_node,
            ticket.lokasi,
            `"${ticket.info?.replace(/"/g, '""') || ''}"`,
            formatDate(ticket.date_terlapor),
            formatDate(ticket.date_selesai)
        ];
        csv += values.join(',') + '\n';
    });

    downloadFile(csv, 'tickets.csv', 'text/csv');
}

function exportToExcel() {
    const filteredTickets = applyFilters(allTickets);
    const sortedTickets = sortTickets(filteredTickets);
    
    const headers = ['ID', 'Status', 'Priority', 'PIC', 'Aktivitas', 'Sub-Node', 'Lokasi', 'Info', 'Date Terlapor', 'Date Selesai'];
    let csv = headers.join('\t') + '\n';

    sortedTickets.forEach(ticket => {
        const values = [
            ticket.id,
            ticket.status,
            ticket.priority,
            ticket.pic,
            ticket.aktivitas,
            ticket.sub_node,
            ticket.lokasi,
            ticket.info || '',
            formatDate(ticket.date_terlapor),
            formatDate(ticket.date_selesai)
        ];
        csv += values.join('\t') + '\n';
    });

    downloadFile(csv, 'tickets.xls', 'application/vnd.ms-excel');
}

function exportToPDF() {
    const filteredTickets = applyFilters(allTickets);
    const sortedTickets = sortTickets(filteredTickets);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Tickets Report</title>
                <style>
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f8f9fa; }
                </style>
            </head>
            <body>
                <h1>Tickets Report</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Priority</th>
                            <th>PIC</th>
                            <th>Aktivitas</th>
                            <th>Sub-Node/Lokasi</th>
                            <th>Info</th>
                            <th>Date Terlapor</th>
                            <th>Date Selesai</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedTickets.map(ticket => `
                            <tr>
                                <td>${ticket.status}</td>
                                <td>${ticket.priority}</td>
                                <td>${ticket.pic}</td>
                                <td>${ticket.aktivitas}</td>
                                <td>${ticket.sub_node}/${ticket.lokasi}</td>
                                <td>${ticket.info || ''}</td>
                                <td>${formatDate(ticket.date_terlapor)}</td>
                                <td>${formatDate(ticket.date_selesai)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Helper function to download files
function downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Format date helper function
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year}, ${hours}.${minutes}`;
}

// Image modal handling
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImage');
const closeBtn = document.getElementsByClassName('close')[0];

function viewImage(filename) {
    modal.style.display = 'block';
    modalImg.src = `/uploads/${filename}`;
}

closeBtn.onclick = function() {
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Edit ticket
async function editTicket(id) {
    try {
        const response = await fetch(`/api/tickets/${id}`);
        const ticket = await response.json();
        
        // Populate form with ticket data
        document.getElementById('aktivitas').value = ticket.aktivitas;
        document.getElementById('sub_node').value = ticket.sub_node;
        document.getElementById('lokasi').value = ticket.lokasi;
        document.getElementById('pic').value = ticket.pic;
        document.getElementById('priority').value = ticket.priority;
        document.getElementById('status').value = ticket.status;
        document.getElementById('info').value = ticket.info || '';
        
        // Remove existing submit event listener
        const form = document.getElementById('ticketForm');
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        // Add new submit event listener for update
        newForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            
            try {
                const response = await fetch(`/api/tickets/${id}`, {
                    method: 'PUT',
                    body: formData
                });
                
                if (response.ok) {
                    alert('Ticket updated successfully!');
                    newForm.reset();
                    showTable();
                } else {
                    const error = await response.json();
                    alert('Error: ' + error.message);
                }
            } catch (error) {
                alert('Error: ' + error.message);
            }
        });
        
        showForm();
    } catch (error) {
        alert('Error loading ticket: ' + error.message);
    }
}

// Delete ticket
async function deleteTicket(id) {
    if (confirm('Are you sure you want to delete this ticket?')) {
        try {
            const response = await fetch(`/api/tickets/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                alert('Ticket deleted successfully!');
                loadTickets();
            } else {
                const error = await response.json();
                alert('Error: ' + error.message);
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }
}

// Initialize
showForm(); 