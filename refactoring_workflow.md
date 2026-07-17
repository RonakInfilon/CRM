# Frontend Refactoring Workflow Guide

This guide details the step-by-step workflow to reorganize the `CRM/Frontend` directory structure to match the clean and modular **Trackmate** layout. 

Since you are on the `refactor/folder-structure` branch, you can complete these steps safely without affecting the `main` branch.

---

## 🛠️ Step 1: Secure Your Current Work
Before moving any folders, ensure you commit or stash your current staged/unstaged changes:
```bash
# To commit your changes temporarily:
git add .
git commit -m "temp: save work before folder refactoring"

# OR to stash them:
git stash
```

---

## 📂 Step 2: Create Directories & Move Files
Run the following PowerShell commands in the root `CRM` directory to automatically create the new structure and move your files into their target locations.

### 1. Reorganize Global Assets (Icons & Shared Styles)
```powershell
# Create Assets folders
New-Item -ItemType Directory -Force -Path "Frontend\src\assets\icons"
New-Item -ItemType Directory -Force -Path "Frontend\src\assets\styles"

# Move all icons
Move-Item -Path "Frontend\src\icons\*" -Destination "Frontend\src\assets\icons\" -Force
Remove-Item -Path "Frontend\src\icons" -Recurse -Force

# Move global/shared styles
Move-Item -Path "Frontend\src\styles\auth.css" -Destination "Frontend\src\assets\styles\" -Force
Move-Item -Path "Frontend\src\styles\Opportunity.css" -Destination "Frontend\src\assets\styles\" -Force
Move-Item -Path "Frontend\src\index.css" -Destination "Frontend\src\assets\styles\" -Force
```

### 2. Move Common Component Helpers
```powershell
# Move ThemeToggleButton
New-Item -ItemType Directory -Force -Path "Frontend\src\components\ThemeToggleButton"
Move-Item -Path "Frontend\src\common\ThemeToggleButton.jsx" -Destination "Frontend\src\components\ThemeToggleButton\index.jsx" -Force
Remove-Item -Path "Frontend\src\common" -Recurse -Force

# Move global Table helper
New-Item -ItemType Directory -Force -Path "Frontend\src\components\Table"
Move-Item -Path "Frontend\src\table\index.jsx" -Destination "Frontend\src\components\Table\index.jsx" -Force
Remove-Item -Path "Frontend\src\table" -Recurse -Force
```

### 3. Reorganize Global UI Components (Colocated Styles)
Run this block to create component subfolders and move matching code and CSS files together:
```powershell
# ActionMenu
New-Item -ItemType Directory -Force -Path "Frontend\src\components\ActionMenu"
Move-Item -Path "Frontend\src\components\ActionMenu.jsx" -Destination "Frontend\src\components\ActionMenu\index.jsx" -Force
Move-Item -Path "Frontend\src\styles\ActionMenu.css" -Destination "Frontend\src\components\ActionMenu\ActionMenu.styles.css" -Force

# ActivityLog
New-Item -ItemType Directory -Force -Path "Frontend\src\components\ActivityLog"
Move-Item -Path "Frontend\src\components\ActivityLog.jsx" -Destination "Frontend\src\components\ActivityLog\index.jsx" -Force
Move-Item -Path "Frontend\src\styles\ActivityLog.css" -Destination "Frontend\src\components\ActivityLog\ActivityLog.styles.css" -Force

# ActivityLogPanel
New-Item -ItemType Directory -Force -Path "Frontend\src\components\ActivityLogPanel"
Move-Item -Path "Frontend\src\components\ActivityLogPanel.jsx" -Destination "Frontend\src\components\ActivityLogPanel\index.jsx" -Force
Move-Item -Path "Frontend\src\styles\ActivityLogPanel.css" -Destination "Frontend\src\components\ActivityLogPanel\ActivityLogPanel.styles.css" -Force

# Appsidebar
New-Item -ItemType Directory -Force -Path "Frontend\src\components\Appsidebar"
Move-Item -Path "Frontend\src\components\Appsidebar.jsx" -Destination "Frontend\src\components\Appsidebar\index.jsx" -Force
Move-Item -Path "Frontend\src\styles\sidebar.css" -Destination "Frontend\src\components\Appsidebar\sidebar.styles.css" -Force

# CompanyCard
New-Item -ItemType Directory -Force -Path "Frontend\src\components\CompanyCard"
Move-Item -Path "Frontend\src\components\CompanyCard.jsx" -Destination "Frontend\src\components\CompanyCard\index.jsx" -Force
Move-Item -Path "Frontend\src\styles\CompanyCard.css" -Destination "Frontend\src\components\CompanyCard\CompanyCard.styles.css" -Force

# CompanyModal
New-Item -ItemType Directory -Force -Path "Frontend\src\components\CompanyModal"
Move-Item -Path "Frontend\src\components\CompanyModal.jsx" -Destination "Frontend\src\components\CompanyModal\index.jsx" -Force
Move-Item -Path "Frontend\src\styles\CompanyModal.css" -Destination "Frontend\src\components\CompanyModal\CompanyModal.styles.css" -Force

# ContactDetailDrawer
New-Item -ItemType Directory -Force -Path "Frontend\src\components\ContactDetailDrawer"
Move-Item -Path "Frontend\src\components\ContactDetailDrawer.jsx" -Destination "Frontend\src\components\ContactDetailDrawer\index.jsx" -Force
Move-Item -Path "Frontend\src\styles\ContactDetailDrawer.css" -Destination "Frontend\src\components\ContactDetailDrawer\ContactDetailDrawer.styles.css" -Force

# ContactModal
New-Item -ItemType Directory -Force -Path "Frontend\src\components\ContactModal"
Move-Item -Path "Frontend\src\components\ContactModal.jsx" -Destination "Frontend\src\components\ContactModal\index.jsx" -Force

# DashboardLayout
New-Item -ItemType Directory -Force -Path "Frontend\src\components\DashboardLayout"
Move-Item -Path "Frontend\src\components\DashboardLayout.jsx" -Destination "Frontend\src\components\DashboardLayout\index.jsx" -Force
Move-Item -Path "Frontend\src\styles\dashboard_layout.css" -Destination "Frontend\src\components\DashboardLayout\dashboard_layout.styles.css" -Force

# DealDetailView
New-Item -ItemType Directory -Force -Path "Frontend\src\components\DealDetailView"
Move-Item -Path "Frontend\src\components\DealDetailView.jsx" -Destination "Frontend\src\components\DealDetailView\index.jsx" -Force
Move-Item -Path "Frontend\src\styles\DealDataView.css" -Destination "Frontend\src\components\DealDetailView\DealDetailView.styles.css" -Force

# LeadCard
New-Item -ItemType Directory -Force -Path "Frontend\src\components\LeadCard"
Move-Item -Path "Frontend\src\components\LeadCard.jsx" -Destination "Frontend\src\components\LeadCard\index.jsx" -Force
Move-Item -Path "Frontend\src\styles\LeadCard.css" -Destination "Frontend\src\components\LeadCard\LeadCard.styles.css" -Force

# LeadModel
New-Item -ItemType Directory -Force -Path "Frontend\src\components\LeadModel"
Move-Item -Path "Frontend\src\components\LeadModel.jsx" -Destination "Frontend\src\components\LeadModel\index.jsx" -Force
Move-Item -Path "Frontend\src\styles\LeadModel.css" -Destination "Frontend\src\components\LeadModel\LeadModel.styles.css" -Force

# LeadTable
New-Item -ItemType Directory -Force -Path "Frontend\src\components\LeadTable"
Move-Item -Path "Frontend\src\components\LeadTable.jsx" -Destination "Frontend\src\components\LeadTable\index.jsx" -Force
Move-Item -Path "Frontend\src\styles\LeadTable.css" -Destination "Frontend\src\components\LeadTable\LeadTable.styles.css" -Force

# Navbar
New-Item -ItemType Directory -Force -Path "Frontend\src\components\Navbar"
Move-Item -Path "Frontend\src\components\navbar.jsx" -Destination "Frontend\src\components\Navbar\index.jsx" -Force
Move-Item -Path "Frontend\src\styles\navbar.css" -Destination "Frontend\src\components\Navbar\navbar.styles.css" -Force

# NotesSection
New-Item -ItemType Directory -Force -Path "Frontend\src\components\NotesSection"
Move-Item -Path "Frontend\src\components\NotesSection.jsx" -Destination "Frontend\src\components\NotesSection\index.jsx" -Force
Move-Item -Path "Frontend\src\styles\NotesSection.css" -Destination "Frontend\src\components\NotesSection\NotesSection.styles.css" -Force

# Pageheader
New-Item -ItemType Directory -Force -Path "Frontend\src\components\Pageheader"
Move-Item -Path "Frontend\src\components\Pageheader.jsx" -Destination "Frontend\src\components\Pageheader\index.jsx" -Force
Move-Item -Path "Frontend\src\styles\Pageheader.css" -Destination "Frontend\src\components\Pageheader\Pageheader.styles.css" -Force

# Pagination
New-Item -ItemType Directory -Force -Path "Frontend\src\components\Pagination"
Move-Item -Path "Frontend\src\components\Pagination.jsx" -Destination "Frontend\src\components\Pagination\index.jsx" -Force
Move-Item -Path "Frontend\src\styles\pagination.css" -Destination "Frontend\src\components\Pagination\pagination.styles.css" -Force

# ProtectedRoute, RoleGuard, StatusBadges (No standalone CSS)
New-Item -ItemType Directory -Force -Path "Frontend\src\components\ProtectedRoute"
Move-Item -Path "Frontend\src\components\ProtectedRoute.jsx" -Destination "Frontend\src\components\ProtectedRoute\index.jsx" -Force

New-Item -ItemType Directory -Force -Path "Frontend\src\components\RoleGuard"
Move-Item -Path "Frontend\src\components\RoleGuard.jsx" -Destination "Frontend\src\components\RoleGuard\index.jsx" -Force

New-Item -ItemType Directory -Force -Path "Frontend\src\components\StatusBadges"
Move-Item -Path "Frontend\src\components\StatusBadges.jsx" -Destination "Frontend\src\components\StatusBadges\index.jsx" -Force

# UnifiedModal
New-Item -ItemType Directory -Force -Path "Frontend\src\components\UnifiedModal"
Move-Item -Path "Frontend\src\components\UnifiedModal.jsx" -Destination "Frontend\src\components\UnifiedModal\index.jsx" -Force
Move-Item -Path "Frontend\src\styles\UnifiedModal.css" -Destination "Frontend\src\components\UnifiedModal\UnifiedModal.styles.css" -Force
```

### 4. Reorganize Pages (Views)
Run this block to create page directories and move views together with colocated page styles:
```powershell
# AccessDenied
New-Item -ItemType Directory -Force -Path "Frontend\src\pages\access-denied"
Move-Item -Path "Frontend\src\pages\AccessDenied.jsx" -Destination "Frontend\src\pages\access-denied\index.jsx" -Force
Move-Item -Path "Frontend\src\styles\AccessDenied.css" -Destination "Frontend\src\pages\access-denied\access-denied.styles.css" -Force

# Activity
New-Item -ItemType Directory -Force -Path "Frontend\src\pages\activity"
Move-Item -Path "Frontend\src\pages\Activity.jsx" -Destination "Frontend\src\pages\activity\index.jsx" -Force

# AuditLogs
New-Item -ItemType Directory -Force -Path "Frontend\src\pages\audit-logs"
Move-Item -Path "Frontend\src\pages\AuditLogs.jsx" -Destination "Frontend\src\pages\audit-logs\index.jsx" -Force
Move-Item -Path "Frontend\src\styles\AuditLogs.css" -Destination "Frontend\src\pages\audit-logs\audit-logs.styles.css" -Force

# Company / Organization
New-Item -ItemType Directory -Force -Path "Frontend\src\pages\company"
Move-Item -Path "Frontend\src\pages\Company.jsx" -Destination "Frontend\src\pages\company\index.jsx" -Force
Move-Item -Path "Frontend\src\styles\Organization.css" -Destination "Frontend\src\pages\company\company.styles.css" -Force

# Dashboard
New-Item -ItemType Directory -Force -Path "Frontend\src\pages\dashboard"
Move-Item -Path "Frontend\src\pages\Dashboard.jsx" -Destination "Frontend\src\pages\dashboard\index.jsx" -Force
Move-Item -Path "Frontend\src\styles\dashboard.css" -Destination "Frontend\src\pages\dashboard\dashboard.styles.css" -Force

# DragAndDrop
New-Item -ItemType Directory -Force -Path "Frontend\src\pages\drag-and-drop"
Move-Item -Path "Frontend\src\pages\DragAndDrop.jsx" -Destination "Frontend\src\pages\drag-and-drop\index.jsx" -Force

# Leads
New-Item -ItemType Directory -Force -Path "Frontend\src\pages\leads"
Move-Item -Path "Frontend\src\pages\Leads.jsx" -Destination "Frontend\src\pages\leads\index.jsx" -Force
Move-Item -Path "Frontend\src\styles\Leads.css" -Destination "Frontend\src\pages\leads\leads.styles.css" -Force

# Login
New-Item -ItemType Directory -Force -Path "Frontend\src\pages\login"
Move-Item -Path "Frontend\src\pages\Login.jsx" -Destination "Frontend\src\pages\login\index.jsx" -Force

# Permission
New-Item -ItemType Directory -Force -Path "Frontend\src\pages\permission"
Move-Item -Path "Frontend\src\pages\Permission.jsx" -Destination "Frontend\src\pages\permission\index.jsx" -Force
Move-Item -Path "Frontend\src\styles\Permission.css" -Destination "Frontend\src\pages\permission\permission.styles.css" -Force

# Pipeline
New-Item -ItemType Directory -Force -Path "Frontend\src\pages\pipeline"
Move-Item -Path "Frontend\src\pages\Pipeline.jsx" -Destination "Frontend\src\pages\pipeline\index.jsx" -Force
Move-Item -Path "Frontend\src\styles\PipeLine.css" -Destination "Frontend\src\pages\pipeline\pipeline.styles.css" -Force

# Profile
New-Item -ItemType Directory -Force -Path "Frontend\src\pages\profile"
Move-Item -Path "Frontend\src\pages\Profile.jsx" -Destination "Frontend\src\pages\profile\index.jsx" -Force
Move-Item -Path "Frontend\src\styles\Profile.css" -Destination "Frontend\src\pages\profile\profile.styles.css" -Force

# Signup
New-Item -ItemType Directory -Force -Path "Frontend\src\pages\signup"
Move-Item -Path "Frontend\src\pages\Signup.jsx" -Destination "Frontend\src\pages\signup\index.jsx" -Force

# Users
New-Item -ItemType Directory -Force -Path "Frontend\src\pages\users"
Move-Item -Path "Frontend\src\pages\Users.jsx" -Destination "Frontend\src\pages\users\index.jsx" -Force
Move-Item -Path "Frontend\src\styles\Users.css" -Destination "Frontend\src\pages\users\users.styles.css" -Force

# Cleanup empty Styles directory
Remove-Item -Path "Frontend\src\styles" -Recurse -Force
```

### 5. Reorganize Services
```powershell
# Move api.js base instance into services
Move-Item -Path "Frontend\src\api.js" -Destination "Frontend\src\services\api.js" -Force
```

---

## 🛠️ Step 3: Update Imports

Once files are moved, the bundler will output compilation errors due to changed import paths. Update import paths using these guidelines:

### 1. Internal Page / Component Styles
Inside each relocated file, update CSS imports to point locally.
* **Example (`Frontend/src/components/ActionMenu/index.jsx`):**
  - **Old:** `import "../styles/ActionMenu.css";`
  - **New:** `import "./ActionMenu.styles.css";`
* **Example (`Frontend/src/pages/dashboard/index.jsx`):**
  - **Old:** `import "../styles/dashboard.css";`
  - **New:** `import "./dashboard.styles.css";`
* **Shared styles (Login & Signup page `auth.css`):**
  - **Old:** `import "../styles/auth.css";`
  - **New:** `import "../../assets/styles/auth.css";`

### 2. Update Component Imports in Pages
Since pages now sit in subfolders, you need to append an extra `../` to components/services paths.
* **Example (`Frontend/src/pages/leads/index.jsx`):**
  - **Old:** `import LeadTable from "../components/LeadTable";`
  - **New:** `import LeadTable from "../../components/LeadTable";`
  - *(Note: Since LeadTable is now inside `components/LeadTable/index.jsx`, Vite will automatically resolve `../../components/LeadTable` as it defaults to looking for index.jsx)*

### 3. Update Icon Asset Imports
* **Example (`Frontend/src/components/Appsidebar/index.jsx`):**
  - **Old:** `import { someIcon } from "../icons";`
  - **New:** `import { someIcon } from "../../assets/icons";`

---

## 🔗 Step 4: Add Decentralized Routing (Recommended)

To keep `App.jsx` clean, create a dedicated router setup.

1. **Create Routing Configuration File (`Frontend/src/routes/index.jsx`):**
   ```jsx
   import { Routes, Route } from "react-router-dom";
   
   import Login from "../pages/login";
   import Signup from "../pages/signup";
   import Dashboard from "../pages/dashboard";
   import ProtectedRoute from "../components/ProtectedRoute";
   import Leads from "../pages/leads";
   import DashboardLayout from "../components/DashboardLayout";
   import Pipeline from "../pages/pipeline";
   import Notes from "../pages/activity";
   import ActivityLog from "../components/ActivityLog";
   import RoleGuard from "../components/RoleGuard";
   import Permission from "../pages/permission";
   import Profile from "../pages/profile";
   import Users from "../pages/users";
   import Company from "../pages/company";
   import AuditLogs from "../pages/audit-logs";

   export default function AppRoutes() {
     return (
       <Routes>
         <Route path="/" element={<Login />} />
         <Route path="/signup" element={<Signup />} />

         <Route
           element={
             <ProtectedRoute>
               <DashboardLayout />
             </ProtectedRoute>
           }
         >
           <Route path="/dashboard" element={<Dashboard />} />
           <Route path="/leads" element={<Leads />} />
           <Route path="/companies" element={<RoleGuard><Company /></RoleGuard>} />
           <Route path="/pipeline" element={<RoleGuard><Pipeline /></RoleGuard>} />
           <Route path="/activity" element={<Notes />} />
           <Route path="/drag" element={<RoleGuard><ActivityLog /></RoleGuard>} />
           <Route path="/permission" element={<RoleGuard><Permission /></RoleGuard>} />
           <Route path="/users" element={<RoleGuard><Users /></RoleGuard>} />
           <Route path="/profile" element={<Profile />} />
           <Route path="/audit-logs" element={<RoleGuard><AuditLogs /></RoleGuard>} />
         </Route>
       </Routes>
     );
   }
   ```

2. **Clean up `Frontend/src/App.jsx`:**
   Make it simply render your context provider and routes:
   ```jsx
   import { BrowserRouter } from "react-router-dom";
   import { RoleProvider } from "./context/RoleContext";
   import AppRoutes from "./routes";

   function App() {
     return (
       <RoleProvider>
         <BrowserRouter>
           <AppRoutes />
         </BrowserRouter>
       </RoleProvider>
     );
   }

   export default App;
   ```

---

## 🧪 Step 5: Test & Validate
1. Run the development server:
   ```bash
   cd Frontend
   npm run dev
   ```
2. Navigate to your app in the browser and verify page rendering.
3. Check for any build compilation warnings/errors in the terminal.
4. Once verified, add the files and commit:
   ```bash
   git add .
   git commit -m "refactor: reorganize folder structure to trackmate standard"
   ```
