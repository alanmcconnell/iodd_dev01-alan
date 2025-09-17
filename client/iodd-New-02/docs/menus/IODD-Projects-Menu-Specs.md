# Projects Menu Specifications

## Overview
The Projects menu provides access to project-related features and information within the IODD application.

## Menu Items

### 1. Project List
- **URL**: `project-list.html`
- **Description**: Displays a comprehensive list of all projects in the database.
- **Features**:
  - Sortable columns
  - Search functionality
  - Filtering options by project type, status, and client
  - Links to detailed project views

### 2. Project Details
- **URL**: `project-members.html`
- **Description**: Shows detailed information about a selected project and its associated members.
- **Features**:
  - Project description and metadata
  - List of project members with roles
  - Project timeline and duration information
  - Two linked grids: projects and members
  - Filtering of members by project

## Implementation Notes
- The Project List page should load all projects from the `webpage_project_info_view` endpoint
- The Project Details page uses both `webpage_project_info_view` and `webpage_project_members_view` endpoints
- Projects and members are linked by the `ProjectID` field
- When a project is selected in the projects grid, the members grid should update to show only members associated with that project

## Future Enhancements
- Project Timeline visualization
- Project Documents section
- Project Tasks and Milestones tracking
- Project Budget information