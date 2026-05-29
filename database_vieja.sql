-- =========================
-- 1. ENUMS
-- =========================

CREATE TYPE user_role_enum AS ENUM ('ADMIN', 'DRIVER');

CREATE TYPE trip_status_enum AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED');

CREATE TYPE expense_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TYPE maintenance_type_enum AS ENUM (
  'PREVENTIVE',
  'CORRECTIVE',
  'EMERGENCY',
  'INSPECTION'
);

CREATE TYPE maintenance_status_enum AS ENUM ('COMPLETED', 'PENDING', 'SCHEDULED');

CREATE TYPE consignment_status_enum AS ENUM ('ACTIVE', 'CLOSED', 'DISPUTED');

CREATE TYPE consignment_purpose_enum AS ENUM ('TRIP_EXPENSES', 'SALARY_ADVANCE');

CREATE TYPE expense_type_enum AS ENUM (
  'FUEL',
  'TOLLS',
  'MAINTENANCE',
  'LOADING_UNLOADING',
  'MEALS',
  'PARKING',
  'OTHER'
);

-- =========================
-- 2. USERS
-- =========================

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  role user_role_enum DEFAULT 'DRIVER',
  phone VARCHAR,
  license_number VARCHAR,
  monthly_salary NUMERIC(12,2) DEFAULT 0,
  vehicle_assignment_history TEXT NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- =========================
-- 3. VEHICLES
-- =========================

CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  license_plate VARCHAR UNIQUE NOT NULL,
  brand VARCHAR NOT NULL,
  model VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  soat_expiry_date DATE,
  technical_review_expiry_date DATE,
  insurance_expiry_date DATE,
  soat_about_to_expire BOOLEAN DEFAULT false,
  technical_review_about_to_expire BOOLEAN DEFAULT false,
  insurance_about_to_expire BOOLEAN DEFAULT false,
  document_notes TEXT,
  maintenance_spent NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

ALTER TABLE users
  ADD COLUMN assigned_vehicle_id INT,
  ADD CONSTRAINT fk_users_assigned_vehicle_id FOREIGN KEY (assigned_vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL;

-- =========================
-- 4. MANTENIMIENTOS
-- =========================

CREATE TABLE maintenance_records (
  id SERIAL PRIMARY KEY,
  vehicle_id INT REFERENCES vehicles(id) ON DELETE CASCADE,
  performed_by_id INT REFERENCES users(id) ON DELETE SET NULL,
  type maintenance_type_enum NOT NULL,
  title VARCHAR NOT NULL,
  description TEXT,
  maintenance_date TIMESTAMP NOT NULL,
  cost NUMERIC(12,2) NOT NULL,
  invoice_number TEXT,
  provider TEXT,
  mileage NUMERIC(12,2),
  next_maintenance_mileage NUMERIC(12,2),
  next_maintenance_date TIMESTAMP,
  technical_notes TEXT,
  status maintenance_status_enum DEFAULT 'COMPLETED',
  requires_follow_up BOOLEAN DEFAULT false,
  follow_up_notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- =========================
-- 5. HISTORIAL VEHÍCULO - CONDUCTOR
-- =========================

CREATE TABLE user_vehicle_history (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id INT REFERENCES vehicles(id) ON DELETE CASCADE,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP
);

-- =========================
-- 5. CUENTAS BANCARIAS (ENCRIPTADAS)
-- =========================

CREATE TABLE user_bank_accounts (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  bank_name VARCHAR NOT NULL,
  account_type VARCHAR NOT NULL,
  account_number_encrypted TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- =========================
-- 6. TRIPS
-- =========================

CREATE TABLE trips (
  id SERIAL PRIMARY KEY,
  trip_number VARCHAR NOT NULL,
  driver_id INT REFERENCES users(id),
  vehicle_id INT REFERENCES vehicles(id),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  start_mileage NUMERIC(12,2) NOT NULL,
  end_mileage NUMERIC(12,2),
  origin TEXT,
  destination TEXT,
  description TEXT,
  status trip_status_enum DEFAULT 'IN_PROGRESS',
  planned_budget NUMERIC(12,2) DEFAULT 0,
  total_expenses NUMERIC(12,2) DEFAULT 0,
  total_consigned NUMERIC(12,2) DEFAULT 0,
  difference NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- =========================
-- 7. CONSIGNMENTS
-- =========================

CREATE TABLE consignments (
  id SERIAL PRIMARY KEY,
  consignment_number VARCHAR NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  purpose consignment_purpose_enum NOT NULL,
  consignment_date TIMESTAMP NOT NULL,
  driver_id INT REFERENCES users(id),
  vehicle_id INT REFERENCES vehicles(id),
  trip_id INT REFERENCES trips(id),
  consignment_notes TEXT,
  total_expenses_reported NUMERIC(12,2) DEFAULT 0,
  total_approved_expenses NUMERIC(12,2) DEFAULT 0,
  balance NUMERIC(12,2) DEFAULT 0,
  surplus NUMERIC(12,2) DEFAULT 0,
  deficit NUMERIC(12,2) DEFAULT 0,
  status consignment_status_enum DEFAULT 'ACTIVE',
  closing_date TIMESTAMP,
  closing_notes TEXT,
  fully_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  CONSTRAINT chk_consignment_logic CHECK (
    (purpose = 'TRIP_EXPENSES' AND trip_id IS NOT NULL)
    OR
    (purpose = 'SALARY_ADVANCE' AND trip_id IS NULL)
  )
);

-- =========================
-- 8. EXPENSES
-- =========================

CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  type expense_type_enum NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  expense_date TIMESTAMP NOT NULL,
  status expense_status_enum DEFAULT 'PENDING',
  description TEXT,
  notes TEXT,
  driver_id INT REFERENCES users(id),
  vehicle_id INT, -- opcional (para casos fuera de viaje)
  trip_id INT REFERENCES trips(id),
  consignment_id INT REFERENCES consignments(id),
  validated_by TEXT,
  validated_at TIMESTAMP,
  has_evidence BOOLEAN DEFAULT false,
  is_duplicate BOOLEAN DEFAULT false,
  is_out_of_range BOOLEAN DEFAULT false,
  needs_observation BOOLEAN DEFAULT false,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  CONSTRAINT chk_expense_context CHECK (
    trip_id IS NOT NULL OR driver_id IS NOT NULL
  )
);

-- =========================
-- 9. EVIDENCE
-- =========================

CREATE TABLE evidence (
  id SERIAL PRIMARY KEY,
  expense_id INT REFERENCES expenses(id) ON DELETE CASCADE,
  file_name VARCHAR NOT NULL,
  file_path VARCHAR NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR NOT NULL,
  file_size BIGINT NOT NULL,
  description TEXT,
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  is_valid BOOLEAN DEFAULT true,
  validation_notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- =========================
-- 10. INDEXES
-- =========================

CREATE INDEX idx_user_consignment ON consignments(driver_id, purpose);
CREATE INDEX idx_user_expenses ON expenses(driver_id, status);
CREATE INDEX idx_expenses_trip ON expenses(trip_id);
CREATE INDEX idx_trips_vehicle ON trips(vehicle_id);