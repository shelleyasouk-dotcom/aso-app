# ASO Coaching App — Director Guide
### For Naima

---

## Getting Started

The ASO app lives at your website URL. It works best when saved to your phone's home screen — it feels and behaves like a normal app from there.

**To install on iPhone:**
1. Open the app in Safari
2. Tap the Share button (box with arrow pointing up)
3. Tap **Add to Home Screen**
4. Tap **Add**

**To install on Android:**
1. Open the app in Chrome
2. Tap the three dots menu
3. Tap **Add to Home Screen**

---

## Your Role as Director

You have full access to everything in the app. You can:
- Add and manage all staff accounts
- Manage all schools
- View every timesheet across all areas
- Approve and reject expense claims
- Post announcements to everyone or specific areas
- Upload documents and policies
- View every coach's digital ID and certificates

Your home screen shows an **Admin Panel** tile — that's your control centre.

---

## How to Add a New Staff Member

There are two ways: one at a time, or in bulk.

### Adding One Person

1. Tap **Admin Panel** on the home screen
2. Tap **Staff**
3. Tap **Add Staff Member** at the top
4. Fill in:
   - **Full Name** — as it should appear on their ID card
   - **Email** — this is their login username
   - **Temporary Password** — give them something simple like their first name + a number
   - **Role** — see role guide below
5. Tap **Create Account**
6. Their account is live immediately — send them the app link and their login details

### Adding Many Staff at Once (Bulk Import)

1. Tap **Admin Panel → Bulk Import**
2. Tap **Staff** tab
3. Tap **Download staff template** — this gives you a spreadsheet template
4. Fill in the spreadsheet with one person per row:

| Full Name | Email | Role | Password |
|-----------|-------|------|----------|
| Sarah Jones | sarah@example.com | lead_coach | Password |
| Tom Ahmed | tom@example.com | assistant_coach | Password |

5. Save as a CSV file
6. Upload it in the app
7. All accounts are created in one go

> **Tip:** Use the same password for everyone during setup — they can change it themselves later via **My Profile → Change Password**

---

## Staff Roles Explained

| Role | What they can do |
|------|-----------------|
| **Director** | Everything |
| **Area Lead** | Manage their area's schools, coaches, timesheets, announcements, expenses |
| **Lead Coach** | Clock in/out, take session registers, manage awards |
| **Assistant Coach** | Clock in/out, take registers |
| **Junior Coach** | Clock in/out only |

---

## Setting Up Area Leads

Area Leads are responsible for Hampshire, Wiltshire, Dorset, Bath and North East Somerset, and Oxfordshire.

**To assign someone as an Area Lead:**

1. Go to **Admin Panel → Staff**
2. Find the person and tap **Edit**
3. Change their Role to **Area Lead**
4. An **Area** dropdown appears — select their area
5. Tap **Save Changes**

They will now automatically see their area's schools and coaches when they log in.

**To give an Area Lead (or any admin) flexible clock-in access:**

1. Go to their staff profile and tap **Edit**
2. Toggle on **Can clock in anywhere**
3. This lets them clock in at any school or enter a custom location

---

## Assigning Coaches to Schools

After creating staff accounts you need to link coaches to their schools. This controls which schools appear when they clock in.

1. Go to **Admin Panel → Staff**
2. Find the coach and tap **Schools**
3. A panel appears with all schools grouped by area
4. Tick every school they work at
5. Tap **Save**

---

## Managing Schools

1. Go to **Admin Panel → Schools** (Director only)
2. Tap **Add School** to add a new location
3. Fill in name, address, area, session day and time
4. To edit an existing school, find it in the list and tap the **pencil icon**

---

## Posting Announcements

Use this for important updates, policy changes, reminders, or anything staff need to know.

1. Go to **Admin Panel → Announcements**
2. Tap **New Announcement**
3. Add a title and your message
4. Optional: add a link (e.g. to a document or form)
5. **Audience:** choose All Staff or a specific area
6. Toggle **Pin** to keep it at the top of everyone's home screen
7. Tap **Post**

Coaches see announcements on their home screen as soon as they open the app.

---

## Uploading Documents

Use this for the staff handbook, safeguarding policies, forms, training materials — anything staff should have access to.

1. Go to **Admin Panel → Documents** (or tap the Documents tile on the home screen)
2. Tap **Upload Document**
3. Give it a clear title, choose a category, and attach the file
4. Tap **Upload**

All staff can download documents. Only Directors and Area Leads can upload or delete them.

---

## Viewing and Editing Timesheets

1. Tap **Timesheets** from the home screen
2. You can see all clock records across all staff
3. Filter by staff member using the dropdown
4. To fix a mistake: tap the **pencil icon** on any record to edit the time or school
5. To delete a record: tap the **bin icon**
6. To add a missing record (if someone forgot to clock in): tap **Add Missing Clock Record** at the top

---

## Approving Expenses

1. Go to **Admin Panel → Expenses**
2. You'll see a summary of how many expenses are waiting and the total value
3. Tap any expense to expand it
4. Add an optional note and tap **Approve** or **Reject**
5. Staff can see the decision and any note you leave on their Expenses page

---

## Viewing a Coach's Profile and ID Card

1. Go to **Admin Panel → Staff**
2. Find the coach and tap **Profile**
3. You can see their digital ID card, DBS number, expiry dates, and certificates
4. As Director you can edit any of these details for them

---

## Getting Everyone Set Up — Suggested Order

1. Add all schools first
2. Add Area Leads and assign their areas
3. Add all coaches (bulk import is fastest)
4. Assign coaches to their schools
5. Share the app link and login details with Area Leads
6. Area Leads then introduce it to their coaches (see the Area Lead guide)

---

## Need to Reset Someone's Password?

You can't reset passwords from inside the app — go to your **Supabase dashboard → Authentication → Users**, find the person, and send them a password reset email. Alternatively, ask them to use the **Change Password** option inside the app if they can still log in.

---

*For technical issues with the app, contact your developer.*
