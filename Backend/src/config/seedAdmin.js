const bcrypt = require("bcrypt");
const pool = require("./database");

async function seed() {
  const name = "Master Admin";
  const email = "admin@crm.com";
  const password = "adminpassword123"; // Feel free to change this password
  
  try {
    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log("Inserting Super Admin into database...");
    // Check if user already exists
    const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      console.log("User already exists with email: " + email);
      process.exit(0);
    }

    await pool.query(
      "INSERT INTO users (name, email, password, role, org_id) VALUES (?, ?, ?, ?, NULL)",
      [name, email, hashedPassword, "Super Admin"]
    );
    
    console.log("\n✓ Super Admin user created successfully!");
    console.log("-----------------------------------------");
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log("-----------------------------------------");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed Super Admin:", error);
    process.exit(1);
  }
}

seed();
