// Debug vendor name assignment issue
const VENDOR_NAMES = [
  'Elegant Events Co',      // venues
  'Golden Hour Photography', // photographers  
  'Cinematic Weddings',     // videographers
  'The Music Masters',      // musicians
  'DJ Spectacular',         // djs
  'Forever Films',          // videographers
  'Blissful Moments',       // musicians
  'Royal Venues',           // venues
  'Harmony Musicians',      // musicians
  'Captured Dreams',        // djs
];

const VENDOR_CATEGORIES = {
  venues: ['venue', 'venues', 'event space', 'event spaces', 'ballroom', 'reception hall', 'wedding venue', 'elegant events', 'royal venue'],
  photographers: ['photo', 'photograph', 'golden hour'],
  videographers: ['video', 'videographer', 'film', 'cinema', 'cinematic'],
  musicians: ['music', 'musician', 'band', 'harmony', 'blissful'],
  djs: ['dj', 'djs', 'disc jockey', 'spectacular', 'party', 'mix', 'remix', 'captured dream'],
  general: []
};

console.log('🔍 Debugging Vendor Name Assignment\n');
console.log('The API uses: vendorName = VENDOR_NAMES[index % VENDOR_NAMES.length]');
console.log('This assigns vendor names sequentially based on video index!\n');

console.log('📋 Vendor names and their expected categories:');
VENDOR_NAMES.forEach((name, index) => {
  // Detect category based on name
  let detectedCategory = 'general';
  const nameLower = name.toLowerCase();
  
  for (const [cat, keywords] of Object.entries(VENDOR_CATEGORIES)) {
    if (keywords.some(keyword => nameLower.includes(keyword))) {
      detectedCategory = cat;
      break;
    }
  }
  
  console.log(`${index}: "${name}" → ${detectedCategory}`);
});

console.log('\n⚠️ THIS IS THE BUG!');
console.log('When videos lack metaTags, they get vendor names assigned by index.');
console.log('This creates the sequential pattern: venues → photographers → videographers → musicians → djs');
console.log('\n💡 Solution: Check if Bunny CDN videos actually have metaTags populated');