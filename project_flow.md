# CRM Project Flow & Commit History

This document maps out the step-by-step evolution of the CRM codebase based on the git commit logs, showing how each module and file was introduced and modified over time.

---

## 🛠️ Step-by-Step Project Flow

### 1. Core User Profiles & Initial Auth Setup
* **Commit**: `6bd668b` - Profile module completed
* **Key Files**:
  * [Backend/server.js](file:///c:/Users/Lenovo/Desktop/CRM/Backend/server.js)
  * `Backend/src/routes/userRoutes.js`
  * `Frontend/src/context/RoleContext.jsx`
  * `Frontend/src/pages/Profile.jsx`
  * `Frontend/src/services/profileService.js`

### 2. Lead Management Foundations
* **Commit**: `fa57fb3` & `5836f7d` - Create and Update Lead Module APIs
* **Key Files**:
  * `Backend/src/config/migrate.js`
  * `Backend/src/controllers/lead.controller.js`
  * `Backend/src/models/lead.model.js`
  * `Backend/src/routes/leadRoutes.js`
  * `Backend/src/services/leads.service.js`

### 3. Pipeline & Deals Management Setup
* **Commit**: `6b3cb55` - Implement pipeline management features (CRUD for deals/stages)
* **Key Files**:
  * `Backend/src/models/pipeline.model.js`
  * `Backend/src/routes/pipelineRoutes.js`
  * `Frontend/src/pages/Pipeline.jsx`
  * `Frontend/src/services/pipelineService.js`

### 4. Contact Management Integration
* **Commit**: `e1adc14` - Implement CRUD operations for contacts with API & frontend integration
* **Key Files**:
  * `Backend/src/controllers/contact.controller.js`
  * `Backend/src/models/contact.model.js`
  * `Backend/src/routes/contactRoutes.js`
  * `Frontend/src/components/ContactDetailDrawer.jsx`
  * `Frontend/src/pages/Contacts.jsx`
  * `Frontend/src/services/contactService.js`

### 5. Connecting Auth, Lead & Pipeline Modules
* **Commit**: `451082d` - Updated auth, lead and pipeline model, controller and routes
* **Key Files**:
  * `Backend/src/controllers/auth.controller.js`
  * `Backend/src/controllers/lead.controller.js`
  * `Backend/src/controllers/pipeline.controller.js`
  * `Backend/src/middleware/auth.middleware.js`
  * `Backend/src/routes/authRoutes.js`
  * `Backend/src/routes/leadRoutes.js`
* **Commit**: `0351407` - Updated lead and pipeline pages
  * **Key Files**:
    * `Frontend/src/App.jsx`
    * `Frontend/src/components/Appsidebar.jsx`
    * `Frontend/src/components/DealDetailView.jsx`
    * `Frontend/src/pages/Account.jsx`
    * `Frontend/src/pages/Pipeline.jsx`
    * `Frontend/src/services/leadService.js`

### 6. Company & Contact Organization Linkage
* **Commit**: `a29c22b` - Implement CRUD operation for company/contact
* **Key Files**:
  * `Backend/src/controllers/company.controller.js`
  * `Backend/src/controllers/tenant.controller.js`
  * `Backend/src/models/company.model.js`
  * `Backend/src/models/contact.model.js`
  * `Backend/src/models/tenant.model.js`
  * `Backend/src/routes/companyRoutes.js`
  * `Frontend/src/components/CompanyModal.jsx`
  * `Frontend/src/components/ContactModal.jsx`
  * `Frontend/src/pages/Company.jsx`
  * `Frontend/src/pages/Dashboard.jsx`
  * `Frontend/src/pages/Users.jsx`
  * `Frontend/src/services/organizationService.js`

### 7. Security Permissions Module
* **Commit**: `4a09fcc` - Implement permission routes and connect with frontend
* **Key Files**:
  * `Backend/src/controllers/permission.controller.js`
  * `Backend/src/models/permission.model.js`
  * `Backend/src/routes/permissionRoutes.js`
  * `Frontend/src/services/permissionService.js`

### 8. Metrics Dashboard Module
* **Commit**: `c3a1948` & `666a6cd` - Implement Dashboard routes and connect with frontend
* **Key Files**:
  * `Backend/server.js`
  * `Backend/src/controllers/dashboard.controller.js`
  * `Backend/src/routes/dashboardRoutes.js`
  * `Frontend/src/services/dashboardService.js`

### 9. Frontend Interactive Improvements & Context Refactoring
* **Commit**: `bc478fa` & `50543c8` - Refactor user components, models, and interactive table CSS
  * **Key Files**:
    * `Frontend/src/components/CompanyModal.jsx`
    * `Frontend/src/components/LeadModel.jsx`
    * `Frontend/src/components/LeadTable.jsx`
    * `Frontend/src/pages/Users.jsx`
* **Commit**: `1733c5f` - Add Companies permission UI, update role context, and streamline login-data refresh
  * **Key Files**:
    * `Backend/src/controllers/lead.controller.js`
    * `Backend/src/controllers/permission.controller.js`
    * `Frontend/src/components/DashboardLayout.jsx`
    * `Frontend/src/components/navbar.jsx`
    * `Frontend/src/context/RoleContext.jsx`
    * `Frontend/src/pages/Login.jsx`
    * `Frontend/src/pages/Permission.jsx`
* **Commit**: `e580e05` - Filter upgrades, make contact organization mandatory
  * **Key Files**:
    * `Backend/src/models/lead.model.js`
    * `Frontend/src/components/LeadModel.jsx`
    * `Frontend/src/components/LeadTable.jsx`

### 10. Backend Optimization, Database Seeding & Security Refactoring
* **Commit**: `ac025dd` / `3e771d6` / `f681cc0` - Seed default pipeline stages, add drag-and-drop config, secure env files
  * **Key Files**:
    * `Backend/src/config/migrate.js`
    * `Backend/src/config/seed_stages.js`
    * `Backend/src/routes/pipelineRoutes.js`
    * `Frontend/src/api.js`
* **Commit**: `d5f4939` - Store auth permissions in the database instead of local storage
  * **Key Files**:
    * `Backend/src/controllers/lead.controller.js`
    * `Backend/src/controllers/user.controller.js`
    * `Backend/src/models/lead.model.js`
    * `Backend/src/models/user.model.js`
    * `Backend/src/routes/userRoutes.js`
    * `Frontend/src/context/RoleContext.jsx`

### 11. Activity Logging & Auditing System
* **Commit**: `c408236` / `46cfbb7` / `584bed7` / `366fe54` - Implement Action Logs/Audit Logs
  * **Key Files**:
    * `Backend/server.js`
    * `Backend/src/controllers/log.controller.js`
    * `Backend/src/controllers/auth.controller.js`
    * `Backend/src/middleware/logger.middleware.js`
    * `Backend/src/models/logs.schema.js`
    * `Backend/src/routes/logRoutes.js`
    * `Frontend/src/components/LeadModel.jsx`
    * `Frontend/src/components/LeadTable.jsx`
    * `Frontend/src/pages/Dashboard.jsx`
    * `Frontend/src/pages/Pipeline.jsx`

### 12. Removing Redundant Modules
* **Commit**: `2ca6c81` - Remove Contacts page & merge with Company Cards
  * **Key Files**:
    * `Frontend/src/components/CompanyModal.jsx`
    * `Frontend/src/pages/Contacts.jsx` (Deleted)
    * `Frontend/src/routes/index.jsx`

---

## 🎨 Refactoring Commit Guidelines

Use the following command to commit your theme gradient refactoring changes:

```bash
git add .
git commit -m "style: refactor frontend theme to use central linear gradient variables"
```
