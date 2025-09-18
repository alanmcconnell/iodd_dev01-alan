// member-profile-skills.js

class MemberProfileSkills {
    constructor() {
        this.quill = null;
        this.originalData = {};
        this.members = [];
        this.selectedMemberId = null;
        this.init();
    }

    async init() {
        // Initialize Quill rich text editor
        this.quill = new Quill('#editor', {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ 'header': 1 }, { 'header': 2 }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'script': 'sub'}, { 'script': 'super' }],
                    [{ 'indent': '-1'}, { 'indent': '+1' }],
                    ['link'],
                    ['clean']
                ]
            }
        });

        // Set up event listeners
        this.setupEventListeners();

        // Load members list first
        this.loadMembersList();
        
        // Wait for auth to be ready
        await this.waitForAuth();
    }
    
    async waitForAuth() {
        let attempts = 0;
        let delay = 50;
        while (attempts < 10 && (!window.gRole || !window.gMemberId)) {
            await new Promise(resolve => setTimeout(() => resolve(), delay));
            attempts++;
            delay = Math.min(delay * 1.5, 500);
        }
        console.log('Auth ready - Role:', window.gRole, 'MemberId:', window.gMemberId);
    }

    async loadMembersList() {
        try {
            const response = await fetch('http://localhost:54032/api2/list/members');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (jsonError) {
                console.error('Invalid JSON response:', text);
                throw new Error('Server returned invalid JSON');
            }
            
            this.members = data.members || [];
            this.displayMembersList();
        } catch (error) {
            console.error('Error loading members list:', error);
            document.getElementById('membersList').innerHTML = '<div class="loading-members">Error loading members</div>';
        }
    }

    displayMembersList() {
        const membersList = document.getElementById('membersList');
        if (!this.members || this.members.length === 0) {
            membersList.innerHTML = '<div class="loading-members">No members found</div>';
            return;
        }

        membersList.innerHTML = '';
        this.members.forEach(member => {
            const memberItem = document.createElement('div');
            memberItem.className = 'member-item';
            memberItem.dataset.memberId = member.MemberNo;
            
            const memberName = document.createElement('div');
            memberName.className = 'member-name';
            memberName.textContent = `${member.FirstName} ${member.LastName}`;
            
            memberItem.appendChild(memberName);
            
            memberItem.addEventListener('click', () => {
                this.selectMember(member);
            });
            
            membersList.appendChild(memberItem);
        });
    }

    selectMember(member) {
        // Remove previous selection
        document.querySelectorAll('.member-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Add selection to clicked item
        event.currentTarget.classList.add('selected');
        
        // Store selected member ID
        this.selectedMemberId = member.MemberNo;
        
        // Load member data
        this.loadMemberDataById(this.selectedMemberId);
        
        // Apply role-based permissions
        this.applyRolePermissions();
    }

    setupEventListeners() {
        // Submit button
        document.getElementById('submitBtn').addEventListener('click', () => {
            this.saveMemberData();
        });

        // Cancel button
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.cancelChanges();
        });

        // Auto-save to localStorage on content change
        this.quill.on('text-change', () => {
            this.autoSaveToLocal();
        });

        // Load from localStorage if page is refreshed
        window.addEventListener('beforeunload', () => {
            this.autoSaveToLocal();
        });

        // Check for saved data on page load
        this.loadFromLocal();
    }

    getMemberId() {
        return this.selectedMemberId || window.gMemberId || window.parent?.gMemberId;
    }

    async loadMemberDataById(memberId) {
        try {
            this.showMessage('Loading member data...', 'loading');

            const response = await fetch(`http://localhost:54032/api2/members?id=${memberId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.members && data.members.length > 0) {
                this.originalData = data.members[0];
                this.populateForm(data.members[0]);
                this.clearMessage();
            } else {
                this.showMessage('Member not found', 'error');
            }
        } catch (error) {
            console.error('Error loading member data:', error);
            this.showMessage('Error loading member data. Please check your connection.', 'error');
        }
    }

    async loadMemberData() {
        const memberId = this.getMemberId();
        if (memberId) {
            await this.loadMemberDataById(memberId);
        } else {
            this.showMessage('Select a member from the list to view their skills', 'loading');
        }
    }

    populateForm(member) {
        const memberId = member.Id || member.MemberNo || '';
        const skills = member.Skills || '';
        
        document.getElementById('memberNo').value = memberId;
        this.quill.root.innerHTML = skills;
        
        // Update debug info
        if (typeof updateDebugInfo === 'function') {
            updateDebugInfo(memberId, true, skills.length);
        }
        
        // Apply role-based permissions after populating form
        this.applyRolePermissions();
    }

    async saveMemberData() {
        try {
            const memberId = this.getMemberId();
            const skills = this.quill.root.innerHTML;

            console.log('=== SAVE ATTEMPT ===');
            console.log('Member ID:', memberId);
            console.log('Skills length:', skills.length);
            console.log('Skills preview:', skills.substring(0, 200) + (skills.length > 200 ? '...' : ''));

            if (!memberId) {
                this.showMessage('Member ID is required', 'error');
                return;
            }

            // Disable submit button during save
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';

            this.showMessage('Saving...', 'loading');

            // Use URLSearchParams to match server expectations
            const formData = new URLSearchParams();
            formData.append('mid', memberId);
            formData.append('skills', skills);
            
            console.log('Sending POST to: http://localhost:54032/api2/member_skills');
            console.log('FormData entries:', Array.from(formData.entries()));

            const response = await fetch('http://localhost:54032/api2/member_skills', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            });

            console.log('Response status:', response.status);
            console.log('Response statusText:', response.statusText);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText}\nServer response: ${errorText}`);
            }

            // Get response text first to debug what's being returned
            const responseText = await response.text();
            console.log('Raw response text:', responseText);
            console.log('Response length:', responseText.length);

            // Try to parse as JSON
            let result;
            try {
                if (responseText.trim() === '') {
                    console.log('Empty response - assuming success');
                    result = { success: true };
                } else {
                    result = JSON.parse(responseText);
                }
            } catch (parseError) {
                console.error('Failed to parse response as JSON:', parseError);
                // If it's not JSON, check if it's a simple success message
                if (responseText.toLowerCase().includes('success') || 
                    responseText.toLowerCase().includes('saved') ||
                    responseText.toLowerCase().includes('updated')) {
                    console.log('Non-JSON success response detected');
                    this.showMessage('Member skills saved successfully!', 'success');
                    localStorage.removeItem('memberSkillsEdit');
                    this.originalData = { Id: memberId, Skills: skills };
                    setTimeout(() => this.clearMessage(), 3000);
                    return;
                }
                throw new Error(`Server returned invalid response: ${responseText}`);
            }

            console.log('Parsed result:', result);

            // Check for successful save - more flexible success detection
            const isSuccess = result.success !== false && 
                (result.member || 
                 result.success === true || 
                 result.status === 'success' ||
                 result.updated === true ||
                 !result.error);

            if (isSuccess) {
                console.log('Save successful!');
                this.showMessage('Member skills saved successfully!', 'success');
                // Clear localStorage after successful save
                localStorage.removeItem('memberSkillsEdit');
                // Update original data
                this.originalData = { Id: memberId, Skills: skills };
                setTimeout(() => this.clearMessage(), 3000);
            } else {
                const errorMsg = result.message || result.error || result.msg || 'Unknown error';
                console.log('Save failed:', errorMsg);
                this.showMessage(`Save failed: ${errorMsg}`, 'error');
            }
        } catch (error) {
            console.error('=== SAVE ERROR ===');
            console.error('Error type:', error.constructor.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            this.showMessage(`Error saving member skills: ${error.message}`, 'error');
        } finally {
            // Re-enable submit button
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit';
        }
    }

    cancelChanges() {
        // Clear any auto-saved data
        localStorage.removeItem('memberSkillsEdit');
        
        // Reload the page to get fresh data from database
        window.location.reload();
    }

    autoSaveToLocal() {
        const memberId = this.getMemberId();
        const skills = this.quill.root.innerHTML;
        
        if (memberId && skills) {
            const editData = {
                memberNo: memberId,
                skills: skills,
                timestamp: Date.now()
            };
            
            localStorage.setItem('memberSkillsEdit', JSON.stringify(editData));
        }
    }

    loadFromLocal() {
        const savedData = localStorage.getItem('memberSkillsEdit');
        if (savedData) {
            try {
                const editData = JSON.parse(savedData);
                // Only load if saved within last hour to avoid stale data
                const oneHour = 60 * 60 * 1000;
                if (Date.now() - editData.timestamp < oneHour) {
                    // Restore the content to the editor
                    if (editData.skills && this.quill) {
                        this.quill.root.innerHTML = editData.skills;
                    }
                    if (editData.memberNo) {
                        const memberNoField = document.getElementById('memberNo');
                        if (memberNoField) {
                            memberNoField.value = editData.memberNo;
                        }
                    }
                    this.showMessage('Restored unsaved changes from browser storage', 'success');
                    setTimeout(() => this.clearMessage(), 5000);
                }
            } catch (error) {
                console.error('Error loading from localStorage:', error);
                localStorage.removeItem('memberSkillsEdit');
            }
        }
    }

    showMessage(message, type) {
        const messageDiv = document.getElementById('message');
        messageDiv.innerHTML = message;
        messageDiv.className = type;
        messageDiv.style.display = 'block';
    }

    clearMessage() {
        const messageDiv = document.getElementById('message');
        messageDiv.style.display = 'none';
        messageDiv.innerHTML = '';
        messageDiv.className = '';
    }

    applyRolePermissions() {
        const userRole = window.gRole;
        const submitBtn = document.getElementById('submitBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        
        // Admin and Editor always see buttons
        if (userRole === 'Admin' || userRole === 'Editor') {
            if (submitBtn) submitBtn.style.display = 'inline-block';
            if (cancelBtn) cancelBtn.style.display = 'inline-block';
        }
        // Members only see buttons for their own record
        else if (userRole === 'Member') {
            const currentUserId = window.gMemberId;
            const targetUserId = this.selectedMemberId;
            const canEdit = currentUserId && targetUserId && (currentUserId == targetUserId);
            if (submitBtn) submitBtn.style.display = canEdit ? 'inline-block' : 'none';
            if (cancelBtn) cancelBtn.style.display = canEdit ? 'inline-block' : 'none';
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MemberProfileSkills();
});