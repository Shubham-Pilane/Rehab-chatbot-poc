# Master Chatbot Test Questions & Expected Answers Catalog

This document is the **complete, exhaustive test question repository** for the Rehab Project Management (RPM) AI Chatbot (**Habi**). It compiles every single test question, scenario, expected response, and database verification query from [CHATBOT_TEST_SCENARIOS.md](file:///c:/Users/ShubhamP/Desktop/Rehab-Chatbot-POC/CHATBOT_TEST_SCENARIOS.md) and live testing.

---

## Table of Contents
1. [Core Verified Test Scenarios & Exact Expected Answers](#1-core-verified-test-scenarios--exact-expected-answers)
2. [Real-World Project & Affiliate Queries](#2-real-world-project--affiliate-queries)
3. [Deep-Dive Database Verification Queries (SQL Reference)](#3-deep-dive-database-verification-queries-sql-reference)
4. [Category-by-Category Test Scenarios (Complete Checklist)](#4-category-by-category-test-scenarios-complete-checklist)

---

## 1. Core Verified Test Scenarios & Exact Expected Answers

### 1.1 Total Number of Projects
- **Question:**
  > What is the total number of projects?
- **Expected Answer:**
  > There are a total of 5,647 projects.

---

### 1.2 Full Project Details
- **Question:**
  > Give me the details of Project 899 Rehab St.  
  *(Template: `Give me the details of Project XXX.`)*
- **Expected Answer:**
  > Here are the details for the project at 899 Rehab St, Della Bella, New Mexico, 21039:
  > 
  > - **Project Name:** 899 Rehab St, Della Bella, New Mexico, 21039
  > - **Project Number:** P-88119271
  > - **Homeowner:** Ronin Glassbon
  > - **Status:** Survey Completed

---

### 1.3 Vendor Invoice for Specific Project
- **Question:**
  > For Project 4317 Tahoe Dr., what is the invoice amount for Vendor GTO?
- **Expected Answer:**
  > The invoice amount for Vendor GTO for the project at 4317 Tahoe Dr. is $11,793.22.

---

### 1.4 Assigned Tasks for Project
- **Question:**
  > What tasks are assigned to Project 899 Rehab St?  
  *(Template: `What tasks are assigned to Project XXX`)*
- **Expected Answer:**
  > Here are the tasks assigned to the project at 899 Rehab St, Della Bella, New Mexico, 21039:
  > 
  > - **RANGEHOOD - EXTERIOR VENTED:** Install an exterior ducted enameled range hood with integral controls and light, capable of 100CFM at 70 somes. If needed add a wall cabinet to attach hood to cabinet with screws. Include 7" galvanized metal vent pipe and roof or wall cap/damper assembly.
  > - **STORE OCCUPANTS FURNITURE & BELONGINGS:** After the dwelling unit owner and/or occupants pack and remove all valuable and breakable items, the contractor shall arrange and pay for the removal and safe storage of all occupants furnishings, decorations and personal belongings for the duration of the project in a bonded warehouse. After final clearance, all occupants' personal belongings are to be returned to the unit and replaced in their original positions.
  > - **VERIFY QUANTITIES/ MEASUREMENTS:** All measurements are for the contractor's convenience prior to a mandatory site inspection to verify all dimensions. All quantities are as stated.

---

### 1.5 Added Contacts for Project
- **Question:**
  > Which contacts are added to Project 899 Rehab St?  
  *(Template: `Which contacts are added to Project XXX`)*
- **Expected Answer:**
  > Here are the vendors assigned to the project at 899 Rehab St, Della Bella, New Mexico, 21039:
  > 
  > - **Ronin Broski** (Other)
  > - **Phone:** 2193218973
  > - **Email:** rn@123.com

---

### 1.6 Invoice Breakdown for Project
- **Question:**
  > Give me the invoice details for Project 899 Rehab St.  
  *(Template: `Give me the invoice details for Project XXX.`)*
- **Expected Answer:**
  > Here are the invoice details for the project at 899 Rehab St, Della Bella, New Mexico, 21039 (Project P-88119271):
  > 
  > - **Invoice ID:** 1117f59c-aa45-48b7-983b-f947e10669d4
  >   - **Amount:** -$19,999.00
  >   - **Status:** Submitted
  >   - **Invoice Date:** July 24, 2025 00:00
  >   - **Due Date:** July 9, 2025 00:00
  >   - **Submitted Date:** July 8, 2025 00:00
  >   - **First Approved By:** Version Upgrade Tenant Admin on July 24, 2025 00:00
  >   - **Second Approved By:** Project Manager v1 on July 22, 2025 00:00
  > 
  > - **Invoice ID:** 424d8953-6565-4f3f-b9c1-9d944754ed43
  >   - **Amount:** $18,000.00
  >   - **Status:** Submitted
  >   - **Invoice Date:** July 11, 2025 00:00
  >   - **Due Date:** July 3, 2025 00:00
  >   - **Submitted Date:** July 17, 2025 00:00
  >   - **First Approved By:** Version Upgrade Tenant Admin on July 2, 2025 00:00

---

### 1.7 Total Invoice Amount
- **Question:**
  > What is the total invoice amount for Project 899 Rehab St?  
  *(Template: `What is the total invoice amount for Project XXX?`)*
- **Expected Answer:**
  > The total invoiced amount for the project at 899 Rehab St, Della Bella, New Mexico, 21039 (Project P-88119271) is -$4,000.00.

---

### 1.8 Pending Milestones for Project
- **Question:**
  > Which milestones are still pending for Project 4605 Virgil St?  
  *(Template: `Which milestones are still pending for Project XXX (Address)?`)*
- **Expected Answer:**
  > For the project at 4605 Virgil St, Fort Worth, Texas, 76119, the following milestones are still pending:
  > 
  > - Homeowner Application Denied
  > - Survey Completed
  > - Risk Assessment Submitted
  > - Project Completed
  > - Work Inspected
  > - Final Inspection
  > - Reimbursement Submitted
  > - Reimbursement Received
  > - Selection Committee Approved
  > - Initial Assessment
  > - HFHI Reported

---

### 1.9 Price of a Specific Task
- **Question:**
  > What is the price of task full paint?  
  *(Template: `What is the price of task ABC (Task Name)?`)*
- **Expected Answer:**
  > The price for the "full paint" task is $2,000.00.

---

### 1.10 Budget for Project Group
- **Question:**
  > What is the budget for project group PAH 2020?  
  *(Template: `What is the budget for project group XXX?`)*
- **Expected Answer:**
  > The total estimated budget for the project group "PAH 2020" is $14,503.10.

---

### 1.11 Grant Information for Project Group
- **Question:**
  > What are the Grant Number, Grant Name, and Grant Amount for project group crash?  
  *(Template: `What are the Grant Number, Grant Name, and Grant Amount for project group XXX?`)*
- **Expected Answer:**
  > For the project group "crash", the grant number is 2109, the grant name is Bhavesh, and the grant amount is $750,000.

---

### 1.12 HUD Number of Project
- **Question:**
  > What is HUD Number of Project 899 Rehab St?  
  *(Template: `What is HUD Number of Project XXX (Address)?`)*
- **Expected Answer:**
  > The HUD Number for the project at 899 Rehab St is 99009900.

---

### 1.13 Survey Completed Date
- **Question:**
  > What is the Survey Completed Date for Project 899 Rehab St?  
  *(Template: `What is the Survey Completed Date for Project XXX (Address)?`)*
- **Expected Answer:**
  > The Survey Completed Date for the project at 899 Rehab St, Della Bella, New Mexico, 21039 (P-88119271) for Ronin Glassbon is July 5, 2025, at 12:00 PM.

---

### 1.14 Assigned Vendors & Status
- **Question:**
  > Which vendors are assigned to Project XXX and what is their status and invoice details?
- **Expected Answer:**
  > The assigned vendors for the project are "ABC Flooring" (status: active, license expires on 2026-09-15) and "XYZ Plumbing" (status: active). ABC Flooring has 1 pending invoice for $3,200.00.

---

### 1.15 Task Group Breakdown
- **Question:**
  > Show the task details for the "Masonry" task group from the "Duplicate 07" task list.
- **Expected Answer:**
  > Certainly! Here are the task details for the "Masonry" task group from the "Duplicate 07" task list:
  > 
  > - **BRICK COLUMN:** Install 12" x 8" brick column. Price: $4021.00 USD per linear foot (lf).
  > - **BRICK WALL REPAIR:** Remove damaged brick and tooth replacement brick into wall. Match brick and tooling as closely as possible. Price: $4035.40 USD per square foot (SF).
  > - **MASONRY - REPOINT:** Cut out mortar at least 1/2". Remove all loose material with clear water. Saturate joints with water and repoint in 1/2" lifts using portland cement mortar. Reinstall flashing, tool concave joints and clean brick face. Price: $4023.75 USD per square foot (SF).
  > - **CHIMNEY REPOINT:** Repair chimney above roof area by cutting out mortar at least 1/2", removing all loose material, and repointing using portland cement mortar. Reinstall flashing, tool concave joints, and clean brick face. Price: $4021.00 USD per sq ft.
  > - **CHIMNEY CAP:** Replace chimney cap with 2' x 2' precast, concrete cap cemented in place. Price: $4021.00 USD per each (EA).
  > - **CHIMNEY REMOVAL:** Remove the chimney to at least 6" below the roof line. Install a permanent cap on the remaining portion of the chimney. Resheath hole where chimney is removed with 1/2 CDX plywood. Finish using roofing materials to match existing as closely as possible. Price: $4021.00 USD per each (EA).
  > - **MASONRY CHIMNEY - REBUILD:** Tear down chimney to below the lowest point on the roof. Rebuild chimney using new 4" thick solid bricks without cored holes. Color of brick to match existing as close as possible. Chimney to a height required by building code. Install roof flashing, chimney cap, and terra cotta flue liner. Price: $4021.00 USD per each (EA).

---

## 2. Real-World Project & Affiliate Queries

Use these queries to test live Text-to-SQL generation and data extraction across affiliates, milestones, and project groups:

1. **Project Count by Affiliate:**
   > `How many total projects we have for this affiliate Colorado County Habitat for Humanity?`

2. **Affiliate Website Lookup:**
   > `Give me website for Habitat for Humanity Collin County`

3. **Affiliate License Number:**
   > `Give me license number for affiliate Marvel habitat`

4. **Affiliate / Tenant Organization Details:**
   > `What is tenant information for Habitat for Humanity Collin County?`

5. **Milestone Date - Work Started:**
   > `What is the Work Started Date for Project 899 Rehab St?`

6. **Project State:**
   > `What is the state of Project 899 Rehab St?`

7. **Project Group Membership:**
   > `Which project group does Project 899 Rehab St belong to?`

8. **Assigned Project Manager:**
   > `Who is the project manager for Project 899 Rehab St?`

9. **Projects in a Group:**
   > `Which projects belong to project group crash?`

10. **Homeowner Lookup:**
    > `Who is the homeowner for Project 899 Rehab St?`

11. **Grant Details:**
    > `What are the Grant Number, Grant Name, and Grant Amount for project group crash?`

12. **Vendor Specific Invoice Amount:**
    > `For Project 4317 Tahoe Dr., what is the invoice amount for Vendor GTO?`

13. **Project Group Actual Invoiced Cost:**
    > `What is the actual cost for project group crash?`

14. **Milestone Date - Selection Committee Approved:**
    > `What is the Selection Committee Approval Date for 899 Rehab St?`

15. **Milestone Date - Vendors Selected:**
    > `What is the Vendor(s) Selected Date for Project 899 Rehab St?`

---

## 3. Deep-Dive Database Verification Queries (SQL Reference)

Use these raw SQL queries to manually cross-check the chatbot's answers against the PostgreSQL database (`backup_2_july`):

### 3.1 Affiliate Website & Contact Info
- **User Prompt:** `Give me website for 'Habitat for Humanity Collin County'.`
- **Database Query:**
  ```sql
  SELECT organization_name, website, phonenumber, email, city, region
  FROM brand
  WHERE organization_name ILIKE '%Collin County%' 
    AND deleted_at IS NULL;
  ```

### 3.2 Display Milestones and Completion Dates
- **User Prompt:** `Display the milestone names and completion dates for Project '899 Rehab St'`
- **Database Query:**
  ```sql
  SELECT 
    p.milestone_homeowner_app_started, 
    p.milestone_homeowner_app_submitted, 
    p.milestone_homeowner_app_approved, 
    p.milestone_er_submitted, 
    p.milestone_er_released, 
    p.milestone_vendors_selected, 
    p.milestone_work_started, 
    p.milestone_work_completed, 
    p.milestone_project_completed
  FROM project AS p
  JOIN home ON p.home_id = home.id
  JOIN address AS a ON home.address_id = a.id
  WHERE a.street_address ILIKE '%899 Rehab St%' 
    AND p.deleted_at IS NULL;
  ```

### 3.3 Environmental Review (ER) Release Status
- **User Prompt:** `Has the ER been released for Project '899 Rehab St'?`
- **Database Query:**
  ```sql
  SELECT p.milestone_er_released,
         CASE 
           WHEN p.milestone_er_released IS NOT NULL THEN 'Yes, ER has been released.'
           ELSE 'No, ER has not been released yet.'
         END AS er_release_status
  FROM project AS p
  JOIN home ON p.home_id = home.id
  JOIN address AS a ON home.address_id = a.id
  WHERE a.street_address ILIKE '%899 Rehab St%' 
    AND p.deleted_at IS NULL;
  ```

### 3.4 Actual Cost for Project Group
- **User Prompt:** `What is the actual cost for Project Group 'crash'?`
- **Database Query:**
  ```sql
  SELECT SUM(i.amount) AS total_actual_cost 
  FROM project_group AS pg 
  JOIN project_project_group AS ppg ON pg.id = ppg.project_group_id 
  JOIN project AS p ON ppg.project_id = p.id 
  JOIN invoice AS i ON p.id = i.project_id 
  WHERE pg.name ILIKE '%crash%';
  ```

### 3.5 Project Notes Authors
- **User Prompt:** `Who has added notes to Project '899 Rehab St'?`
- **Database Query:**
  ```sql
  SELECT na.title AS note_title, na.attachment_type AS note_type, na.created_at, h.first_name AS created_by_first_name, h.last_name AS created_by_last_name
  FROM notes_attachment AS na
  JOIN project AS p ON na.tenant_id = p.tenant_id
  JOIN home ON p.home_id = home.id
  JOIN address AS a ON home.address_id = a.id
  JOIN homeowner AS h ON p.assigned_user_id = h.id
  WHERE a.street_address ILIKE '%899 Rehab St%' 
    AND na.deleted_at IS NULL;
  ```

### 3.6 Project Photos / Images Added
- **User Prompt:** `Which photos/images have been added to Project '899 Rehab St'?`
- **Database Query:**
  ```sql
  SELECT att.id, att.title, att.description, att.file_type, att.attachment_type
  FROM attachment AS att
  JOIN project AS p ON att.project_id = p.id
  JOIN home ON p.home_id = home.id
  JOIN address AS a ON home.address_id = a.id
  WHERE a.street_address ILIKE '%899 Rehab St%' 
    AND (att.attachment_type = 'images' OR att.file_type LIKE 'image/%')
    AND att.deleted_at IS NULL;
  ```

### 3.7 Project Group Association
- **User Prompt:** `Which Project Group does Project '899 Rehab St' belong to?`
- **Database Query:**
  ```sql
  SELECT pg.id AS project_group_id, pg.name AS project_group_name, a.street_address
  FROM project AS p
  JOIN home ON p.home_id = home.id
  JOIN address AS a ON home.address_id = a.id
  JOIN project_project_group AS ppg ON p.id = ppg.project_id
  JOIN project_group AS pg ON ppg.project_group_id = pg.id
  WHERE a.street_address ILIKE '%899 Rehab St%';
  ```

---

## 4. Category-by-Category Test Scenarios (Complete Checklist)

### Category 1: Super Admin
- `What is the total number of projects?`
- `What is the total number of tenants/affiliates?`
- `What is the total number of projects for Affiliate XXX?`

### Category 2: Find Project
- `Find Project XXX.`
- `Give me the details of Project XXX.`
- `Which users are assigned to Project XXX?` *(Project Admin, Project Manager)*
- `Which Project Group does Project XXX belong to?`

### Category 3: Projects – Tasks & Pricing
- `Give me the information for Project XXX (Address).`
  *(Includes: Full project address, Homeowner details, Project status/state)*
- `What tasks are assigned to Project XXX?`
- `What is the estimated cost of Project XXX?`
- `What is the budget for Project XXX?`

### Category 4: Projects – Homeowner Application
- `What is the status of the Homeowner Application for Project XXX?`
  *(Returns completion date or fallback: "The Homeowner Application is not completed yet.")*
- `How many years has the homeowner lived at the residence for Project XXX (Address)?`
- `What is the TAD square footage for Project XXX (Address)?`

### Category 5: Project – Contacts
- `Which contacts are added to Project XXX?` *(Displays contact details and contact types)*
- `What are the License Expiry Date and Insurance Expiry Date for Contact XYZ (Contact Name)?`

### Category 6: Project – Photos
- `Which photos/images have been added to Project XXX?` *(Displays title and description for each image)*

### Category 7: Project – Attachments
- `Which attachments have been added to Project XXX?` *(Displays title and description for each attachment)*

### Category 8: Project – Notes
- `What notes have been added to Project XXX?` *(Displays note title and description)*
- `Who has added notes to Project XXX?` *(Displays note title, description, author name, and created date)*

### Category 9: Project – Invoices
- `How many invoices have been added to Project XXX?`
- `Give me the invoice details for Project XXX.`
- `What is the total invoice amount for Project XXX?`
- `What is the actual cost of Project XXX?`

### Category 10: Project – Environmental Review (ER)
- `Has the ER been submitted for Project XXX (Address)?`
- `Has the ER been released for Project XXX (Address)?`

### Category 11: Project – Milestones
- `Which milestones are still pending for Project XXX (Address)?`
- `Which milestones have been completed for Project XXX (Address)?` *(Displays milestone names and completion dates)*
