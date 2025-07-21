import React, { useState, useEffect } from 'react';
import { getZipCodeMapper } from '../utils/zipcodeMapper';

interface ZipCodeFilterProps {
  onCityChange: (city: string | null, nearbyZips: string[]) => void;
  className?: string;
}

export const ZipCodeFilter: React.FC<ZipCodeFilterProps> = ({ onCityChange, className }) => {
  const [zipCode, setZipCode] = useState('');
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const [isValidTN, setIsValidTN] = useState(true);
  const [nearbyZips, setNearbyZips] = useState<string[]>([]);
  
  const mapper = getZipCodeMapper();

  useEffect(() => {
    if (zipCode.length >= 5) {
      const isTN = mapper.isTennesseeZip(zipCode);
      setIsValidTN(isTN);
      
      if (isTN) {
        const city = mapper.getCityForZip(zipCode);
        setDetectedCity(city);
        
        if (city) {
          // Get all ZIP codes for this city to use in filtering
          const cityZips = mapper.getAllZipsForCity(city);
          setNearbyZips(cityZips);
          onCityChange(city, cityZips);
        } else {
          setNearbyZips([]);
          onCityChange(null, []);
        }
      } else {
        setDetectedCity(null);
        setNearbyZips([]);
        onCityChange(null, []);
      }
    } else if (zipCode.length === 0) {
      // Reset when cleared
      setDetectedCity(null);
      setIsValidTN(true);
      setNearbyZips([]);
      onCityChange(null, []);
    }
  }, [zipCode, mapper, onCityChange]);

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 5);
    setZipCode(value);
  };

  const availableCities = mapper.getAvailableCities();

  return (
    <div className={`zip-filter ${className || ''}`}>
      <div className="zip-input-group">
        <label htmlFor="zipcode" className="block text-sm font-medium text-gray-700">
          Enter Your ZIP Code
        </label>
        <input
          id="zipcode"
          type="text"
          value={zipCode}
          onChange={handleZipChange}
          placeholder="e.g., 37075"
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
            !isValidTN && zipCode.length >= 5 
              ? 'border-red-300' 
              : 'border-gray-300'
          }`}
          maxLength={5}
        />
        
        {zipCode.length >= 5 && !isValidTN && (
          <p className="mt-2 text-sm text-red-600">
            We currently only serve Tennessee. Please enter a Tennessee ZIP code.
          </p>
        )}
        
        {detectedCity && (
          <p className="mt-2 text-sm text-green-600">
            Showing vendors near <strong>{detectedCity}</strong>
          </p>
        )}
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-500">Or select a city:</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {availableCities.map(city => (
            <button
              key={city}
              onClick={() => {
                setDetectedCity(city);
                const cityZips = mapper.getAllZipsForCity(city);
                setNearbyZips(cityZips);
                onCityChange(city, cityZips);
                
                // Set ZIP to the center ZIP for this city
                const centerZip = mapper.getAllZipsForCity(city)[0];
                if (centerZip) {
                  setZipCode(centerZip);
                }
              }}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                detectedCity === city
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Example usage in a parent component
export const VendorSearch: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [filterZips, setFilterZips] = useState<string[]>([]);

  const handleCityChange = (city: string | null, zips: string[]) => {
    setSelectedCity(city);
    setFilterZips(zips);
    
    // Here you would typically:
    // 1. Update your API query to filter by these ZIP codes
    // 2. Or filter your existing vendor list
    console.log('Filtering vendors for city:', city);
    console.log('ZIP codes to include:', zips);
  };

  return (
    <div className="vendor-search">
      <h2 className="text-2xl font-bold mb-4">Find Wedding Vendors Near You</h2>
      
      <ZipCodeFilter onCityChange={handleCityChange} />
      
      {selectedCity && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold">
            Vendors in {selectedCity} and surrounding areas
          </h3>
          {/* Your vendor list would go here, filtered by filterZips */}
        </div>
      )}
    </div>
  );
};