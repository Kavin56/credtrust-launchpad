# Software Development Process Document for Sri Roja Shabarish Guruji Souharda Sahakari Niyamitha

## 1\. Project Overview

**Objective:  
**To design and develop a secure, user-friendly software system to manage Credit Cooperative Society operations - including member registration, deposits, loans, accounting, and compliance with State Cooperative laws.

Stakeholders:  
\- Society Management Committee  
\- CEO  
\- Advisor  
\- Software Development Team

## 2\. Scope of the Project

**Core Modules:**

- Member Management  
   \- **Purpose:** To manage all member-related information from registration to exit.

**Workflow:**

- New Registration

- Member fills registration form (name, address, ID proof, photo and nominee).
- KYC verification (Aadhaar, Photo, Pan card) → Admin approval.
- System generates unique Member ID.

- Share Capital Management
  - Member purchases society shares (fixed share value or variable processing charge).
  - Share ledger updated automatically.
- Membership Ledger

- Tracks contributions, loans, deposits, and dividends.

- Deactivation / Exit

- On resignation or death → system calculates refund or settlement.
- Status marked "Inactive" after approval.(No of days to mark inactive has to be given)

**Outputs:**

- - Member list with KYC details
    - Share certificate or statement
    - Active / inactive member reports

2\. Deposit Management:

**Purpose:** To handle all recurring deposits, fixed deposit.

**Workflow:**

- Account Creation

• Admin opens a deposit account for a member.

• Select scheme (RD, FD, or Savings) and duration.

| Product Category | Product Name                             | Target Group            | Interest/Terms           | Notes                           |
| ---------------- | ---------------------------------------- | ----------------------- | ------------------------ | ------------------------------- |
| Deposits         | Saranam Fixed Deposit (SFD)              | All members             | 8.25%                    | KYC + Min ₹10,000               |
| Deposits         | Mahadevan Elite Deposit (HNI)            | ₹25L+ HNI/institutional | 9.1%                     | After membership only           |
| Deposits         | Padi Monthly Income Scheme (MIS) HG Loan | Senior Citizens         | 8-9% with monthly payout | Health benefits added           |
| Deposits         | Tatvamasi Goal Deposits                  | Parents, youth          | 8.25%                    | Education, marriage, pilgrimage |
| Deposits         | Kuberputra Senior Citizens Deposit       | Age 60+                 | 8.5%                     | With medical card partnership   |
| Recurring        | Irumudi Recurring Savings Plan (RSP)     | Small savers, salaried  | 7.25-7.75%               | From ₹500/month                 |

- Collection

• Cash, cheque, or online payment.

• Auto-entry into member ledger and day book.

- Interest Calculation

• Periodic computation (monthly/quarterly/yearly).

• Auto-posting to account at maturity.

- Maturity / Closure

• On maturity date → auto-generate payout amount.

• Option to renew or transfer to another account.

**Outputs:**

- - Deposit register
    - Maturity alerts
    - Scheme-wise interest report

3\. Loan Management  
**Purpose:** To automate loan application, approval, EMI tracking, and recovery.

**Workflow:**

1\. Loan Application

- - Member submits request → loan type, amount, guarantors, and purpose.
    - System checks eligibility (shares, deposits, repayment capacity).

2\. Approval Workflow

- - Manager reviews → approves or rejects.
    - On approval → loan account created.

3\. Disbursement

- - Funds released to member's account.
    - Loan ledger and general ledger updated.

4\. Repayment / EMI

- - Auto EMI schedule generated (interest + principal).
    - Receipts posted on payment.

5\. Overdue Management

- - Alerts for unpaid EMIs.
    - Recovery and penalty tracking.

Outputs:

- - Loan ledger
    - EMI due report
    - Recovery & overdue report
    - Regulatory Daily report

| **Product Category** | **Product Name**                | **Target Group** | **Interest/Terms**   | **Notes**               |
| -------------------- | ------------------------------- | ---------------- | -------------------- | ----------------------- |
| Loans                | Swamy Gold Loan                 | Traders, farmers | 12-14% p.a.          | Max ₹2L                 |
| Loans                | Annadanam SHG Credit            | Women SHGs, NGOs | 10-12% p.a.          | Linked to group savings |
| Loans                | Udaya Emergency Loan            | All members      | 15% flat, short term | Max ₹25,000             |
| Loans                | Gopuram Festival/Education Loan | Families, youth  | 12% p.a.             | Purpose-limited         |

4\. Accounting & Finance  
**Purpose:** To maintain books of accounts automatically integrated with all transactions.

**Workflow:**

1\. Transaction Posting

• Every deposit, loan, or expense auto-updates general ledger.

2\. Cash Book & Day Book

• Daily summary of receipts and payments.

3\. Ledger Management

• Chart of accounts predefined for society heads (e.g., Member Deposits, Loans, Interest Income).

4\. Reports & Financials

• Trial Balance, Income/Expense statement, Balance Sheet.

5\. Audit Support

• Exportable reports for annual audit submission.

Outputs:

• Financial statements

• Daily cash flow report

• Year-end balance sheet

5\. Dividend & Profit Distribution  
\- **Purpose:** To calculate and distribute profits/dividends among members.

**Workflow:**

1\. Profit Calculation

• Annual income and expenses computed from accounts.

2\. Dividend Setup

• Admin enters dividend rate (as approved in AGM).

3\. Distribution

• System calculates member-wise dividend based on shareholding.

• Auto-credit to member ledger or deposit account.

4\. Reporting

• Dividend register generated for audit.

**Outputs:**

• Dividend calculation sheet

• Member-wise payout report

6\. Administration & Reports

**Purpose:** To manage users, permissions, system security, and MIS reporting.

**Workflow:**

1\. User Roles & Access

• Define roles: Admin, CEO, Pigmy Collector, Teller and Director

• Role-based access control for modules and actions.

| **Role**        | **Main Access**                                                   |
| --------------- | ----------------------------------------------------------------- |
| Admin           | Full system control, user management, reports, configuration      |
| CEO             | View all data, approve major decisions, access high-level reports |
| Director        | Approvals, policy oversight, view reports                         |
| Teller          | Cash transactions (deposit/withdrawal), customer service          |
| Pigmy Collector | Daily pigmy collection entry, customer collection updates         |

2\. Audit Trail

• Every change (creation/edit/delete) logged with timestamp and user ID.

3\. Reports

• Financial reports (Cash Book, Day Book, Trial Balance)

• Operational reports (Active Members, Loan Summary, Deposit Analysis)

4\. Backup & Data Security

• Regular backup scheduling and restore options.

**Outputs:**

• User activity log

• Regulatory reports for Registrar

• Backup and restore logs

**Credit Cooperative Society Management System**

**1\. Member Management**

- Member registration
- Share capital management
- Membership ledger

**2\. Deposit & Thrift**

- Account creation
- Collection
- Interest calculation
- Maturity/closure

**3\. Loan Management**

- Loan application
- Approval workflow
- EMI schedule
- Overdue management

**4\. Accounting & Finance**

- Transaction posting
- Cash book & day book
- Financial reports

**5\. Dividends & Profit Distribution**

- Profit calculation
- Dividend setup
- Distribution

**6\. Administration & Reports**

- User roles & access
- Audit trail
- MIS reports

**Flow (Process Direction)**

- Member Management → Deposit & Thrift → Loan Management
- Deposit & Thrift → Dividends & Profit Distribution
- Loan Management → Administration & Reports
- Administration & Reports → Dividends & Profit Distribution
- Dividends & Profit Distribution → Accounting & Finance

## 3\. Security and Compliance

\- Adherence to State Cooperative Act and Audit guidelines  
\- Data encryption and secure authentication  
\- Regular data backups and activity logs  
\- Access control for staff and auditors