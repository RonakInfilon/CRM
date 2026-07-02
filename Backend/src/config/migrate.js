const pool = require("./database");

async function migrate() {
  console.log("Starting database migration...");
  try {
    // 1. Ensure organization table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`organization\` (
        \`org_id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`organization_name\` VARCHAR(255) NOT NULL,
        \`website\` VARCHAR(255),
        \`industry\` VARCHAR(100),
        \`company_size\` VARCHAR(50),
        \`annual_revenue\` VARCHAR(100),
        \`phone\` VARCHAR(20),
        \`city\` VARCHAR(100),
        \`country\` VARCHAR(100),
        \`billing_address\` TEXT,
        \`isPresent\` BOOLEAN DEFAULT TRUE,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    console.log("✓ Organization table verified/created.");

    // 2. Ensure users table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL,
        \`email\` VARCHAR(255) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    console.log("✓ Users table verified/created.");

    // 3. Add missing columns to users table if they don't exist
    const [columns] = await pool.query("SHOW COLUMNS FROM users");
    const columnNames = columns.map(col => col.Field);

    if (!columnNames.includes("phone")) {
      await pool.query("ALTER TABLE users ADD COLUMN phone VARCHAR(50) DEFAULT NULL AFTER password");
      console.log("✓ Added 'phone' column to users.");
    }
    if (!columnNames.includes("bio")) {
      await pool.query("ALTER TABLE users ADD COLUMN bio TEXT DEFAULT NULL AFTER phone");
      console.log("✓ Added 'bio' column to users.");
    }
    if (!columnNames.includes("avatar")) {
      await pool.query("ALTER TABLE users ADD COLUMN avatar VARCHAR(255) DEFAULT NULL AFTER bio");
      console.log("✓ Added 'avatar' column to users.");
    }
    if (!columnNames.includes("role")) {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN role ENUM('Super Admin', 'Company Admin', 'Manager', 'Company Employee') 
        NOT NULL DEFAULT 'Company Employee' AFTER avatar
      `);
      console.log("✓ Added 'role' column to users.");
    }
    if (!columnNames.includes("org_id")) {
      await pool.query("ALTER TABLE users ADD COLUMN org_id INT DEFAULT NULL AFTER role");
      await pool.query("ALTER TABLE users ADD CONSTRAINT fk_users_org FOREIGN KEY (org_id) REFERENCES organization(org_id) ON DELETE SET NULL");
      console.log("✓ Added 'org_id' column and constraint to users.");
    }

    console.log("Database migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
