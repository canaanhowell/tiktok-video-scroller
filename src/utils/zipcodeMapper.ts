/**
 * ZIP Code to City Mapper for Tennessee
 * Handles smart matching of customer ZIP codes to available cities in the system
 */

interface CityData {
  center_zip: string;
  coordinates: { lat: number; lng: number };
  primary_zips: string[];
  nearby_zips?: string[];
}

interface ZipCodeConfig {
  cities: Record<string, CityData>;
  zip_to_city_mapping: Record<string, string>;
  unmapped_zips_strategy: string;
}

export class ZipCodeMapper {
  private cities: Record<string, CityData>;
  private zipToCity: Record<string, string> = {};
  private config: ZipCodeConfig;

  constructor(config: ZipCodeConfig) {
    this.config = config;
    this.cities = config.cities;
    this.buildZipToCityMapping();
  }

  private buildZipToCityMapping(): void {
    const mapping: Record<string, string> = {};

    // Map primary ZIPs
    for (const [city, data] of Object.entries(this.cities)) {
      for (const zipCode of data.primary_zips) {
        mapping[zipCode] = city;
      }

      // Also map nearby ZIPs
      for (const zipCode of data.nearby_zips || []) {
        if (!mapping[zipCode]) { // Don't override primary mappings
          mapping[zipCode] = city;
        }
      }
    }

    this.zipToCity = mapping;
  }

  /**
   * Get the city for a given ZIP code
   * Returns null if ZIP is not in Tennessee or unmapped
   */
  getCityForZip(zipCode: string): string | null {
    const cleanZip = zipCode.trim();

    // Direct mapping check
    if (this.zipToCity[cleanZip]) {
      return this.zipToCity[cleanZip];
    }

    // If not found and strategy is nearest_city, find the nearest city
    if (this.config.unmapped_zips_strategy === 'nearest_city') {
      return this.findNearestCityByPrefix(cleanZip);
    }

    return null;
  }

  /**
   * Find nearest city based on ZIP code prefix matching
   * Tennessee ZIP codes generally follow geographic patterns
   */
  private findNearestCityByPrefix(zipCode: string): string | null {
    if (!zipCode || zipCode.length < 3) {
      return null;
    }

    const prefix = zipCode.substring(0, 3);

    // Tennessee ZIP code prefix ranges
    const prefixRanges: Record<string, string[]> = {
      // Nashville area: 370-372
      'Nashville': ['370', '371', '372'],
      // Memphis area: 380-381
      'Memphis': ['380', '381'],
      // Knoxville area: 377-379
      'Knoxville': ['377', '378', '379'],
      // Chattanooga area: 373-374
      'Chattanooga': ['373', '374'],
      // Clarksville area: 370 (northwest)
      'Clarksville': ['370'],
      // Middle Tennessee: 370-372, 385
      'Franklin': ['370', '385'],
      'Murfreesboro': ['371'],
      // East Tennessee mountains: 376-378
      'Gatlinburg': ['377'],
      'Pigeon Forge': ['378']
    };

    // Find cities that match the prefix
    const matchingCities: string[] = [];
    for (const [city, prefixes] of Object.entries(prefixRanges)) {
      if (prefixes.includes(prefix)) {
        matchingCities.push(city);
      }
    }

    // If multiple matches, prioritize based on additional logic
    if (matchingCities.length > 1) {
      const fourDigitPrefix = zipCode.substring(0, 4);
      
      // Special cases for overlapping prefixes
      if (prefix === '370') {
        // Northwestern 370xx more likely Clarksville
        if (['3704', '3705'].includes(fourDigitPrefix)) {
          return 'Clarksville';
        }
        // Rest of 370xx more likely Nashville
        return 'Nashville';
      } else if (prefix === '377') {
        // Mountain area 377xx could be Knoxville or Gatlinburg
        if (['3773', '3776'].includes(fourDigitPrefix)) {
          return 'Gatlinburg';
        }
        return 'Knoxville';
      } else if (prefix === '378') {
        // Could be Knoxville or Pigeon Forge
        if (fourDigitPrefix === '3786') {
          return 'Pigeon Forge';
        }
        return 'Knoxville';
      }
    }

    // Return the first match if only one
    if (matchingCities.length > 0) {
      return matchingCities[0];
    }

    // Default fallback for unknown Tennessee ZIPs
    if (prefix.startsWith('37') || prefix.startsWith('38')) {
      // Western Tennessee (38xxx) -> Memphis
      if (prefix.startsWith('38')) {
        return 'Memphis';
      }
      // Middle/Eastern Tennessee (37xxx) -> Nashville as default
      return 'Nashville';
    }

    return null;
  }

  /**
   * Get a list of nearby cities for a ZIP code
   */
  getNearbyCities(zipCode: string, maxCities: number = 3): string[] {
    const primaryCity = this.getCityForZip(zipCode);
    if (!primaryCity) {
      return [];
    }

    // For now, return a simple list based on region
    const nearbyMap: Record<string, string[]> = {
      'Nashville': ['Franklin', 'Murfreesboro', 'Clarksville'],
      'Memphis': [], // Memphis is isolated in the west
      'Knoxville': ['Gatlinburg', 'Pigeon Forge'],
      'Chattanooga': [], // Chattanooga is in the southeast
      'Clarksville': ['Nashville'],
      'Franklin': ['Nashville', 'Murfreesboro'],
      'Murfreesboro': ['Nashville', 'Franklin'],
      'Gatlinburg': ['Pigeon Forge', 'Knoxville'],
      'Pigeon Forge': ['Gatlinburg', 'Knoxville']
    };

    const nearby = nearbyMap[primaryCity] || [];
    return [primaryCity, ...nearby.slice(0, maxCities - 1)];
  }

  /**
   * Check if a ZIP code is in Tennessee
   */
  isTennesseeZip(zipCode: string): boolean {
    if (!zipCode || zipCode.length < 3) {
      return false;
    }

    const prefix = zipCode.substring(0, 2);
    // Tennessee ZIP codes are in the 370-385 range
    return prefix === '37' || prefix === '38';
  }

  /**
   * Get all ZIP codes (primary and nearby) for a city
   */
  getAllZipsForCity(city: string): string[] {
    if (!this.cities[city]) {
      return [];
    }

    const cityData = this.cities[city];
    return [...cityData.primary_zips, ...(cityData.nearby_zips || [])];
  }

  /**
   * Get available cities
   */
  getAvailableCities(): string[] {
    return Object.keys(this.cities);
  }
}

// Export a singleton instance with default config
let mapperInstance: ZipCodeMapper | null = null;

export function getZipCodeMapper(): ZipCodeMapper {
  if (!mapperInstance) {
    // This would typically load from an API or config file
    // For now, we'll use a subset of the data
    const config: ZipCodeConfig = {
      cities: {
        Nashville: {
          center_zip: "37203",
          coordinates: { lat: 36.1627, lng: -86.7816 },
          primary_zips: ["37201", "37203", "37205", "37206", "37207", "37208", "37212", "37215"],
          nearby_zips: ["37075", "37076", "37080", "37086", "37087", "37089"]
        },
        Memphis: {
          center_zip: "38103",
          coordinates: { lat: 35.1495, lng: -90.0490 },
          primary_zips: ["38103", "38104", "38105", "38107", "38109", "38111", "38112", "38114"],
          nearby_zips: ["38002", "38016", "38017", "38018", "38028", "38053"]
        },
        Knoxville: {
          center_zip: "37902",
          coordinates: { lat: 35.9606, lng: -83.9207 },
          primary_zips: ["37902", "37916", "37917", "37919", "37920", "37921", "37922", "37923"],
          nearby_zips: ["37721", "37764", "37771", "37801", "37803", "37830", "37849"]
        },
        Chattanooga: {
          center_zip: "37402",
          coordinates: { lat: 35.0456, lng: -85.3097 },
          primary_zips: ["37402", "37403", "37404", "37405", "37407", "37408", "37411", "37416"],
          nearby_zips: ["37302", "37311", "37312", "37341", "37343", "37350", "37363"]
        },
        Clarksville: {
          center_zip: "37040",
          coordinates: { lat: 36.5298, lng: -87.3595 },
          primary_zips: ["37040", "37041", "37042", "37043", "37044"],
          nearby_zips: ["37015", "37023", "37048", "37050", "37052", "37055"]
        },
        Franklin: {
          center_zip: "37064",
          coordinates: { lat: 35.9251, lng: -86.8689 },
          primary_zips: ["37064", "37065", "37067", "37069"],
          nearby_zips: ["37014", "37027", "37046", "37062", "37179"]
        },
        Murfreesboro: {
          center_zip: "37130",
          coordinates: { lat: 35.8456, lng: -86.3903 },
          primary_zips: ["37127", "37128", "37129", "37130"],
          nearby_zips: ["37016", "37020", "37037", "37073", "37085", "37086", "37087"]
        },
        Gatlinburg: {
          center_zip: "37738",
          coordinates: { lat: 35.7143, lng: -83.5102 },
          primary_zips: ["37738"],
          nearby_zips: ["37862", "37863", "37876", "37764"]
        },
        "Pigeon Forge": {
          center_zip: "37863",
          coordinates: { lat: 35.7884, lng: -83.5543 },
          primary_zips: ["37862", "37863", "37868"],
          nearby_zips: ["37725", "37738", "37764", "37865", "37876"]
        }
      },
      zip_to_city_mapping: {},
      unmapped_zips_strategy: "nearest_city"
    };

    mapperInstance = new ZipCodeMapper(config);
  }

  return mapperInstance;
}