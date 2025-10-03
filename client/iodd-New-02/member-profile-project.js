// member-profile-project.js

class MemberProfileProject {
    constructor() {
        this.projects = [];
        this.selectedProject = null;
        this.isEditing = false;
        this.currentUser = null;
        this.init();
    }

    async init() {
        await this.checkAuthentication();
        this.setupEventListeners();
        this.loadProjects();
    }

    async checkAuthentication() {
        // Use global member variables if available
        const memberId = window.gMemberId || window.gMemberNo || window.parent?.gMemberId || window.parent?.gMemberNo;
        const memberRole = window.gRole || window.parent?.gRole || 'Admin';
        
        if (memberId) {
            this.currentUser = { 
                MemberId: memberId, 
                Role: memberRole 
            };
        } else {
            // Default admin user for testing
            this.currentUser = { Role: 'Admin' };
        }
        
        // Enable buttons based on role
        const canModify = this.currentUser.Role === 'Admin' || this.currentUser.Role === 'Editor';
        document.getElementById('addBtn').disabled = !canModify;
        document.getElementById('deleteBtn').disabled = true; // Will be enabled when project selected
        document.getElementById('submitBtn').disabled = true; // Will be enabled when editing
    }

    setupEventListeners() {
        document.getElementById('addBtn').addEventListener('click', () => {
            this.addProject();
        });

        document.getElementById('deleteBtn').addEventListener('click', () => {
            this.deleteProject();
        });

        document.getElementById('submitBtn').addEventListener('click', () => {
            this.saveProject();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.cancelChanges();
        });

        // Auto-save to localStorage on input change
        const form = document.getElementById('projectFormElement');
        form.addEventListener('input', () => {
            this.autoSaveToLocal();
        });
        
        // Add specific listener for dropdown changes
        document.getElementById('projectStatus').addEventListener('change', () => {
            if (!this.isEditing) {
                this.isEditing = true;
                this.updateButtons();
            }
            this.autoSaveToLocal();
        });

        this.loadFromLocal();
    }

    getMemberId() {
        const memberId = window.gMemberId || window.parent?.gMemberId;
        if (!memberId) {
            console.warn('No member ID available');
        }
        return memberId;
    }

    async loadProjects() {
        try {
            this.showMessage('Loading projects...', 'loading');

            const response = await fetch('http://localhost:3004/api/webpage_project_info_view', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Projects grid data:', data);
            
            if (data.webpage_project_info_view && Array.isArray(data.webpage_project_info_view)) {
                this.projects = data.webpage_project_info_view;
                console.log('Loaded projects:', this.projects);
                this.renderProjectGrid();
                this.clearMessage();
            } else {
                this.projects = [];
                this.renderProjectGrid();
                this.showMessage('No projects found', 'error');
            }
        } catch (error) {
            console.error('Error loading projects:', error);
            this.showMessage('Error loading projects. Please check your connection.', 'error');
        }
    }

    renderProjectGrid() {
        const grid = document.getElementById('projectGrid');
        grid.innerHTML = '';

        this.projects.forEach(project => {
            const item = document.createElement('div');
            item.className = 'project-item';
            item.dataset.projectId = project.ProjectID;
            
            item.innerHTML = `
                <div class="project-name">${project.ProjectName || 'Unnamed Project'}</div>
                <div class="project-id">${project.ProjectID}</div>
            `;

            item.addEventListener('click', () => {
                this.selectProject(project);
            });

            grid.appendChild(item);
        });
    }

    async selectProject(project) {
        // Remove previous selection
        document.querySelectorAll('.project-item').forEach(item => {
            item.classList.remove('selected');
        });

        // Add selection to clicked item
        const selectedItem = document.querySelector(`[data-project-id="${project.ProjectID}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }

        this.selectedProject = project;
        
        // Load detailed project data from iodd.projects
        await this.loadProjectDetails(project.ProjectID);
        
        this.updateButtons();
    }

    async loadProjectDetails(projectId) {
        try {
            console.log('Loading project details for ID:', projectId);
            const response = await fetch(`http://localhost:3004/api/project?pid=${projectId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Project details response:', data);
            
            if (data.project && data.project.length > 0) {
                this.populateForm(data.project[0]);
            } else {
                console.log('No project data found in response');
                this.showMessage('Project details not found', 'error');
            }
        } catch (error) {
            console.error('Error loading project details:', error);
            this.showMessage('Error loading project details', 'error');
        }
    }

    populateForm(project) {
        console.log('Populating form with project data:', project);
        document.getElementById('projectName').value = project.Name || project.ProjectName || '';
        document.getElementById('description').value = project.Description || '';
        document.getElementById('client').value = project.Client || '';
        document.getElementById('projectType').value = project.ProjectType || '';
        document.getElementById('projectStatus').value = project.Status || 'Active';
        document.getElementById('industry').value = project.Industry || '';
        document.getElementById('location').value = project.Location || '';
        document.getElementById('projectWeb').value = project.ProjectWeb || '';
        document.getElementById('clientWeb').value = project.ClientWeb || '';
        
        // Enable editing mode
        this.isEditing = true;
        this.updateButtons();
    }

    clearForm() {
        document.getElementById('projectFormElement').reset();
        this.selectedProject = null;
        this.isEditing = false;
        this.updateButtons();
        
        // Remove selection from grid
        document.querySelectorAll('.project-item').forEach(item => {
            item.classList.remove('selected');
        });
    }

    addProject() {
        if (!this.currentUser || (this.currentUser.Role !== 'Admin' && this.currentUser.Role !== 'Editor')) {
            this.showMessage('Admin or Editor role required', 'error');
            return;
        }
        
        // Clear form and reset state
        document.getElementById('projectFormElement').reset();
        this.selectedProject = null;
        
        // Remove selection from grid
        document.querySelectorAll('.project-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Enable editing mode for new project
        this.isEditing = true;
        this.updateButtons();
    }

    async deleteProject() {
        if (!this.currentUser || (this.currentUser.Role !== 'Admin' && this.currentUser.Role !== 'Editor')) {
            this.showMessage('Admin or Editor role required', 'error');
            return;
        }
        
        if (!this.selectedProject) {
            this.showMessage('Please select a project to delete', 'error');
            return;
        }

        const result = await acm_SecurePopUp(`Do you want to delete this project: "${this.selectedProject.ProjectName}"?`, "Yes:Yes", "No:No");
        
        if (result !== 'Yes') {
            return;
        }

        try {
            this.showMessage('Deleting project...', 'loading');

            const response = await fetch(`http://localhost:3004/api/projects/${this.selectedProject.ProjectID}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.showMessage('Project deleted successfully!', 'success');
            this.loadProjects();
            this.clearForm();
            localStorage.removeItem('memberProjectEdit');
            setTimeout(() => this.clearMessage(), 3000);
        } catch (error) {
            console.error('Error deleting project:', error);
            this.showMessage(`Error deleting project: ${error.message}`, 'error');
        }
    }

    async saveProject() {
        if (!this.currentUser || (this.currentUser.Role !== 'Admin' && this.currentUser.Role !== 'Editor')) {
            this.showMessage('Admin or Editor role required', 'error');
            return;
        }
        
        try {
            const formData = new URLSearchParams();
            
            if (this.selectedProject) {
                formData.append('pid', this.selectedProject.ProjectID);
            }
            
            formData.append('projectname', document.getElementById('projectName').value);
            formData.append('description', document.getElementById('description').value);
            formData.append('client', document.getElementById('client').value);
            formData.append('projecttype', document.getElementById('projectType').value);
            formData.append('status', document.getElementById('projectStatus').value);
            formData.append('industry', document.getElementById('industry').value);
            formData.append('location', document.getElementById('location').value);
            formData.append('projecturl', document.getElementById('projectWeb').value);
            formData.append('clienturl', document.getElementById('clientWeb').value);
            
            console.log('Form data being sent:', Array.from(formData.entries()));

            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';

            this.showMessage('Saving project...', 'loading');

            const url = 'http://localhost:3004/api/projects';

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                credentials: 'include',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${response.statusText}\nServer response: ${errorText}`);
            }

            const responseText = await response.text();
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                if (responseText.toLowerCase().includes('success') || 
                    responseText.toLowerCase().includes('saved') ||
                    responseText.toLowerCase().includes('updated')) {
                    this.showMessage('Project saved successfully!', 'success');
                    localStorage.removeItem('memberProjectEdit');
                    this.loadProjects();
                    this.isEditing = false;
                    this.updateButtons();
                    setTimeout(() => this.clearMessage(), 3000);
                    return;
                }
                throw new Error(`Server returned invalid response: ${responseText}`);
            }

            const isSuccess = result.success !== false && 
                (result.project || result.success === true || !result.error);

            if (isSuccess) {
                this.showMessage('Project saved successfully!', 'success');
                localStorage.removeItem('memberProjectEdit');
                this.loadProjects();
                this.isEditing = false;
                this.updateButtons();
                setTimeout(() => this.clearMessage(), 3000);
            } else {
                const errorMsg = result.message || result.error || result.msg || 'Unknown error';
                this.showMessage(`Save failed: ${errorMsg}`, 'error');
            }
        } catch (error) {
            console.error('Error saving project:', error);
            this.showMessage(`Error saving project: ${error.message}`, 'error');
        } finally {
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit';
        }
    }

    cancelChanges() {
        localStorage.removeItem('memberProjectEdit');
        window.location.reload();
    }

    updateButtons() {
        const deleteBtn = document.getElementById('deleteBtn');
        const submitBtn = document.getElementById('submitBtn');
        const canModify = this.currentUser && (this.currentUser.Role === 'Admin' || this.currentUser.Role === 'Editor');
        
        deleteBtn.disabled = !this.selectedProject || !canModify;
        submitBtn.disabled = !this.isEditing || !canModify;
    }

    autoSaveToLocal() {
        if (!this.isEditing && !this.selectedProject) return;

        const formData = {
            projectId: this.selectedProject?.Id || null,
            projectName: document.getElementById('projectName').value,
            description: document.getElementById('description').value,
            client: document.getElementById('client').value,
            projectType: document.getElementById('projectType').value,
            projectStatus: document.getElementById('projectStatus').value,
            industry: document.getElementById('industry').value,
            location: document.getElementById('location').value,
            projectWeb: document.getElementById('projectWeb').value,
            clientWeb: document.getElementById('clientWeb').value,
            timestamp: Date.now()
        };

        localStorage.setItem('memberProjectEdit', JSON.stringify(formData));
    }

    loadFromLocal() {
        const savedData = localStorage.getItem('memberProjectEdit');
        if (savedData) {
            try {
                const editData = JSON.parse(savedData);
                const oneHour = 60 * 60 * 1000;
                if (Date.now() - editData.timestamp < oneHour) {
                    document.getElementById('projectName').value = editData.projectName || '';
                    document.getElementById('description').value = editData.description || '';
                    document.getElementById('client').value = editData.client || '';
                    document.getElementById('projectType').value = editData.projectType || '';
                    document.getElementById('projectStatus').value = editData.projectStatus || 'Active';
                    document.getElementById('industry').value = editData.industry || '';
                    document.getElementById('location').value = editData.location || '';
                    document.getElementById('projectWeb').value = editData.projectWeb || '';
                    document.getElementById('clientWeb').value = editData.clientWeb || '';
                    
                    this.showMessage('Restored unsaved changes from browser storage', 'success');
                    setTimeout(() => this.clearMessage(), 5000);
                }
            } catch (error) {
                console.error('Error loading from localStorage:', error);
                localStorage.removeItem('memberProjectEdit');
            }
        }
    }

    showMessage(message, type) {
        const messageDiv = document.getElementById('message');
        messageDiv.innerHTML = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
    }

    clearMessage() {
        const messageDiv = document.getElementById('message');
        messageDiv.style.display = 'none';
        messageDiv.innerHTML = '';
        messageDiv.className = 'message';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MemberProfileProject();
});