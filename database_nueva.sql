-- ENUMS
CREATE TYPE user_role AS ENUM ('admin', 'driver', 'supervisor', 'accountant');
CREATE TYPE trip_status AS ENUM ('planned', 'in_progress', 'completed', 'cancelled');
CREATE TYPE consignment_status AS ENUM ('open', 'closed', 'pending_approval');
CREATE TYPE consignment_purpose AS ENUM ('trip_advance', 'salary_advance');
CREATE TYPE expense_type AS ENUM ('fuel', 'toll', 'maintenance', 'food', 'lodging', 'parking', 'other');
CREATE TYPE expense_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE maintenance_type AS ENUM ('preventive', 'corrective', 'emergency');
CREATE TYPE maintenance_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE document_type AS ENUM ('soat', 'technical_review', 'insurance');

-- VEHICLES (va primero porque users la referencia)
CREATE TABLE vehicles (
    id                              SERIAL          PRIMARY KEY,
    license_plate                   VARCHAR(20)     NOT NULL UNIQUE,
    brand                           VARCHAR(80)     NOT NULL,
    model                           VARCHAR(80)     NOT NULL,
    type                            VARCHAR(50)     NOT NULL,
    soat_expiry_date                DATE,
    technical_review_expiry_date    DATE,
    insurance_expiry_date           DATE,
    maintenance_spent               NUMERIC(14,2)   NOT NULL DEFAULT 0,
    created_at                      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at                      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- USERS
CREATE TABLE users (
    id                  SERIAL          PRIMARY KEY,
    full_name           VARCHAR(150)    NOT NULL,
    email               VARCHAR(150)    NOT NULL UNIQUE,
    password            VARCHAR(255)    NOT NULL,
    role                user_role       NOT NULL DEFAULT 'driver',
    phone               VARCHAR(30),
    license_number      VARCHAR(50),
    assigned_vehicle_id INTEGER         REFERENCES vehicles(id) ON DELETE SET NULL,
    monthly_salary      NUMERIC(14,2)   NOT NULL DEFAULT 0,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- USER VEHICLE HISTORY
CREATE TABLE user_vehicle_history (
    id          SERIAL      PRIMARY KEY,
    user_id     INTEGER     NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    vehicle_id  INTEGER     NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    start_date  TIMESTAMP   NOT NULL DEFAULT NOW(),
    end_date    TIMESTAMP
);

-- USER BANK ACCOUNTS
CREATE TABLE user_bank_accounts (
    id                       SERIAL          PRIMARY KEY,
    user_id                  INTEGER         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bank_name                VARCHAR(100)    NOT NULL,
    account_type             VARCHAR(50)     NOT NULL,
    account_number_encrypted TEXT            NOT NULL,
    created_at               TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- TRIPS
CREATE TABLE trips (
    id              SERIAL          PRIMARY KEY,
    trip_number     VARCHAR(50)     NOT NULL UNIQUE,
    driver_id       INTEGER         NOT NULL REFERENCES users(id)    ON DELETE RESTRICT,
    vehicle_id      INTEGER         NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    start_date      TIMESTAMP,
    end_date        TIMESTAMP,
    start_mileage   NUMERIC(12,2),
    end_mileage     NUMERIC(12,2),
    origin          TEXT            NOT NULL,
    destination     TEXT            NOT NULL,
    status          trip_status     NOT NULL DEFAULT 'planned',
    planned_budget  NUMERIC(14,2),
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- CONSIGNMENTS
-- vehicle_id es nullable para anticipos de salario que no están ligados a un vehículo
CREATE TABLE consignments (
    id                      SERIAL                  PRIMARY KEY,
    consignment_number      VARCHAR(50)             NOT NULL UNIQUE,
    amount                  NUMERIC(14,2)           NOT NULL DEFAULT 0,
    purpose                 consignment_purpose     NOT NULL,
    consignment_date        TIMESTAMP               NOT NULL DEFAULT NOW(),
    driver_id               INTEGER                 NOT NULL REFERENCES users(id)    ON DELETE RESTRICT,
    vehicle_id              INTEGER                 REFERENCES vehicles(id)          ON DELETE RESTRICT,
    trip_id                 INTEGER                 REFERENCES trips(id)             ON DELETE SET NULL,
    total_expenses_reported NUMERIC(14,2)           NOT NULL DEFAULT 0,
    total_approved_expenses NUMERIC(14,2)           NOT NULL DEFAULT 0,
    balance                 NUMERIC(14,2)           GENERATED ALWAYS AS (amount - total_approved_expenses) STORED,
    status                  consignment_status      NOT NULL DEFAULT 'open',
    closing_date            TIMESTAMP,
    created_at              TIMESTAMP               NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP               NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_consignment_trip CHECK (
        (purpose = 'trip_advance' AND trip_id IS NOT NULL)
        OR
        (purpose = 'salary_advance' AND trip_id IS NULL)
    )
);

-- EXPENSES
CREATE TABLE expenses (
    id               SERIAL          PRIMARY KEY,
    type             expense_type    NOT NULL,
    amount           NUMERIC(14,2)   NOT NULL,
    expense_date     TIMESTAMP       NOT NULL DEFAULT NOW(),
    status           expense_status  NOT NULL DEFAULT 'pending',
    description      TEXT,
    driver_id        INTEGER         NOT NULL REFERENCES users(id)        ON DELETE RESTRICT,
    vehicle_id       INTEGER         NOT NULL REFERENCES vehicles(id)     ON DELETE RESTRICT,
    trip_id          INTEGER         REFERENCES trips(id)                 ON DELETE SET NULL,
    consignment_id   INTEGER         REFERENCES consignments(id)          ON DELETE SET NULL,
    validated_by     INTEGER         REFERENCES users(id)                 ON DELETE SET NULL,
    validated_at     TIMESTAMP,
    has_evidence     BOOLEAN         NOT NULL DEFAULT FALSE,
    rejection_reason TEXT,
    created_at       TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- EVIDENCE
CREATE TABLE evidence (
    id          SERIAL          PRIMARY KEY,
    expense_id  INTEGER         NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    file_name   VARCHAR(255)    NOT NULL,
    file_path   VARCHAR(512)    NOT NULL,
    file_url    TEXT            NOT NULL,
    file_type   VARCHAR(100)    NOT NULL,
    file_size   BIGINT          NOT NULL,
    is_primary  BOOLEAN         NOT NULL DEFAULT FALSE,
    is_valid    BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- MAINTENANCE RECORDS
CREATE TABLE maintenance_records (
    id                  SERIAL              PRIMARY KEY,
    vehicle_id          INTEGER             NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    performed_by_id     INTEGER             REFERENCES users(id)             ON DELETE SET NULL,
    type                maintenance_type    NOT NULL,
    title               VARCHAR(200)        NOT NULL,
    maintenance_date    TIMESTAMP           NOT NULL DEFAULT NOW(),
    cost                NUMERIC(14,2)       NOT NULL DEFAULT 0,
    invoice_number      VARCHAR(100),
    provider            VARCHAR(150),
    mileage             NUMERIC(12,2),
    status              maintenance_status  NOT NULL DEFAULT 'scheduled',
    requires_follow_up  BOOLEAN             NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP           NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP           NOT NULL DEFAULT NOW()
);

-- DOCUMENT ALERTS
CREATE TABLE document_alerts (
    id                SERIAL          PRIMARY KEY,
    vehicle_id        INTEGER         NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    document_type     document_type   NOT NULL,
    expiry_date       DATE            NOT NULL,
    days_until_expiry INTEGER,
    notified          BOOLEAN         NOT NULL DEFAULT FALSE,
    notified_at       TIMESTAMP,
    notified_user_id  INTEGER         REFERENCES users(id) ON DELETE SET NULL
);

-- INDEXES
CREATE INDEX ON users(email);
CREATE INDEX ON users(assigned_vehicle_id);
CREATE INDEX ON users(role, is_active);
CREATE INDEX ON user_vehicle_history(user_id);
CREATE INDEX ON user_vehicle_history(vehicle_id);
CREATE INDEX ON trips(driver_id);
CREATE INDEX ON trips(vehicle_id);
CREATE INDEX ON trips(status);
CREATE INDEX ON consignments(driver_id);
CREATE INDEX ON consignments(trip_id);
CREATE INDEX ON consignments(status);
CREATE INDEX ON expenses(driver_id);
CREATE INDEX ON expenses(trip_id);
CREATE INDEX ON expenses(consignment_id);
CREATE INDEX ON expenses(status);
CREATE INDEX ON evidence(expense_id);
CREATE INDEX ON maintenance_records(vehicle_id);
CREATE INDEX ON maintenance_records(maintenance_date);
CREATE INDEX ON document_alerts(vehicle_id);
CREATE INDEX ON document_alerts(expiry_date);
CREATE INDEX ON document_alerts(notified);
