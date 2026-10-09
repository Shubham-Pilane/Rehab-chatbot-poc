# User Queries & Raw SQL Log

1)
==================================================
🔍 [SQL Generated for User Query]: "What is the Vendor(s) Selected Date for Project 899 Rehab St899 Rehab St"
💻 [Raw SQL]: SELECT p.milestone_vendors_selected, h.first_name, h.last_name, a.street_address, a.city, a.state, a.zip FROM project AS p JOIN home ON p.home_id = home.id JOIN address AS a ON home.address_id = a.id JOIN homeowner AS h ON home.homeowner_id = h.id WHERE a.street_address ILIKE '899 Rehab St'
==================================================

2)
==================================================
🔍 [SQL Generated for User Query]: "how many total project we have"
💻 [Raw SQL]: SELECT COUNT(*) FROM project
==================================================

3)
==================================================
🔍 [SQL Generated for User Query]: "give me website for Habitat for Humanity Collin County"
💻 [Raw SQL]: SELECT website FROM brand WHERE organization_name ILIKE 'Habitat for Humanity Collin County'
==================================================

4)
==================================================
🔍 [SQL Generated for User Query]: "how much projects for them?"
💻 [Raw SQL]: SELECT COUNT(p.id) FROM project AS p JOIN brand AS b ON p.tenant_id = b.tenant_id WHERE b.organization_name ILIKE 'Habitat for Humanity Collin County'
==================================================

5)
==================================================
🔍 [SQL Generated for User Query]: ")give me license number for afiliate Marvel habitat"
💻 [Raw SQL]: SELECT license_number FROM brand WHERE organization_name ILIKE 'Marvel habitat'
==================================================

6)
==================================================
🔍 [SQL Generated for User Query]: "how many total projects we have for this afiliate Colorado County Habitat for Humanity?"
💻 [Raw SQL]: SELECT COUNT(p.id) FROM project AS p JOIN brand AS b ON p.tenant_id = b.id WHERE b.organization_name ILIKE 'Colorado County Habitat for Humanity'
==================================================

7)
==================================================
🔍 [SQL Generated for User Query]: "how many total projects we have for this afiliate Colorado County Habitat for Humanity?"
💻 [Raw SQL]: SELECT COUNT(p.id) FROM project AS p JOIN brand AS b ON p.tenant_id = b.tenant_id WHERE b.organization_name ILIKE 'Colorado County Habitat for Humanity' AND p.deleted_at IS NULL
==================================================

8)
==================================================
🔍 [SQL Generated for User Query]: "What is the Work Started Date for Project 899 Rehab St"
💻 [Raw SQL]: SELECT p.milestone_work_started, h.first_name, h.last_name, a.street_address, a.city, a.state, a.zip FROM project AS p JOIN home ON p.home_id = home.id JOIN address AS a ON home.address_id = a.id JOIN homeowner AS h ON home.homeowner_id = h.id WHERE a.street_address ILIKE '899 Rehab St'
==================================================

9)
==================================================
🔍 [SQL Generated for User Query]: "What is the project status?"
💻 [Raw SQL]: SELECT T1.status FROM project AS T1 JOIN home AS T2 ON T1.home_id = T2.id JOIN address AS T3 ON T2.address_id = T3.id JOIN homeowner AS T4 ON T2.homeowner_id = T4.id WHERE T3.street_address ILIKE '899 Rehab St' AND T3.city ILIKE 'Della Bella' AND T3.state ILIKE 'New Mexico' AND T3.zip ILIKE '21039' AND T4.first_name ILIKE 'Ronin' AND T4.last_name ILIKE 'Glassbon'
==================================================

10)
==================================================
🔍 [SQL Generated for User Query]: "What is the budget?"
💻 [Raw SQL]: SELECT (25000 + (ascii(substring(project.project_number, 1, 1)) % 15) * 5000) AS budget, homeowner.first_name, homeowner.last_name, address.street_address, address.city, address.state, address.zip FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id JOIN homeowner ON home.homeowner_id = homeowner.id WHERE address.street_address ILIKE '899 Rehab St' AND address.city ILIKE 'Della Bella' AND address.state ILIKE 'New Mexico' AND address.zip ILIKE '21039' AND homeowner.first_name ILIKE 'Ronin' AND homeowner.last_name ILIKE 'Glassbon' AND project.deleted_at IS NULL AND home.deleted_at IS NULL AND address.deleted_at IS NULL AND homeowner.deleted_at IS NULL
==================================================

11)
==================================================
🔍 [SQL Generated for User Query]: "who was homeowner"
💻 [Raw SQL]: SELECT T3.first_name, T3.last_name, T4.street_address, T4.city, T4.state, T4.zip FROM project AS T1 JOIN home AS T2 ON T1.home_id = T2.id JOIN homeowner AS T3 ON T2.homeowner_id = T3.id JOIN address AS T4 ON T2.address_id = T4.id WHERE T4.street_address ILIKE '899 Rehab St' AND T4.city ILIKE 'Della Bella' AND T4.state ILIKE 'New Mexico' AND T4.zip ILIKE '21039' AND T3.first_name ILIKE 'Ronin' AND T3.last_name ILIKE 'Glassbon'
==================================================

12)
==================================================
🔍 [SQL Generated for User Query]: "give contcact details"
💻 [Raw SQL]: SELECT h.first_name, h.last_name, h.email, h.phone_number, h.alternate_first_name, h.alternate_last_name, h.alternate_phone_number, h.phone_number_extension, h.alternate_phone_extension FROM project AS p JOIN home AS hm ON p.home_id = hm.id JOIN homeowner AS h ON hm.homeowner_id = h.id JOIN address AS a ON hm.address_id = a.id WHERE a.street_address ILIKE '899 Rehab St' AND a.city ILIKE 'Della Bella' AND a.state ILIKE 'New Mexico' AND a.zip ILIKE '21039' AND h.first_name ILIKE 'Ronin' AND h.last_name ILIKE 'Glassbon'
==================================================

13)
==================================================
🔍 [SQL Generated for User Query]: "Any open tasks?"
💻 [Raw SQL]: SELECT at.title, at.description, at.unit, at.quantity, at.price FROM assigned_task AS at JOIN project AS p ON at.project_id = p.id JOIN home AS h ON p.home_id = h.id JOIN address AS a ON h.address_id = a.id WHERE a.street_address ILIKE '899 Rehab St' AND a.city ILIKE 'Della Bella' AND a.state ILIKE 'New Mexico' AND a.zip ILIKE '21039';
==================================================

14)
==================================================
🔍 [SQL Generated for User Query]: "What is the actual cost for project group crash? "
💻 [Raw SQL]: SELECT SUM(T3.amount) FROM project_group AS T1 JOIN project_project_group AS T2 ON T1.id = T2.project_group_id JOIN project AS T4 ON T2.project_id = T4.id JOIN invoice AS T3 ON T4.id = T3.project_id WHERE T1.name ILIKE 'crash'
==================================================

15)
==================================================
🔍 [SQL Generated for User Query]: "What is the budget for crash?"
💻 [Raw SQL]: SELECT SUM(25000 + (ascii(SUBSTRING(p.project_number, 1, 1)) % 15) * 5000) AS total_budget FROM project_group pg JOIN project_project_group ppg ON pg.id = ppg.project_group_id JOIN project p ON ppg.project_id = p.id WHERE pg.name ILIKE 'crash' AND p.project_number IS NOT NULL AND p.project_number != ''
==================================================

16)
==================================================
🔍 [SQL Generated for User Query]: "Which project group does Project 899 Rehab St belong to?"
💻 [Raw SQL]: SELECT T3.name FROM project AS T1 JOIN project_project_group AS T2 ON T1.id = T2.project_id JOIN project_group AS T3 ON T2.project_group_id = T3.id WHERE T1.project_number ILIKE '899 Rehab St'
==================================================

17)
==================================================
🔍 [SQL Generated for User Query]: "What is the Selection Committee Approval Date for 899 Rehab St"
💻 [Raw SQL]: SELECT p.milestone_selection_committee_approved, h.first_name, h.last_name, a.street_address, a.city, a.state, a.zip FROM project AS p JOIN home ON p.home_id = home.id JOIN address AS a ON home.address_id = a.id JOIN homeowner AS h ON home.homeowner_id = h.id WHERE a.street_address ILIKE '899 Rehab St'
==================================================

18)
==================================================
🔍 [SQL Generated for User Query]: "Has the ER been released for Project '899 Rehab St'?"
💻 [Raw SQL]: SELECT T1.milestone_er_released FROM project AS T1 JOIN home AS T2 ON T1.home_id = T2.id JOIN address AS T3 ON T2.address_id = T3.id WHERE T3.street_address ILIKE '%899 Rehab St%'
==================================================

19)
==================================================
🔍 [SQL Generated for User Query]: "how many total projects we hvae"
💻 [Raw SQL]: SELECT COUNT(*) FROM project
==================================================

20)
==================================================
🔍 [SQL Generated for User Query]: "What's the average budget?"
💻 [Raw SQL]: SELECT AVG((25000 + (ascii(substring(project.project_number, 1, 1)) % 15) * 5000)) AS average_budget FROM project WHERE project.project_number IS NOT NULL AND project.project_number != ''
==================================================

21)
==================================================
🔍 [SQL Generated for User Query]: "Which Project Group does Project '899 Rehab St' belong to?"
💻 [Raw SQL]: SELECT pg.name AS project_group_name, h.first_name AS homeowner_first_name, h.last_name AS homeowner_last_name, a.street_address, a.city, a.state, a.zip FROM project AS p JOIN home AS ho ON p.home_id = ho.id JOIN address AS a ON ho.address_id = a.id JOIN homeowner AS h ON ho.homeowner_id = h.id JOIN project_project_group AS ppg ON p.id = ppg.project_id JOIN project_group AS pg ON ppg.project_group_id = pg.id WHERE a.street_address ILIKE '%899 Rehab St%'
==================================================

22)
==================================================
🔍 [SQL Generated for User Query]: "which project has most attachments"
💻 [Raw SQL]: SELECT p.id AS project_id, p.project_number, COUNT(a.id) AS attachment_count, h.first_name AS homeowner_first_name, h.last_name AS homeowner_last_name, addr.street_address, addr.city, addr.state, addr.zip FROM project AS p JOIN attachment AS a ON p.id = a.project_id JOIN home ON p.home_id = home.id JOIN homeowner AS h ON home.homeowner_id = h.id JOIN address AS addr ON home.address_id = addr.id GROUP BY p.id, p.project_number, h.first_name, h.last_name, addr.street_address, addr.city, addr.state, addr.zip ORDER BY attachment_count DESC LIMIT 1
==================================================

23)
==================================================
🔍 [SQL Generated for User Query]: "which project has 232 attachments"
💻 [Raw SQL]: SELECT p.id, h.first_name, h.last_name, a.street_address, a.city, a.state, a.zip, COUNT(att.id) AS attachment_count FROM project AS p JOIN home ON p.home_id = home.id JOIN homeowner AS h ON home.homeowner_id = h.id JOIN address AS a ON home.address_id = a.id LEFT JOIN attachment AS att ON p.id = att.project_id GROUP BY p.id, h.first_name, h.last_name, a.street_address, a.city, a.state, a.zip HAVING COUNT(att.id) = 232
==================================================

24)
==================================================
🔍 [SQL Generated for User Query]: "who is homeowner"
💻 [Raw SQL]: SELECT T3.first_name, T3.last_name FROM project AS T1 JOIN home AS T2 ON T1.home_id = T2.id JOIN homeowner AS T3 ON T2.homeowner_id = T3.id WHERE T1.id = '304c6c25-ed38-4237-a7d1-d247da222a0c'
==================================================

25)
==================================================
🔍 [SQL Generated for User Query]: "which tenenat this belongs to"
💻 [Raw SQL]: SELECT T3.organization_name FROM homeowner AS T1 JOIN home AS T2 ON T1.id = T2.homeowner_id JOIN project AS T4 ON T2.id = T4.home_id JOIN brand AS T3 ON T4.tenant_id = T3.tenant_id JOIN address AS T5 ON T2.address_id = T5.id WHERE T1.first_name ILIKE 'Maxine' AND T1.last_name ILIKE 'Branch' AND T5.street_address ILIKE '3633 Avenue I' AND T5.city ILIKE 'Fort Worth' AND T5.state ILIKE 'Texas' AND T5.zip ILIKE '76105'
==================================================

26)
==================================================
🔍 [SQL Generated for User Query]: "which tenenat this belongs to"
💻 [Raw SQL]: SELECT T2.organization_name FROM project AS T1 JOIN brand AS T2 ON T1.tenant_id = T2.tenant_id WHERE T1.id = '304c6c25-ed38-4237-a7d1-d247da222a0c'
==================================================

27)
==================================================
🔍 [SQL Generated for User Query]: "What is the actual cost for project group crash? "
💻 [Raw SQL]: SELECT SUM(i.amount) FROM project_group AS pg JOIN project_project_group AS ppg ON pg.id = ppg.project_group_id JOIN project AS p ON ppg.project_id = p.id JOIN invoice AS i ON p.id = i.project_id WHERE pg.name ILIKE 'crash'
==================================================

28)
==================================================
🔍 [SQL Generated for User Query]: "What does this amount mean?"
💻 [Raw SQL]: SELECT SUM(i.amount) FROM project_group AS pg JOIN project_project_group AS ppg ON pg.id = ppg.project_group_id JOIN invoice AS i ON ppg.project_id = i.project_id WHERE pg.name ILIKE 'crash'
==================================================

29)
==================================================
🔍 [SQL Generated for User Query]: "Projects in 'crash' group?"
💻 [Raw SQL]: SELECT project.id, project.project_number, homeowner.first_name, homeowner.last_name, address.street_address, address.city, address.state, address.zip FROM project_group JOIN project_project_group ON project_group.id = project_project_group.project_group_id JOIN project ON project_project_group.project_id = project.id JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id JOIN homeowner ON home.homeowner_id = homeowner.id WHERE project_group.name ILIKE 'crash'
==================================================

30)
==================================================
🔍 [SQL Generated for User Query]: "how many total projects we havve"
💻 [Raw SQL]: SELECT COUNT(id) FROM project
==================================================

31)
==================================================
🔍 [SQL Generated for User Query]: "What did the inspector mention about the flooring damage?"
💻 [Raw SQL]: SELECT n.title AS note_title, n.description AS note_description, h.first_name AS homeowner_first_name, h.last_name AS homeowner_last_name, a.street_address, a.city, a.state, a.zip, p.project_number FROM notes AS n JOIN project AS p ON n.project_id = p.id JOIN home AS hm ON p.home_id = hm.id JOIN homeowner AS h ON hm.homeowner_id = h.id JOIN address AS a ON hm.address_id = a.id WHERE (n.description ILIKE '%flooring damage%' OR n.title ILIKE '%flooring damage%') AND (n.description ILIKE '%inspector%' OR n.title ILIKE '%inspector%')
==================================================

32)
==================================================
🔍 [SQL Generated for User Query]: "what in this uploaded pdf?"
💻 [Raw SQL]: SELECT attachment.title, attachment.description, attachment.file_type, attachment.attachment_type, attachment.content_type FROM attachment JOIN project ON attachment.project_id = project.id WHERE project.project_number = 'P-1025' AND attachment.title ILIKE 'Inspection_Report_P1025.pdf' AND attachment.deleted_at IS NULL
==================================================

33)
==================================================
🔍 [SQL Generated for User Query]: "whats inside delga pdf?"
💻 [Raw SQL]: SELECT title, description, file_type, content_type FROM attachment WHERE title ILIKE '%delga pdf%'
==================================================

34)
==================================================
🔍 [SQL Generated for User Query]: ""What's inside delga pdf?""
💻 [Raw SQL]: SELECT a.title, a.description, a.file_type, a.attachment_type, a.content_type, p.project_number, h.first_name AS homeowner_first_name, h.last_name AS homeowner_last_name, addr.street_address, addr.city, addr.state, addr.zip FROM attachment AS a LEFT JOIN project AS p ON a.project_id = p.id LEFT JOIN home AS hm ON p.home_id = hm.id LEFT JOIN homeowner AS h ON hm.homeowner_id = h.id LEFT JOIN address AS addr ON hm.address_id = addr.id WHERE a.title ILIKE '%delga pdf%'
==================================================

35)
==================================================
🔍 [SQL Generated for User Query]: "how many total notes are there"
💻 [Raw SQL]: SELECT COUNT(n.id) FROM notes AS n JOIN project AS p ON n.project_id = p.id JOIN home AS h ON p.home_id = h.id JOIN address AS a ON h.address_id = a.id WHERE a.street_address ILIKE '%1920 Delga St%'
==================================================

36)
==================================================
🔍 [SQL Generated for User Query]: "Who created the notes?"
💻 [Raw SQL]: SELECT DISTINCT T3.name FROM project AS T1 JOIN home AS T2 ON T1.home_id = T2.id JOIN address AS T4 ON T2.address_id = T4.id JOIN notes AS T3 ON T1.id = T3.project_id WHERE T4.street_address ILIKE '%1920 Delga St%'
==================================================

37)
==================================================
🔍 [SQL Generated for User Query]: "Any other attachments?"
💻 [Raw SQL]: SELECT attachment.title, project.project_number, homeowner.first_name, homeowner.last_name, address.street_address, address.city, address.state, address.zip FROM attachment JOIN project ON attachment.project_id = project.id JOIN home ON project.home_id = home.id JOIN homeowner ON home.homeowner_id = homeowner.id JOIN address ON home.address_id = address.id WHERE attachment.project_id = '11' AND attachment.deleted_at IS NULL AND project.deleted_at IS NULL AND home.deleted_at IS NULL AND homeowner.deleted_at IS NULL AND address.deleted_at IS NULL
==================================================

38)
==================================================
🔍 [SQL Generated for User Query]: "whats insid ethat excel"
💻 [Raw SQL]: SELECT id, title, description, file_type, content_type, project_id FROM attachment WHERE content_type ILIKE '%excel%' OR file_type ILIKE '%excel%'
==================================================

39)
==================================================
🔍 [SQL Generated for User Query]: "what is budget for ctbu spring "
💻 [Raw SQL]: SELECT SUM(25000 + (ascii(SUBSTRING(p.project_number, 1, 1)) % 15) * 5000) AS total_budget FROM project_group pg JOIN project_project_group ppg ON pg.id = ppg.project_group_id JOIN project p ON ppg.project_id = p.id WHERE pg.name ILIKE 'ctbu spring' AND p.project_number IS NOT NULL AND p.project_number != ''
==================================================

40)
==================================================
🔍 [SQL Generated for User Query]: "what is budget for ctbu spring file"
💻 [Raw SQL]: SELECT SUM(25000 + (ascii(substring(p.project_number, 1, 1)) % 15) * 5000) AS total_simulated_budget FROM project_group AS pg JOIN project_project_group AS ppg ON pg.id = ppg.project_group_id JOIN project AS p ON ppg.project_id = p.id WHERE pg.name ILIKE 'ctbu spring file' AND p.project_number IS NOT NULL AND p.project_number != ''
==================================================

41)
==================================================
🔍 [SQL Generated for User Query]: "what is age for joleen"
💻 [Raw SQL]: SELECT NULL AS age FROM homeowner WHERE first_name ILIKE 'joleen'
==================================================

42)
==================================================
🔍 [SQL Generated for User Query]: "its inside ctbu pring excel file"
💻 [Raw SQL]: SELECT T3.first_name, T3.last_name, NULL AS age FROM project AS T1 JOIN home AS T2 ON T1.home_id = T2.id JOIN homeowner AS T3 ON T2.homeowner_id = T3.id WHERE T1.project_number ILIKE 'CTBU Spring 2020' AND T3.first_name ILIKE 'Joleen'
==================================================

43)
==================================================
🔍 [SQL Generated for User Query]: "Give info about olen"
💻 [Raw SQL]: SELECT homeowner.first_name, homeowner.last_name, homeowner.email, homeowner.phone_number, address.street_address, address.city, address.state, address.zip FROM homeowner JOIN home ON homeowner.id = home.homeowner_id JOIN address ON home.address_id = address.id WHERE homeowner.first_name ILIKE '%olen%' OR homeowner.last_name ILIKE '%olen%'
==================================================

44)
==================================================
🔍 [SQL Generated for User Query]: "how many project are completed for ctbu spring"
💻 [Raw SQL]: SELECT COUNT(p.id) FROM project AS p JOIN project_project_group AS ppg ON p.id = ppg.project_id JOIN project_group AS pg ON ppg.project_group_id = pg.id WHERE pg.name ILIKE '%ctbu spring%' AND p.status = 'Completed'
==================================================

45)
==================================================
🔍 [SQL Generated for User Query]: "how many project are completed for ctbu spring file"
💻 [Raw SQL]: SELECT COUNT(p.id) FROM project AS p WHERE p.project_number ILIKE 'CTBU Spring 2020' AND p.status = 'COMPLETED'
==================================================

46)
==================================================
🔍 [SQL Generated for User Query]: "What is the total budget?"
💻 [Raw SQL]: SELECT SUM((25000 + (ascii(substring(p.project_number, 1, 1)) % 15) * 5000)) AS total_budget FROM project AS p JOIN project_project_group AS ppg ON p.id = ppg.project_id JOIN project_group AS pg ON ppg.project_group_id = pg.id WHERE pg.name ILIKE 'CTBU Spring 2020' AND p.project_number IS NOT NULL AND p.project_number != ''
==================================================

47)
==================================================
🔍 [SQL Generated for User Query]: "how many total projects in ctbu pring"
💻 [Raw SQL]: SELECT COUNT(p.id) FROM project AS p JOIN project_project_group AS ppg ON p.id = ppg.project_id JOIN project_group AS pg ON ppg.project_group_id = pg.id WHERE pg.name ILIKE 'CTBU Spring 2020'
==================================================

48)
==================================================
🔍 [SQL Generated for User Query]: "how many total projects in ctbu apring file"
💻 [Raw SQL]: SELECT COUNT(DISTINCT pp.project_id) FROM project_project_group AS pp JOIN project_group AS pg ON pp.project_group_id = pg.id WHERE pg.name ILIKE '%ctbu apring%'
==================================================

49)
==================================================
🔍 [SQL Generated for User Query]: "How many total projects do we have?"
💻 [Raw SQL]: SELECT id FROM project LIMIT 1
==================================================

50)
==================================================
🔍 [SQL Generated for User Query]: "How many total projects do we have?"
💻 [Raw SQL]: SELECT id FROM project LIMIT 1
==================================================

51)
==================================================
🔍 [SQL Generated for User Query]: "How many total projects do we have?"
💻 [Raw SQL]: SELECT id FROM project LIMIT 1
==================================================

52)
==================================================
🔍 [SQL Generated for User Query]: "How many projects do we have?""
💻 [Raw SQL]: SELECT COUNT(*) FROM project
==================================================

53)
==================================================
🔍 [SQL Generated for User Query]: "how many projects we have"
💻 [Raw SQL]: SELECT COUNT(*) FROM project
==================================================

54)
==================================================
🔍 [SQL Generated for User Query]: "What is the Vendor(s) Selected Date for Project 899 Rehab St899 Rehab St"
💻 [Raw SQL]: SELECT T1.milestone_vendors_selected FROM project AS T1 INNER JOIN home AS T2 ON T1.home_id = T2.id INNER JOIN address AS T3 ON T2.address_id = T3.id WHERE T3.street_address ILIKE '%899 Rehab St%'
==================================================

55)
==================================================
🔍 [SQL Generated for User Query]: "how many total projects we have"
💻 [Raw SQL]: SELECT COUNT(*) FROM project
==================================================

56)
==================================================
🔍 [SQL Generated for User Query]: "Show project details?"
💻 [Raw SQL]: SELECT p.id, p.project_number, p.status, p.project_state, h.first_name AS homeowner_first_name, h.last_name AS homeowner_last_name, a.street_address, a.city, a.state, a.zip FROM project AS p JOIN home ON p.home_id = home.id JOIN homeowner AS h ON home.homeowner_id = h.id JOIN address AS a ON home.address_id = a.id
==================================================

57)
==================================================
🔍 [SQL Generated for User Query]: "What is tenant information for Habitat for Humanity Collin County"
💻 [Raw SQL]: SELECT id, created_at, updated_at, deleted_at, tenant_id, firstname, lastname, phonenumber, email, address1, address2, city, zipcode, organization_phone, organization_name, website, profile_image_url, region, county, address_type, license_number, phone_number_extension, organization_phone_extension FROM brand WHERE organization_name ILIKE 'Habitat for Humanity Collin County'
==================================================

58)
==================================================
🔍 [SQL Generated for User Query]: "list homeowners"
💻 [Raw SQL]: SELECT first_name, last_name, email, phone_number FROM homeowner
==================================================

59)
==================================================
🔍 [SQL Generated for User Query]: "list homeonwers"
💻 [Raw SQL]: SELECT first_name, last_name, email, phone_number FROM homeowner
==================================================

60)
==================================================
🔍 [SQL Generated for User Query]: "How many projects?"
💻 [Raw SQL]: SELECT COUNT(*) FROM project
==================================================

61)
==================================================
🔍 [SQL Generated for User Query]: "Which project group does Project 899 Rehab St belong to?"
💻 [Raw SQL]: SELECT T3.name FROM project AS T1 JOIN home AS T2 ON T1.home_id = T2.id JOIN address AS T4 ON T2.address_id = T4.id JOIN project_project_group AS T5 ON T1.id = T5.project_id JOIN project_group AS T3 ON T5.project_group_id = T3.id WHERE T4.street_address ILIKE '%899 Rehab St%'
==================================================

62)
==================================================
🔍 [SQL Generated for User Query]: "What is the Vendor(s) Selected Date for Project 899 Rehab St899 Rehab St"
💻 [Raw SQL]: SELECT T1.milestone_vendors_selected FROM project AS T1 JOIN home AS T2 ON T1.home_id = T2.id JOIN address AS T3 ON T2.address_id = T3.id WHERE T3.street_address ILIKE '%899 Rehab St899 Rehab St%'
==================================================

63)
==================================================
🔍 [SQL Generated for User Query]: "What is the Selection Committee Approval Date for 899 Rehab St"
💻 [Raw SQL]: SELECT p.milestone_selection_committee_approved, h.first_name, h.last_name, a.street_address, a.city, a.state, a.zip FROM project AS p JOIN home ON p.home_id = home.id JOIN address AS a ON home.address_id = a.id JOIN homeowner AS h ON home.homeowner_id = h.id WHERE a.street_address ILIKE '%899 Rehab St%'
==================================================

64)
==================================================
🔍 [SQL Generated for User Query]: "What is the Vendor(s) Selected Date for Project 899 Rehab"
💻 [Raw SQL]: SELECT p.milestone_vendors_selected, h.first_name, h.last_name, a.street_address, a.city, a.state, a.zip FROM project AS p JOIN home ON p.home_id = home.id JOIN address AS a ON home.address_id = a.id JOIN homeowner AS h ON home.homeowner_id = h.id WHERE a.street_address ILIKE '%899 Rehab St%'
==================================================

65)
==================================================
🔍 [SQL Generated for User Query]: "What is the budget?"
💻 [Raw SQL]: SELECT (25000 + (ascii(substring(project.project_number, 1, 1)) % 15) * 5000) AS budget, homeowner.first_name, homeowner.last_name, address.street_address, address.city, address.state, address.zip FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id JOIN homeowner ON home.homeowner_id = homeowner.id WHERE address.street_address ILIKE '%899 Rehab St%'
==================================================

66)
==================================================
🔍 [SQL Generated for User Query]: "how many total projects we have"
💻 [Raw SQL]: SELECT COUNT(id) FROM project
==================================================

67)
==================================================
🔍 [SQL Generated for User Query]: "list some projects"
💻 [Raw SQL]: SELECT p.id, p.project_number, h.first_name, h.last_name, a.street_address, a.city, a.state, a.zip FROM project AS p JOIN home ON p.home_id = home.id JOIN homeowner AS h ON home.homeowner_id = h.id JOIN address AS a ON home.address_id = a.id LIMIT 10
==================================================

68)
==================================================
🔍 [SQL Generated for User Query]: "give some projects names"
💻 [Raw SQL]: SELECT T3.first_name, T3.last_name, T4.street_address, T4.city, T4.state, T4.zip FROM project AS T1 JOIN home AS T2 ON T1.home_id = T2.id JOIN homeowner AS T3 ON T2.homeowner_id = T3.id JOIN address AS T4 ON T2.address_id = T4.id LIMIT 10
==================================================

69)
==================================================
🔍 [SQL Generated for User Query]: "What is a project's status?"
💻 [Raw SQL]: SELECT p.status, h.first_name, h.last_name, a.street_address, a.city, a.state, a.zip FROM project AS p JOIN home ON p.home_id = home.id JOIN homeowner AS h ON home.homeowner_id = h.id JOIN address AS a ON home.address_id = a.id WHERE a.street_address ILIKE '%123 Main st%' AND a.city ILIKE '%Detroit%' AND a.state ILIKE '%Michigan%' AND a.zip ILIKE '%48226%' AND h.first_name ILIKE '%Jane%' AND h.last_name ILIKE '%Doe%'
==================================================

70)
==================================================
🔍 [SQL Generated for User Query]: "give project names"
💻 [Raw SQL]: SELECT project_number FROM project
==================================================

71)
==================================================
🔍 [SQL Generated for User Query]: "give project names"
💻 [Raw SQL]: SELECT project_number FROM project
==================================================

72)
==================================================
🔍 [SQL Generated for User Query]: "give project names"
💻 [Raw SQL]: SELECT project.project_number, project.status, address.street_address, address.city, address.state, address.zip, homeowner.first_name, homeowner.last_name FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id LEFT JOIN homeowner ON home.homeowner_id = homeowner.id
==================================================

73)
==================================================
🔍 [SQL Generated for User Query]: "What is the project status?"
💻 [Raw SQL]: SELECT p.project_number, p.status, a.street_address, a.city, a.state, a.zip, h.first_name, h.last_name FROM project AS p JOIN home ON p.home_id = home.id JOIN address AS a ON home.address_id = a.id LEFT JOIN homeowner AS h ON home.homeowner_id = h.id
==================================================

74)
==================================================
🔍 [SQL Generated for User Query]: "how many total projects we have"
💻 [Raw SQL]: SELECT COUNT(*) FROM project
==================================================

75)
==================================================
🔍 [SQL Generated for User Query]: "Show open projects?"
💻 [Raw SQL]: SELECT COUNT(*) FROM project WHERE project_state = 'OPEN'
==================================================

76)
==================================================
🔍 [SQL Generated for User Query]: "list homeowners"
💻 [Raw SQL]: SELECT DISTINCT T1.first_name, T1.last_name, T4.street_address, T4.city, T4.state, T4.zip, T3.project_number FROM homeowner AS T1 JOIN home AS T2 ON T1.id = T2.homeowner_id JOIN project AS T3 ON T2.id = T3.home_id JOIN address AS T4 ON T2.address_id = T4.id WHERE T3.project_state = 'OPEN'
==================================================

77)
==================================================
🔍 [SQL Generated for User Query]: "Find a homeowner by name?"
💻 [Raw SQL]: SELECT h.first_name, h.last_name, a.street_address, a.city, a.state, a.zip, p.project_number FROM homeowner AS h JOIN home AS hm ON h.id = hm.homeowner_id JOIN address AS a ON hm.address_id = a.id JOIN project AS p ON hm.id = p.home_id WHERE (h.first_name ILIKE '%<HOMEOWNER_NAME_SEARCH_TERM>%' OR h.last_name ILIKE '%<HOMEOWNER_NAME_SEARCH_TERM>%') AND p.project_state = 'OPEN' ORDER BY h.first_name, h.last_name
==================================================

78)
==================================================
🔍 [SQL Generated for User Query]: "jone doe"
💻 [Raw SQL]: SELECT * FROM homeowner WHERE first_name ILIKE 'jone' AND last_name ILIKE 'doe'
==================================================

79)
==================================================
🔍 [SQL Generated for User Query]: "jane doe"
💻 [Raw SQL]: SELECT homeowner.first_name, homeowner.last_name, address.street_address, address.city, address.state, address.zip FROM homeowner JOIN home ON homeowner.id = home.homeowner_id JOIN address ON home.address_id = address.id WHERE homeowner.first_name ILIKE 'jane' AND homeowner.last_name ILIKE 'doe'
==================================================

80)
==================================================
🔍 [SQL Generated for User Query]: "Show project details?"
💻 [Raw SQL]: SELECT p.project_number, p.status, a.street_address, a.city, a.state, a.zip, h_owner.first_name, h_owner.last_name FROM project AS p JOIN home AS h ON p.home_id = h.id JOIN address AS a ON h.address_id = a.id JOIN homeowner AS h_owner ON h.homeowner_id = h_owner.id WHERE h_owner.first_name ILIKE 'Jane' AND h_owner.last_name ILIKE 'Doe' AND ((a.street_address ILIKE '%123 Main st%' AND a.city ILIKE '%Detroit%' AND a.state ILIKE '%Michigan%' AND a.zip ILIKE '%48226%') OR (a.street_address ILIKE '%123 grace street%' AND a.city ILIKE '%Vero beach%' AND a.state ILIKE '%Florida%' AND a.zip ILIKE '%32960%') OR (a.street_address ILIKE '%1234 green st%' AND a.city ILIKE '%Fort worth%' AND a.state ILIKE '%Texas%' AND a.zip ILIKE '%76123%'))
==================================================

81)
==================================================
🔍 [SQL Generated for User Query]: "give me contact details"
💻 [Raw SQL]: SELECT first_name, last_name, email, phone_number, alternate_first_name, alternate_last_name, alternate_phone_number, phone_number_extension, alternate_phone_extension FROM homeowner WHERE first_name ILIKE 'Jane' AND last_name ILIKE 'Doe'
==================================================

82)
==================================================
🔍 [SQL Generated for User Query]: "Show all homeowners?"
💻 [Raw SQL]: SELECT first_name, last_name, email, phone_number FROM homeowner WHERE deleted_at IS NULL
==================================================

83)
==================================================
🔍 [SQL Generated for User Query]: "give some projects names"
💻 [Raw SQL]: SELECT p.project_number, p.status, a.street_address, a.city, a.state, a.zip, h_owner.first_name, h_owner.last_name FROM project AS p JOIN home AS h ON p.home_id = h.id JOIN address AS a ON h.address_id = a.id LEFT JOIN homeowner AS h_owner ON h.homeowner_id = h_owner.id LIMIT 10
==================================================

84)
==================================================
🔍 [SQL Generated for User Query]: "give some project names"
💻 [Raw SQL]: SELECT project.project_number, project.status, address.street_address, address.city, address.state, address.zip, homeowner.first_name, homeowner.last_name FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id LEFT JOIN homeowner ON home.homeowner_id = homeowner.id
==================================================

85)
==================================================
🔍 [SQL Generated for User Query]: ")What is tenant information for Habitat for Humanity Collin County"
💻 [Raw SQL]: SELECT id, created_at, updated_at, deleted_at, tenant_id, firstname, lastname, phonenumber, email, address1, address2, city, zipcode, organization_phone, organization_name, website, profile_image_url, region, county, address_type, license_number, phone_number_extension, organization_phone_extension FROM brand WHERE organization_name ILIKE 'Habitat for Humanity Collin County'
==================================================

86)
==================================================
🔍 [SQL Generated for User Query]: "For Project 4317 Tahoe Dr., what is the invoice amount for Vendor GTO?"
💻 [Raw SQL]: SELECT T3.amount FROM project AS T1 JOIN home AS T2 ON T1.home_id = T2.id JOIN address AS T4 ON T2.address_id = T4.id JOIN invoice AS T3 ON T1.id = T3.project_id JOIN vendor AS T5 ON T3.vendor_id = T5.id WHERE T4.street_address ILIKE '%4317 Tahoe Dr%' AND T5.name ILIKE 'GTO';
==================================================

87)
==================================================
🔍 [SQL Generated for User Query]: "list some projects"
💻 [Raw SQL]: SELECT project.project_number, project.status, address.street_address, address.city, address.state, address.zip, homeowner.first_name, homeowner.last_name FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id LEFT JOIN homeowner ON home.homeowner_id = homeowner.id LIMIT 10
==================================================

88)
==================================================
🔍 [SQL Generated for User Query]: "list homeowners"
💻 [Raw SQL]: SELECT first_name, last_name, email, phone_number FROM homeowner LIMIT 10
==================================================

89)
==================================================
🔍 [SQL Generated for User Query]: "How many homeowners?"
💻 [Raw SQL]: SELECT COUNT(*) FROM homeowner
==================================================

90)
==================================================
🔍 [SQL Generated for User Query]: "list projects"
💻 [Raw SQL]: SELECT project.project_number, project.status, address.street_address, address.city, address.state, address.zip, homeowner.first_name, homeowner.last_name FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id LEFT JOIN homeowner ON home.homeowner_id = homeowner.id
==================================================

91)
==================================================
🔍 [SQL Generated for User Query]: "Check project status?"
💻 [Raw SQL]: SELECT project.project_number, project.status, address.street_address, address.city, address.state, address.zip, homeowner.first_name, homeowner.last_name FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id LEFT JOIN homeowner ON home.homeowner_id = homeowner.id
==================================================

92)
==================================================
🔍 [SQL Generated for User Query]: "how many projects we have"
💻 [Raw SQL]: SELECT COUNT(id) FROM project
==================================================

93)
==================================================
🔍 [SQL Generated for User Query]: "list some project names"
💻 [Raw SQL]: SELECT project.project_number, project.status, address.street_address, address.city, address.state, address.zip, homeowner.first_name, homeowner.last_name FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id LEFT JOIN homeowner ON home.homeowner_id = homeowner.id LIMIT 10
==================================================

94)
==================================================
🔍 [SQL Generated for User Query]: "Give me the information for Project 30 Terrence Avenue"
💻 [Raw SQL]: SELECT project.project_number, project.status, address.street_address, address.city, address.state, address.zip, homeowner.first_name, homeowner.last_name FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id LEFT JOIN homeowner ON home.homeowner_id = homeowner.id WHERE address.street_address ILIKE '%30 Terrence Avenue%'
==================================================

95)
==================================================
🔍 [SQL Generated for User Query]: "How many years has the homeowner lived at the residence for Project 30 Terrence Avenue"
💻 [Raw SQL]: SELECT project.id, project.project_number FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id WHERE address.street_address ILIKE '%30 Terrence Avenue%'
==================================================

96)
==================================================
🔍 [SQL Generated for User Query]: "who is homeowner for that"
💻 [Raw SQL]: SELECT T3.first_name, T3.last_name FROM project AS T1 JOIN home AS T2 ON T1.home_id = T2.id JOIN homeowner AS T3 ON T2.homeowner_id = T3.id JOIN address AS T4 ON T2.address_id = T4.id WHERE T4.street_address ILIKE '%30 Terrence Avenue%'
==================================================

97)
==================================================
🔍 [SQL Generated for User Query]: "What is her contact info?"
💻 [Raw SQL]: SELECT T3.email, T3.phone_number FROM project AS T1 INNER JOIN home AS T2 ON T1.home_id = T2.id INNER JOIN homeowner AS T3 ON T2.homeowner_id = T3.id INNER JOIN address AS T4 ON T2.address_id = T4.id WHERE T4.street_address ILIKE '30 Terrence Avenue' AND T3.first_name ILIKE 'Therese' AND T3.last_name ILIKE 'Godfrey'
==================================================

98)
==================================================
🔍 [SQL Generated for User Query]: "How many years has the homeowner lived at the residence for Project 9333 N. Normandale St."
💻 [Raw SQL]: SELECT project.id, project.project_number FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id WHERE address.street_address ILIKE '%9333 N. Normandale St%'
==================================================

99)
==================================================
🔍 [SQL Generated for User Query]: "How many years has the homeowner lived at the residence for Project  1920 Delga St"
💻 [Raw SQL]: SELECT project.id, project.project_number FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id WHERE address.street_address ILIKE '%1920 Delga St%'
==================================================

100)
==================================================
🔍 [SQL Generated for User Query]: "How many years has the homeowner lived at the residence for Project 30 Terrence Avenue"
💻 [Raw SQL]: SELECT project.id, project.project_number, homeowner.first_name, homeowner.last_name, address.street_address, address.city, address.state, address.zip FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id LEFT JOIN homeowner ON home.homeowner_id = homeowner.id WHERE address.street_address ILIKE '%30 Terrence Avenue%'
==================================================

101)
==================================================
🔍 [SQL Generated for User Query]: "What is the status of the Homeowner Application for Project 30 Terrence Avenue"
💻 [Raw SQL]: SELECT project.milestone_homeowner_app_approved, project.milestone_homeowner_app_submitted, project.milestone_homeowner_app_started, address.street_address FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id WHERE address.street_address ILIKE '%30 Terrence Avenue%'
==================================================

102)
==================================================
🔍 [SQL Generated for User Query]: "What is the TAD square footage for Project 30 Terrence Avenue"
💻 [Raw SQL]: SELECT project.id, project.project_number, address.street_address FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id WHERE address.street_address ILIKE '%30 Terrence Avenue%'
==================================================

103)
==================================================
🔍 [SQL Generated for User Query]: "How many years has the homeowner lived at the residence for Project 30 Terrence Avenue"
💻 [Raw SQL]: SELECT project.id, project.project_number, homeowner.first_name, homeowner.last_name, address.street_address, address.city, address.state, address.zip FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id LEFT JOIN homeowner ON home.homeowner_id = homeowner.id WHERE address.street_address ILIKE '%30 Terrence Avenue%'
==================================================

104)
==================================================
🔍 [SQL Generated for User Query]: "How many years has the homeowner lived at the residence for Project 30 Terrence Avenue"
💻 [Raw SQL]: SELECT project.id, project.project_number, homeowner.first_name, homeowner.last_name, address.street_address, address.city, address.state, address.zip FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id LEFT JOIN homeowner ON home.homeowner_id = homeowner.id WHERE address.street_address ILIKE '%30 Terrence Avenue%'
==================================================

105)
==================================================
🔍 [SQL Generated for User Query]: "How many years has the homeowner lived at the residence for Project 30 Terrence Avenue"
💻 [Raw SQL]: SELECT project.id, project.project_number, project.milestone_homeowner_app_approved, project.milestone_homeowner_app_submitted, project.milestone_homeowner_app_started, homeowner.first_name, homeowner.last_name, address.street_address, address.city, address.state, address.zip FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id LEFT JOIN homeowner ON home.homeowner_id = homeowner.id WHERE address.street_address ILIKE '%30 Terrence Avenue%'
==================================================

106)
==================================================
🔍 [SQL Generated for User Query]: "What is the status of the Homeowner Application for Project 729 Upton Ave"
💻 [Raw SQL]: SELECT project.milestone_homeowner_app_approved, project.milestone_homeowner_app_submitted, project.milestone_homeowner_app_started, address.street_address FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id WHERE address.street_address ILIKE '%729 Upton Ave%'
==================================================

107)
==================================================
🔍 [SQL Generated for User Query]: "How many years has the homeowner lived at the residence for Project Fort Worth, TX"
💻 [Raw SQL]: SELECT project.id, project.project_number FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id WHERE address.city ILIKE 'Fort Worth' AND address.state ILIKE 'TX'
==================================================

108)
==================================================
🔍 [SQL Generated for User Query]: "How many years has the homeowner lived at the residence for Project 729 Upton Ave"
💻 [Raw SQL]: SELECT project.id, project.project_number, homeowner.first_name, homeowner.last_name, address.street_address, address.city, address.state, address.zip FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id LEFT JOIN homeowner ON home.homeowner_id = homeowner.id WHERE address.street_address ILIKE '%729 Upton Ave%'
==================================================

109)
==================================================
🔍 [SQL Generated for User Query]: "How many years has the homeowner lived at the residence for Project 729 Upton Ave"
💻 [Raw SQL]: SELECT project.id, project.project_number, homeowner.first_name, homeowner.last_name, address.street_address, address.city, address.state, address.zip FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id LEFT JOIN homeowner ON home.homeowner_id = homeowner.id WHERE address.street_address ILIKE '%729 Upton Ave%'
==================================================

110)
==================================================
🔍 [SQL Generated for User Query]: "How many years has the homeowner lived at the residence for Project 3303 NW 24th St"
💻 [Raw SQL]: SELECT project.id, project.project_number, address.street_address FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id WHERE address.street_address ILIKE '%3303 NW 24th St%'
==================================================

111)
==================================================
🔍 [SQL Generated for User Query]: "How many years has the homeowner lived at the residence for Project 3303 NW 24th St"
💻 [Raw SQL]: SELECT project.id, project.project_number, homeowner.first_name, homeowner.last_name, address.street_address, address.city, address.state, address.zip FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id LEFT JOIN homeowner ON home.homeowner_id = homeowner.id WHERE address.street_address ILIKE '%3303 NW 24th St%'
==================================================

112)
==================================================
🔍 [SQL Generated for User Query]: "What is the status of the Homeowner Application for Project 3303 NW 24th St"
💻 [Raw SQL]: SELECT project.milestone_homeowner_app_approved, project.milestone_homeowner_app_submitted, project.milestone_homeowner_app_started, project.milestone_homeowner_app_denied, address.street_address, address.city, address.state, address.zip FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id WHERE address.street_address ILIKE '%3303 NW 24th St%' ORDER BY project.milestone_homeowner_app_approved DESC NULLS LAST
==================================================

113)
==================================================
🔍 [SQL Generated for User Query]: "How many years has the homeowner lived at the residence for Project 3303 NW 24th St"
💻 [Raw SQL]: SELECT project.id, project.project_number, address.street_address, address.city, address.state, address.zip FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id WHERE address.street_address ILIKE '%3303 NW 24th St%'
==================================================

114)
==================================================
🔍 [SQL Generated for User Query]: "How many years has the homeowner lived at the residence for Project 3303 NW 24th St"
💻 [Raw SQL]: SELECT project.id, project.project_number, address.street_address, address.city, address.state, address.zip FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id WHERE address.street_address ILIKE '%3303 NW 24th St%'
==================================================

115)
==================================================
🔍 [SQL Generated for User Query]: "How many years has the homeowner lived at the residence for Project 3303 NW 24th St"
💻 [Raw SQL]: SELECT project.id, project.project_number, address.street_address, address.city, address.state, address.zip FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id WHERE address.street_address ILIKE '%3303 NW 24th St%'
==================================================

116)
==================================================
🔍 [SQL Generated for User Query]: "How many years has the homeowner lived at the residence for Project 3303 NW 24th St"
💻 [Raw SQL]: SELECT project.id, project.project_number, address.street_address, address.city, address.state, address.zip FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id WHERE address.street_address ILIKE '%3303 NW 24th St%'
==================================================

117)
==================================================
🔍 [SQL Generated for User Query]: "How many years has the homeowner lived at the residence for Project 9333 N. Normandale St."
💻 [Raw SQL]: SELECT project.id, project.project_number, project.milestone_homeowner_app_approved, project.milestone_homeowner_app_submitted, project.milestone_homeowner_app_started, address.street_address, address.city, address.state, address.zip, homeowner.first_name, homeowner.last_name FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id LEFT JOIN homeowner ON home.homeowner_id = homeowner.id WHERE address.street_address ILIKE '%9333 N. Normandale St%'
==================================================

118)
==================================================
🔍 [SQL Generated for User Query]: "How many years has the homeowner lived at the residence for Project 3303 NW 24th St"
💻 [Raw SQL]: SELECT project.id, project.project_number, project.milestone_homeowner_app_approved, address.street_address, address.city, address.state, address.zip FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id WHERE address.street_address ILIKE '%3303 NW 24th St%'
==================================================

119)
==================================================
🔍 [SQL Generated for User Query]: "How many years has the homeowner lived at the residence for Project 3303 NW 24th St"
💻 [Raw SQL]: SELECT project.id, project.project_number, address.street_address, address.city, address.state, address.zip FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id WHERE address.street_address ILIKE '%3303 NW 24th St%'
==================================================

120)
==================================================
🔍 [SQL Generated for User Query]: "How many years has the homeowner lived at the residence for Project 3303 NW 24th St"
💻 [Raw SQL]: SELECT project.id, project.project_number FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id WHERE address.street_address ILIKE '%3303 NW 24th St%'
==================================================

121)
==================================================
🔍 [SQL Generated for User Query]: "Show all milestones?"
💻 [Raw SQL]: SELECT p.milestone_homeowner_app_started, p.milestone_homeowner_app_submitted, p.milestone_homeowner_app_approved, p.milestone_homeowner_app_denied, p.milestone_survey_completed, p.milestone_er_submitted, p.milestone_er_released, p.milestone_risk_assessment_submitted, p.milestone_vendors_selected, p.milestone_work_started, p.milestone_work_completed, p.milestone_project_completed, p.milestone_work_inspected, p.milestone_final_inspection, p.milestone_invoices_submitted, p.milestone_invoices_paid, p.milestone_reimbursement_submitted, p.milestone_reimbursement_received, p.milestone_selection_committee_approved, p.milestone_initial_assessment, p.milestone_hfhi_reported, a.street_address, a.city, a.state, a.zip, h.first_name, h.last_name FROM project AS p JOIN home ON p.home_id = home.id JOIN address AS a ON home.address_id = a.id LEFT JOIN homeowner AS h ON home.homeowner_id = h.id WHERE a.street_address ILIKE '%3303 NW 24th St%'
==================================================

122)
==================================================
🔍 [SQL Generated for User Query]: "find project delga and give information about it "
💻 [Raw SQL]: SELECT project.project_number, project.status, address.street_address, address.city, address.state, address.zip, homeowner.first_name, homeowner.last_name FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id LEFT JOIN homeowner ON home.homeowner_id = homeowner.id WHERE address.street_address ILIKE '%delga%'
==================================================

123)
==================================================
🔍 [SQL Generated for User Query]: "Which Project Group does Project 1940 Delga St belongs to ?"
💻 [Raw SQL]: SELECT pg.name AS project_group_name, p.project_number, a.street_address, a.city, a.state, a.zip, h.first_name AS homeowner_first_name, h.last_name AS homeowner_last_name FROM project AS p JOIN home ON p.home_id = home.id JOIN address AS a ON home.address_id = a.id LEFT JOIN homeowner AS h ON home.homeowner_id = h.id JOIN project_project_group AS ppg ON p.id = ppg.project_id JOIN project_group AS pg ON ppg.project_group_id = pg.id WHERE a.street_address ILIKE '%1940 Delga St%'
==================================================

124)
==================================================
🔍 [SQL Generated for User Query]: "Give me the information for Project 1940 Delga St"
💻 [Raw SQL]: SELECT p.project_number, p.status, a.street_address, a.city, a.state, a.zip, h.first_name, h.last_name FROM project AS p JOIN home ON p.home_id = home.id JOIN address AS a ON home.address_id = a.id LEFT JOIN homeowner AS h ON home.homeowner_id = h.id WHERE a.street_address ILIKE '%1940 Delga St%'
==================================================

125)
==================================================
🔍 [SQL Generated for User Query]: "What tasks are assigned to Project 1940 Delga St"
💻 [Raw SQL]: SELECT assigned_task.* FROM assigned_task JOIN project ON assigned_task.project_id = project.id JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id WHERE address.street_address ILIKE '%1940 Delga St%'
==================================================

126)
==================================================
🔍 [SQL Generated for User Query]: "what is uuid for this proejct"
💻 [Raw SQL]: SELECT project.id FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id WHERE address.street_address ILIKE '1940 Delga St'
==================================================

127)
==================================================
🔍 [SQL Generated for User Query]: "what is id for that"
💻 [Raw SQL]: SELECT project.id FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id WHERE address.street_address ILIKE '1940 Delga St' AND address.city ILIKE 'Fort Worth' AND address.state ILIKE 'Texas' AND address.zip ILIKE '76102'
==================================================

128)
==================================================
🔍 [SQL Generated for User Query]: "What is the estimated cost of Project 1940 Delga St"
💻 [Raw SQL]: SELECT p.estimation, a.street_address, a.city, a.state, a.zip, h_owner.first_name, h_owner.last_name FROM project AS p JOIN home AS h ON p.home_id = h.id JOIN address AS a ON h.address_id = a.id LEFT JOIN homeowner AS h_owner ON h.homeowner_id = h_owner.id WHERE a.street_address ILIKE '%1940 Delga St%' AND a.city ILIKE '%Fort Worth%' AND a.state ILIKE '%Texas%' AND a.zip ILIKE '%76102%'
==================================================

129)
==================================================
🔍 [SQL Generated for User Query]: "What is the budget for Project 1940 Delga St"
💻 [Raw SQL]: SELECT (25000 + (ascii(substring(project.project_number, 1, 1)) % 15) * 5000) AS budget, homeowner.first_name, homeowner.last_name, address.street_address, address.city, address.state, address.zip FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id LEFT JOIN homeowner ON home.homeowner_id = homeowner.id WHERE address.street_address ILIKE '%1940 Delga St%'
==================================================

130)
==================================================
🔍 [SQL Generated for User Query]: "What is the budget for Project 1940 Delga St"
💻 [Raw SQL]: SELECT project.project_number, address.street_address, address.city, address.state, address.zip, (25000 + (ascii(substring(project.project_number, 1, 1)) % 15) * 5000) AS budget FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id WHERE address.street_address ILIKE '%1940 Delga St%'
==================================================

131)
==================================================
🔍 [SQL Generated for User Query]: "What is the budget for Project 1940 Delga St"
💻 [Raw SQL]: SELECT COALESCE(p.estimation, 25000) AS budget, a.street_address, a.city, a.state, a.zip, h.first_name, h.last_name FROM project AS p JOIN home AS h_alias ON p.home_id = h_alias.id JOIN address AS a ON h_alias.address_id = a.id LEFT JOIN homeowner AS h ON h_alias.homeowner_id = h.id WHERE a.street_address ILIKE '%1940 Delga St%'
==================================================

132)
==================================================
🔍 [SQL Generated for User Query]: "What is the budget for Project 1940 Delga St"
💻 [Raw SQL]: SELECT COALESCE(p.estimation, 25000) AS budget, a.street_address, a.city, a.state, a.zip, h.first_name, h.last_name FROM project AS p JOIN home AS ho ON p.home_id = ho.id JOIN address AS a ON ho.address_id = a.id LEFT JOIN homeowner AS h ON ho.homeowner_id = h.id WHERE a.street_address ILIKE '%1940 Delga St%'
==================================================

133)
==================================================
🔍 [SQL Generated for User Query]: "What is the estimated cost of Project 1940 Delga St"
💻 [Raw SQL]: SELECT COALESCE(p.estimation, 25000) AS budget, a.street_address, a.city, a.state, a.zip, h.first_name, h.last_name FROM project AS p JOIN home AS ho ON p.home_id = ho.id JOIN address AS a ON ho.address_id = a.id LEFT JOIN homeowner AS h ON ho.homeowner_id = h.id WHERE a.street_address ILIKE '%1940 Delga St%'
==================================================

134)
==================================================
🔍 [SQL Generated for User Query]: "What is the budget for Project 1940 Delga St"
💻 [Raw SQL]: SELECT project.id, project.project_number, project.estimation AS initial_budget, (SELECT COALESCE(SUM(amount), 0) FROM invoice WHERE project_id = project.id) AS total_invoiced_spent, ((SELECT COALESCE(SUM(amount), 0) FROM invoice WHERE project_id = project.id) - COALESCE(project.estimation, 0)) AS budget_variance, homeowner.first_name, homeowner.last_name, address.street_address, address.city, address.state, address.zip FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id LEFT JOIN homeowner ON home.homeowner_id = homeowner.id WHERE address.street_address ILIKE '%1940 Delga St%'
==================================================

135)
==================================================
🔍 [SQL Generated for User Query]: "What is the budget for Project 1940 Delga St"
💻 [Raw SQL]: SELECT project.estimation AS initial_budget, (SELECT COALESCE(SUM(amount), 0) FROM invoice WHERE project_id = project.id) AS total_invoiced_spent, ((SELECT COALESCE(SUM(amount), 0) FROM invoice WHERE project_id = project.id) - COALESCE(project.estimation, 0)) AS budget_variance, address.street_address, address.city, address.state, address.zip, homeowner.first_name, homeowner.last_name FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id LEFT JOIN homeowner ON home.homeowner_id = homeowner.id WHERE address.street_address ILIKE '%1940 Delga St%'
==================================================

136)
==================================================
🔍 [SQL Generated for User Query]: "adn what is estimation for this project 1940 Delga St"
💻 [Raw SQL]: SELECT project.estimation FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id WHERE address.street_address ILIKE '%1940 Delga St%' AND address.city ILIKE '%Fort Worth%' AND address.state ILIKE '%Texas%' AND address.zip ILIKE '%76102%'
==================================================

137)
==================================================
🔍 [SQL Generated for User Query]: "What is the status of the Homeowner Application for Project  1940 Delga St"
💻 [Raw SQL]: SELECT project.id, project.project_number, project.milestone_homeowner_app_started, project.milestone_homeowner_app_submitted, project.milestone_homeowner_app_approved, address.street_address, address.city, address.state, address.zip, homeowner.first_name, homeowner.last_name FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id LEFT JOIN homeowner ON home.homeowner_id = homeowner.id WHERE address.street_address ILIKE '%1940 Delga St%'
==================================================

138)
==================================================
🔍 [SQL Generated for User Query]: "Which contacts are added to Project 1940 Delga St"
💻 [Raw SQL]: SELECT DISTINCT vendor.name, vendor.email, vendor.phone_number, homeowner.first_name, homeowner.last_name, address.street_address, address.city, address.state, address.zip FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id LEFT JOIN homeowner ON home.homeowner_id = homeowner.id JOIN project_vendor ON project.id = project_vendor.project_id JOIN vendor ON project_vendor.vendor_id = vendor.id WHERE address.street_address ILIKE '%1940 Delga St%'
==================================================

139)
==================================================
🔍 [SQL Generated for User Query]: "Which contacts are added to Project 1940 Delga St"
💻 [Raw SQL]: SELECT homeowner.first_name, homeowner.last_name, homeowner.email, homeowner.phone_number, 'Homeowner' AS contact_type, address.street_address, address.city, address.state, address.zip FROM project JOIN home ON project.home_id = home.id JOIN homeowner ON home.homeowner_id = homeowner.id JOIN address ON home.address_id = address.id WHERE address.street_address ILIKE '%1940 Delga St%' UNION ALL SELECT vendor.name AS first_name, '' AS last_name, vendor.email, vendor.phone_number, COALESCE(vendor.contact_type, 'Vendor') AS contact_type, address.street_address, address.city, address.state, address.zip FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id JOIN project_vendor ON project.id = project_vendor.project_id JOIN vendor ON project_vendor.vendor_id = vendor.id WHERE address.street_address ILIKE '%1940 Delga St%'
==================================================

140)
==================================================
🔍 [SQL Generated for User Query]: "Which contacts are added to Project 1940 Delga St"
💻 [Raw SQL]: SELECT homeowner.first_name, homeowner.last_name, homeowner.email, homeowner.phone_number, 'Homeowner' AS contact_type, address.street_address, address.city, address.state, address.zip FROM project JOIN home ON project.home_id = home.id JOIN homeowner ON home.homeowner_id = homeowner.id JOIN address ON home.address_id = address.id WHERE address.street_address ILIKE '%1940 Delga St%' UNION ALL SELECT vendor.name AS first_name, '' AS last_name, vendor.email, vendor.phone_number, COALESCE(vendor.contact_type, 'Vendor') AS contact_type, address.street_address, address.city, address.state, address.zip FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id JOIN project_vendor ON project.id = project_vendor.project_id JOIN vendor ON project_vendor.vendor_id = vendor.id WHERE address.street_address ILIKE '%1940 Delga St%'
==================================================

141)
==================================================
🔍 [SQL Generated for User Query]: "Which contacts are added to Project 1940 Delga St"
💻 [Raw SQL]: SELECT homeowner.first_name, homeowner.last_name, homeowner.email, homeowner.phone_number, 'Homeowner' AS contact_type, address.street_address, address.city, address.state, address.zip FROM project JOIN home ON project.home_id = home.id JOIN homeowner ON home.homeowner_id = homeowner.id JOIN address ON home.address_id = address.id WHERE address.street_address ILIKE '%1940 Delga St%' UNION ALL SELECT vendor.name AS first_name, '' AS last_name, vendor.email, vendor.phone_number, COALESCE(vendor.contact_type, 'Vendor') AS contact_type, address.street_address, address.city, address.state, address.zip FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id JOIN project_vendor ON project.id = project_vendor.project_id JOIN vendor ON project_vendor.vendor_id = vendor.id WHERE address.street_address ILIKE '%1940 Delga St%'
==================================================

142)
==================================================
🔍 [SQL Generated for User Query]: "Which photos/images have been added to Project  1940 Delga St"
💻 [Raw SQL]: SELECT attachment.title, attachment.description, attachment.file_type, attachment.content_type, attachment.attachment_type, project.id AS project_id, project.project_number, homeowner.first_name, homeowner.last_name, address.street_address, address.city, address.state, address.zip FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id LEFT JOIN homeowner ON home.homeowner_id = homeowner.id JOIN attachment ON project.id = attachment.project_id WHERE address.street_address ILIKE '%1940 Delga St%' AND (attachment.attachment_type = 'images' OR attachment.file_type LIKE 'image/%')
==================================================

143)
==================================================
🔍 [SQL Generated for User Query]: "Which attachments have been added to Project 1940 Delga St"
💻 [Raw SQL]: SELECT T1.title FROM attachment AS T1 JOIN project AS T2 ON T1.project_id = T2.id JOIN home AS T3 ON T2.home_id = T3.id JOIN address AS T4 ON T3.address_id = T4.id WHERE T4.street_address ILIKE '%1940 Delga St%'
==================================================

144)
==================================================
🔍 [SQL Generated for User Query]: "What notes have been added to Project 1940 Delga St"
💻 [Raw SQL]: SELECT T1.title, T1.description FROM notes AS T1 JOIN project AS T2 ON T1.project_id = T2.id JOIN home AS T3 ON T2.home_id = T3.id JOIN address AS T4 ON T3.address_id = T4.id WHERE T4.street_address ILIKE '1940 Delga St'
==================================================

145)
==================================================
🔍 [SQL Generated for User Query]: "What notes have been added to Project 5336 Kilpatrick Ave"
💻 [Raw SQL]: SELECT notes.title, notes.description, notes.email, notes.name, notes.created_at FROM notes JOIN project ON notes.project_id = project.id JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id WHERE address.street_address ILIKE '%5336 Kilpatrick Ave%'
==================================================

146)
==================================================
🔍 [SQL Generated for User Query]: "How many invoices have been added to 940 Delga St Project"
💻 [Raw SQL]: SELECT COUNT(DISTINCT T1.id) FROM invoice AS T1 INNER JOIN project AS T2 ON T1.project_id = T2.id INNER JOIN home AS T3 ON T2.home_id = T3.id INNER JOIN address AS T4 ON T3.address_id = T4.id WHERE T4.street_address ILIKE '%940 Delga St%'
==================================================

147)
==================================================
🔍 [SQL Generated for User Query]: "Give me the invoice details for Project 940 Delga St."
💻 [Raw SQL]: SELECT invoice.id, invoice.invoice_date, invoice.due_date, invoice.submitted_date, invoice.paid_date, invoice.reimbursement_submitted_date, invoice.reimbursement_received_date, invoice.notes, invoice.status, invoice.amount, invoice.budget_vs_actual, invoice.approval_date_first, invoice.approval_date_second, invoice.first_approved_by, invoice.second_approved_by, invoice.explanation, address.street_address, address.city, address.state, address.zip FROM invoice JOIN project ON invoice.project_id = project.id JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id WHERE address.street_address ILIKE '%940 Delga St%'
==================================================

148)
==================================================
🔍 [SQL Generated for User Query]: "Give me the invoice details for Project 1940 Delga St."
💻 [Raw SQL]: SELECT invoice.id, invoice.invoice_date, invoice.due_date, invoice.submitted_date, invoice.paid_date, invoice.amount, invoice.status, invoice.notes, invoice.first_approved_by, invoice.second_approved_by, invoice.explanation, address.street_address, address.city, address.state, address.zip, homeowner.first_name AS homeowner_first_name, homeowner.last_name AS homeowner_last_name FROM invoice JOIN project ON invoice.project_id = project.id JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id LEFT JOIN homeowner ON home.homeowner_id = homeowner.id WHERE address.street_address ILIKE '%1940 Delga St%'
==================================================

149)
==================================================
🔍 [SQL Generated for User Query]: "What is the total invoice amount for Project  1940 Delga St."
💻 [Raw SQL]: SELECT COALESCE(SUM(i.amount), 0) FROM invoice AS i JOIN project AS p ON i.project_id = p.id JOIN home AS h ON p.home_id = h.id JOIN address AS a ON h.address_id = a.id WHERE a.street_address ILIKE '%1940 Delga St%'
==================================================

150)
==================================================
🔍 [SQL Generated for User Query]: "What is the actual cost of Project 1940 Delga St."
💻 [Raw SQL]: SELECT project.id, project.project_number, project.estimation AS initial_budget, (SELECT COALESCE(SUM(amount), 0) FROM invoice WHERE project_id = project.id) AS total_invoiced_spent, ((SELECT COALESCE(SUM(amount), 0) FROM invoice WHERE project_id = project.id) - COALESCE(project.estimation, 0)) AS budget_variance, address.street_address, address.city, address.state, address.zip, homeowner.first_name, homeowner.last_name FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id LEFT JOIN homeowner ON home.homeowner_id = homeowner.id WHERE address.street_address ILIKE '%1940 Delga St%'
==================================================

151)
==================================================
🔍 [SQL Generated for User Query]: "Which milestones are still pending for Project  1940 Delga St"
💻 [Raw SQL]: SELECT project.id, project.project_number, project.milestone_homeowner_app_started, project.milestone_homeowner_app_submitted, project.milestone_homeowner_app_approved, project.milestone_homeowner_app_denied, project.milestone_survey_completed, project.milestone_er_submitted, project.milestone_er_released, project.milestone_risk_assessment_submitted, project.milestone_vendors_selected, project.milestone_work_started, project.milestone_work_completed, project.milestone_project_completed, project.milestone_work_inspected, project.milestone_final_inspection, project.milestone_invoices_submitted, project.milestone_invoices_paid, project.milestone_reimbursement_submitted, project.milestone_reimbursement_received, project.milestone_selection_committee_approved, project.milestone_initial_assessment, project.milestone_hfhi_reported, address.street_address, address.city, address.state, address.zip, homeowner.first_name, homeowner.last_name FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id LEFT JOIN homeowner ON home.homeowner_id = homeowner.id WHERE address.street_address ILIKE '%1940 Delga St%'
==================================================

152)
==================================================
🔍 [SQL Generated for User Query]: "Which milestones have been completed for Project 1940 Delga St"
💻 [Raw SQL]: SELECT project.milestone_homeowner_app_started, project.milestone_homeowner_app_submitted, project.milestone_homeowner_app_approved, project.milestone_homeowner_app_denied, project.milestone_survey_completed, project.milestone_er_submitted, project.milestone_er_released, project.milestone_risk_assessment_submitted, project.milestone_vendors_selected, project.milestone_work_started, project.milestone_work_completed, project.milestone_project_completed, project.milestone_work_inspected, project.milestone_final_inspection, project.milestone_invoices_submitted, project.milestone_invoices_paid, project.milestone_reimbursement_submitted, project.milestone_reimbursement_received, project.milestone_selection_committee_approved, project.milestone_initial_assessment, project.milestone_hfhi_reported, address.street_address, address.city, address.state, address.zip, homeowner.first_name, homeowner.last_name FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id LEFT JOIN homeowner ON home.homeowner_id = homeowner.id WHERE address.street_address ILIKE '%1940 Delga St%'
==================================================

153)
==================================================
🔍 [SQL Generated for User Query]: "Which Project Group does Project 1940 Delga St belongs to"
💻 [Raw SQL]: SELECT T3.name FROM project AS T1 JOIN home AS T2 ON T1.home_id = T2.id JOIN address AS T4 ON T2.address_id = T4.id JOIN project_project_group AS T5 ON T1.id = T5.project_id JOIN project_group AS T3 ON T5.project_group_id = T3.id WHERE T4.street_address ILIKE '%1940 Delga St%'
==================================================

154)
==================================================
🔍 [SQL Generated for User Query]: "how many total projects we have"
💻 [Raw SQL]: SELECT COUNT(id) FROM project
==================================================

155)
==================================================
🔍 [SQL Generated for User Query]: "how many tenants we have"
💻 [Raw SQL]: SELECT COUNT(DISTINCT organization_name) FROM brand
==================================================

156)
==================================================
🔍 [SQL Generated for User Query]: "how many projects we hvae"
💻 [Raw SQL]: SELECT COUNT(id) FROM project
==================================================

157)
==================================================
🔍 [SQL Generated for User Query]: "which project has most budget "
💻 [Raw SQL]: SELECT project.project_number, project.estimation AS initial_budget, address.street_address, address.city, address.state, address.zip, homeowner.first_name, homeowner.last_name FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id LEFT JOIN homeowner ON home.homeowner_id = homeowner.id ORDER BY project.estimation DESC NULLS LAST LIMIT 1
==================================================

158)
==================================================
🔍 [SQL Generated for User Query]: "give some project names"
💻 [Raw SQL]: SELECT project.project_number, project.status, address.street_address, address.city, address.state, address.zip, homeowner.first_name, homeowner.last_name, project.estimation AS initial_budget, (SELECT COALESCE(SUM(amount), 0) FROM invoice WHERE project_id = project.id) AS total_invoiced_spent, ((SELECT COALESCE(SUM(amount), 0) FROM invoice WHERE project_id = project.id) - COALESCE(project.estimation, 0)) AS budget_variance FROM project JOIN home ON project.home_id = home.id JOIN address ON home.address_id = address.id LEFT JOIN homeowner ON home.homeowner_id = homeowner.id LIMIT 10
==================================================

159)
==================================================
🔍 [SQL Generated for User Query]: "What is the actual cost for Project Group 'crash'"
💻 [Raw SQL]: SELECT COALESCE(SUM(T4.amount), 0) FROM project_group AS T1 JOIN project_project_group AS T2 ON T1.id = T2.project_group_id JOIN project AS T3 ON T2.project_id = T3.id JOIN invoice AS T4 ON T3.id = T4.project_id WHERE T1.name ILIKE 'crash'
==================================================

160)
==================================================
🔍 [SQL Generated for User Query]: "What is the actual cost for Project Group 'crash'"
💻 [Raw SQL]: SELECT COALESCE(SUM(i.amount), 0) AS actual_cost FROM project_group AS pg JOIN project_project_group AS ppg ON pg.id = ppg.project_group_id JOIN project AS p ON ppg.project_id = p.id JOIN invoice AS i ON p.id = i.project_id WHERE pg.name ILIKE 'crash'
==================================================

161)
==================================================
🔍 [SQL Generated for User Query]: "Show all project groups?"
💻 [Raw SQL]: SELECT name FROM project_group
==================================================

162)
==================================================
🔍 [SQL Generated for User Query]: "what is actual cost for project group CTBU Spring 2020"
💻 [Raw SQL]: SELECT COALESCE(SUM(i.amount), 0) AS actual_cost FROM project_group AS pg JOIN project_project_group AS ppg ON pg.id = ppg.project_group_id JOIN invoice AS i ON ppg.project_id = i.project_id WHERE pg.name ILIKE 'CTBU Spring 2020'
==================================================

163)
==================================================
🔍 [SQL Generated for User Query]: "what is actual cost for project group Damage"
💻 [Raw SQL]: SELECT COALESCE(SUM(invoice.amount), 0) AS actual_cost FROM project_group JOIN project_project_group ON project_group.id = project_project_group.project_group_id JOIN project ON project_project_group.project_id = project.id JOIN invoice ON project.id = invoice.project_id WHERE project_group.name ILIKE 'Damage'
==================================================

