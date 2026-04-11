# CredTrust Cooperative Society - System Architecture Plan

## 1. Summary of Understanding
The goal is to build a production-ready Credit Cooperative Society Management System. The system handles the complete lifecycle of a cooperative society member, including:
- **Member Management:** Registration, KYC verification, and Share Capital tracking.
- **Deposit & Thrift:** Savings accounts, Fixed Deposits (FD), and Recurring Deposits (RD) with automated interest calculation and maturity handling.
- **Loan Management:** Various loan products (Gold, SHG, Emergency) with automated Amortization Schedule generation, EMI tracking, and overdue management.
- **Accounting & Finance:** A strict double-entry accounting engine (Ledger) that records every financial transaction (deposits, withdrawals, disbursements, EMI payments) to ensure financial integrity.
- **Dividends:** Annual profit calculation and dividend distribution based on shareholding.
- **Administration:** Role-based access control (Admin, CEO, Teller, etc.), audit trails, and regulatory reporting (Trial Balance, Cash Book).

## 2. System Architecture

### 2.1. Frontend (React + Vite + Tailwind + shadcn/ui)
- **State Management:** React Query for server state caching and synchronization. Context API for Authentication state.
- **Routing:** React Router with protected routes based on user roles.
- **Key Modules:**
  - `Auth`: Login/Registration (Firebase + Custom JWT fallback).
  - `Member Portal`: Dashboard, KYC upload, Account balances, Loan applications, EMI payments.
  - `Admin Portal`: System overview, KYC/Loan approvals, Ledger view, Report generation.

### 2.2. Backend (NestJS + Fastify + Prisma)
- **Core Modules:**
  - `AuthModule`: Handles authentication and token verification.
  - `MembersModule`: Manages member profiles, KYC, and shares.
  - `DepositsModule`: Manages FD/RD creation and schedules.
  - `LoansModule`: Manages loan applications, amortization, and EMI processing.
  - `LedgerModule` (CRITICAL): The central accounting engine. Exposes methods to record multi-leg double-entry transactions.
  - `DividendsModule`: Handles profit distribution.
  - `ReportsModule`: Generates financial reports (PDF/Excel).
- **Interceptors:** `AuditInterceptor` logs all mutating requests for compliance.

### 2.3. Database Schema (PostgreSQL)
- **Entities:** `User`, `Member`, `KycDocument`, `Share`, `Account`, `Deposit`, `DepositSchedule`, `Loan`, `EmiSchedule`, `LedgerAccount`, `Transaction`, `Dividend`, `DividendPayout`, `AuditLog`.
- **Enhancements Planned:** 
  - Add `groupId` to `Transaction` for multi-leg entries.
  - Add Nominee details to `Member`.

### 2.4. Infrastructure
- **Deployment:** Dockerized containers for API, Database, Redis, and MinIO.
- **Storage:** MinIO (S3-compatible) for production KYC document storage, with local fallback for development.

## 3. Development Phases
1. **Deep Analysis:** Completed.
2. **System Design:** Refine database schema and API contracts.
3. **Core Backend:** Implement robust Ledger engine and connect it to Deposits/Loans.
4. **Frontend:** Wire up missing UI components (Share Purchase, Transaction History).
5. **Financial Integrity:** Ensure all flows balance perfectly in the Ledger.
6. **Advanced Features:** Reports, Dividends.
7. **Testing & Deployment.**
