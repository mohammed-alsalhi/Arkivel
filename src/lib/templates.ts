export type ArticleTemplate = {
  id: string;
  name: string;
  icon: string;
  description: string;
  content: string;
};

export const ARTICLE_TEMPLATES: ArticleTemplate[] = [
  {
    id: "blank",
    name: "Blank",
    icon: "\uD83D\uDCC4",
    description: "Start from scratch",
    content: "",
  },
  {
    id: "person",
    name: "Person",
    icon: "\uD83D\uDC64",
    description: "A person or notable figure",
    content: `<h2>Overview</h2><p>Brief description of this person.</p><h2>Background</h2><p>History and life events.</p><h2>Personality</h2><p>Traits, motivations, and demeanor.</p><h2>Relationships</h2><p>Key connections to other people.</p><h2>Trivia</h2><ul><li></li></ul>`,
  },
  {
    id: "place",
    name: "Place",
    icon: "\uD83D\uDCCD",
    description: "A location, city, or region",
    content: `<h2>Overview</h2><p>Brief description of this place.</p><h2>Geography</h2><p>Physical features, climate, and terrain.</p><h2>History</h2><p>Notable events that occurred here.</p><h2>Notable Residents</h2><ul><li></li></ul><h2>Points of Interest</h2><ul><li></li></ul>`,
  },
  {
    id: "event",
    name: "Event",
    icon: "\uD83D\uDCC5",
    description: "A notable event or occurrence",
    content: `<h2>Overview</h2><p>Brief summary of the event.</p><h2>Background</h2><p>Context and causes.</p><h2>Key Participants</h2><ul><li></li></ul><h2>Timeline</h2><ol><li></li></ol><h2>Aftermath</h2><p>Consequences and legacy.</p>`,
  },
  {
    id: "thing",
    name: "Thing",
    icon: "\uD83D\uDCE6",
    description: "An object, concept, or item",
    content: `<h2>Description</h2><p>Appearance and properties.</p><h2>History</h2><p>Origin and background.</p><h2>Significance</h2><p>Why this is notable.</p><h2>Current Status</h2><p>Where it is now or current state.</p>`,
  },
  {
    id: "group",
    name: "Group",
    icon: "\uD83D\uDC65",
    description: "An organization, team, or group",
    content: `<h2>Overview</h2><p>Purpose and general description.</p><h2>History</h2><p>Founding and major events.</p><h2>Leadership</h2><ul><li></li></ul><h2>Members</h2><p>Notable members and structure.</p><h2>Goals</h2><p>Current objectives and motivations.</p>`,
  },
];
