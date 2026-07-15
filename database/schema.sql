-- =====================================================================
-- ArchDNA Web Development Project — Database Schema (DDL)
-- Engine: SQLite 3
-- File: database/database.db
-- =====================================================================
-- Two tables, currently independent (no foreign key between them):
--   Accounts — registered users and their role (user / admin)
--   Samples  — ancient DNA sample records, manageable by admins only
-- =====================================================================

-- ---------------------------------------------------------------------
-- Table: Accounts
-- Stores user credentials and access role for authentication/authorisation.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Accounts (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,      -- surrogate key, auto-incremented
    email    TEXT    NOT NULL UNIQUE,                -- login identifier, must be unique
    password TEXT    NOT NULL,                        -- bcrypt hash, never stored in plaintext
    role     TEXT    NOT NULL DEFAULT 'user'           -- 'user' or 'admin' — controls access to /adminarch/*
        CHECK (role IN ('user', 'admin'))
);

-- Speeds up the login lookup (SELECT * FROM Accounts WHERE email = ?)
-- UNIQUE already creates an implicit index on email in SQLite, this is
-- listed explicitly for documentation/report purposes.
CREATE UNIQUE INDEX IF NOT EXISTS idx_accounts_email ON Accounts (email);


-- ---------------------------------------------------------------------
-- Table: Samples
-- Stores ancient DNA sample records displayed to logged-in users and
-- managed (INSERT / UPDATE / DELETE) exclusively by admin accounts.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Samples (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,   -- surrogate key
    period      TEXT    NOT NULL,                     -- e.g. "Bronze Age"
    name        TEXT    NOT NULL,                     -- sample identifier/name
    age         TEXT    NOT NULL,                     -- estimated age of the sample
    composition TEXT    NOT NULL                       -- comma-separated ancestry components, e.g. "ANF:40,WSH:50"
);

-- Speeds up pagination ordering / lookups by period if the app later
-- filters samples by period.
CREATE INDEX IF NOT EXISTS idx_samples_period ON Samples (period);


-- =====================================================================
-- Notes on normalisation (for report):
-- - Both tables are in 3NF: every non-key attribute depends only on the
--   primary key, there are no repeating groups, and no transitive
--   dependencies between non-key columns.
-- - Samples.composition currently stores a delimited string
--   ("ANF:40,WSH:50") rather than a normalised child table
--   (SampleComposition: sample_id, ancestry_component, percentage).
--   This is a deliberate simplification for the scope of the assignment;
--   a fully normalised design would extract this into its own table
--   with a foreign key back to Samples(id).
-- - Accounts and Samples currently have no foreign key relationship —
--   sample records are not attributed to the admin who created them.
--   A future improvement would add Samples.created_by INTEGER
--   REFERENCES Accounts(id) to support audit logging.
-- =====================================================================
