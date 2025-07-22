// Debug category detection logic
const baseUrl = 'https://media.synthetikmedia.ai';

const VENDOR_CATEGORIES = {
  venues: ['venue', 'venues', 'hall', 'ballroom', 'garden', 'outdoor', 'indoor', 'space', 'location'],
  photographers: ['photo', 'photographer', 'photographers', 'photography', 'camera', 'portrait', 'shoot', 'picture'],
  videographers: ['video', 'videographer', 'videographers', 'videography', 'film', 'cinema', 'record', 'footage'],
  musicians: ['music', 'musician', 'musicians', 'band', 'song', 'perform', 'sing', 'orchestra'],
  djs: ['dj', 'djs', 'mix', 'dance', 'party', 'remix', 'disco'],
  general: ['wedding', 'bride', 'groom', 'ceremony', 'reception', 'love', 'romance']
};

function detectCategory(title) {
  const lowerTitle = title.toLowerCase();
  console.log(`   🔍 Testing title: "${lowerTitle}"`);
  
  for (const [cat, keywords] of Object.entries(VENDOR_CATEGORIES)) {
    const foundKeywords = keywords.filter(keyword => lowerTitle.includes(keyword));
    if (foundKeywords.length > 0) {
      console.log(`   ✅ Found ${cat} keywords: ${foundKeywords.join(', ')}`);
      return cat;
    }
  }
  console.log(`   ❌ No keywords found, defaulting to 'general'`);
  return 'general';
}

async function debugCategoryDetection() {
  console.log('🔍 Debugging category detection...\n');
  
  try {
    const response = await fetch(`${baseUrl}/api/bunny-videos?device=mobile`);
    const data = await response.json();
    
    if (data.success && data.videos) {
      console.log('📊 Testing category detection for each video:\n');
      
      data.videos.forEach((video, i) => {
        console.log(`${i+1}. "${video.title}"`);
        console.log(`   API Category: ${video.category}`);
        
        const detectedCategory = detectCategory(video.title);
        console.log(`   My Detection: ${detectedCategory}`);
        console.log(`   Match: ${video.category === detectedCategory ? '✅' : '❌'}`);
        
        if (video.category !== detectedCategory) {
          console.log(`   🚨 MISMATCH DETECTED!`);
        }
        console.log('');
      });
      
      // Summary
      const workingCategories = [];
      const brokenCategories = [];
      
      data.videos.forEach(video => {
        if (['venues', 'photographers'].includes(video.category)) {
          workingCategories.push(video.category);
        } else if (['musicians', 'videographers', 'djs'].includes(video.category)) {
          brokenCategories.push(video.category);
        }
      });
      
      console.log('📋 SUMMARY:');
      console.log(`Working categories: ${[...new Set(workingCategories)].join(', ')}`);
      console.log(`Broken categories: ${[...new Set(brokenCategories)].join(', ')}`);
      
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

debugCategoryDetection();