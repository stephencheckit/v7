/**
 * Seed script to generate realistic form responses for testing
 * This can generate 100-500 responses for any form dynamically
 */

export interface FormResponse {
  id: string;
  form_id: string;
  submitted_at: string;
  submitted_by?: string;
  data: Record<string, any>;
}

// Sample names for generating realistic responses
const FIRST_NAMES = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker'
];

const LOCATIONS = [
  'Kitchen', 'Main Hall', 'Prep Area', 'Storage Room', 'Loading Dock', 
  'Dining Area', 'Bar Station', 'Freezer', 'Walk-in Cooler', 'Dish Station'
];

const COMPLIANCE_RESPONSES = {
  always: 0.4,
  usually: 0.3,
  sometimes: 0.2,
  rarely: 0.08,
  never: 0.02
};

const TEMPERATURE_RANGES = {
  safe: { min: 35, max: 40, probability: 0.85 },
  warning: { min: 41, max: 45, probability: 0.10 },
  danger: { min: 46, max: 55, probability: 0.05 }
};

const EQUIPMENT_TYPES = [
  'Grill', 'Oven', 'Fryer', 'Refrigerator', 'Freezer', 'Mixer', 
  'Slicer', 'Food Processor', 'Dishwasher', 'Ice Machine'
];

/**
 * Generate a random date within the last N days
 */
function randomDate(daysBack: number): string {
  const now = new Date();
  const randomDays = Math.random() * daysBack;
  const date = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000);
  return date.toISOString();
}

/**
 * Generate a random name
 */
function randomName(): string {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${first} ${last}`;
}

/**
 * Generate a random email
 */
function randomEmail(name: string): string {
  const [first, last] = name.toLowerCase().split(' ');
  const domain = ['gmail.com', 'yahoo.com', 'company.com', 'business.com'][Math.floor(Math.random() * 4)];
  return `${first}.${last}@${domain}`;
}

/**
 * Generate a random phone number
 */
function randomPhone(): string {
  const area = Math.floor(Math.random() * 900) + 100;
  const prefix = Math.floor(Math.random() * 900) + 100;
  const line = Math.floor(Math.random() * 9000) + 1000;
  return `(${area}) ${prefix}-${line}`;
}

/**
 * Generate a weighted random choice from compliance responses
 */
function weightedChoice(weights: Record<string, number>): string {
  const random = Math.random();
  let cumulative = 0;
  
  for (const [choice, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (random <= cumulative) {
      return choice;
    }
  }
  
  return Object.keys(weights)[0];
}

/**
 * Generate a random temperature reading
 */
function randomTemperature(): number {
  const random = Math.random();
  let cumulative = 0;
  
  for (const [, range] of Object.entries(TEMPERATURE_RANGES)) {
    cumulative += range.probability;
    if (random <= cumulative) {
      return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    }
  }
  
  return 38; // Default safe temperature
}

/**
 * Generate response data based on field type
 */
function generateFieldResponse(fieldType: string, fieldLabel: string): any {
  switch (fieldType) {
    case 'text':
    case 'single-text':
      // Generate name, location, or generic text based on label
      if (fieldLabel.toLowerCase().includes('name')) {
        return randomName();
      } else if (fieldLabel.toLowerCase().includes('location')) {
        return LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      } else if (fieldLabel.toLowerCase().includes('equipment')) {
        return EQUIPMENT_TYPES[Math.floor(Math.random() * EQUIPMENT_TYPES.length)];
      }
      return `Response ${Math.floor(Math.random() * 1000)}`;
      
    case 'email':
      return randomEmail(randomName());
      
    case 'phone':
      return randomPhone();
      
    case 'number':
      // Temperature or generic number
      if (fieldLabel.toLowerCase().includes('temp')) {
        return randomTemperature();
      }
      return Math.floor(Math.random() * 100);
      
    case 'textarea':
    case 'multi-text':
      return 'All safety protocols were followed correctly. Equipment is in good condition and properly maintained.';
      
    case 'multiple-choice':
    case 'dropdown':
      // Compliance-related question
      if (fieldLabel.toLowerCase().includes('wash') || 
          fieldLabel.toLowerCase().includes('clean') || 
          fieldLabel.toLowerCase().includes('sanitize')) {
        return weightedChoice(COMPLIANCE_RESPONSES);
      }
      return ['Always', 'Usually', 'Sometimes', 'Rarely', 'Never'][Math.floor(Math.random() * 5)];
      
    case 'multi-select':
    case 'checkbox':
      // Return array of selections
      const options = ['Option A', 'Option B', 'Option C', 'Option D'];
      const numSelections = Math.floor(Math.random() * 3) + 1;
      return options.slice(0, numSelections);
      
    case 'binary':
    case 'true-false':
    case 'thumbs':
      // 80% compliant, 20% non-compliant
      return Math.random() < 0.8 ? 'Yes' : 'No';
      
    case 'date':
      return randomDate(30).split('T')[0];
      
    case 'time':
      const hour = Math.floor(Math.random() * 12) + 8; // 8am - 8pm
      const minute = Math.floor(Math.random() * 60);
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
    default:
      return null;
  }
}

/**
 * Generate N responses for a form
 * @param formId - The form ID to generate responses for
 * @param formFields - Array of form fields with id, type, and label
 * @param count - Number of responses to generate (default: 247)
 * @param daysBack - Generate responses over the last N days (default: 30)
 */
export function generateFormResponses(
  formId: string,
  formFields: Array<{ id: string; type: string; label: string }>,
  count: number = 247,
  daysBack: number = 30
): FormResponse[] {
  const responses: FormResponse[] = [];
  
  for (let i = 0; i < count; i++) {
    const data: Record<string, any> = {};
    
    // Generate response for each field
    for (const field of formFields) {
      data[field.id] = generateFieldResponse(field.type, field.label);
    }
    
    responses.push({
      id: `response-${formId}-${i + 1}`,
      form_id: formId,
      submitted_at: randomDate(daysBack),
      submitted_by: randomName(),
      data
    });
  }
  
  // Sort by submission date (most recent first)
  return responses.sort((a, b) => 
    new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
  );
}

/**
 * Calculate analytics from responses
 */
export function calculateAnalytics(responses: FormResponse[], formFields: Array<{ id: string; type: string; label: string }>) {
  const analytics: Record<string, any> = {
    totalResponses: responses.length,
    dateRange: {
      start: responses[responses.length - 1]?.submitted_at,
      end: responses[0]?.submitted_at
    },
    fields: {}
  };
  
  // Calculate field-specific analytics
  for (const field of formFields) {
    const fieldData = responses.map(r => r.data[field.id]).filter(v => v !== null && v !== undefined);
    
    if (field.type === 'multiple-choice' || field.type === 'dropdown' || field.type === 'binary') {
      // Calculate distribution
      const distribution: Record<string, number> = {};
      fieldData.forEach(value => {
        distribution[value] = (distribution[value] || 0) + 1;
      });
      
      analytics.fields[field.id] = {
        type: 'categorical',
        label: field.label,
        distribution,
        total: fieldData.length
      };
    } else if (field.type === 'number') {
      // Calculate statistics
      const numbers = fieldData as number[];
      analytics.fields[field.id] = {
        type: 'numeric',
        label: field.label,
        min: Math.min(...numbers),
        max: Math.max(...numbers),
        avg: numbers.reduce((a, b) => a + b, 0) / numbers.length,
        total: numbers.length
      };
    }
  }
  
  return analytics;
}

/**
 * Export sample usage
 */
export function generateSampleData() {
  const sampleFields = [
    { id: 'inspector_name', type: 'text', label: 'Inspector Name' },
    { id: 'location', type: 'text', label: 'Location' },
    { id: 'hand_washing', type: 'multiple-choice', label: 'Hand Washing Compliance' },
    { id: 'temperature', type: 'number', label: 'Temperature Check (°F)' },
    { id: 'equipment_clean', type: 'binary', label: 'Equipment Cleaned' },
    { id: 'notes', type: 'textarea', label: 'Additional Notes' }
  ];
  
  const responses = generateFormResponses('form-123', sampleFields, 247, 30);
  const analytics = calculateAnalytics(responses, sampleFields);
  
  return { responses, analytics };
}

