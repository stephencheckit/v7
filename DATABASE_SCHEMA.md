# V7 Form Builder - Database Schema Design

**Version:** 1.0  
**Date:** October 16, 2025  
**Database:** Supabase (PostgreSQL)

---

## Overview

This document outlines the complete database schema for the V7 AI-Powered Form Builder, designed for scalability, flexibility, and performance.

### Design Principles
- **Simple**: Clear table structure with minimal complexity
- **Flexible**: JSONB for dynamic field configurations
- **Scalable**: Indexed for performance at scale
- **Secure**: Row Level Security (RLS) enabled
- **Auditable**: Timestamps and change tracking

---

## Entity Relationship Diagram

```
users (auth.users)
  ↓
  ├─ workspaces (1:many)
  │    ↓
  │    ├─ forms (1:many)
  │    │    ↓
  │    │    ├─ form_versions (1:many)
  │    │    ├─ form_submissions (1:many)
  │    │    │    ↓
  │    │    │    └─ submission_files (1:many)
  │    │    ├─ form_analytics (1:many)
  │    │    └─ form_distribution_settings (1:1)
  │    │
  │    ├─ templates (1:many)
  │    └─ workspace_members (many:many with users)
  │
  └─ ai_chat_history (1:many)
```

---

## Table Definitions

### 1. `workspaces`
User workspaces for organizing forms (multi-tenant support)

```sql
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  plan VARCHAR(50) DEFAULT 'free', -- free, pro, enterprise
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT slug_format CHECK (slug ~* '^[a-z0-9-]+$')
);

-- Indexes
CREATE INDEX idx_workspaces_owner_id ON workspaces(owner_id);
CREATE INDEX idx_workspaces_slug ON workspaces(slug);
CREATE INDEX idx_workspaces_created_at ON workspaces(created_at DESC);

-- Example settings JSONB:
{
  "theme": "dark",
  "branding": {
    "logo_url": "https://...",
    "primary_color": "#c4dfc4"
  },
  "features": {
    "ai_assistant": true,
    "advanced_logic": true
  }
}
```

### 2. `workspace_members`
Team members with access to workspaces

```sql
CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member', -- owner, admin, editor, viewer
  permissions JSONB DEFAULT '[]',
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  
  UNIQUE(workspace_id, user_id)
);

-- Indexes
CREATE INDEX idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user_id ON workspace_members(user_id);

-- Example permissions JSONB:
["forms.create", "forms.edit", "forms.delete", "submissions.view", "submissions.export"]
```

### 3. `forms`
Main forms table

```sql
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  
  -- Form metadata
  name VARCHAR(255) NOT NULL,
  description TEXT,
  slug VARCHAR(150) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft', -- draft, published, archived, paused
  
  -- Form schema (JSONB for flexibility)
  schema JSONB NOT NULL DEFAULT '{"fields": []}',
  
  -- UI settings
  theme JSONB DEFAULT '{}',
  submit_button_text VARCHAR(100) DEFAULT 'Submit',
  
  -- Behavior settings
  settings JSONB DEFAULT '{}',
  
  -- Versioning
  version INTEGER DEFAULT 1,
  current_version_id UUID,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  
  UNIQUE(workspace_id, slug)
);

-- Indexes
CREATE INDEX idx_forms_workspace_id ON forms(workspace_id);
CREATE INDEX idx_forms_created_by ON forms(created_by);
CREATE INDEX idx_forms_status ON forms(status);
CREATE INDEX idx_forms_created_at ON forms(created_at DESC);
CREATE INDEX idx_forms_slug ON forms(workspace_id, slug);
CREATE INDEX idx_forms_schema ON forms USING GIN (schema);

-- Example schema JSONB:
{
  "formId": "customer-feedback",
  "title": "Customer Feedback",
  "description": "Help us improve",
  "fields": [
    {
      "id": "field-1",
      "type": "text",
      "name": "fullName",
      "label": "Full Name",
      "placeholder": "John Doe",
      "required": true,
      "validation": {
        "minLength": 2,
        "maxLength": 100
      }
    },
    {
      "id": "field-2",
      "type": "email",
      "name": "email",
      "label": "Email Address",
      "required": true,
      "validation": {
        "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
      }
    },
    {
      "id": "field-3",
      "type": "radio",
      "name": "rating",
      "label": "How satisfied are you?",
      "required": true,
      "options": ["Very Satisfied", "Satisfied", "Neutral", "Unsatisfied", "Very Unsatisfied"]
    },
    {
      "id": "field-4",
      "type": "textarea",
      "name": "comments",
      "label": "Additional Comments",
      "placeholder": "Tell us more...",
      "required": false
    }
  ],
  "submitButton": {
    "label": "Send Feedback",
    "color": "#c4dfc4"
  }
}

-- Example theme JSONB:
{
  "colors": {
    "primary": "#c4dfc4",
    "secondary": "#c8e0f5",
    "background": "#0a0a0a",
    "text": "#ffffff"
  },
  "fonts": {
    "heading": "Inter",
    "body": "Inter"
  },
  "borderRadius": "8px"
}

-- Example settings JSONB:
{
  "notifications": {
    "email": ["admin@example.com"],
    "slack_webhook": "https://...",
    "on_submission": true
  },
  "limits": {
    "max_submissions": 1000,
    "max_file_size_mb": 10
  },
  "redirect": {
    "enabled": true,
    "url": "https://example.com/thank-you"
  },
  "security": {
    "captcha_enabled": true,
    "rate_limit": 10
  },
  "features": {
    "partial_save": true,
    "edit_after_submit": false
  }
}
```

### 4. `form_versions`
Version history for forms

```sql
CREATE TABLE form_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  schema JSONB NOT NULL,
  theme JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  change_summary TEXT,
  
  UNIQUE(form_id, version_number)
);

-- Indexes
CREATE INDEX idx_form_versions_form_id ON form_versions(form_id);
CREATE INDEX idx_form_versions_created_at ON form_versions(created_at DESC);
```

### 5. `form_submissions`
Form responses/submissions

```sql
CREATE TABLE form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  form_version INTEGER NOT NULL,
  
  -- Submission data
  data JSONB NOT NULL,
  
  -- Submitter info (optional, for anonymous forms)
  submitter_id UUID REFERENCES auth.users(id),
  submitter_email VARCHAR(255),
  submitter_ip INET,
  submitter_user_agent TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Status
  status VARCHAR(50) DEFAULT 'completed', -- draft, completed, flagged, archived
  
  -- Timestamps
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Analytics
  time_to_complete INTEGER, -- seconds
  device_type VARCHAR(50), -- desktop, mobile, tablet
  referrer TEXT
);

-- Indexes
CREATE INDEX idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX idx_form_submissions_submitter_id ON form_submissions(submitter_id);
CREATE INDEX idx_form_submissions_submitted_at ON form_submissions(submitted_at DESC);
CREATE INDEX idx_form_submissions_status ON form_submissions(status);
CREATE INDEX idx_form_submissions_data ON form_submissions USING GIN (data);
CREATE INDEX idx_form_submissions_form_submitted ON form_submissions(form_id, submitted_at DESC);

-- Example data JSONB:
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "rating": "Very Satisfied",
  "comments": "Great service!"
}

-- Example metadata JSONB:
{
  "utm_source": "google",
  "utm_campaign": "summer-2025",
  "location": {
    "country": "US",
    "city": "New York",
    "timezone": "America/New_York"
  },
  "browser": "Chrome 120.0",
  "screen_resolution": "1920x1080"
}
```

### 6. `submission_files`
File uploads associated with submissions

```sql
CREATE TABLE submission_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES form_submissions(id) ON DELETE CASCADE,
  field_id VARCHAR(100) NOT NULL,
  
  -- File info
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL, -- bytes
  file_type VARCHAR(100) NOT NULL,
  storage_path TEXT NOT NULL, -- Supabase Storage path
  storage_bucket VARCHAR(100) DEFAULT 'form-submissions',
  
  -- Security
  is_public BOOLEAN DEFAULT FALSE,
  virus_scan_status VARCHAR(50), -- pending, clean, infected
  
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_submission_files_submission_id ON submission_files(submission_id);
CREATE INDEX idx_submission_files_uploaded_at ON submission_files(uploaded_at DESC);
```

### 7. `form_distribution_settings`
Distribution and access control settings

```sql
CREATE TABLE form_distribution_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE UNIQUE,
  
  -- WHO (Audience)
  access_type VARCHAR(50) DEFAULT 'public', -- public, private, restricted
  allowed_domains TEXT[], -- email domain restrictions
  allowed_locations JSONB DEFAULT '[]', -- geo restrictions
  password_hash TEXT,
  
  -- WHEN (Schedule)
  schedule_type VARCHAR(50) DEFAULT 'always', -- always, one_time, recurring, date_range
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  recurring_pattern JSONB,
  timezone VARCHAR(100) DEFAULT 'UTC',
  
  -- WHERE (Distribution channels)
  distribution_channels JSONB DEFAULT '{}',
  
  -- HOW (Input methods)
  input_methods JSONB DEFAULT '{}',
  
  -- Limits
  max_submissions INTEGER,
  max_submissions_per_user INTEGER DEFAULT 1,
  
  -- Additional settings
  settings JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_distribution_form_id ON form_distribution_settings(form_id);

-- Example allowed_locations JSONB:
["US", "CA", "GB", "AU"]

-- Example recurring_pattern JSONB:
{
  "frequency": "weekly",
  "days": ["monday", "wednesday", "friday"],
  "time": "09:00"
}

-- Example distribution_channels JSONB:
{
  "direct_link": {
    "enabled": true,
    "short_url": "https://v7.app/f/abc123"
  },
  "qr_code": {
    "enabled": true,
    "url": "https://..."
  },
  "email": {
    "enabled": true,
    "send_reminders": true
  },
  "embed": {
    "enabled": true,
    "allowed_domains": ["example.com"]
  }
}

-- Example input_methods JSONB:
{
  "text": { "enabled": true },
  "audio": { "enabled": false },
  "vision": { "enabled": false },
  "ai_assistant": { "enabled": true }
}
```

### 8. `form_analytics`
Aggregated analytics data

```sql
CREATE TABLE form_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  
  -- Date dimension
  date DATE NOT NULL,
  
  -- Metrics
  views INTEGER DEFAULT 0,
  starts INTEGER DEFAULT 0,
  submissions INTEGER DEFAULT 0,
  drop_offs INTEGER DEFAULT 0,
  avg_completion_time INTEGER, -- seconds
  
  -- Field-level analytics
  field_analytics JSONB DEFAULT '{}',
  
  -- Calculated metrics
  completion_rate DECIMAL(5,2),
  bounce_rate DECIMAL(5,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(form_id, date)
);

-- Indexes
CREATE INDEX idx_form_analytics_form_id ON form_analytics(form_id);
CREATE INDEX idx_form_analytics_date ON form_analytics(date DESC);
CREATE INDEX idx_form_analytics_form_date ON form_analytics(form_id, date DESC);

-- Example field_analytics JSONB:
{
  "field-1": {
    "completion_rate": 98.5,
    "avg_time_spent": 3.2,
    "error_rate": 1.5
  },
  "field-2": {
    "completion_rate": 95.0,
    "avg_time_spent": 5.8,
    "most_common_errors": ["Invalid email format"]
  }
}
```

### 9. `templates`
Pre-built form templates

```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  
  -- Template metadata
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  tags TEXT[],
  
  -- Template content
  schema JSONB NOT NULL,
  theme JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  
  -- Stats
  use_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Preview
  preview_image_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_templates_workspace_id ON templates(workspace_id);
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_is_public ON templates(is_public);
CREATE INDEX idx_templates_is_featured ON templates(is_featured);
CREATE INDEX idx_templates_tags ON templates USING GIN (tags);
```

### 10. `ai_chat_history`
AI assistant conversation history

```sql
CREATE TABLE ai_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  form_id UUID REFERENCES forms(id) ON DELETE SET NULL,
  
  -- Conversation
  role VARCHAR(50) NOT NULL, -- user, assistant, system
  message TEXT NOT NULL,
  
  -- Context
  context JSONB DEFAULT '{}',
  
  -- Metadata
  model VARCHAR(100),
  tokens_used INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ai_chat_user_id ON ai_chat_history(user_id);
CREATE INDEX idx_ai_chat_form_id ON ai_chat_history(form_id);
CREATE INDEX idx_ai_chat_created_at ON ai_chat_history(created_at DESC);
CREATE INDEX idx_ai_chat_user_created ON ai_chat_history(user_id, created_at DESC);

-- Example context JSONB:
{
  "action": "create_form",
  "result": {
    "fields_added": 4,
    "form_type": "customer_feedback"
  }
}
```

### 11. `api_keys`
API keys for programmatic access

```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  
  -- Key info
  name VARCHAR(255) NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix VARCHAR(20) NOT NULL, -- e.g., "v7_live_" or "v7_test_"
  
  -- Permissions
  scopes TEXT[] NOT NULL DEFAULT '{}', -- forms:read, forms:write, submissions:read, etc.
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  
  -- Security
  expires_at TIMESTAMPTZ,
  rate_limit INTEGER DEFAULT 1000, -- requests per hour
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_api_keys_workspace_id ON api_keys(workspace_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);
```

### 12. `webhooks`
Webhook configurations for integrations

```sql
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  
  -- Webhook config
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL, -- form.submitted, form.updated, etc.
  
  -- Security
  secret TEXT NOT NULL, -- for signature verification
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  last_status INTEGER, -- HTTP status code
  
  -- Retry config
  retry_count INTEGER DEFAULT 3,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_webhooks_workspace_id ON webhooks(workspace_id);
CREATE INDEX idx_webhooks_form_id ON webhooks(form_id);
CREATE INDEX idx_webhooks_is_active ON webhooks(is_active);
```

---

## Database Functions & Triggers

### Auto-update `updated_at` timestamp

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_distribution_updated_at BEFORE UPDATE ON form_distribution_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Auto-increment form version

```sql
CREATE OR REPLACE FUNCTION increment_form_version()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.schema IS DISTINCT FROM NEW.schema THEN
    NEW.version = OLD.version + 1;
    
    -- Create version history entry
    INSERT INTO form_versions (form_id, version_number, schema, theme, settings, created_by, change_summary)
    VALUES (NEW.id, NEW.version, NEW.schema, NEW.theme, NEW.settings, NEW.created_by, 'Schema updated');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_form_version_trigger BEFORE UPDATE ON forms
  FOR EACH ROW EXECUTE FUNCTION increment_form_version();
```

### Calculate submission metrics

```sql
CREATE OR REPLACE FUNCTION calculate_completion_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.submitted_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
    NEW.time_to_complete = EXTRACT(EPOCH FROM (NEW.submitted_at - NEW.started_at))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_completion_time_trigger BEFORE INSERT OR UPDATE ON form_submissions
  FOR EACH ROW EXECUTE FUNCTION calculate_completion_time();
```

---

## Row Level Security (RLS) Policies

### Enable RLS on all tables

```sql
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_distribution_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
```

### Workspace policies

```sql
-- Users can view their own workspaces
CREATE POLICY "Users can view their workspaces"
  ON workspaces FOR SELECT
  USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Users can create workspaces
CREATE POLICY "Users can create workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Users can update their own workspaces
CREATE POLICY "Owners can update their workspaces"
  ON workspaces FOR UPDATE
  USING (owner_id = auth.uid());

-- Users can delete their own workspaces
CREATE POLICY "Owners can delete their workspaces"
  ON workspaces FOR DELETE
  USING (owner_id = auth.uid());
```

### Forms policies

```sql
-- Users can view forms in their workspaces
CREATE POLICY "Users can view workspace forms"
  ON forms FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Users can create forms in their workspaces
CREATE POLICY "Users can create forms in their workspaces"
  ON forms FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'editor')
    )
  );

-- Users can update forms in their workspaces
CREATE POLICY "Users can update workspace forms"
  ON forms FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'editor')
    )
  );
```

### Public form submissions (for anonymous users)

```sql
-- Anyone can submit to published forms
CREATE POLICY "Anyone can submit to published forms"
  ON form_submissions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM forms
      WHERE forms.id = form_id
      AND forms.status = 'published'
    )
  );

-- Users can view their own submissions
CREATE POLICY "Users can view their own submissions"
  ON form_submissions FOR SELECT
  USING (
    submitter_id = auth.uid() OR
    form_id IN (
      SELECT id FROM forms
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );
```

---

## Indexes Summary

### Critical Indexes (for performance)
- `forms(workspace_id, status, created_at)` - List forms
- `form_submissions(form_id, submitted_at)` - List submissions
- `form_analytics(form_id, date)` - Analytics queries
- GIN indexes on JSONB columns for searching

### Full-text search

```sql
-- Add full-text search for forms
ALTER TABLE forms ADD COLUMN search_vector tsvector;

CREATE INDEX idx_forms_search ON forms USING GIN(search_vector);

CREATE OR REPLACE FUNCTION forms_search_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER forms_search_update_trigger
  BEFORE INSERT OR UPDATE ON forms
  FOR EACH ROW EXECUTE FUNCTION forms_search_update();
```

---

## Data Types Reference

### Field Types
- `text`, `textarea`, `email`, `phone`, `number`
- `dropdown`, `checkbox`, `radio`, `thumbs`
- `date`, `file`, `image`, `group`

### Status Values
- **Forms**: `draft`, `published`, `archived`, `paused`
- **Submissions**: `draft`, `completed`, `flagged`, `archived`
- **Workspace Plans**: `free`, `pro`, `enterprise`
- **Member Roles**: `owner`, `admin`, `editor`, `viewer`

---

## Scalability Considerations

### Partitioning (for high volume)

```sql
-- Partition form_submissions by month
CREATE TABLE form_submissions_2025_10 PARTITION OF form_submissions
  FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

CREATE TABLE form_submissions_2025_11 PARTITION OF form_submissions
  FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
```

### Archiving Strategy

```sql
-- Archive old submissions after 1 year
CREATE TABLE form_submissions_archive (
  LIKE form_submissions INCLUDING ALL
);

-- Move old data
INSERT INTO form_submissions_archive
SELECT * FROM form_submissions
WHERE submitted_at < NOW() - INTERVAL '1 year';

DELETE FROM form_submissions
WHERE submitted_at < NOW() - INTERVAL '1 year';
```

---

## Sample Queries

### Get form with submission stats

```sql
SELECT 
  f.*,
  COUNT(DISTINCT fs.id) as total_submissions,
  AVG(fs.time_to_complete) as avg_completion_time,
  COUNT(DISTINCT fs.id) FILTER (
    WHERE fs.submitted_at >= NOW() - INTERVAL '7 days'
  ) as submissions_last_7_days
FROM forms f
LEFT JOIN form_submissions fs ON fs.form_id = f.id
WHERE f.workspace_id = $1
GROUP BY f.id
ORDER BY f.created_at DESC;
```

### Get submission analytics by date

```sql
SELECT 
  DATE(submitted_at) as date,
  COUNT(*) as submissions,
  AVG(time_to_complete) as avg_time,
  COUNT(*) FILTER (WHERE device_type = 'mobile') as mobile_submissions,
  COUNT(*) FILTER (WHERE device_type = 'desktop') as desktop_submissions
FROM form_submissions
WHERE form_id = $1
  AND submitted_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(submitted_at)
ORDER BY date DESC;
```

### Search forms

```sql
SELECT *
FROM forms
WHERE search_vector @@ to_tsquery('english', $1)
  AND workspace_id = $2
ORDER BY ts_rank(search_vector, to_tsquery('english', $1)) DESC;
```

---

## Backup & Recovery

### Point-in-time Recovery (PITR)
- Enabled by default in Supabase
- 7-day backup retention (Free tier)
- 30-day backup retention (Pro tier)

### Manual Backup

```bash
# Export all data
pg_dump -h db.project.supabase.co -U postgres -d postgres > backup.sql

# Export specific tables
pg_dump -h db.project.supabase.co -U postgres -d postgres \
  -t forms -t form_submissions > forms_backup.sql
```

---

## Migration Strategy

1. **Phase 1**: Core tables (workspaces, forms, submissions)
2. **Phase 2**: Analytics and distribution
3. **Phase 3**: Advanced features (webhooks, API keys)
4. **Phase 4**: Optimization (indexes, partitioning)

---

## Next Steps

1. ✅ Review schema design
2. ⏱️ Apply migrations to Supabase
3. ⏱️ Set up RLS policies
4. ⏱️ Configure storage buckets
5. ⏱️ Install Supabase client in frontend
6. ⏱️ Create TypeScript types from database

---

**Document Version**: 1.0  
**Last Updated**: October 16, 2025  
**Status**: Ready for Implementation

