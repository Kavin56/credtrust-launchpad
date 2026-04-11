# CredTrust Cooperative Society Management System

A comprehensive, production-ready full-stack application for managing a Credit Cooperative Society.

## Features

- **Member Management:** Registration, KYC verification, Nominee management.
- **Share Capital:** Purchase shares, view share certificates, and track share ledger.
- **Deposits:** Fixed Deposits (FD) and Recurring Deposits (RD) with automated maturity processing.
- **Loans:** Multiple loan products (Gold, SHG, Emergency), EMI calculation, and repayment tracking.
- **Accounting:** Robust double-entry ledger system recording every financial transaction.
- **Dividends:** Annual profit calculation and dividend distribution to members.
- **Admin Dashboard:** System overview, pending approvals, and ledger activity.
- **Reports:** Trial Balance and Cash Book generation (PDF/Excel).
- **AI Assistant:** Integrated Gemini AI chatbot for customer support.

## Tech Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, React Query, Recharts.
- **Backend:** NestJS, Fastify, Prisma ORM, PostgreSQL.
- **Authentication:** Firebase Auth (with custom JWT fallback).
- **Storage:** MinIO (S3-compatible) / Local File System.

## Getting Started

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose

### Environment Setup
1. Copy `.env.example` to `.env` in the root directory and fill in your Firebase and Gemini API keys.
2. Copy `apps/api/.env.example` to `apps/api/.env` (or use the provided one) and configure your database connection.

### Running Locally

1. Start the infrastructure (Database, Redis, MinIO):
   ```bash
   docker-compose up -d db redis minio
   ```

2. Run database migrations and seed data:
   ```bash
   cd apps/api
   npm run prisma:dev
   npm run seed
   cd ../..
   ```

3. Start the development servers (Frontend & Backend concurrently):
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:8080` and the backend API at `http://localhost:3000/api/v1`.

## Architecture Notes

- **Double-Entry Ledger:** All financial movements (deposits, withdrawals, loan disbursements, EMI payments, share purchases, dividend declarations) are recorded in the `Transaction` table using a strict double-entry system (Debit/Credit).
- **Automated Jobs:** The backend uses `@nestjs/schedule` to run daily cron jobs (e.g., processing matured deposits).
- **Audit Trail:** An `AuditInterceptor` logs all mutating requests (`POST`, `PUT`, `PATCH`, `DELETE`) for compliance and security.
