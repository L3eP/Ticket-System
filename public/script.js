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

// Load tickets
async function loadTickets() {
    try {
        const response = await fetch('/api/tickets');
        const tickets = await response.json();
        
        const tbody = document.getElementById('ticketTableBody');
        tbody.innerHTML = '';
        
        tickets.forEach(ticket => {
            const formatDate = (dateString) => {
                if (!dateString) return '-';
                const date = new Date(dateString);
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear().toString().slice(-2);
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                return `${day}/${month}/${year}, ${hours}.${minutes}`;
            };

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
    } catch (error) {
        alert('Error loading tickets: ' + error.message);
    }
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

// Export to CSV
function exportToCSV() {
    window.location.href = '/api/export';
}

// Initialize
showForm(); 