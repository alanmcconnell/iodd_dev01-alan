// Member List Client for webpage_members_info_view
class MemberListClient {
    constructor() {
        this.baseUrl = 'http://localhost:3004/api';
    }

    async fetchData(endpoint) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const text = await response.text();
            console.log('Raw response:', text);
            
            try {
                return JSON.parse(text);
            } catch (jsonError) {
                console.error('JSON parse error:', jsonError);
                throw new Error('Server returned invalid JSON');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

    async getMembersInfo() {
        return await this.fetchData('/webpage_members_info_view');
    }

    async getMembersInfoAlt() {
        return await this.fetchData('/members');
    }
}

// UI Functions
function showLoading() {
    const container = document.getElementById('data-display');
    container.innerHTML = '<div class="loading">Loading member data...</div>';
}

function showError(error) {
    const container = document.getElementById('data-display');
    container.innerHTML = `<div class="error">Error loading data: ${error.message}</div>`;
}

function displayMembersTable(data) {
    const container = document.getElementById('data-display');
    
    console.log('Data received:', data);
    
    if (!data) {
        container.innerHTML = '<p>No data received from server</p>';
        return;
    }
    
    // Handle different response formats
    let members = data;
    if (data && typeof data === 'object') {
        // Check for various possible data structures
        if (Array.isArray(data)) {
            members = data;
        } else if (data.members && Array.isArray(data.members)) {
            members = data.members;
        } else {
            // Try to find the first array property
            const keys = Object.keys(data);
            const arrayKey = keys.find(key => Array.isArray(data[key]));
            if (arrayKey) {
                members = data[arrayKey];
            } else {
                members = [data]; // Single object
            }
        }
    } else {
        container.innerHTML = '<p>Invalid data format received</p>';
        return;
    }
    
    if (!members || members.length === 0) {
        container.innerHTML = '<p>No member data available</p>';
        return;
    }

    // Only show these fields with custom titles
    const fieldConfig = [
        { field: 'FirstName', title: 'First Name' },
        { field: 'LastName', title: 'Last Name' },
        { field: 'Company', title: 'Company' },
        { field: 'Email', title: 'email' },
        { field: 'Phone1', title: 'Phone 1' },
        { field: 'Phone2', title: 'Phone 2' },
        { field: 'WebSite', title: 'Website' }
    ];

    const table = document.createElement('table');
    table.className = 'data-table';

    // Create header with custom titles
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const visibleFields = fieldConfig.filter(config => members[0].hasOwnProperty(config.field));
    visibleFields.forEach(config => {
        const th = document.createElement('th');
        th.textContent = config.title;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create body - only show visible fields
    const tbody = document.createElement('tbody');
    members.forEach(row => {
        const tr = document.createElement('tr');
        visibleFields.forEach(config => {
            const td = document.createElement('td');
            
            // Special handling for website field
            if (config.field === 'WebSite' && row[config.field]) {
                const website = row[config.field].trim();
                if (website) {
                    // Add http:// if not present
                    const url = website.startsWith('http') ? website : `http://${website}`;
                    const link = document.createElement('a');
                    link.href = url;
                    link.target = '_blank'; // Open in new tab
                    link.className = 'globe-icon';
                    link.innerHTML = '🌐'; // Globe icon
                    link.title = url;
                    td.appendChild(link);
                } else {
                    td.textContent = '';
                }
            } else {
                td.textContent = row[config.field] || '';
            }
            
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    container.innerHTML = '';
    container.appendChild(table);
}

// Initialize and load data
const client = new MemberListClient();

async function loadMembersList() {
    try {
        showLoading();
        // Try the view first, fallback to members endpoint
        let data;
        try {
            data = await client.getMembersInfo();
        } catch (viewError) {
            console.log('View endpoint failed, trying members endpoint');
            data = await client.getMembersInfoAlt();
        }
        displayMembersTable(data);
    } catch (error) {
        showError(error);
    }
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', loadMembersList);