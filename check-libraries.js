const ADMIN_KEY = 'e5bfd06a-fc66-4fa4-a04c-9898d59406c1af22c640-76ef-455b-889c-c6b0f190d89c';

// Libraries with their specific API keys
const libraries = {
  'default_mobile': { id: '467029', key: '931f28b3-fc95-4659-a29300277c12-1643-4c31' },
  'default_desktop': { id: '469922', key: '6b9d2bc6-6ad4-47d1-9fbc96134fc8-c5dc-4643' },
  'photographers_mobile': { id: '469958', key: '77e4f8a4-129b-4ef4-8f72a5e4dffd-f951-4342' },
  'photographers_desktop': { id: '469957', key: '33029dab-5c10-4011-acb70be9a984-150e-4041' },
  'venues_mobile': { id: '469966', key: 'aacb61e1-ac77-454b-a0aeeeb23391-f320-48c7' },
  'venues_desktop': { id: '469968', key: '43946146-474c-472a-98a8eab0039e-c8d0-46d1' },
  'videographers_mobile': { id: '469964', key: '81b7b97d-9e02-4c00-9b4b94626029-c6e7-46f8' },
  'videographers_desktop': { id: '469965', key: 'd0754b35-fa96-40d9-b72f3f0e51a8-244b-495e' },
  'musicians_mobile': { id: '469970', key: '94095172-3d73-470c-b6976115ee04-f062-486f' },
  'musicians_desktop': { id: '469971', key: '5b2adb99-64b9-439b-93f7388e9899-9761-45fb' },
  'djs_mobile': { id: '469972', key: '212e9949-c822-4a2d-88f999d57972-d4c5-46c1' },
  'djs_desktop': { id: '469973', key: 'a06c2983-bdbf-4312-8a6b90ac6f65-888d-4921' }
};

async function checkLibrary(name, library) {
  const libraryId = library.id;
  const apiKey = library.key;
  
  try {
    const response = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos?page=1&itemsPerPage=5`,
      {
        headers: {
          'AccessKey': apiKey,
          'accept': 'application/json'
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      const readyVideos = (data.items || []).filter(v => v.status === 4).length;
      return {
        name,
        libraryId,
        status: 'OK',
        totalVideos: data.totalItems || 0,
        readyVideos
      };
    } else {
      return {
        name,
        libraryId,
        status: 'ERROR',
        error: `${response.status} ${response.statusText}`
      };
    }
  } catch (error) {
    return {
      name,
      libraryId,
      status: 'EXCEPTION',
      error: error.message
    };
  }
}

async function main() {
  console.log('Checking all Bunny CDN libraries with admin key...\n');
  
  const results = [];
  for (const [name, library] of Object.entries(libraries)) {
    const result = await checkLibrary(name, library);
    results.push(result);
  }

  // Show results
  console.log('=== LIBRARY CHECK RESULTS ===\n');
  
  // Group by category
  const categories = ['default', 'photographers', 'venues', 'videographers', 'musicians', 'djs'];
  
  for (const category of categories) {
    console.log(`\n${category.toUpperCase()}:`);
    const categoryResults = results.filter(r => r.name.startsWith(category));
    
    for (const result of categoryResults) {
      if (result.status === 'OK') {
        const device = result.name.includes('mobile') ? 'Mobile (9:16)' : 'Desktop (16:9)';
        console.log(`  ${device}: ${result.totalVideos} videos (${result.readyVideos} ready)`);
        if (result.totalVideos === 0) {
          console.log(`    ⚠️  EMPTY LIBRARY - No videos uploaded`);
        }
      } else {
        console.log(`  ${result.name}: ❌ ${result.error}`);
      }
    }
  }

  // Summary
  console.log('\n=== SUMMARY ===');
  const emptyLibraries = results.filter(r => r.status === 'OK' && r.totalVideos === 0);
  const withVideos = results.filter(r => r.status === 'OK' && r.totalVideos > 0);
  const errors = results.filter(r => r.status !== 'OK');

  console.log(`Total libraries: ${results.length}`);
  console.log(`Libraries with videos: ${withVideos.length}`);
  console.log(`Empty libraries: ${emptyLibraries.length}`);
  console.log(`Failed checks: ${errors.length}`);

  if (emptyLibraries.length > 0) {
    console.log('\n⚠️  EMPTY LIBRARIES (need videos uploaded):');
    emptyLibraries.forEach(lib => {
      console.log(`  - ${lib.name} (ID: ${lib.libraryId})`);
    });
  }
}

main();