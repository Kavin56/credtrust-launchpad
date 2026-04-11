-- Create collateral table to support loan collateral items
CREATE TABLE "Collateral" (
  "id" UUID PRIMARY KEY,
  "loanId" UUID NOT NULL,
  "type" VARCHAR NOT NULL,
  "description" TEXT,
  "value" DECIMAL(14,2) NOT NULL,
  "status" VARCHAR,
  "fileUrl" VARCHAR,
  "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

ALTER TABLE "Collateral" ADD CONSTRAINT "Collateral_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE CASCADE;
