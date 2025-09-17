# IODD Members Menu - Project Specifications

## Overview
The Members dropdown menu provides access to four distinct member-related pages, each serving different purposes for viewing and managing member information.

## Menu Items Specifications

### 1. Member List
**File:** `member-list.html` + `member-list-client.js`
**Purpose:** Display comprehensive member directory with contact information
**Layout:** Grid-based card layout with uniform card heights (450px)
**Features:**
- Member cards showing name, phone, and cell numbers
- Search functionality (name, phone, email)
- Bio expansion with "Show More Bio" / "Show Less Bio" buttons
- Responsive grid layout
- Database integration via API endpoint
- Compact header design (50% smaller)

### 2. Members Bios
**File:** `member-bios.html` + `member-bios-client.js`
**Purpose:** Display member biographies in individual expandable cards
**Layout:** Multi-column grid with expandable bio sections
**Features:**
- Member name headers
- Expandable biography text with "Show More Bio" toggle
- Professional card-based design
- Individual bio loading and display

### 3. Member Bios 2
**File:** `member-bios2.html` + `member-bios2-client.js`
**Purpose:** Alternative bio viewing with split-panel interface
**Layout:** Two-panel layout (300px left panel + flexible right panel)
**Features:**
- Left panel: Clickable member name list with compact row spacing (2px vertical padding)
- Right panel: Selected member's biography display
- Interactive selection with visual highlighting
- Single-click bio viewing experience
- Compact header design (50% smaller)

### 4. Member Skills
**File:** `member-skills.html` + `member-skills-client.js`
**Purpose:** Display technical skills and expertise of members
**Layout:** Two-panel layout (300px left panel + flexible right panel)
**Features:**
- Left panel: Member name selection list with ultra-compact rows (2px vertical padding)
- Right panel: Skills search functionality with clear button (X) and technical skills display
- Skills data from database Skills field
- Search functionality to filter members by skills
- Professional skills presentation format
- Maximized content area extending close to footer
- Compact header design (50% smaller)
- Minimized title spacing for maximum content space

## Technical Specifications

### Database Integration
- **Primary Endpoint:** `/api2/webpage_members_bio_view`
- **Server:** `http://localhost:54032`
- **Data Fields:** FirstName, LastName, BIO, Skills, Phone, Cell
- **Response Format:** JSON array of member objects

### Common Features Across All Pages
- Consistent IODD branding and styling
- Responsive design with mobile considerations
- Error handling for network/data issues
- Loading states during data fetch
- "Back to Home" navigation with compact button design
- Professional gradient background design
- Standardized compact header and footer across all pages
- Maximized content area utilization

### Styling Standards
- **Color Scheme:** Blue-purple gradient (#667eea to #764ba2)
- **Typography:** Arial sans-serif font family
- **Card Design:** White backgrounds with subtle shadows
- **Interactive Elements:** Hover effects and smooth transitions
- **Layout:** Consistent padding, margins, and spacing
- **Header Design:** Compact 50% smaller headers (10px padding, 12px logo font-size)
- **Footer Design:** Compact 50% smaller footers (10px padding)
- **Member List Rows:** Ultra-compact spacing for maximum visibility

### Performance Considerations
- Efficient data loading and caching
- Minimal DOM manipulation
- Responsive grid layouts
- Optimized for various screen sizes
- Clean separation of concerns (HTML/CSS/JS)

## File Structure
```
/iodd-New-02/
├── member-list.html
├── member-list-client.js
├── member-bios.html
├── member-bios-client.js
├── member-bios2.html
├── member-bios2-client.js
├── member-skills.html
└── member-skills-client.js
```

Each page maintains consistent architecture while providing unique user experiences for different member data viewing needs.