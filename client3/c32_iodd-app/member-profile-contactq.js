// Contact Emails Management
class ContactEmailsManager {
    constructor() {
        this.contactData = [];
        this.selectedContactId = null;
        this.jwtToken = this.getJWTToken();
        this.apiBaseUrl = 'http://localhost:3004/api';                                  //#.(51013.01.19)
        this.apiBaseUrl = window.fvaRs.SERVER_API_URL;                                  // .(51013.01.19)        
        this.init();
    }

    init() {
        this.loadContactEmails();
        this.setupEventListeners();
    }

    getJWTToken() {
        // Get JWT token from localStorage or cookie
        return localStorage.getItem('jwtToken') || this.getCookie('authToken');
    }

    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    async loadContactEmails() {
        try {
            console.log('Fetching from:', `${this.apiBaseUrl}/contactmail`);
            const response = await fetch( `${this.apiBaseUrl}/contactmail`, {           // .(51013.01.19)
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.jwtToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const text = await response.text();
            console.log('Raw response text:', text);
            
            let data;
            try {
                data = JSON.parse(text);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                throw new Error('Server returned invalid JSON');
            }
            
            console.log('Parsed API Response data:', data);
            console.log('Data type:', typeof data);
            console.log('Data keys:', Object.keys(data));
            
            // Try different possible property names based on server patterns
            this.contactData = data.contactmail || data.ContactMail || data.data || data.results || [];
            console.log('Final contactData:', this.contactData);
            console.log('ContactData length:', this.contactData.length);
            this.renderGrid();
        } catch (error) {
            console.error('Error loading contact emails:', error);
            this.showError('Failed to load contact messages. Please try again.');
        }
    }

    renderGrid() {
        const gridContainer = document.getElementById('gridContainer');
        
        if (this.contactData.length === 0) {
            gridContainer.innerHTML = '<div class="no-data">No contact messages found</div>';
            return;
        }

        // Sort by DateReceived (newest first)
        const sortedData = [...this.contactData].sort((a, b) => 
            new Date(b.DateReceived) - new Date(a.DateReceived)
        );

        const table = document.createElement('table');
        table.className = 'data-grid';
        
        // Create header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Contact Name</th>
                <th>Date Received</th>
            </tr>
        `;
        table.appendChild(thead);

        // Create body
        const tbody = document.createElement('tbody');
        sortedData.forEach(contact => {
            const row = document.createElement('tr');
            row.dataset.id = contact.Id;
            row.innerHTML = `
                <td>${this.escapeHtml(contact.ContactName || 'Unknown')}</td>
                <td>${this.formatDate(contact.DateReceived)}</td>
            `;
            
            row.addEventListener('click', () => this.selectContact(contact.Id));
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        gridContainer.innerHTML = '';
        gridContainer.appendChild(table);
    }

    selectContact(contactId) {
        // Remove previous selection
        document.querySelectorAll('.data-grid tr').forEach(row => {
            row.classList.remove('selected');
        });

        // Add selection to clicked row
        const selectedRow = document.querySelector(`tr[data-id="${contactId}"]`);
        if (selectedRow) {
            selectedRow.classList.add('selected');
        }

        this.selectedContactId = contactId;
        this.renderDetails();
    }

    renderDetails() {
        const detailsContainer = document.getElementById('detailsContainer');
        
        if (!this.selectedContactId) {
            detailsContainer.innerHTML = '<div class="no-data">Select a message from the left to view details</div>';
            return;
        }

        const contact = this.contactData.find(c => c.Id == this.selectedContactId);
        if (!contact) {
            detailsContainer.innerHTML = '<div class="error">Contact not found</div>';
            return;
        }

        detailsContainer.innerHTML = `
            <form id="contactForm">
                <div class="form-group">
                    <label class="form-label">Contact Name:</label>
                    <input type="text" class="form-input" value="${this.escapeHtml(contact.ContactName || '')}" disabled>
                </div>

                <div class="form-group">
                    <label class="form-label">Contact Email:</label>
                    <input type="email" class="form-input" value="${this.escapeHtml(contact.ContactEmail || '')}" disabled>
                </div>

                <div class="form-group">
                    <label class="form-label">Date Received:</label>
                    <input type="text" class="form-input" value="${this.formatDate(contact.DateReceived)}" disabled>
                </div>

                <div class="form-group">
                    <label class="form-label">Question:</label>
                    <textarea class="form-input question-field" disabled>${this.escapeHtml(contact.Question || '')}</textarea>
                </div>

                <div class="form-group">
                    <label class="form-label">Member Responded:</label>
                    <select class="form-input" id="memberSelect">
                        <option value="">Select a member...</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">Member's Answer:</label>
                    <textarea class="form-textarea" id="answerText" placeholder="Enter your response here...">${this.escapeHtml(contact.Answer || '')}</textarea>
                </div>
            </form>
        `;

        // Note: Member dropdown population code not added as requested
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        const gridContainer = document.getElementById('gridContainer');
        gridContainer.innerHTML = `<div class="error">${message}</div>`;
    }

    setupEventListeners() {
        // Add any additional event listeners here
        window.addEventListener('resize', () => {
            // Handle responsive layout changes if needed
        });
    }
}

// Initialize the contact emails manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ContactEmailsManager();
});