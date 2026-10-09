const geminiService = require('./gemini.service');
const fs = require('fs');
const path = require('path');

const LOG_FILE_PATH = path.join(__dirname, '../../SQL_QUERIES_LOG.md');

function logSqlQueryToFile(userQuery, sqlQuery) {
  try {
    let count = 1;
    if (fs.existsSync(LOG_FILE_PATH)) {
      const content = fs.readFileSync(LOG_FILE_PATH, 'utf8');
      const matches = content.match(/^\d+\)/gm);
      if (matches) {
        count = matches.length + 1;
      }
    } else {
      fs.writeFileSync(LOG_FILE_PATH, '# User Queries & Raw SQL Log\n\n', 'utf8');
    }

    const logEntry = `${count})\n==================================================\n🔍 [SQL Generated for User Query]: "${userQuery}"\n💻 [Raw SQL]: ${sqlQuery}\n==================================================\n\n`;

    fs.appendFileSync(LOG_FILE_PATH, logEntry, 'utf8');
  } catch (err) {
    console.error('Error writing to SQL_QUERIES_LOG.md:', err.message);
  }
}

class SqlService {
  async generateQuery(userQuery, contextText = '') {
    const systemPrompt = `
You are a PostgreSQL expert translating natural language queries about project repair management into clean, valid PostgreSQL SELECT queries.
Refer to the following database tables and columns:

1. address
   - id: UUID NOT NULL
   - created_at: TIMESTAMP WITH TIME ZONE NOT NULL
   - updated_at: TIMESTAMP WITH TIME ZONE NOT NULL
   - deleted_at: TIMESTAMP WITH TIME ZONE
   - tenant_id: UUID NOT NULL
   - street_address: CHARACTER VARYING(255) NOT NULL
   - street_address_two: CHARACTER VARYING(255)
   - city: CHARACTER VARYING(255) NOT NULL
   - state: CHARACTER VARYING(255) NOT NULL
   - country: CHARACTER VARYING(255) NOT NULL
   - zip: CHARACTER VARYING(255) NOT NULL

2. assigned_task
   - id: UUID NOT NULL
   - created_at: TIMESTAMP WITH TIME ZONE NOT NULL
   - updated_at: TIMESTAMP WITH TIME ZONE NOT NULL
   - deleted_at: TIMESTAMP WITH TIME ZONE
   - tenant_id: UUID NOT NULL
   - task_group_id: UUID NOT NULL
   - project_id: UUID NOT NULL
   - reference_task_id: UUID
   - title: CHARACTER VARYING(255) NOT NULL
   - description: TEXT
   - unit: CHARACTER VARYING(255) NOT NULL
   - quantity: CHARACTER VARYING(255) NOT NULL
   - quantity_type: CHARACTER VARYING(255) NOT NULL
   - price: CHARACTER VARYING(255) NOT NULL
   - price_type: CHARACTER VARYING(255) NOT NULL
   - task_attachments: TEXT
   * Relations:
     - project_id points to project.id
     - reference_task_id points to task.id
     - task_group_id points to task_group.id

3. attachment
   - id: UUID NOT NULL
   - created_at: TIMESTAMP WITH TIME ZONE NOT NULL
   - updated_at: TIMESTAMP WITH TIME ZONE NOT NULL
   - deleted_at: TIMESTAMP WITH TIME ZONE
   - tenant_id: UUID NOT NULL
   - project_id: UUID NOT NULL
   - title: CHARACTER VARYING(255)
   - description: CHARACTER VARYING(255)
   - file_type: CHARACTER VARYING(255) NOT NULL
   - attachment_type: CHARACTER VARYING(255) NOT NULL
   - content_type: CHARACTER VARYING(255) NOT NULL
   - is_locked: BOOLEAN
   - include_in_er_dup: BOOLEAN
   - tag_dup: CHARACTER VARYING(255)
   - id_3feb: UUID
   - include_in_er_3feb: BOOLEAN
   - tag_3feb: CHARACTER VARYING(255)
   - include_in_er: BOOLEAN NOT NULL
   - tag: CHARACTER VARYING(255)
   * Relations:
     - project_id points to project.id

4. attachment_3feb
   - id: UUID
   - include_in_er: BOOLEAN
   - tag: CHARACTER VARYING(255)

5. brand
   - id: UUID NOT NULL
   - created_at: TIMESTAMP WITH TIME ZONE NOT NULL
   - updated_at: TIMESTAMP WITH TIME ZONE NOT NULL
   - deleted_at: TIMESTAMP WITH TIME ZONE
   - tenant_id: UUID NOT NULL
   - firstname: CHARACTER VARYING(255) NOT NULL
   - lastname: CHARACTER VARYING(255) NOT NULL
   - phonenumber: CHARACTER VARYING(255) NOT NULL
   - email: CHARACTER VARYING(255) NOT NULL
   - address1: CHARACTER VARYING(255) NOT NULL
   - address2: CHARACTER VARYING(255)
   - city: CHARACTER VARYING(255) NOT NULL
   - zipcode: CHARACTER VARYING(255) NOT NULL
   - organization_phone: CHARACTER VARYING(255) NOT NULL
   - organization_name: CHARACTER VARYING(255) NOT NULL
   - website: CHARACTER VARYING(255)
   - profile_image_url: BYTEA
   - region: CHARACTER VARYING(255) NOT NULL
   - county: CHARACTER VARYING(255)
   - address_type: CHARACTER VARYING(255)
   - license_number: CHARACTER VARYING(255)
   - phone_number_extension: CHARACTER VARYING(255)
   - organization_phone_extension: CHARACTER VARYING(255)
   * Relations:
     - project.tenant_id points to brand.tenant_id (CRITICAL: ALWAYS join ON project.tenant_id = brand.tenant_id. NEVER join ON brand.id!)

6. custom_milestone
   - id: UUID NOT NULL
   - project_id: UUID
   - milestone_name: CHARACTER VARYING(255)
   - milestone_date: TIMESTAMP WITH TIME ZONE
   - index: INTEGER NOT NULL
   - tenant_id: UUID NOT NULL
   - created_at: TIMESTAMP WITH TIME ZONE NOT NULL
   - updated_at: TIMESTAMP WITH TIME ZONE NOT NULL
   - deleted_at: TIMESTAMP WITH TIME ZONE
   * Relations:
     - project_id points to project.id

7. hoa_section_manager
   - id: UUID NOT NULL
   - tenant_id: UUID NOT NULL
   - applicant_information: BOOLEAN NOT NULL
   - doc_client_as_sda: BOOLEAN NOT NULL
   - cert_compliance_lshr: BOOLEAN NOT NULL
   - coi_disclosure: BOOLEAN NOT NULL
   - homeowner_agreement: BOOLEAN NOT NULL
   - created_at: TIMESTAMP WITH TIME ZONE NOT NULL
   - updated_at: TIMESTAMP WITH TIME ZONE NOT NULL
   - deleted_at: TIMESTAMP WITH TIME ZONE

8. home
   - id: UUID NOT NULL
   - created_at: TIMESTAMP WITH TIME ZONE NOT NULL
   - updated_at: TIMESTAMP WITH TIME ZONE NOT NULL
   - deleted_at: TIMESTAMP WITH TIME ZONE
   - tenant_id: UUID NOT NULL
   - homeowner_id: UUID NOT NULL
   - address_id: UUID NOT NULL
   * Relations:
     - address_id points to address.id
     - homeowner_id points to homeowner.id

9. homeowner
   - id: UUID NOT NULL
   - created_at: TIMESTAMP WITH TIME ZONE NOT NULL
   - updated_at: TIMESTAMP WITH TIME ZONE NOT NULL
   - deleted_at: TIMESTAMP WITH TIME ZONE
   - tenant_id: UUID NOT NULL
   - first_name: CHARACTER VARYING(255) NOT NULL
   - last_name: CHARACTER VARYING(255)
   - email: CHARACTER VARYING(255)
   - phone_number: CHARACTER VARYING(255) NOT NULL
   - alternate_first_name: CHARACTER VARYING(255)
   - alternate_last_name: CHARACTER VARYING(255)
   - alternate_phone_number: CHARACTER VARYING(255)
   - phone_number_extension: CHARACTER VARYING(255)
   - alternate_phone_extension: CHARACTER VARYING(255)

10. homeowner_log
    - id: UUID NOT NULL
    - created_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - updated_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - deleted_at: TIMESTAMP WITH TIME ZONE
    - tenant_id: UUID NOT NULL
    - project_id: UUID NOT NULL
    - timestamp: TIMESTAMP WITH TIME ZONE NOT NULL
    - changes_made_by: CHARACTER VARYING(255) NOT NULL
    - updated: CHARACTER VARYING(255) NOT NULL
    - approved_by: CHARACTER VARYING(255) NOT NULL
    - attachment: CHARACTER VARYING(255)
    - file_type: CHARACTER VARYING(255)
    - content_type: CHARACTER VARYING(255)
    * Relations:
      - project_id points to project.id

11. invoice
    - id: UUID NOT NULL
    - tenant_id: UUID NOT NULL
    - project_id: UUID NOT NULL
    - vendor_id: UUID
    - attachment_id: UUID
    - invoice_date: TIMESTAMP WITH TIME ZONE
    - due_date: TIMESTAMP WITH TIME ZONE
    - submitted_date: TIMESTAMP WITH TIME ZONE
    - paid_date: TIMESTAMP WITH TIME ZONE
    - reimbursement_submitted_date: TIMESTAMP WITH TIME ZONE
    - reimbursement_received_date: TIMESTAMP WITH TIME ZONE
    - notes: CHARACTER VARYING(255)
    - status: CHARACTER VARYING(255) NOT NULL
    - amount: DOUBLE PRECISION
    - created_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - updated_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - deleted_at: TIMESTAMP WITH TIME ZONE
    - budget_vs_actual: BOOLEAN
    - approval_date_first: TIMESTAMP WITH TIME ZONE
    - approval_date_second: TIMESTAMP WITH TIME ZONE
    - first_approved_by: CHARACTER VARYING(255)
    - second_approved_by: CHARACTER VARYING(255)
    - explanation: CHARACTER VARYING(255)
    * Relations:
      - attachment_id points to attachment.id
      - project_id points to project.id
      - vendor_id points to vendor.id

12. notes
    - id: UUID NOT NULL
    - title: CHARACTER VARYING(255) NOT NULL
    - description: CHARACTER VARYING(500) NOT NULL
    - project_id: UUID NOT NULL
    - user_id: UUID NOT NULL
    - email: CHARACTER VARYING(255) NOT NULL
    - name: CHARACTER VARYING(255) NOT NULL
    - tenant_id: UUID NOT NULL
    - created_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - updated_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - deleted_at: TIMESTAMP WITH TIME ZONE
    * Relations:
      - project_id points to project.id

13. notes_attachment
    - id: UUID NOT NULL
    - note_id: UUID NOT NULL
    - tenant_id: UUID NOT NULL
    - title: CHARACTER VARYING(255) NOT NULL
    - attachment_type: CHARACTER VARYING(255) NOT NULL
    - content_type: CHARACTER VARYING(255) NOT NULL
    - file_type: CHARACTER VARYING(255) NOT NULL
    - created_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - updated_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - deleted_at: TIMESTAMP WITH TIME ZONE
    * Relations:
      - note_id points to notes.id

14. project
    - id: UUID NOT NULL
    - created_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - updated_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - deleted_at: TIMESTAMP WITH TIME ZONE
    - tenant_id: UUID NOT NULL
    - home_id: UUID NOT NULL
    - status: CHARACTER VARYING(255) NOT NULL
    - assigned_user_id: UUID
    - cover_photo_id: UUID
    - milestone_homeowner_app_started: TIMESTAMP WITH TIME ZONE
    - milestone_homeowner_app_submitted: TIMESTAMP WITH TIME ZONE
    - milestone_homeowner_app_approved: TIMESTAMP WITH TIME ZONE
    - milestone_homeowner_app_denied: TIMESTAMP WITH TIME ZONE
    - milestone_survey_completed: TIMESTAMP WITH TIME ZONE
    - milestone_er_submitted: TIMESTAMP WITH TIME ZONE
    - milestone_er_released: TIMESTAMP WITH TIME ZONE
    - milestone_risk_assessment_submitted: TIMESTAMP WITH TIME ZONE
    - milestone_vendors_selected: TIMESTAMP WITH TIME ZONE
    - milestone_work_started: TIMESTAMP WITH TIME ZONE
    - milestone_work_completed: TIMESTAMP WITH TIME ZONE
    - milestone_project_completed: TIMESTAMP WITH TIME ZONE
    - milestone_work_inspected: TIMESTAMP WITH TIME ZONE
    - milestone_final_inspection: TIMESTAMP WITH TIME ZONE
    - milestone_invoices_submitted: TIMESTAMP WITH TIME ZONE
    - milestone_invoices_paid: TIMESTAMP WITH TIME ZONE
    - milestone_reimbursement_submitted: TIMESTAMP WITH TIME ZONE
    - milestone_reimbursement_received: TIMESTAMP WITH TIME ZONE
    - project_state: CHARACTER VARYING(255)
    - rejected_note: CHARACTER VARYING(255)
    - estimation: DOUBLE PRECISION
    - assigned_project_admin: UUID
    - task_list_name_id: UUID
    - old_assigned_project_admin: UUID
    - old_assigned_user_id: UUID
    - milestone_selection_committee_approved: TIMESTAMP WITH TIME ZONE
    - milestone_initial_assessment: TIMESTAMP WITH TIME ZONE
    - milestone_hfhi_reported: TIMESTAMP WITH TIME ZONE
    - project_number: CHARACTER VARYING(255)
    - hud_number: CHARACTER VARYING(255)
    * Relations:
      - cover_photo_id points to attachment.id
      - home_id points to home.id
      - task_list_name_id points to task_list_name.id

15. project_clone_log
    - id: UUID NOT NULL
    - tenant_id: UUID NOT NULL
    - project_id: UUID NOT NULL
    - parent_project_id: UUID NOT NULL
    - project_status: USER-DEFINED
    - attachment_status: USER-DEFINED
    - error: CHARACTER VARYING(255)
    - created_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - updated_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - deleted_at: TIMESTAMP WITH TIME ZONE
    * Relations:
      - parent_project_id points to project.id
      - project_id points to project.id

16. project_group
    - id: UUID NOT NULL
    - created_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - updated_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - deleted_at: TIMESTAMP WITH TIME ZONE
    - tenant_id: UUID NOT NULL
    - name: TEXT NOT NULL
    - project_template_id: UUID
    - status: CHARACTER VARYING(255)
    - grant_number: CHARACTER VARYING(255)
    - grant_name: CHARACTER VARYING(255)
    - grant_amount: CHARACTER VARYING(255)
    * Relations:
      - project_template_id points to project_template.id

17. project_group_task
    - id: UUID NOT NULL
    - tenant_id: UUID NOT NULL
    - project_group_id: UUID NOT NULL
    - task_id: UUID NOT NULL
    - created_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - updated_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - deleted_at: TIMESTAMP WITH TIME ZONE
    * Relations:
      - project_group_id points to project_group.id
      - task_id points to task.id

18. project_project_group
    - project_id: UUID NOT NULL
    - project_group_id: UUID NOT NULL
    - created_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - updated_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - deleted_at: TIMESTAMP WITH TIME ZONE
    * Relations:
      - project_group_id points to project_group.id
      - project_id points to project.id

19. project_template
    - id: UUID NOT NULL
    - created_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - updated_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - deleted_at: TIMESTAMP WITH TIME ZONE
    - tenant_id: UUID NOT NULL

20. project_vendor
    - project_id: UUID NOT NULL
    - vendor_id: UUID NOT NULL
    - created_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - updated_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - deleted_at: TIMESTAMP WITH TIME ZONE
    * Relations:
      - project_id points to project.id
      - vendor_id points to vendor.id

21. task
    - id: UUID NOT NULL
    - created_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - updated_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - deleted_at: TIMESTAMP WITH TIME ZONE
    - tenant_id: UUID NOT NULL
    - task_group_id: UUID NOT NULL
    - title: CHARACTER VARYING(255) NOT NULL
    - description: TEXT
    - unit: CHARACTER VARYING(255) NOT NULL
    - quantity_type: CHARACTER VARYING(255) NOT NULL
    - price: CHARACTER VARYING(255) NOT NULL
    - price_type: CHARACTER VARYING(255) NOT NULL
    - notes: TEXT
    - is_master: BOOLEAN
    * Relations:
      - task_group_id points to task_group.id

22. task_and_task_list_name
    - id: UUID NOT NULL
    - task_id: UUID NOT NULL
    - task_list_name_id: UUID NOT NULL
    - created_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - updated_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - deleted_at: TIMESTAMP WITH TIME ZONE
    * Relations:
      - task_id points to task.id
      - task_list_name_id points to task_list_name.id

23. task_group
    - id: UUID NOT NULL
    - created_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - updated_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - deleted_at: TIMESTAMP WITH TIME ZONE
    - tenant_id: UUID NOT NULL
    - title: CHARACTER VARYING(255) NOT NULL
    - task_list_name_id: UUID
    * Relations:
      - task_list_name_id points to task_list_name.id

24. task_list_name
    - id: UUID NOT NULL
    - created_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - updated_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - deleted_at: TIMESTAMP WITH TIME ZONE
    - tenant_id: UUID NOT NULL
    - list_name: CHARACTER VARYING(255) NOT NULL
    - revision_date: TIMESTAMP WITH TIME ZONE NOT NULL
    - is_finalized: BOOLEAN

25. task_project_template
    - project_template_id: UUID NOT NULL
    - task_id: UUID NOT NULL
    - created_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - updated_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - deleted_at: TIMESTAMP WITH TIME ZONE NOT NULL
    * Relations:
      - project_template_id points to project_template.id
      - task_id points to task.id

26. vendor
    - id: UUID NOT NULL
    - created_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - updated_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - deleted_at: TIMESTAMP WITH TIME ZONE
    - tenant_id: UUID NOT NULL
    - name: CHARACTER VARYING(255) NOT NULL
    - address_id: UUID NOT NULL
    - email: CHARACTER VARYING(255)
    - phone_number: CHARACTER VARYING(255)
    - contact_type: CHARACTER VARYING(255)
    - description: CHARACTER VARYING(255)
    - designation: CHARACTER VARYING(255)
    - license_expiry_date: TIMESTAMP WITH TIME ZONE
    - insurance_expiry_date: TIMESTAMP WITH TIME ZONE
    - main_number: CHARACTER VARYING(255)
    - fax_number: CHARACTER VARYING(255)
    - cell_number: CHARACTER VARYING(255)
    - phone_number_extension: CHARACTER VARYING(255)
    - main_number_extension: CHARACTER VARYING(255)
    - fax_number_extension: CHARACTER VARYING(255)
    - cell_number_extension: CHARACTER VARYING(255)
    * Relations:
      - address_id points to address.id

27. vendor_attachment
    - id: UUID NOT NULL
    - vendor_id: UUID NOT NULL
    - tenant_id: UUID NOT NULL
    - title: CHARACTER VARYING(255) NOT NULL
    - attachment_type: CHARACTER VARYING(255) NOT NULL
    - content_type: CHARACTER VARYING(255) NOT NULL
    - file_type: CHARACTER VARYING(255) NOT NULL
    - created_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - updated_at: TIMESTAMP WITH TIME ZONE NOT NULL
    - deleted_at: TIMESTAMP WITH TIME ZONE
    * Relations:
      - vendor_id points to vendor.id

- Budget & Spent Mapping (CRITICAL):
  * When the user prompt asks about budget, budget report, cost, or financial status for a project, ALWAYS SELECT:
    - project.estimation AS initial_budget
    - (SELECT COALESCE(SUM(amount), 0) FROM invoice WHERE project_id = project.id) AS total_invoiced_spent
    - ((SELECT COALESCE(SUM(amount), 0) FROM invoice WHERE project_id = project.id) - COALESCE(project.estimation, 0)) AS budget_variance
    (e.g. SELECT project.id, project.estimation AS initial_budget, (SELECT COALESCE(SUM(amount), 0) FROM invoice WHERE project_id = project.id) AS total_invoiced_spent, ((SELECT COALESCE(SUM(amount), 0) FROM invoice WHERE project_id = project.id) - COALESCE(project.estimation, 0)) AS budget_variance, address.street_address, address.city, address.state, address.zip FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id WHERE address.street_address ILIKE '%...%').
- Filter project status or states correctly: "OPEN" projects are filtered by project.project_state = 'OPEN'.
- PostgreSQL Casing Matcher: PostgreSQL string comparisons are case-sensitive. When filtering text columns by names, titles, addresses, or status values (e.g. project_group.name, brand.organization_name, vendor.name, homeowner.first_name, address.street_address), always use the 'ILIKE' operator instead of '=' to do case-insensitive comparisons (e.g. use "project_group.name ILIKE 'crash'" instead of "project_group.name = 'crash'").
- Address vs. Project Number Disambiguation:
  * If a user prompt contains a street address, house number, or street suffix (such as "St", "Street", "Ave", "Avenue", "Rd", "Road", "Dr", "Drive", "Ln", "Lane", "Blvd", "Way", "Ct", "Pl", e.g. "899 Rehab St", "Project 899 Rehab St"), ALWAYS match it against address.street_address using: project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id WHERE address.street_address ILIKE '%899 Rehab St%'.
  * NEVER filter project.project_number by a street address! project.project_number only stores codes like "P-1025" or numeric project codes, NOT street names.
- Tenant / Tenants Mapping: The terms "tenant" and "tenants" refer exclusively to the "brand" table. When asked about tenants (e.g. number of tenants, list of tenants, names of tenants), always query the "brand" table and use the "organization_name" column for their names. Do NOT query the "homeowner" table for tenant queries.
- Tenant Lookup for a Project: Every project in the database belongs to a tenant/brand via project.tenant_id = brand.tenant_id. To find which tenant/affiliate a project belongs to, write: SELECT brand.organization_name FROM project JOIN brand ON project.tenant_id = brand.tenant_id WHERE project.id = '<Project_ID>' (or WHERE address.street_address ILIKE '%<Street>%'). Do NOT add 5+ over-constrained text WHERE conditions (such as city, state, zip, homeowner name) when project.id or street_address is known.
- Affiliate / Tenant Name Mapping: If the user asks for the "affiliate name", "tenant name", or "affiliate/organization details", query the table "brand" and select/filter using the column "organization_name" (e.g. SELECT organization_name FROM brand).
- Project Contacts Mapping (CRITICAL):
  * When the user asks "Which contacts are added to Project [Address]", "Show contacts for project", or asks for project contacts:
  * ALWAYS query both Homeowner and assigned Vendors for the project:
    SELECT homeowner.first_name, homeowner.last_name, homeowner.email, homeowner.phone_number, 'Homeowner' AS contact_type, address.street_address, address.city, address.state, address.zip 
    FROM project 
    JOIN home ON project.home_id = home.id 
    JOIN homeowner ON home.homeowner_id = homeowner.id 
    JOIN address ON home.address_id = address.id 
    WHERE address.street_address ILIKE '%...'
    UNION ALL
    SELECT vendor.name AS first_name, '' AS last_name, vendor.email, vendor.phone_number, COALESCE(vendor.contact_type, 'Vendor') AS contact_type, address.street_address, address.city, address.state, address.zip 
    FROM project 
    JOIN home ON project.home_id = home.id 
    JOIN address ON home.address_id = address.id 
    JOIN project_vendor ON project.id = project_vendor.project_id 
    JOIN vendor ON project_vendor.vendor_id = vendor.id 
    WHERE address.street_address ILIKE '%...';
- Project Names Rule (CRITICAL):
  * A project's NAME is defined by its home address (street_address, city, state, zip).
  * Whenever the user asks for project names, names of projects, or project list with names, ALWAYS JOIN project, home, and address:
    SELECT project.project_number, project.status, address.street_address, address.city, address.state, address.zip, homeowner.first_name, homeowner.last_name 
    FROM project 
    JOIN home ON project.home_id = home.id 
    JOIN address ON home.address_id = address.id 
    LEFT JOIN homeowner ON home.homeowner_id = homeowner.id;
- Homeowner Application Queries (CRITICAL):
  * Whenever the user prompt asks about Homeowner Application, status of application, years lived at residence, years has homeowner lived, or TAD square footage, ALWAYS include project.milestone_homeowner_app_approved, project.milestone_homeowner_app_submitted, project.milestone_homeowner_app_started, and address.street_address in the SELECT list (e.g. SELECT project.id, project.project_number, project.milestone_homeowner_app_approved, project.milestone_homeowner_app_submitted, project.milestone_homeowner_app_started, address.street_address, address.city, address.state, address.zip FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id WHERE address.street_address ILIKE '%...' ORDER BY project.milestone_homeowner_app_approved DESC NULLS LAST).
- Milestone Dates: Major project milestones are stored as columns directly on the "project" table (milestone_er_released, milestone_er_submitted, milestone_final_inspection, milestone_hfhi_reported, milestone_homeowner_app_approved, milestone_homeowner_app_denied, milestone_homeowner_app_started, milestone_homeowner_app_submitted, milestone_initial_assessment, milestone_invoices_paid, milestone_invoices_submitted, milestone_project_completed, milestone_reimbursement_received, milestone_reimbursement_submitted, milestone_risk_assessment_submitted, milestone_selection_committee_approved, milestone_survey_completed, milestone_vendors_selected, milestone_work_completed, milestone_work_inspected, milestone_work_started).
  * For queries about when a milestone was completed/submitted, select the corresponding milestone column directly from the "project" table (e.g. SELECT milestone_er_submitted FROM project WHERE id = ...).
- Joins:
  * To get a homeowner for a project, query: project JOIN home ON project.home_id = home.id JOIN homeowner ON home.homeowner_id = homeowner.id.
  * To get an address for a project, query: project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id.
  * To count/filter attachments of type images, query: JOIN attachment ON project.id = attachment.project_id WHERE attachment.attachment_type = 'images' (or file_type LIKE 'image/%').
  * Whenever a user asks for a specific project (e.g., "which project has most attachments", "highest budget project"), always select the homeowner's first/last name and the home address details (street_address, city, state, zip) using these JOINs so they can be shown in the response.
  * To join projects with project groups, use: project JOIN project_project_group ON project.id = project_project_group.project_id JOIN project_group ON project_project_group.project_group_id = project_group.id.
  * To get default tasks configured for a project group, join: project_group JOIN project_group_task ON project_group.id = project_group_task.project_group_id JOIN task ON project_group_task.task_id = task.id.
  * To link projects with brands (affiliates/tenants), join: project JOIN brand ON project.tenant_id = brand.tenant_id. Do NOT join on brand.id.
- Project Group budget mapping: To calculate budget or actual costs for a project_group:
  * Simulated budget for a project group is the sum of simulated project budgets under it.
  * Actual cost of a project group is the sum of invoice amounts under it (invoice.amount).
- ER & Homeowner Application JSON Fields: If the user asks for fields from the homeowner application (e.g. Years at Residence, TAD Sqft, Race, Ethnicity, Disabled, Veteran status, family members, or Gross Annual Income) or from the Environmental Review report (site visit completed, asbestos, phase I/II, noise analysis, major/minor rehab, lead project, demolition, er signed, zoning district), write a PostgreSQL query to retrieve the project ID (project.id) and project number matching the project/address. The chatbot will dynamically load the JSON document associated with that project to answer these questions.
- Postgres Null Sorting Gotcha: In PostgreSQL, "ORDER BY ... DESC" places NULL values first. If you are sorting by a column/expression that can be null (such as a simulated budget or spent), use "ORDER BY ... DESC NULLS LAST". Only add "WHERE project.project_number IS NOT NULL AND project.project_number != ''" if the query calculates a simulated budget/spent or if the user explicitly asks for valid project numbers. Otherwise, do not filter out null project numbers.

Respond ONLY with a JSON object containing a single key "sql" holding the raw query string. Do not include markdown code block styling or any additional text.

Example Output:
{
  "sql": "SELECT COUNT(*) FROM project WHERE project_state = 'OPEN'"
}
`;

    try {
      const combinedQuery = contextText
        ? `Conversation History:\n${contextText}\n\nUser's follow-up request (write the SQL query to answer this request based on the context above): ${userQuery}`
        : userQuery;
      const result = await geminiService.generateJsonResponse(systemPrompt, combinedQuery, 'sql');
      let sqlQuery = result && result.sql ? result.sql.trim() : '';

      // Auto-fix LLM join error: replace tenant_id = brand.id with tenant_id = brand.tenant_id
      if (sqlQuery) {
        sqlQuery = sqlQuery.replace(/(\b\w+\.tenant_id\s*=\s*\b\w+)\.id\b/gi, '$1.tenant_id');
      }

      // Auto-fix LLM mapping error: if query filters project.project_number using a street address (e.g. '899 Rehab St')
      if (sqlQuery && /project_number\s+ILIKE\s+'[^']*?\b(St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Ln|Lane|Blvd|Way|Ct|Pl)\b/i.test(sqlQuery)) {
        sqlQuery = sqlQuery.replace(/(\b\w+)\.project_number(\s+ILIKE\s+)'([^']+)'/gi, (match, projAlias, ilikeOp, val) => {
          return `address.street_address${ilikeOp}'${val}'`;
        });

        if (!/JOIN\s+home\b/i.test(sqlQuery)) {
          sqlQuery = sqlQuery.replace(/FROM\s+project(\s+AS\s+\w+|\s+\w+)?/i, (match) => {
            const aliasMatch = match.match(/project(?:\s+AS)?\s+(\w+)/i);
            const pAlias = aliasMatch ? aliasMatch[1] : 'project';
            return `${match} JOIN home ON ${pAlias}.home_id = home.id JOIN address ON home.address_id = address.id`;
          });
        }
      }

      if (sqlQuery && this.isValidQuery(sqlQuery)) {
        console.log(`\n==================================================`);
        console.log(`🔍 [SQL Generated for User Query]: "${userQuery}"`);
        console.log(`💻 [Raw SQL]: ${sqlQuery}`);
        console.log(`==================================================\n`);
        logSqlQueryToFile(userQuery, sqlQuery);
        return sqlQuery;
      }
      return null;
    } catch (err) {
      console.error('Error generating dynamic SQL query:', err.message);
      return null;
    }
  }

  isValidQuery(sql) {
    if (!sql) return false;
    const cleanSql = sql.trim().toUpperCase();

    // Safety check: must start with SELECT (read-only query)
    if (!cleanSql.startsWith('SELECT')) {
      console.warn('⚠️ WARNING: Blocked SQL query. Does not start with SELECT:', sql);
      return false;
    }

    // Safety check: reject any mutation keywords
    const forbiddenKeywords = [
      'INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'TRUNCATE',
      'RENAME', 'CREATE', 'GRANT', 'REVOKE', 'REPLACE', 'UPSERT'
    ];

    for (const keyword of forbiddenKeywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(sql)) {
        console.warn(`⚠️ WARNING: Blocked SQL query due to forbidden keyword "${keyword}":`, sql);
        return false;
      }
    }

    return true;
  }
}

module.exports = new SqlService();
