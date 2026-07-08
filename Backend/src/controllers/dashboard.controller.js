const pool = require("../config/database");

const getDashboardStats = async (req, res) => {
  try {
    const orgId = req.user.org_id;

    // 1. Total Leads count (isPresent = 1)
    const [leadsCountRow] = await pool.execute(
      `SELECT COUNT(*) AS total_leads
       FROM leads l
       INNER JOIN users u ON l.created_by_user_id = u.id
       WHERE u.org_id = ? AND l.isPresent = 1`,
      [orgId]
    );
    const totalLeads = leadsCountRow[0]?.total_leads || 0;

    // 2. Active Pipeline Value (Sum of deal values in the "Won" stage)
    const [pipelineValueRow] = await pool.execute(
      `SELECT SUM(d.value) AS active_pipeline_value
       FROM deals d
       INNER JOIN pipeline_stages ps ON d.stage_id = ps.stage_id
       INNER JOIN users u ON d.created_by_user_id = u.id
       WHERE u.org_id = ? AND ps.name = 'Won'`,
      [orgId]
    );
    const pipelineValue = parseFloat(pipelineValueRow[0]?.active_pipeline_value || 0);

    // 3. Win Rate calculation: (Won Deals / Total Deals) * 100
    const [dealsCountRow] = await pool.execute(
      `SELECT 
         COUNT(*) AS total_deals,
         SUM(CASE WHEN ps.name = 'Won' THEN 1 ELSE 0 END) AS won_deals
       FROM deals d
       INNER JOIN pipeline_stages ps ON d.stage_id = ps.stage_id
       INNER JOIN users u ON d.created_by_user_id = u.id
       WHERE u.org_id = ?`,
      [orgId]
    );
    const totalDeals = dealsCountRow[0]?.total_deals || 0;
    const wonDeals = dealsCountRow[0]?.won_deals || 0;
    const winRateVal = totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0.0;
    const winRate = winRateVal.toFixed(1) + "%";

    // 4. Total Companies count
    const [companiesCountRow] = await pool.execute(
      `SELECT COUNT(*) AS total_companies
       FROM client_companies cc
       WHERE cc.org_id = ?`,
      [orgId]
    );
    const companiesCount = companiesCountRow[0]?.total_companies || 0;

    // 5. Lead Acquisition Trend (last 6 months, chronological)
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = d.toLocaleString('en-US', { month: 'short' });
      months.push({
        name: monthName,
        year: d.getFullYear(),
        monthNum: d.getMonth() + 1,
        count: 0
      });
    }

    const [trendRows] = await pool.execute(
      `SELECT
         YEAR(l.created_at) AS year,
         MONTH(l.created_at) AS monthNum,
         COUNT(l.lead_id) AS lead_count
       FROM leads l
       INNER JOIN users u ON l.created_by_user_id = u.id
       WHERE u.org_id = ?
         AND l.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY YEAR(l.created_at), MONTH(l.created_at)`,
      [orgId]
    );

    trendRows.forEach(row => {
      const match = months.find(m => m.year === row.year && m.monthNum === row.monthNum);
      if (match) {
        match.count = row.lead_count;
      }
    });

    const leadAcquisitionTrend = {
      categories: months.map(m => m.name),
      data: months.map(m => m.count)
    };

    // 6. Lead Distribution by Source
    const [sourceRows] = await pool.execute(
      `SELECT
         COALESCE(o.source, 'Unknown') AS source,
         COUNT(l.lead_id) AS count
       FROM leads l
       INNER JOIN organizations o ON l.org_id = o.org_id
       INNER JOIN users u ON l.created_by_user_id = u.id
       WHERE u.org_id = ? AND l.isPresent = 1
       GROUP BY o.source`,
      [orgId]
    );

    const sourceMap = {
      "Website": 0,
      "LinkedIn": 0,
      "Referrals": 0,
      "Cold outreach": 0
    };
    sourceRows.forEach(row => {
      sourceMap[row.source] = row.count;
    });

    const leadDistribution = {
      labels: Object.keys(sourceMap),
      series: Object.values(sourceMap)
    };

    // 7. Recent Activities Feed
    const [dealActivitiesRows] = await pool.execute(
      `SELECT
         'deal' AS type,
         da.activity_text AS text,
         d.deal_name AS title,
         u.name AS user_name,
         da.created_at AS created_at
       FROM deal_activities da
       INNER JOIN deals d ON da.deal_id = d.deal_id
       INNER JOIN users u ON da.performed_by_user_id = u.id
       WHERE u.org_id = ?
       ORDER BY da.created_at DESC
       LIMIT 5`,
      [orgId]
    );

    const [leadRows] = await pool.execute(
      `SELECT
         'lead' AS type,
         CONCAT(c.first_name, ' ', c.last_name) AS lead_name,
         o.name AS organization_name,
         u.name AS user_name,
         l.created_at AS created_at
       FROM leads l
       INNER JOIN contacts c ON l.contact_id = c.contact_id
       INNER JOIN organizations o ON l.org_id = o.org_id
       INNER JOIN users u ON l.created_by_user_id = u.id
       WHERE u.org_id = ? AND l.isPresent = 1
       ORDER BY l.created_at DESC
       LIMIT 5`,
      [orgId]
    );

    const [companyRows] = await pool.execute(
      `SELECT
         'company' AS type,
         cc.name AS company_name,
         cc.city AS city,
         cc.created_at AS created_at
       FROM client_companies cc
       WHERE cc.org_id = ?
       ORDER BY cc.created_at DESC
       LIMIT 5`,
      [orgId]
    );

    const mergedActivities = [];
    dealActivitiesRows.forEach(row => {
      mergedActivities.push({
        type: 'deal',
        text: row.text,
        subtext: `${row.title} • By ${row.user_name}`,
        created_at: row.created_at
      });
    });
    leadRows.forEach(row => {
      mergedActivities.push({
        type: 'lead',
        text: `New Lead created: ${row.lead_name}`,
        subtext: `${row.organization_name} • Inbound • By ${row.user_name}`,
        created_at: row.created_at
      });
    });
    companyRows.forEach(row => {
      mergedActivities.push({
        type: 'company',
        text: `New Organization added: ${row.company_name}`,
        subtext: `${row.city || 'Headquarters'} • By Admin`,
        created_at: row.created_at
      });
    });

    mergedActivities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const recentActivities = mergedActivities.slice(0, 5);

    // 8. Lifecycle Conversion
    const totalBaseline = totalLeads + totalDeals;
    const qualifiedPercentage = totalBaseline > 0 ? Math.round((totalDeals / totalBaseline) * 100) : 0;
    const convertedPercentage = totalBaseline > 0 ? Math.round((wonDeals / totalBaseline) * 100) : 0;

    const lifecycleConversion = {
      totalBaseline,
      qualifiedLeadsCount: totalDeals,
      qualifiedPercentage,
      wonDealsCount: wonDeals,
      convertedPercentage
    };

    return res.status(200).json({
      success: true,
      message: "Dashboard statistics fetched successfully",
      data: {
        totalLeads,
        pipelineValue,
        winRate,
        companiesCount,
        leadAcquisitionTrend,
        leadDistribution,
        recentActivities,
        lifecycleConversion
      }
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getDashboardStats
};
