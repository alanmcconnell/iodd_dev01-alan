# About Page Specifications

## Overview
The About page provides information about the Institute of Database Developers (IODD), including its mission, vision, history, expertise, and key statistics.

## File Structure
- **HTML**: `about.html`
- **JavaScript**: `about-client.js`
- **CSS**: Inline styles in `about.html`

## Page Components

### Header
- Logo: "IODD"
- Navigation: Back to Home link

### Main Content
1. **Page Title**
   - Heading: "About IODD"
   - Subheading: "Institute of Database Developers"

2. **Information Sections**
   - Mission statement
   - Vision statement
   - History
   - Areas of expertise (displayed as a bulleted list)

3. **Statistics Display**
   - Four stat cards in the following order:
     1. Years of Excellence (calculated as current year minus 2005)
     2. Professional Members (active members count)
     3. Projects Completed (projects count)
     4. Industries Served (distinct industries count)
   - Each stat card includes a number and a label
   - Numbers animate from 0 to their final value on page load

### Footer
- Links to Support, Licenses, and Guru Mail

## Data Sources

### Static Content
- Mission, vision, history, and expertise information is stored in the `aboutInfo` object in `about-client.js`

### Dynamic Content (API Endpoints)
1. **Member Count**
   - Endpoint: `/api2/member-count`
   - SQL Query: `SELECT COUNT(DISTINCT ID) AS TheCnt FROM members WHERE Active = 'Y'`
   - Fallback: Direct query to `/api2/members` and count active members

2. **Industry Count**
   - Endpoint: `/api2/industry-count`
   - SQL Query: `SELECT COUNT(DISTINCT LCASE(Industry)) AS TheCnt FROM iodd.projects`
   - Fallback: Direct query to `/api2/projects` and count distinct industries (case-insensitive)

3. **Project Count**
   - Endpoint: `/api2/project-count`
   - SQL Query: `SELECT COUNT(DISTINCT ID) AS TheCnt FROM projects`
   - Fallback: Direct query to `/api2/projects` and count projects

## Responsive Design
- Adapts to different screen sizes with media queries
- On smaller screens:
  - Stat cards change from 4-column to 2-column layout
  - Font sizes are reduced
  - Navigation changes to vertical layout

## Animation
- Stat numbers animate from 0 to their final value
- Animation duration: 2 seconds for initial load, 1 second for updates