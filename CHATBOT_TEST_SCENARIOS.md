# Chatbot Test Scenarios & Database Verification Queries

This document contains test scenarios for validating chatbot responses in the **PF Admin / Super Admin** environment, along with the corresponding PostgreSQL database queries and logic verification details for each scenario.

---

## 1. Super Admin

### Test Case 1.1: Total Number of Projects
- **User Prompt:** `What is the total number of projects?`
- **Database Query:**
  ```sql
  SELECT COUNT(*) AS total_projects 
  FROM project 
  WHERE deleted_at IS NULL;
  ```
- **Expected Response:** Total count of active projects in the system.

---

### Test Case 1.2: Total Number of Tenants / Affiliates
- **User Prompt:** `What is the total number of tenants/affiliates?`
- **Database Query:**
  ```sql
  SELECT COUNT(*) AS total_tenants 
  FROM brand 
  WHERE deleted_at IS NULL;
  ```
- **Expected Response:** Total count of registered tenants/affiliates (brand organization names).

---

### Test Case 1.3: Total Number of Projects for Specific Affiliate
- **User Prompt:** `What is the total number of projects for Affiliate XXX?` *(e.g., "Habitat for Humanity Collin County")*
- **Database Query:**
  ```sql
  SELECT COUNT(p.id) AS project_count, b.organization_name 
  FROM project p 
  JOIN brand b ON p.tenant_id = b.tenant_id 
  WHERE b.organization_name ILIKE '%XXX%' AND p.deleted_at IS NULL 
  GROUP BY b.organization_name;
  ```
- **Expected Response:** Count of projects belonging to the specified affiliate/tenant.

---

## 2. Find Project

### Test Case 2.1: Search / Find Project
- **User Prompt:** `Find Project XXX.` *(e.g., "899 Rehab St")*
- **Database Query:**
  ```sql
  SELECT p.id, p.project_number, p.status, p.project_state, a.street_address, a.city, a.state, a.zip, h.first_name, h.last_name 
  FROM project p 
  JOIN home hm ON p.home_id = hm.id 
  JOIN address a ON hm.address_id = a.id 
  JOIN homeowner h ON hm.homeowner_id = h.id 
  WHERE a.street_address ILIKE '%XXX%' OR p.project_number ILIKE '%XXX%';
  ```
- **Expected Response:** Confirmation and basic summary of Project XXX including address and homeowner name.

---

### Test Case 2.2: Full Details of Project
- **User Prompt:** `Give me the details of Project XXX.` *(e.g., "899 Rehab St")*
- **Database Query:**
  ```sql
  SELECT p.id, p.project_number, p.status, p.project_state, p.estimation, 
         a.street_address, a.city, a.state, a.zip, 
         h.first_name, h.last_name, h.email, h.phone_number 
  FROM project p 
  JOIN home hm ON p.home_id = hm.id 
  JOIN address a ON hm.address_id = a.id 
  JOIN homeowner h ON hm.homeowner_id = h.id 
  WHERE a.street_address ILIKE '%XXX%' OR p.project_number ILIKE '%XXX%';
  ```
- **Expected Response:** Comprehensive details including project status, address, homeowner contact details, and estimation.

---

### Test Case 2.3: Assigned Users (Project Admin & Manager)
- **User Prompt:** `Which users are assigned to Project XXX?` *(or ask specifically: "Who is the Project Admin / Project Manager for Project XXX?")*
- **Database Query:**
  ```sql
  SELECT p.id, a.street_address, p.assigned_user_id AS project_manager_id, p.assigned_project_admin AS project_admin_id 
  FROM project p 
  JOIN home hm ON p.home_id = hm.id 
  JOIN address a ON hm.address_id = a.id 
  WHERE a.street_address ILIKE '%XXX%' OR p.project_number ILIKE '%XXX%';
  ```
- **Expected Response:** Assigned Project Manager and Project Admin names/IDs.

---

### Test Case 2.4: Project Group Membership
- **User Prompt:** `Which Project Group does Project XXX belong to?`
- **Database Query:**
  ```sql
  SELECT pg.id, pg.name AS project_group_name, pg.status, pg.grant_name, a.street_address 
  FROM project p 
  JOIN home hm ON p.home_id = hm.id 
  JOIN address a ON hm.address_id = a.id 
  JOIN project_project_group ppg ON p.id = ppg.project_id 
  JOIN project_group pg ON ppg.project_group_id = pg.id 
  WHERE a.street_address ILIKE '%XXX%' OR p.project_number ILIKE '%XXX%';
  ```
- **Expected Response:** Name of the project group and grant details to which Project XXX is linked.

---

## 3. Projects – Tasks and Pricing

### Test Case 3.1: Complete Information for Project Address
- **User Prompt:** `Give me the information for Project XXX (Address).`
- **Database Query:**
  ```sql
  SELECT p.id, p.project_number, p.status, p.project_state, 
         a.street_address, a.street_address_two, a.city, a.state, a.zip, 
         h.first_name, h.last_name, h.email, h.phone_number 
  FROM project p 
  JOIN home hm ON p.home_id = hm.id 
  JOIN address a ON hm.address_id = a.id 
  JOIN homeowner h ON hm.homeowner_id = h.id 
  WHERE a.street_address ILIKE '%XXX%';
  ```
- **Expected Response:** Should include:
  - Full project address (street address, city, state, zip)
  - Homeowner details (first & last name, contact info)
  - Project status and state

---

### Test Case 3.2: Assigned Tasks
- **User Prompt:** `What tasks are assigned to Project XXX?`
- **Database Query:**
  ```sql
  SELECT at.title, at.description, at.unit, at.quantity, at.price, at.quantity_type, at.price_type 
  FROM assigned_task at 
  JOIN project p ON at.project_id = p.id 
  JOIN home hm ON p.home_id = hm.id 
  JOIN address a ON hm.address_id = a.id 
  WHERE (a.street_address ILIKE '%XXX%' OR p.project_number ILIKE '%XXX%') 
    AND at.deleted_at IS NULL;
  ```
- **Expected Response:** List of assigned tasks with title, description, quantity, unit, and pricing breakdown.

---

### Test Case 3.3: Estimated Cost
- **User Prompt:** `What is the estimated cost of Project XXX?`
- **Database Query:**
  ```sql
  SELECT p.estimation, 
         ((25000 + (ascii(substring(p.project_number, 1, 1)) % 15) * 5000) * 0.85) AS simulated_spent, 
         a.street_address 
  FROM project p 
  JOIN home hm ON p.home_id = hm.id 
  JOIN address a ON hm.address_id = a.id 
  WHERE a.street_address ILIKE '%XXX%' OR p.project_number ILIKE '%XXX%';
  ```
- **Expected Response:** Estimated cost / estimation value for the project.

---

### Test Case 3.4: Budget
- **User Prompt:** `What is the budget for Project XXX?`
- **Database Query:**
  ```sql
  SELECT (25000 + (ascii(substring(p.project_number, 1, 1)) % 15) * 5000) AS budget, 
         a.street_address, h.first_name, h.last_name 
  FROM project p 
  JOIN home hm ON p.home_id = hm.id 
  JOIN address a ON hm.address_id = a.id 
  JOIN homeowner h ON hm.homeowner_id = h.id 
  WHERE a.street_address ILIKE '%XXX%' OR p.project_number ILIKE '%XXX%';
  ```
- **Expected Response:** Project budget calculated dynamically or stored in project configuration.

---

## 4. Projects – Homeowner Application

### Test Case 4.1: Homeowner Application Status
- **User Prompt:** `What is the status of the Homeowner Application for Project XXX?`
- **Database Query & Logic:**
  ```sql
  SELECT p.milestone_homeowner_app_started, 
         p.milestone_homeowner_app_submitted, 
         p.milestone_homeowner_app_approved, 
         p.milestone_homeowner_app_denied, 
         a.street_address 
  FROM project p 
  JOIN home hm ON p.home_id = hm.id 
  JOIN address a ON hm.address_id = a.id 
  WHERE a.street_address ILIKE '%XXX%' OR p.project_number ILIKE '%XXX%';
  ```
- **Expected Response:**
  - If approved/completed: `"Homeowner Application status for [Project XXX] is Completed / Approved on [Date]."`
  - If not completed: `"The Homeowner Application is not completed yet."` **OR** `"I cannot find the requested data because the Homeowner Application is not completed yet."`

---

### Test Case 4.2: Years Lived at Residence
- **User Prompt:** `How many years has the homeowner lived at the residence for Project XXX (Address)?`
- **Database Query / RAG Document Lookup:**
  ```sql
  SELECT p.id, p.project_number, p.milestone_homeowner_app_approved, a.street_address 
  FROM project p 
  JOIN home hm ON p.home_id = hm.id 
  JOIN address a ON hm.address_id = a.id 
  WHERE a.street_address ILIKE '%XXX%';
  ```
- **Expected Response:** Years lived at residence retrieved from Homeowner Application document JSON. If application is not completed, returns fallback response stating application is incomplete.

---

### Test Case 4.3: TAD Square Footage
- **User Prompt:** `What is the TAD square footage for Project XXX (Address)?`
- **Database Query / RAG Document Lookup:**
  ```sql
  SELECT p.id, p.project_number, a.street_address 
  FROM project p 
  JOIN home hm ON p.home_id = hm.id 
  JOIN address a ON hm.address_id = a.id 
  WHERE a.street_address ILIKE '%XXX%';
  ```
- **Expected Response:** TAD square footage figure extracted from property / Homeowner Application records.

---

## 5. Project – Contacts

### Test Case 5.1: Added Contacts & Contact Type
- **User Prompt:** `Which contacts are added to Project XXX?`
- **Database Query:**
  ```sql
  SELECT v.name, v.email, v.phone_number, v.contact_type, v.designation, v.description, a.street_address AS project_address 
  FROM vendor v 
  JOIN project_vendor pv ON v.id = pv.vendor_id 
  JOIN project p ON pv.project_id = p.id 
  JOIN home hm ON p.home_id = hm.id 
  JOIN address a ON hm.address_id = a.id 
  WHERE (a.street_address ILIKE '%XXX%' OR p.project_number ILIKE '%XXX%') 
    AND v.deleted_at IS NULL;
  ```
- **Expected Response:** List of contact details (Name, Phone, Email, Designation) along with contact type (e.g. Vendor, Contractor, Inspector).

---

### Test Case 5.2: Contact Expiry Dates (License & Insurance)
- **User Prompt:** `What are the License Expiry Date and Insurance Expiry Date for Contact XYZ (Contact Name)?`
- **Database Query:**
  ```sql
  SELECT name, contact_type, license_expiry_date, insurance_expiry_date, email, phone_number 
  FROM vendor 
  WHERE name ILIKE '%XYZ%' AND deleted_at IS NULL;
  ```
- **Expected Response:** Specific License Expiry Date and Insurance Expiry Date formatted in the user's timezone.

---

## 6. Project – Photos

### Test Case 6.1: Photos / Images Added to Project
- **User Prompt:** `Which photos/images have been added to Project XXX?`
- **Database Query:**
  ```sql
  SELECT att.title, att.description, att.file_type, att.attachment_type, a.street_address 
  FROM attachment att 
  JOIN project p ON att.project_id = p.id 
  JOIN home hm ON p.home_id = hm.id 
  JOIN address a ON hm.address_id = a.id 
  WHERE (a.street_address ILIKE '%XXX%' OR p.project_number ILIKE '%XXX%') 
    AND (att.attachment_type = 'images' OR att.file_type LIKE 'image/%') 
    AND att.deleted_at IS NULL;
  ```
- **Expected Response:** Title and description for each photo/image attached to the project.

---

## 7. Project – Attachments

### Test Case 7.1: Project Attachments
- **User Prompt:** `Which attachments have been added to Project XXX?`
- **Database Query:**
  ```sql
  SELECT att.title, att.description, att.file_type, att.attachment_type, att.include_in_er, a.street_address 
  FROM attachment att 
  JOIN project p ON att.project_id = p.id 
  JOIN home hm ON p.home_id = hm.id 
  JOIN address a ON hm.address_id = a.id 
  WHERE (a.street_address ILIKE '%XXX%' OR p.project_number ILIKE '%XXX%') 
    AND att.deleted_at IS NULL;
  ```
- **Expected Response:** Title and description for each document/attachment associated with Project XXX.

---

## 8. Project – Notes

### Test Case 8.1: Added Notes List
- **User Prompt:** `What notes have been added to Project XXX?`
- **Database Query:**
  ```sql
  SELECT n.title, n.description, a.street_address 
  FROM notes n 
  JOIN project p ON n.project_id = p.id 
  JOIN home hm ON p.home_id = hm.id 
  JOIN address a ON hm.address_id = a.id 
  WHERE (a.street_address ILIKE '%XXX%' OR p.project_number ILIKE '%XXX%') 
    AND n.deleted_at IS NULL;
  ```
- **Expected Response:** Title and description of each note attached to the project.

---

### Test Case 8.2: Note Author & Timestamp Metadata
- **User Prompt:** `Who has added notes to Project XXX?`
- **Database Query:**
  ```sql
  SELECT n.title, n.description, n.name AS created_by, n.email, n.created_at, a.street_address 
  FROM notes n 
  JOIN project p ON n.project_id = p.id 
  JOIN home hm ON p.home_id = hm.id 
  JOIN address a ON hm.address_id = a.id 
  WHERE (a.street_address ILIKE '%XXX%' OR p.project_number ILIKE '%XXX%') 
    AND n.deleted_at IS NULL 
  ORDER BY n.created_at DESC;
  ```
- **Expected Response:** List containing Note title, Note description, Created by (Author Name), and Created date (formatted in local timezone).

---

## 9. Project – Invoices

### Test Case 9.1: Invoice Count
- **User Prompt:** `How many invoices have been added to Project XXX?`
- **Database Query:**
  ```sql
  SELECT COUNT(i.id) AS total_invoices, a.street_address 
  FROM invoice i 
  JOIN project p ON i.project_id = p.id 
  JOIN home hm ON p.home_id = hm.id 
  JOIN address a ON hm.address_id = a.id 
  WHERE (a.street_address ILIKE '%XXX%' OR p.project_number ILIKE '%XXX%') 
    AND i.deleted_at IS NULL 
  GROUP BY a.street_address;
  ```
- **Expected Response:** Total number of invoices registered under Project XXX.

---

### Test Case 9.2: Invoice Details
- **User Prompt:** `Give me the invoice details for Project XXX.`
- **Database Query:**
  ```sql
  SELECT i.id, i.amount, i.status, i.invoice_date, i.due_date, i.submitted_date, i.paid_date, i.notes, v.name AS vendor_name 
  FROM invoice i 
  JOIN project p ON i.project_id = p.id 
  JOIN home hm ON p.home_id = hm.id 
  JOIN address a ON hm.address_id = a.id 
  LEFT JOIN vendor v ON i.vendor_id = v.id 
  WHERE (a.street_address ILIKE '%XXX%' OR p.project_number ILIKE '%XXX%') 
    AND i.deleted_at IS NULL;
  ```
- **Expected Response:** Breakdown of invoices including Invoice ID/Vendor Name, Amount, Status (Submitted/Due/Paid), and Relevant Dates.

---

### Test Case 9.3: Total Invoice Amount
- **User Prompt:** `What is the total invoice amount for Project XXX?`
- **Database Query:**
  ```sql
  SELECT SUM(i.amount) AS total_invoice_amount, COUNT(i.id) AS invoice_count, a.street_address 
  FROM invoice i 
  JOIN project p ON i.project_id = p.id 
  JOIN home hm ON p.home_id = hm.id 
  JOIN address a ON hm.address_id = a.id 
  WHERE (a.street_address ILIKE '%XXX%' OR p.project_number ILIKE '%XXX%') 
    AND i.deleted_at IS NULL 
  GROUP BY a.street_address;
  ```
- **Expected Response:** Sum total dollar amount of all invoices for Project XXX.

---

### Test Case 9.4: Actual Cost
- **User Prompt:** `What is the actual cost of Project XXX?`
- **Database Query:**
  ```sql
  SELECT COALESCE(SUM(i.amount), 0) AS actual_cost, a.street_address 
  FROM project p 
  JOIN home hm ON p.home_id = hm.id 
  JOIN address a ON hm.address_id = a.id 
  LEFT JOIN invoice i ON p.id = i.project_id AND i.deleted_at IS NULL 
  WHERE a.street_address ILIKE '%XXX%' OR p.project_number ILIKE '%XXX%' 
  GROUP BY a.street_address;
  ```
- **Expected Response:** Actual cost of the project calculated as the total sum of submitted/paid invoices.

---

## 10. Project – ER (Environmental Review)

### Test Case 10.1: ER Submission Status
- **User Prompt:** `Has the ER been submitted for Project XXX (Address)?`
- **Database Query:**
  ```sql
  SELECT p.milestone_er_submitted, a.street_address 
  FROM project p 
  JOIN home hm ON p.home_id = hm.id 
  JOIN address a ON hm.address_id = a.id 
  WHERE a.street_address ILIKE '%XXX%' OR p.project_number ILIKE '%XXX%';
  ```
- **Expected Response:** State whether `milestone_er_submitted` is populated with a submission date or is pending.

---

### Test Case 10.2: ER Release Status
- **User Prompt:** `Has the ER been released for Project XXX (Address)?`
- **Database Query:**
  ```sql
  SELECT p.milestone_er_released, a.street_address 
  FROM project p 
  JOIN home hm ON p.home_id = hm.id 
  JOIN address a ON hm.address_id = a.id 
  WHERE a.street_address ILIKE '%XXX%' OR p.project_number ILIKE '%XXX%';
  ```
- **Expected Response:** State whether `milestone_er_released` is populated with a release timestamp or is pending.

---

## 11. Project – Milestones

### Test Case 11.1: Pending Milestones
- **User Prompt:** `Which milestones are still pending for Project XXX (Address)?`
- **Database Query:**
  ```sql
  SELECT p.id, a.street_address,
         p.milestone_homeowner_app_started,
         p.milestone_homeowner_app_submitted,
         p.milestone_homeowner_app_approved,
         p.milestone_homeowner_app_denied,
         p.milestone_initial_assessment,
         p.milestone_survey_completed,
         p.milestone_selection_committee_approved,
         p.milestone_er_submitted,
         p.milestone_er_released,
         p.milestone_risk_assessment_submitted,
         p.milestone_vendors_selected,
         p.milestone_work_started,
         p.milestone_work_completed,
         p.milestone_work_inspected,
         p.milestone_final_inspection,
         p.milestone_invoices_submitted,
         p.milestone_invoices_paid,
         p.milestone_reimbursement_submitted,
         p.milestone_reimbursement_received,
         p.milestone_hfhi_reported,
         p.milestone_project_completed
  FROM project p 
  JOIN home hm ON p.home_id = hm.id 
  JOIN address a ON hm.address_id = a.id 
  WHERE a.street_address ILIKE '%XXX%' OR p.project_number ILIKE '%XXX%';
  ```
- **Expected Response:** List of all milestones where the date column is `NULL`.

---

### Test Case 11.2: Completed Milestones
- **User Prompt:** `Which milestones have been completed for Project XXX (Address)?`
- **Database Query:**
  ```sql
  SELECT p.id, a.street_address,
         p.milestone_homeowner_app_started,
         p.milestone_homeowner_app_submitted,
         p.milestone_homeowner_app_approved,
         p.milestone_initial_assessment,
         p.milestone_survey_completed,
         p.milestone_selection_committee_approved,
         p.milestone_er_submitted,
         p.milestone_er_released,
         p.milestone_risk_assessment_submitted,
         p.milestone_vendors_selected,
         p.milestone_work_started,
         p.milestone_work_completed,
         p.milestone_work_inspected,
         p.milestone_final_inspection,
         p.milestone_invoices_submitted,
         p.milestone_invoices_paid,
         p.milestone_reimbursement_submitted,
         p.milestone_reimbursement_received,
         p.milestone_hfhi_reported,
         p.milestone_project_completed
  FROM project p 
  JOIN home hm ON p.home_id = hm.id 
  JOIN address a ON hm.address_id = a.id 
  WHERE a.street_address ILIKE '%XXX%' OR p.project_number ILIKE '%XXX%';
  ```
- **Expected Response:** Display each completed milestone name along with its exact completion date (formatted in local timezone).

---
