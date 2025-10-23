-- Sensors Dashboard - Database Schema
-- Temperature monitoring for food safety compliance
-- Integrated with Disruptive Technologies sensors

-- =====================================================
-- 1. SENSORS TABLE
-- Registry of all temperature sensors
-- =====================================================
CREATE TABLE IF NOT EXISTS sensors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- DT Sensor Details
  dt_device_id VARCHAR(255) UNIQUE NOT NULL,
  dt_project_id VARCHAR(255) NOT NULL,
  
  -- Sensor Metadata
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  type VARCHAR(50) NOT NULL DEFAULT 'temperature',
  equipment_type VARCHAR(50) NOT NULL, -- 'freezer' or 'fridge'
  
  -- Temperature Ranges (stored in Celsius for standardization)
  min_temp_celsius DECIMAL(5,2) NOT NULL,
  max_temp_celsius DECIMAL(5,2) NOT NULL,
  
  -- Alert Configuration
  alert_delay_minutes INTEGER DEFAULT 15,
  alert_recipients JSONB DEFAULT '[]'::jsonb,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_reading_at TIMESTAMPTZ,
  battery_level INTEGER,
  signal_strength INTEGER,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_equipment_type CHECK (equipment_type IN ('freezer', 'fridge')),
  CONSTRAINT valid_battery CHECK (battery_level >= 0 AND battery_level <= 100),
  CONSTRAINT valid_signal CHECK (signal_strength >= 0 AND signal_strength <= 100)
);

-- Indexes for sensors
CREATE INDEX idx_sensors_dt_device_id ON sensors(dt_device_id);
CREATE INDEX idx_sensors_equipment_type ON sensors(equipment_type);
CREATE INDEX idx_sensors_is_active ON sensors(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_sensors_last_reading ON sensors(last_reading_at DESC NULLS LAST);

-- =====================================================
-- 2. SENSOR_READINGS TABLE
-- Time-series temperature data
-- =====================================================
CREATE TABLE IF NOT EXISTS sensor_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id UUID NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
  
  -- Reading Data
  temperature_celsius DECIMAL(5,2) NOT NULL,
  temperature_fahrenheit DECIMAL(5,2) NOT NULL,
  
  -- Status
  is_in_range BOOLEAN NOT NULL,
  is_critical BOOLEAN DEFAULT FALSE,
  
  -- Timestamp
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Raw DT Event (for debugging)
  raw_event JSONB
);

-- Critical indexes for time-series performance
CREATE INDEX idx_sensor_readings_sensor_time ON sensor_readings(sensor_id, recorded_at DESC);
CREATE INDEX idx_sensor_readings_recorded_at ON sensor_readings(recorded_at DESC);
CREATE INDEX idx_sensor_readings_critical ON sensor_readings(sensor_id, is_critical) WHERE is_critical = TRUE;

-- =====================================================
-- 3. SENSOR_ALERTS TABLE
-- Violations and alerts tracking
-- =====================================================
CREATE TABLE IF NOT EXISTS sensor_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id UUID NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
  
  -- Alert Details
  alert_type VARCHAR(50) NOT NULL DEFAULT 'temperature_violation',
  severity VARCHAR(50) NOT NULL,
  
  -- Temperature Context
  temp_celsius DECIMAL(5,2) NOT NULL,
  temp_fahrenheit DECIMAL(5,2) NOT NULL,
  threshold_min DECIMAL(5,2),
  threshold_max DECIMAL(5,2),
  
  -- Timing
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  
  -- Resolution
  status VARCHAR(50) DEFAULT 'active',
  resolved_by VARCHAR(255),
  resolution_action VARCHAR(100),
  resolution_notes TEXT,
  
  -- Notification Tracking
  notifications_sent JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_severity CHECK (severity IN ('warning', 'critical', 'resolved')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'acknowledged', 'resolved', 'false_alarm'))
);

-- Indexes for alerts
CREATE INDEX idx_sensor_alerts_sensor_id ON sensor_alerts(sensor_id);
CREATE INDEX idx_sensor_alerts_status ON sensor_alerts(status);
CREATE INDEX idx_sensor_alerts_severity ON sensor_alerts(severity);
CREATE INDEX idx_sensor_alerts_started_at ON sensor_alerts(started_at DESC);
CREATE INDEX idx_sensor_alerts_active ON sensor_alerts(sensor_id, status) WHERE status = 'active';

-- =====================================================
-- 4. SENSOR_TASKS TABLE
-- Task management for alert resolution
-- =====================================================
CREATE TABLE IF NOT EXISTS sensor_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES sensor_alerts(id) ON DELETE CASCADE,
  sensor_id UUID NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
  
  -- Task Details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  task_type VARCHAR(50) NOT NULL,
  
  -- Assignment
  assigned_to VARCHAR(255),
  priority VARCHAR(50) DEFAULT 'medium',
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending',
  
  -- Timestamps
  due_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  CONSTRAINT valid_task_status CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled'))
);

-- Indexes for tasks
CREATE INDEX idx_sensor_tasks_alert_id ON sensor_tasks(alert_id);
CREATE INDEX idx_sensor_tasks_sensor_id ON sensor_tasks(sensor_id);
CREATE INDEX idx_sensor_tasks_status ON sensor_tasks(status);
CREATE INDEX idx_sensor_tasks_assigned_to ON sensor_tasks(assigned_to);

-- =====================================================
-- DATABASE FUNCTIONS & TRIGGERS
-- =====================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update sensors.updated_at
CREATE TRIGGER update_sensors_updated_at 
  BEFORE UPDATE ON sensors
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update sensor_alerts.updated_at
CREATE TRIGGER update_sensor_alerts_updated_at 
  BEFORE UPDATE ON sensor_alerts
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function: Update sensor last_reading_at
CREATE OR REPLACE FUNCTION update_sensor_last_reading()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE sensors 
  SET last_reading_at = NEW.recorded_at
  WHERE id = NEW.sensor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update last_reading_at on new reading
CREATE TRIGGER update_sensor_last_reading_trigger
  AFTER INSERT ON sensor_readings
  FOR EACH ROW 
  EXECUTE FUNCTION update_sensor_last_reading();

-- Function: Auto-calculate alert duration when resolved
CREATE OR REPLACE FUNCTION calculate_alert_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.resolved_at IS NOT NULL AND (OLD.resolved_at IS NULL OR OLD.resolved_at IS DISTINCT FROM NEW.resolved_at) THEN
    NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.resolved_at - NEW.started_at))::INTEGER / 60;
    IF NEW.status = 'active' THEN
      NEW.status = 'resolved';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Calculate duration on resolve
CREATE TRIGGER calculate_alert_duration_trigger 
  BEFORE UPDATE ON sensor_alerts
  FOR EACH ROW 
  EXECUTE FUNCTION calculate_alert_duration();

-- =====================================================
-- INITIAL DATA (OPTIONAL)
-- Sample sensor for testing
-- =====================================================

-- Uncomment to insert test sensor
-- INSERT INTO sensors (
--   dt_device_id,
--   dt_project_id,
--   name,
--   location,
--   equipment_type,
--   min_temp_celsius,
--   max_temp_celsius,
--   alert_delay_minutes,
--   alert_recipients
-- ) VALUES (
--   'test-device-001',
--   'test-project',
--   'Walk-in Freezer #1',
--   'Kitchen - Back Storage',
--   'freezer',
--   -23.0,
--   -18.0,
--   15,
--   '[{"name":"Charlie Checkit","email":"charlie@checkit.com","notify_methods":["email","in_app"]}]'::jsonb
-- );

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE sensors IS 'Registry of temperature sensors from Disruptive Technologies';
COMMENT ON TABLE sensor_readings IS 'Time-series temperature data from sensors';
COMMENT ON TABLE sensor_alerts IS 'Temperature violation alerts and tracking';
COMMENT ON TABLE sensor_tasks IS 'Tasks for resolving sensor alerts';

COMMENT ON COLUMN sensors.alert_recipients IS 'JSON array of recipients: [{"name":"","email":"","phone":"","notify_methods":["email","sms","in_app"]}]';
COMMENT ON COLUMN sensor_alerts.notifications_sent IS 'JSON log of sent notifications with delivery status';
COMMENT ON COLUMN sensors.equipment_type IS 'Type of equipment: freezer (-23 to -18°C) or fridge (0 to 4°C)';

