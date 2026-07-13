const pool = require("./database");

const DEFAULT_STAGES = [
  "Opportunity",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost",
];

async function seedStages() {
  const conn = await pool.getConnection();
  try {
    // Find all org IDs that currently have NO pipeline stages
    const [orgs] = await conn.query(`
      SELECT org_id FROM organizations
      WHERE org_id NOT IN (
        SELECT DISTINCT org_id FROM pipeline_stages
      )
    `);

    if (orgs.length === 0) {
      console.log("ℹ  All organizations already have pipeline stages.");
      console.log("   Run this instead to force-insert for a specific org:");
      console.log("   Edit seed_stages.js and set forceOrgIds = [<your_org_id>]");
    } else {
      for (const { org_id } of orgs) {
        for (let i = 0; i < DEFAULT_STAGES.length; i++) {
          await conn.query(
            "INSERT IGNORE INTO pipeline_stages (org_id, name, sort_order) VALUES (?, ?, ?)",
            [org_id, DEFAULT_STAGES[i], i]
          );
        }
        console.log(` Seeded 5 stages for org_id=${org_id}`);
      }
    }

    // Also handle force-insert for specific orgs if you need it
    // const forceOrgIds = []; // ← put your org_id here if needed
    // for (const org_id of forceOrgIds) {
    //   for (let i = 0; i < DEFAULT_STAGES.length; i++) {
    //     await conn.query(
    //       "INSERT IGNORE INTO pipeline_stages (org_id, name, sort_order) VALUES (?, ?, ?)",
    //       [org_id, DEFAULT_STAGES[i], i]
    //     );
    //   }
    //   console.log(`  Force-seeded 5 stages for org_id=${org_id}`);
    // }

    // Show what's in the table now
    const [rows] = await conn.query(
      "SELECT org_id, stage_id, name, sort_order FROM pipeline_stages ORDER BY org_id, sort_order"
    );
    console.log("\nCurrent pipeline_stages table:");
    console.table(rows);

    process.exit(0);
  } catch (err) {
    console.error("  Seed failed:", err.message);
    process.exit(1);
  } finally {
    conn.release();
  }
}

seedStages();
