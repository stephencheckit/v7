# V7 Form Builder - System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐              ┌──────────────────┐         │
│  │                  │              │                  │         │
│  │  Chat Interface  │◄────────────►│  Form Preview    │         │
│  │  (Left Panel)    │   Real-time  │  (Right Panel)   │         │
│  │                  │   Updates    │                  │         │
│  └────────┬─────────┘              └────────┬─────────┘         │
│           │                                 │                   │
│           │ User Input                      │ Form Interaction  │
│           ▼                                 ▼                   │
│  ┌─────────────────────────────────────────────────┐           │
│  │         React State Management                   │           │
│  │  (useChat, useForm, Form Schema State)          │           │
│  └──────────────────┬──────────────────────────────┘           │
│                     │                                           │
└─────────────────────┼───────────────────────────────────────────┘
                      │
                      │ HTTP/Streaming
                      │
┌─────────────────────┼───────────────────────────────────────────┐
│                     ▼         SERVER (Next.js)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────┐         │
│  │              API Routes                             │         │
│  ├────────────────────────────────────────────────────┤         │
│  │                                                      │         │
│  │  /api/chat        ◄──── AI Conversation Endpoint    │         │
│  │  /api/forms       ◄──── Form CRUD Operations        │         │
│  │  /api/submit      ◄──── Form Submission Handler     │         │
│  │                                                      │         │
│  └──────────┬──────────────────────┬───────────────────┘         │
│             │                      │                             │
│             ▼                      ▼                             │
│  ┌──────────────────┐   ┌──────────────────┐                   │
│  │   AI Service     │   │  Database Layer  │                   │
│  │   (Anthropic/    │   │  (Postgres/      │                   │
│  │    OpenAI)       │   │   Supabase)      │                   │
│  └──────────────────┘   └──────────────────┘                   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Frontend Components

```
/app
├── layout.tsx                    # Root layout
├── page.tsx                      # Main form builder page
└── api/
    ├── chat/route.ts            # AI chat endpoint
    └── forms/
        ├── route.ts             # List/Create forms
        └── [id]/route.ts        # Get/Update/Delete form

/components
├── chat/
│   ├── ChatInterface.tsx        # Main chat container
│   ├── MessageList.tsx          # Message history display
│   ├── Message.tsx              # Individual message
│   ├── ChatInput.tsx            # User input field
│   └── StreamingIndicator.tsx  # Loading animation
│
├── form-builder/
│   ├── FormPreview.tsx          # Live form preview
│   ├── FormField.tsx            # Universal field wrapper
│   ├── FormExport.tsx           # Export dialog
│   └── FormToolbar.tsx          # Actions toolbar
│
├── field-types/
│   ├── SingleTextInput.tsx      # Text input
│   ├── MultiTextInput.tsx       # Textarea
│   ├── MultipleChoice.tsx       # Radio group
│   ├── MultiSelect.tsx          # Checkboxes
│   ├── BinaryChoice.tsx         # Yes/No
│   ├── NumberInput.tsx          # Number
│   ├── DateInput.tsx            # Date picker
│   ├── TimeInput.tsx            # Time picker
│   ├── EmailInput.tsx           # Email
│   ├── UrlInput.tsx             # URL
│   ├── PhoneInput.tsx           # Phone
│   ├── FileUpload.tsx           # File
│   └── Dropdown.tsx             # Select
│
└── ui/                          # Shared UI components
    ├── Button.tsx
    ├── Input.tsx
    ├── Label.tsx
    ├── Dialog.tsx
    └── ...

/lib
├── types/
│   └── form-schema.ts           # TypeScript types
├── validations/
│   └── field-schemas.ts         # Zod schemas
├── ai/
│   ├── prompts.ts               # System prompts
│   └── tools.ts                 # AI tool definitions
└── utils/
    ├── form-generator.ts        # Form generation logic
    └── export.ts                # Export utilities

/hooks
├── useChat.ts                   # Chat state management
├── useFormBuilder.ts            # Form builder state
└── useFormPreview.ts            # Preview state
```

---

## Data Flow Diagrams

### 1. Form Creation Flow

```
User Types Message
      │
      ▼
ChatInput Component
      │
      ▼
POST /api/chat (streaming)
      │
      ├──► AI Model (Anthropic/OpenAI)
      │         │
      │         ├──► Parse user intent
      │         ├──► Generate form schema
      │         └──► Call createForm tool
      │
      ▼
Tool Call Response
      │
      ├──► Validate with Zod
      │
      ▼
Stream to Client
      │
      ├──► Update Chat UI (show thinking)
      │
      ▼
Form Schema Received
      │
      ├──► Parse JSON schema
      ├──► Validate structure
      │
      ▼
Update Form State
      │
      ├──► Trigger FormPreview re-render
      │
      ▼
Display Form in Preview Panel
      │
      └──► User sees live form
```

### 2. Form Validation Flow

```
User Fills Form Field
      │
      ▼
React Hook Form onChange
      │
      ├──► Field-level validation
      │         │
      │         ├──► Check required
      │         ├──► Check type (email, url, etc.)
      │         ├──► Check custom rules
      │         │
      │         ▼
      │    Show errors inline
      │
      ▼
Form Submit Triggered
      │
      ├──► Form-level validation
      │         │
      │         ├──► Validate all fields
      │         ├──► Check conditional rules
      │         │
      │         └──► Zod schema validation
      │
      ▼
Validation Success
      │
      ├──► Call onSubmit handler
      │
      ▼
POST /api/submit
      │
      ├──► Save to database
      │
      ▼
Show success message
```

### 3. AI Streaming Flow

```
Client Sends Message
      │
      ▼
POST /api/chat
      │
      ├──► Initialize AI SDK stream
      │         │
      │         ├──► System prompt
      │         ├──► Tool definitions
      │         ├──► Message history
      │         │
      │         ▼
      │    AI generates tokens
      │         │
      │         ├──► Stream chunk 1: "I'll"
      │         ├──► Stream chunk 2: " create"
      │         ├──► Stream chunk 3: " a form"
      │         ├──► ...
      │         │
      │         ▼
      │    AI calls tool: createForm
      │         │
      │         └──► Return structured JSON
      │
      ▼
Server streams to client
      │
      ├──► Chunk 1: Text delta
      ├──► Chunk 2: Text delta
      ├──► Chunk 3: Tool call
      │
      ▼
Client receives stream
      │
      ├──► Update chat message in real-time
      ├──► Parse tool call
      │
      ▼
Execute tool call locally
      │
      ├──► Generate form schema
      ├──► Validate schema
      │
      ▼
Update form preview
```

---

## Database Schema

### Forms Table

```sql
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255),           -- Optional: for multi-user
  title VARCHAR(255) NOT NULL,
  description TEXT,
  schema JSONB NOT NULL,          -- Full form schema
  status VARCHAR(50) DEFAULT 'draft', -- draft, published, archived
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  version INTEGER DEFAULT 1
);

-- Example schema JSONB:
{
  "formId": "contact-form",
  "title": "Contact Us",
  "description": "Get in touch",
  "fields": [
    {
      "id": "name",
      "type": "single-text",
      "label": "Your Name",
      "required": true,
      "validation": {
        "minLength": 2,
        "maxLength": 100
      }
    },
    {
      "id": "email",
      "type": "email",
      "label": "Email Address",
      "required": true
    }
  ],
  "submitButton": {
    "label": "Send Message"
  }
}
```

### Submissions Table

```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  data JSONB NOT NULL,            -- Form response data
  metadata JSONB,                 -- IP, user agent, etc.
  submitted_at TIMESTAMP DEFAULT NOW()
);

-- Example data JSONB:
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello world"
}
```

### Indexes

```sql
-- Performance indexes
CREATE INDEX idx_forms_user_id ON forms(user_id);
CREATE INDEX idx_forms_created_at ON forms(created_at DESC);
CREATE INDEX idx_submissions_form_id ON submissions(form_id);
CREATE INDEX idx_submissions_submitted_at ON submissions(submitted_at DESC);

-- JSON indexes for querying
CREATE INDEX idx_forms_schema ON forms USING GIN (schema);
CREATE INDEX idx_submissions_data ON submissions USING GIN (data);
```

---

## State Management

### Chat State

```typescript
interface ChatState {
  messages: Message[];           // Chat history
  isStreaming: boolean;          // AI is responding
  currentToolCall: ToolCall | null; // Active tool execution
  error: Error | null;           // Error state
}

// Managed by Vercel AI SDK useChat hook
const { messages, append, isLoading } = useChat({
  api: '/api/chat',
  onToolCall: handleToolCall,
  onResponse: handleResponse,
  onError: handleError
});
```

### Form Builder State

```typescript
interface FormBuilderState {
  currentForm: FormSchema | null;  // Active form being edited
  isDirty: boolean;                // Unsaved changes
  selectedField: string | null;    // Field being edited
  previewMode: 'desktop' | 'mobile'; // Preview mode
  validationErrors: Record<string, string[]>; // Validation state
}

// Custom hook
const {
  form,
  updateField,
  addField,
  removeField,
  validateForm,
  exportForm,
  saveForm
} = useFormBuilder();
```

### Form Preview State

```typescript
// Managed by React Hook Form
const form = useForm({
  resolver: zodResolver(dynamicSchema),
  mode: 'onChange',
  defaultValues: {}
});

// Dynamic schema generation
const dynamicSchema = generateZodSchema(formSchema);
```

---

## AI Integration Architecture

### System Prompt Structure

```typescript
const SYSTEM_PROMPT = `
You are an expert form builder AI assistant. Help users create 
professional forms through conversation.

AVAILABLE FIELD TYPES:
- single-text: Basic text input
- multi-text: Textarea for longer text
- email: Email with validation
- url: URL with validation
- phone: Phone number
- number: Numeric input
- date: Date picker
- time: Time picker
- multiple-choice: Radio buttons (single select)
- multi-select: Checkboxes (multiple select)
- binary: Yes/No choice
- dropdown: Select dropdown
- file-upload: File input

VALIDATION RULES:
- required: Field must be filled
- minLength/maxLength: Text length limits
- min/max: Number range
- pattern: Regex validation
- custom: Custom validation function

When user describes a form:
1. Identify form purpose
2. List all necessary fields
3. Choose appropriate field types
4. Add sensible validation
5. Create clear, user-friendly labels
6. Call createForm tool with complete schema

Always prioritize:
- User experience (clear, simple)
- Data quality (proper validation)
- Accessibility (ARIA labels)
`;
```

### Tool Definitions

```typescript
const tools = {
  createForm: {
    description: "Create a new form with specified fields",
    parameters: z.object({
      title: z.string().describe("Form title"),
      description: z.string().optional().describe("Form description"),
      fields: z.array(fieldSchema).describe("Array of form fields"),
      submitButton: z.object({
        label: z.string().default("Submit")
      }).optional()
    })
  },
  
  addField: {
    description: "Add a new field to the existing form",
    parameters: z.object({
      field: fieldSchema.describe("Field to add"),
      position: z.number().optional().describe("Position to insert")
    })
  },
  
  updateField: {
    description: "Modify an existing field",
    parameters: z.object({
      fieldId: z.string().describe("ID of field to update"),
      updates: fieldSchema.partial().describe("Properties to update")
    })
  },
  
  removeField: {
    description: "Remove a field from the form",
    parameters: z.object({
      fieldId: z.string().describe("ID of field to remove")
    })
  }
};
```

---

## Security Considerations

### Input Validation
- ✅ Validate all AI responses with Zod
- ✅ Sanitize user input before AI processing
- ✅ Rate limit API endpoints
- ✅ Validate form schemas before rendering

### Data Protection
- ✅ Encrypt sensitive form data at rest
- ✅ Use HTTPS for all communications
- ✅ Implement CORS policies
- ✅ Sanitize form submissions

### AI Safety
- ✅ Set token limits for AI responses
- ✅ Timeout long-running requests
- ✅ Validate tool call outputs
- ✅ Implement fallback for AI failures

---

## Performance Optimization

### Frontend
- ✅ Code splitting by route
- ✅ Lazy load field components
- ✅ Memoize expensive computations
- ✅ Virtual scrolling for large forms
- ✅ Debounce validation checks

### Backend
- ✅ Cache AI responses (similar queries)
- ✅ Connection pooling for database
- ✅ Compress API responses
- ✅ CDN for static assets
- ✅ Edge functions for low latency

### AI
- ✅ Stream responses (don't wait for completion)
- ✅ Use smaller models for simple tasks
- ✅ Cache common form patterns
- ✅ Optimize token usage in prompts

---

## Deployment Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Vercel Edge Network               │
├──────────────────────────────────────────────────────┤
│                                                       │
│  ┌────────────┐      ┌────────────┐                │
│  │  Static    │      │   Edge     │                │
│  │  Assets    │      │  Functions │                │
│  │  (CDN)     │      │  (API)     │                │
│  └────────────┘      └──────┬─────┘                │
│                              │                       │
└──────────────────────────────┼───────────────────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
         ┌───────────┐  ┌───────────┐  ┌───────────┐
         │ Anthropic │  │ Vercel    │  │  Vercel   │
         │    API    │  │ Postgres  │  │  Blob     │
         │           │  │ (Database)│  │  (Files)  │
         └───────────┘  └───────────┘  └───────────┘
```

### Infrastructure Components
- **Vercel:** Next.js hosting, edge functions, CDN
- **Vercel Postgres:** Database for forms/submissions
- **Vercel Blob:** File storage (for file uploads)
- **Anthropic/OpenAI:** AI model API
- **GitHub:** Version control & CI/CD

---

## Scalability Strategy

### Horizontal Scaling
- ✅ Stateless API design
- ✅ Serverless functions (auto-scale)
- ✅ Database read replicas
- ✅ CDN for static content

### Vertical Optimization
- ✅ Optimize database queries
- ✅ Index frequently queried fields
- ✅ Batch operations where possible
- ✅ Cache expensive computations

### Cost Optimization
- ✅ Token usage optimization
- ✅ Efficient prompt design
- ✅ Caching strategy
- ✅ Database query optimization

---

## Monitoring & Observability

### Metrics to Track
- Response time (p50, p95, p99)
- AI token usage
- Error rates
- User engagement (forms created, exported)
- Database query performance

### Tools
- **Vercel Analytics:** Page views, performance
- **Sentry:** Error tracking
- **Posthog/Mixpanel:** Product analytics
- **Database:** Query performance monitoring

---

*Document Version: 1.0*  
*Last Updated: October 16, 2025*

