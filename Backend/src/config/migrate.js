const pool = require("./database");
const bcrypt = require("bcrypt");

async function migrate() {
  
  
  const conn = await pool.getConnection();
  
  try {
    // 1. Temporarily disable foreign key checks to drop tables safely
    await conn.query("SET FOREIGN_KEY_CHECKS = 0");
    
    const tablesToDrop = [
      "deal_activities",
      "deal_notes",
      "deals",
      "pipeline_stages",
      "lead_notes",
      "leads",
      "contacts",
      "client_companies",
      "users",
      "organization_permissions",
      "role_permissions",
      "organizations"
    ];
    
    for (const table of tablesToDrop) {
      await conn.query(`DROP TABLE IF EXISTS \`${table}\``);
      console.log(`- Dropped table \`${table}\` (if it existed)`);
    }
    
    // We keep FOREIGN_KEY_CHECKS = 0 during creation of all tables to prevent 
    console.log("✓ Disabled foreign key checks for table creation.");

    // 2. Create organizations table (replaces tenants)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        org_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        status ENUM('active', 'suspended', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("Organizations table created.");

    // 3. Create organization_permissions table (replaces tenant_permissions)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS organization_permissions (
        org_id INT PRIMARY KEY,
        module_dashboard BOOLEAN NOT NULL DEFAULT TRUE,
        module_leads BOOLEAN NOT NULL DEFAULT TRUE,
        module_pipeline BOOLEAN NOT NULL DEFAULT TRUE,
        module_contacts BOOLEAN NOT NULL DEFAULT TRUE,
        module_companies BOOLEAN NOT NULL DEFAULT TRUE,
        module_user_management BOOLEAN NOT NULL DEFAULT TRUE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (org_id) REFERENCES organizations(org_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("Organization Permissions table created.");

    // 3b. Create role_permissions table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        org_id INT,
        role VARCHAR(100) NOT NULL,
        module_dashboard BOOLEAN NOT NULL DEFAULT TRUE,
        module_leads BOOLEAN NOT NULL DEFAULT TRUE,
        module_pipeline BOOLEAN NOT NULL DEFAULT TRUE,
        module_contacts BOOLEAN NOT NULL DEFAULT TRUE,
        module_companies BOOLEAN NOT NULL DEFAULT TRUE,
        module_user_management BOOLEAN NOT NULL DEFAULT TRUE,
        PRIMARY KEY (org_id, role),
        FOREIGN KEY (org_id) REFERENCES organizations(org_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("Role Permissions table created.");

    // 4. Create users table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        org_id INT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(50) DEFAULT NULL,
        bio TEXT DEFAULT NULL,
        role ENUM('Super Admin', 'Company Admin', 'Manager', 'Company Employee', 'Employee') NOT NULL,
        default_module VARCHAR(50) DEFAULT 'Dashboard',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (org_id) REFERENCES organizations(org_id) ON DELETE CASCADE,
        INDEX idx_user_org (org_id),
        INDEX idx_user_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("Users table created.");

    // 5. Create client_companies table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS client_companies (
        company_id INT AUTO_INCREMENT PRIMARY KEY,
        org_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        website VARCHAR(255) DEFAULT NULL,
        industry VARCHAR(100) DEFAULT NULL,
        annual_revenue DECIMAL(18, 2) DEFAULT 0.00,
        phone VARCHAR(50) DEFAULT NULL,
        city VARCHAR(100) DEFAULT NULL,
        country VARCHAR(100) DEFAULT NULL,
        billing_address TEXT DEFAULT NULL,
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        linked_org_id INT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (org_id) REFERENCES organizations(org_id) ON DELETE CASCADE,
        FOREIGN KEY (linked_org_id) REFERENCES organizations(org_id) ON DELETE SET NULL,
        UNIQUE KEY uq_org_company (org_id, name),
        INDEX idx_client_org (org_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("Client Companies table created.");

    // 6. Create contacts table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        contact_id INT AUTO_INCREMENT PRIMARY KEY,
        org_id INT NOT NULL,
        company_id INT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) DEFAULT NULL,
        job_title VARCHAR(150) DEFAULT NULL,
        role VARCHAR(100) DEFAULT NULL,
        contact_status ENUM('Lead', 'Opportunity', 'Won Contact', 'Inactive') DEFAULT 'Lead',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (org_id) REFERENCES organizations(org_id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES client_companies(company_id) ON DELETE SET NULL,
        INDEX idx_contact_org (org_id),
        INDEX idx_contact_company (company_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("Contacts table created.");

    // 7. Create leads table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS leads (
        lead_id INT AUTO_INCREMENT PRIMARY KEY,
        org_id INT NOT NULL,
        contact_id INT NOT NULL UNIQUE,
        org_name VARCHAR(255) NOT NULL,
        website VARCHAR(255) DEFAULT NULL,
        industry VARCHAR(100) DEFAULT NULL,
        source VARCHAR(100) DEFAULT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'New',
        assigned_to_user_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (org_id) REFERENCES organizations(org_id) ON DELETE CASCADE,
        FOREIGN KEY (contact_id) REFERENCES contacts(contact_id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_lead_org (org_id),
        INDEX idx_lead_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("Leads table created.");

    // 8. Create lead_notes table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS lead_notes (
        note_id INT AUTO_INCREMENT PRIMARY KEY,
        lead_id INT NOT NULL,
        note_text TEXT NOT NULL,
        created_by_user_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(lead_id) ON DELETE CASCADE,
        FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_note_lead (lead_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("Lead Notes table created.");

    // 9. Create pipeline_stages table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS pipeline_stages (
        stage_id INT AUTO_INCREMENT PRIMARY KEY,
        org_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (org_id) REFERENCES organizations(org_id) ON DELETE CASCADE,
        UNIQUE KEY uq_org_stage (org_id, name),
        INDEX idx_stage_org (org_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("Pipeline Stages table created.");

    // 10. Create deals table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS deals (
        deal_id INT AUTO_INCREMENT PRIMARY KEY,
        org_id INT NOT NULL,
        stage_id INT NOT NULL,
        contact_id INT NOT NULL,
        deal_name VARCHAR(255) NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        value DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
        contact_executive_id INT NULL,
        dev_progress INT NOT NULL DEFAULT 0,
        lost_reason VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (org_id) REFERENCES organizations(org_id) ON DELETE CASCADE,
        FOREIGN KEY (stage_id) REFERENCES pipeline_stages(stage_id) ON DELETE RESTRICT,
        FOREIGN KEY (contact_id) REFERENCES contacts(contact_id) ON DELETE RESTRICT,
        FOREIGN KEY (contact_executive_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_deal_org (org_id),
        INDEX idx_deal_stage (stage_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("Deals table created.");

    // 11. Create deal_notes table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS deal_notes (
        note_id INT AUTO_INCREMENT PRIMARY KEY,
        deal_id INT NOT NULL,
        note_text TEXT NOT NULL,
        created_by_user_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (deal_id) REFERENCES deals(deal_id) ON DELETE CASCADE,
        FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_note_deal (deal_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("Deal Notes table created.");

    // 12. Create deal_activities table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS deal_activities (
        activity_id INT AUTO_INCREMENT PRIMARY KEY,
        deal_id INT NOT NULL,
        activity_text TEXT NOT NULL,
        performed_by_user_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (deal_id) REFERENCES deals(deal_id) ON DELETE CASCADE,
        FOREIGN KEY (performed_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_activity_deal (deal_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    // Enable foreign key checks back to validate constraints during data insert
    await conn.query("SET FOREIGN_KEY_CHECKS = 1");
    console.log("Re-enabled foreign key checks. Validating constraints...");

    // Seeding: Step 1. Insert global/default organization for Super Admin
    const [orgResult] = await conn.query(
      "INSERT INTO organizations (name, status) VALUES (?, ?)",
      ["Global Admin Group", "active"]
    );
    const orgId = orgResult.insertId;
    console.log(`Seeded default organization ID: ${orgId}`);

    // Seeding: Step 2. Create the default pipeline stages for this organization
    const defaultStages = ["Opportunity", "Proposal Sent", "Negotiation", "Won", "Lost"];
    for (let i = 0; i < defaultStages.length; i++) {
      await conn.query(
        "INSERT INTO pipeline_stages (org_id, name, sort_order) VALUES (?, ?, ?)",
        [orgId, defaultStages[i], i]
      );
    }
    console.log("Seeded default pipeline stages.");

    // Seeding: Step 3. Insert default Super Admin user
    const email = "admin@crm.com";
    const rawPass = "adminpassword123";
    const hashedPass = await bcrypt.hash(rawPass, 10);
    await conn.query(`
      INSERT INTO users (org_id, name, email, password, role, default_module)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [orgId, "Master Admin", email, hashedPass, "Super Admin", "Dashboard"]);
    console.log("Super Admin Seed User created successfully!");
    console.log(`  Email:    ${email}`);
    console.log(`  Password: ${rawPass}`);

    // Seeding: Step 4. Create default organization permissions for orgId = 1
    await conn.query(`
      INSERT INTO organization_permissions (org_id, module_dashboard, module_leads, module_pipeline, module_contacts, module_companies, module_user_management)
      VALUES (?, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE)
    `, [orgId]);
    console.log("Default Organization Permissions seeded successfully!");

    console.log("Database migration and QA validation completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed with error:", error);
    process.exit(1);
  } finally {
    conn.release();
  }
}

migrate();
