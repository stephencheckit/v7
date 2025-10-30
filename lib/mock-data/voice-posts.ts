/**
 * Mock Voice Commentary Posts for Demo
 * Realistic Sheetz DC inspection voice notes
 */

export interface VoicePost {
  id: string;
  location: string;
  dc: string; // Which distribution center
  area: string; // Specific area within DC
  inspector: string;
  timestamp: Date;
  quote: string;
  tags: string[];
  similarCount: number;
  isTrending: boolean;
  actionType: 'issue' | 'positive' | 'observation';
}

export const MOCK_VOICE_POSTS: VoicePost[] = [
  // TRENDING: Floor Mat Issues (9 mentions)
  {
    id: '1',
    location: 'Claysburg DC',
    dc: 'Claysburg DC',
    area: 'Production Line 2',
    inspector: 'Maria Rodriguez',
    timestamp: new Date(Date.now() - 8 * 60 * 1000), // 8 min ago
    quote: "The floor mats by the prep station are really worn out. Someone could trip on these torn edges.",
    tags: ['safety', 'equipment'],
    similarCount: 9,
    isTrending: true,
    actionType: 'issue'
  },
  {
    id: '2',
    location: 'Altoona DC',
    dc: 'Altoona DC',
    area: 'Cold Storage',
    inspector: 'James Chen',
    timestamp: new Date(Date.now() - 23 * 60 * 1000), // 23 min ago
    quote: "Floor mat in cold storage area is torn on the left side. Need replacement soon.",
    tags: ['safety', 'equipment'],
    similarCount: 9,
    isTrending: true,
    actionType: 'issue'
  },
  {
    id: '3',
    location: 'Claysburg DC',
    dc: 'Claysburg DC',
    area: 'Receiving Bay',
    inspector: 'David Park',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    quote: "Noticed the entrance mat is fraying at the corners. Safety hazard.",
    tags: ['safety', 'equipment'],
    similarCount: 9,
    isTrending: true,
    actionType: 'issue'
  },
  
  // TRENDING: Sanitizer Dispenser Issues (6 mentions)
  {
    id: '4',
    location: 'Altoona DC',
    dc: 'Altoona DC',
    area: 'Production Line 3',
    inspector: 'James Chen',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 min ago
    quote: "Sanitizer dispenser by line 3 has been empty for two days now. Need a refill or it's a compliance issue.",
    tags: ['compliance', 'supplies'],
    similarCount: 6,
    isTrending: true,
    actionType: 'issue'
  },
  {
    id: '5',
    location: 'Claysburg DC',
    dc: 'Claysburg DC',
    area: 'Packaging Area',
    inspector: 'Sarah Thompson',
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 min ago
    quote: "Hand sanitizer station near packaging is running low. Should be refilled before next shift.",
    tags: ['compliance', 'supplies'],
    similarCount: 6,
    isTrending: true,
    actionType: 'issue'
  },
  
  // TRENDING: Lot Code Printer Issues (4 mentions)
  {
    id: '6',
    location: 'Altoona DC',
    dc: 'Altoona DC',
    area: 'Receiving Bay',
    inspector: 'Sarah Thompson',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    quote: "Lot code printer keeps jamming when we're trying to label incoming pallets. Slowing down receiving by 15 minutes per load.",
    tags: ['equipment', 'fsma-204', 'efficiency'],
    similarCount: 4,
    isTrending: false,
    actionType: 'issue'
  },
  {
    id: '7',
    location: 'Claysburg DC',
    dc: 'Claysburg DC',
    area: 'Labeling Station',
    inspector: 'Michael Brown',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    quote: "Label printer for lot codes is printing faded text. Hard to scan the barcodes.",
    tags: ['equipment', 'fsma-204'],
    similarCount: 4,
    isTrending: false,
    actionType: 'issue'
  },
  
  // Positive Feedback
  {
    id: '8',
    location: 'Claysburg DC',
    dc: 'Claysburg DC',
    area: 'Training Room',
    inspector: 'David Park',
    timestamp: new Date(Date.now() - 50 * 60 * 1000), // 50 min ago
    quote: "The new supervisor Maria is doing an amazing job training the team on HACCP procedures. Really thorough and patient.",
    tags: ['training', 'positive'],
    similarCount: 3,
    isTrending: false,
    actionType: 'positive'
  },
  {
    id: '9',
    location: 'Altoona DC',
    dc: 'Altoona DC',
    area: 'Production Line 1',
    inspector: 'Jennifer Lee',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    quote: "John from the new hire group is catching on quickly. He's double-checking lot codes without being asked. Great attention to detail.",
    tags: ['training', 'positive'],
    similarCount: 2,
    isTrending: false,
    actionType: 'positive'
  },
  
  // Temperature Monitoring
  {
    id: '10',
    location: 'Claysburg DC',
    dc: 'Claysburg DC',
    area: 'Walk-in Freezer 3',
    inspector: 'Maria Rodriguez',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
    quote: "Temperature in freezer 3 is reading 2 degrees. Slightly higher than normal but still in range. Keeping an eye on it.",
    tags: ['temperature', 'equipment'],
    similarCount: 1,
    isTrending: false,
    actionType: 'observation'
  },
  
  // Supply Chain
  {
    id: '11',
    location: 'Altoona DC',
    dc: 'Altoona DC',
    area: 'Dry Storage',
    inspector: 'Michael Brown',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    quote: "We're running low on sanitizer wipes. Need to order more soon or we'll run out by Thursday.",
    tags: ['supplies', 'inventory'],
    similarCount: 3,
    isTrending: false,
    actionType: 'issue'
  },
  
  // Equipment Issues
  {
    id: '12',
    location: 'Claysburg DC',
    dc: 'Claysburg DC',
    area: 'Production Line 1',
    inspector: 'Jennifer Lee',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    quote: "Conveyor belt on line 1 is making a clicking noise. Not affecting production yet but should probably get maintenance to check it.",
    tags: ['equipment', 'maintenance'],
    similarCount: 1,
    isTrending: false,
    actionType: 'observation'
  },
  
  // Cleaning & Sanitation
  {
    id: '13',
    location: 'Altoona DC',
    dc: 'Altoona DC',
    area: 'Food Prep Area',
    inspector: 'Sarah Thompson',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    quote: "Floor drain near the prep sink is clogged again. This is the third time this week. Might need a plumber to look at it.",
    tags: ['maintenance', 'sanitation'],
    similarCount: 5,
    isTrending: false,
    actionType: 'issue'
  },
  
  // FSMA Compliance
  {
    id: '14',
    location: 'Claysburg DC',
    dc: 'Claysburg DC',
    area: 'Receiving Bay',
    inspector: 'David Park',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    quote: "Vendor truck from Sysco had lot codes clearly visible. All documentation looks good for traceability.",
    tags: ['fsma-204', 'compliance', 'positive'],
    similarCount: 1,
    isTrending: false,
    actionType: 'positive'
  },
  
  // PPE Observations
  {
    id: '15',
    location: 'Altoona DC',
    dc: 'Altoona DC',
    area: 'Production Floor',
    inspector: 'Michael Brown',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    quote: "Everyone on the floor is wearing proper PPE. Hair nets, gloves, and aprons all in use. Good compliance today.",
    tags: ['safety', 'ppe', 'positive'],
    similarCount: 2,
    isTrending: false,
    actionType: 'positive'
  },
  
  // More Floor Safety
  {
    id: '16',
    location: 'Claysburg DC',
    dc: 'Claysburg DC',
    area: 'Loading Dock',
    inspector: 'Maria Rodriguez',
    timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000), // 7 hours ago
    quote: "Anti-slip mat at the dock entrance is bunched up. Could be a tripping hazard when people are carrying product.",
    tags: ['safety', 'equipment'],
    similarCount: 9,
    isTrending: true,
    actionType: 'issue'
  },
  
  // Training Needs
  {
    id: '17',
    location: 'Altoona DC',
    dc: 'Altoona DC',
    area: 'Cold Storage',
    inspector: 'Jennifer Lee',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    quote: "Noticed some confusion about the new lot code format. Might need a quick refresher training for the team.",
    tags: ['training', 'fsma-204'],
    similarCount: 2,
    isTrending: false,
    actionType: 'observation'
  },
  
  // More Sanitizer Issues
  {
    id: '18',
    location: 'Claysburg DC',
    dc: 'Claysburg DC',
    area: 'Break Room Entrance',
    inspector: 'Sarah Thompson',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    quote: "Hand sanitizer dispenser at break room entrance needs to be refilled. People are using it and getting nothing.",
    tags: ['compliance', 'supplies'],
    similarCount: 6,
    isTrending: true,
    actionType: 'issue'
  },
  
  // Equipment Positive
  {
    id: '19',
    location: 'Altoona DC',
    dc: 'Altoona DC',
    area: 'Quality Control',
    inspector: 'James Chen',
    timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000), // 9 hours ago
    quote: "New temperature probe is working perfectly. Much more accurate readings than the old one.",
    tags: ['equipment', 'positive'],
    similarCount: 1,
    isTrending: false,
    actionType: 'positive'
  },
  
  // More Printer Issues
  {
    id: '20',
    location: 'Claysburg DC',
    dc: 'Claysburg DC',
    area: 'Shipping Dock',
    inspector: 'David Park',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    quote: "Shipping label printer is low on ink. Print quality is fading. Should replace cartridge before tomorrow's shipments.",
    tags: ['equipment', 'fsma-204'],
    similarCount: 4,
    isTrending: false,
    actionType: 'issue'
  }
];

// Helper function to get posts filtered by criteria
export function getVoicePosts(filters?: {
  location?: string;
  tag?: string;
  trendingOnly?: boolean;
  limit?: number;
}): VoicePost[] {
  let filtered = [...MOCK_VOICE_POSTS];
  
  if (filters?.location) {
    filtered = filtered.filter(post => post.dc === filters.location);
  }
  
  if (filters?.tag) {
    filtered = filtered.filter(post => post.tags.includes(filters.tag));
  }
  
  if (filters?.trendingOnly) {
    filtered = filtered.filter(post => post.isTrending);
  }
  
  // Sort by timestamp (most recent first)
  filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  if (filters?.limit) {
    filtered = filtered.slice(0, filters.limit);
  }
  
  return filtered;
}

// Get unique locations
export function getUniqueLocations(): string[] {
  return Array.from(new Set(MOCK_VOICE_POSTS.map(post => post.dc)));
}

// Get unique tags
export function getUniqueTags(): string[] {
  const allTags = MOCK_VOICE_POSTS.flatMap(post => post.tags);
  return Array.from(new Set(allTags)).sort();
}

// Get trending count
export function getTrendingCount(): number {
  return MOCK_VOICE_POSTS.filter(post => post.isTrending).length;
}

