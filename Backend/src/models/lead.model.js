const pool = require("../config/database");


const createLead=async(leaData)=>{
  const connection=await pool.getConnection();

  try{
    await connection.beginTransaction();

      const {
      salutation,
      firstName,
      lastName,
      email,
      phone,
      jobTitle,
      organization,
      website,
      territory,
      industry,
      source,
      status,
      notes,
      assignedToUserId = null,
      createdByUserId = null,
      companyId = null,
    } = leadData;
    //create organization
    const[orgResult]=await connection.execute(
      `Insert into organizations (
      name,website,territory,industry,source) VALUES (?,?,?,?,?)`,
      [organization,website,territory,industry,source]
    );

    const orgId=orgResult.insertId;


    // create contact

    const[contactResult]=await connection.execute(
      `Insert into contacts
      (
        org_id,company_id,Salutation,first_name,last_name,email,phone,job_title,contact_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Lead')`,
      [orgId,companyId,salutation,firstName,lastName,email,phone,jobTitle,
      ]
    )
    const contactId = contactResult.insertId;
    
    //create lead
    const [leadResult] = await connection.execute(
      `
      INSERT INTO leads
      (
        org_id,contact_id,status,assigned_to_user_id
      )
      VALUES (?, ?, ?, ?)`,
      [orgId, contactId,status || "New",assignedToUserId,]
    );

    const leadId = leadResult.insertId;
    //create lead note
     if (notes && notes.trim() !== "") {
      await connection.execute(
        `
        INSERT INTO lead_notes
        (lead_id,note_text,created_by_user_id)
        VALUES (?, ?, ?)`,
        [leadId,notes,createdByUserId,]
      );
      await connection.commit();
      return {
      success: true,
      leadId,
      message: "Lead created successfully",
    };
    }
  }
  catch (error) {
    await connection.rollback();
    throw error;}
    finally{
      connection.release();
    }
}
const getAllLeads=async({
  page=1,
  limit=10,
  search="",
  status=""
})=>{
  const offset=(page-1)*limit;
  const query=
  `
  select l.lead_id,
  c.Saluation,
  c.first_name,
  c.last_name,
  c.email,
  c.phone,
  
  o.name as OrganizatioName,
  o.webiste,
  o.industry,
  o.Terriority,
  o.Source

  l.status,
  (select note_text from 
  lead_notes ln where ln.lead_d=l.lead_id 
  order by ln.created_at DESC limit 1) as Notes,

  l.created_at from leads l
  INNER JOIN organizations o
        ON l.org_id = o.org_id

    INNER JOIN contacts c
        ON l.contact_id = c.contact_id

    WHERE 1=1
  )
  `


  const values=[];

  if(search){
    query+=`
    AND(
    c.first_name LIKE ?
    or c.last_name LIKE ?
    or c.name LIKE ?
    or c.email LIKE?
    )
    `

    const keyword=`%${search}%`;
    values.push(keyword,keyword,keyword,keyword);
  }
  if (status) {
    query += ` AND l.status = ? `;
    values.push(status);
  }

  
  query += `
      ORDER BY l.created_at DESC
      LIMIT ?
      OFFSET ?
  `;

  values.push(Number(limit));
  values.push(Number(offset));

  const [rows] = await pool.execute(query, values);

  // Total Count

  let countQuery = `
      SELECT COUNT(*) AS total

      FROM leads l

      INNER JOIN organizations o
          ON l.org_id = o.org_id

      INNER JOIN contacts c
          ON l.contact_id = c.contact_id

      WHERE 1=1
  `;
  const countValues = [];

  if (search) {
    countQuery += `
      AND (
        c.first_name LIKE ?
        OR c.last_name LIKE ?
        OR o.name LIKE ?
        OR c.email LIKE ?
      )
    `;

    const keyword = `%${search}%`;

    countValues.push(keyword, keyword, keyword, keyword);
  }

  if (status) {
    countQuery += ` AND l.status = ? `;
    countValues.push(status);
  }
  const [[count]] = await pool.execute(countQuery, countValues);

  return {
    total: count.total,
    page: Number(page),
    limit: Number(limit),
    leads: rows,
  };
}
//get single lead
const getLeadById = async (leadId) => {
  const [rows] = await pool.execute(
    `
    SELECT

        l.lead_id,

        c.contact_id,
        c.Salutation,
        c.first_name,
        c.last_name,
        c.email,
        c.phone,
        c.job_title,

        o.org_id,
        o.name AS organization,
        o.website,
        o.Territory,
        o.industry,
        o.Source,

        l.status,
        l.assigned_to_user_id,

        (
            SELECT note_text
            FROM lead_notes ln
            WHERE ln.lead_id = l.lead_id
            ORDER BY ln.created_at DESC
            LIMIT 1
        ) AS notes,

        l.created_at,
        l.updated_at

    FROM leads l

    INNER JOIN organizations o
        ON l.org_id = o.org_id

    INNER JOIN contacts c
        ON l.contact_id = c.contact_id

    WHERE l.lead_id = ?
    `,
    [leadId]
  );

  return rows[0];
};
//update lead
const updateLead = async (leadId, leadData) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      salutation,
      firstName,
      lastName,
      email,
      phone,
      jobTitle,
      organization,
      website,
      territory,
      industry,
      source,
      status,
      notes,
      assignedToUserId = null,
    } = leadData;



    const [[lead]] = await connection.execute(
      `
      SELECT org_id, contact_id
      FROM leads
      WHERE lead_id = ?
      `,
      [leadId]
    );

    if (!lead) {
      throw new Error("Lead not found");
    }



    await connection.execute(
      `
      UPDATE organizations
      SET

      name=?,
      website=?,
      Territory=?,
      industry=?,
      Source=?

      WHERE org_id=?
      `,
      [
        organization,
        website,
        territory,
        industry,
        source,
        lead.org_id,
      ]
    );


    await connection.execute(
      `
      UPDATE contacts

      SET

      Salutation=?,
      first_name=?,
      last_name=?,
      email=?,
      phone=?,
      job_title=?

      WHERE contact_id=?
      `,
      [
        salutation,
        firstName,
        lastName,
        email,
        phone,
        jobTitle,
        lead.contact_id,
      ]
    );

   

    await connection.execute(
      `
      UPDATE leads

      SET

      status=?,
      assigned_to_user_id=?

      WHERE lead_id=?
      `,
      [
        status,
        assignedToUserId,
        leadId,
      ]
    );


    const [[existingNote]] = await connection.execute(
      `
      SELECT note_id
      FROM lead_notes
      WHERE lead_id=?
      `,
      [leadId]
    );

    if (existingNote) {
      await connection.execute(
        `
        UPDATE lead_notes

        SET note_text=?

        WHERE lead_id=?
        `,
        [
          notes,
          leadId,
        ]
      );
    } else if (notes && notes.trim() !== "") {
      await connection.execute(
        `
        INSERT INTO lead_notes
        (
            lead_id,
            note_text
        )
        VALUES (?,?)
        `,
        [
          leadId,
          notes,
        ]
      );
    }

    await connection.commit();

    return {
      success: true,
      message: "Lead Updated Successfully",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
//delete lead
const deleteLead = async (leadId) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Get related IDs
    const [[lead]] = await connection.execute(
      `
      SELECT org_id, contact_id
      FROM leads
      WHERE lead_id = ?
      `,
      [leadId]
    );

    if (!lead) {
      throw new Error("Lead not found");
    }

    // Delete notes
    await connection.execute(
      `
      DELETE FROM lead_notes
      WHERE lead_id = ?
      `,
      [leadId]
    );

    // Delete lead
    await connection.execute(
      `
      DELETE FROM leads
      WHERE lead_id = ?
      `,
      [leadId]
    );

    // Delete contact
    await connection.execute(
      `
      DELETE FROM contacts
      WHERE contact_id = ?
      `,
      [lead.contact_id]
    );

    // Delete organization
    await connection.execute(
      `
      DELETE FROM organizations
      WHERE org_id = ?
      `,
      [lead.org_id]
    );

    await connection.commit();

    return {
      success: true,
      message: "Lead deleted successfully",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
//update lead status
const updateLeadStatus = async (leadId, status) => {
  const [result] = await pool.execute(
    `
    UPDATE leads
    SET status = ?
    WHERE lead_id = ?
    `,
    [status, leadId]
  );

  return result;
};
module.exports={
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
  updateLead
}