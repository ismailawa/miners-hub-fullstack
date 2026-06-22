import React, { useState } from 'react';
import NigeriaMap from './NigeriaMap';
import { NIGERIA_MAP_DATA } from '../lib/constants/data';
import { MapLocationData } from '../lib/types';

const MapSection: React.FC = () => {
  const [hoveredState, setHoveredState] = useState<MapLocationData | null>(null);
  const [selectedState, setSelectedState] = useState<MapLocationData | null>(null);

  const stateDataMap = new Map<string, MapLocationData>(NIGERIA_MAP_DATA.map(data => [data.id, data]));

  const handleStateHover = (stateId: string | null) => {
    if (stateId) {
      const data = stateDataMap.get(stateId);
      setHoveredState(data || null);
    } else {
      setHoveredState(null);
    }
  };

  const handleStateClick = (stateId: string) => {
    const data = stateDataMap.get(stateId);
    if (data) {
      // Toggle selection if clicking the same state, or select new one
      setSelectedState(prev => prev?.id === stateId ? null : data);
    } else {
      setSelectedState(null);
    }
  };

  const displayState = hoveredState || selectedState;

  return (
    <section id="map" className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary">Interactive Mining Map</h2>
          <p className="text-lg text-text-secondary mt-4 max-w-2xl mx-auto">Explore Nigeria's rich mineral deposits and key mining locations.</p>
        </div>
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          <div className="w-full lg:w-2/3">
            <NigeriaMap
              onStateHover={handleStateHover}
              onStateClick={handleStateClick}
              stateData={stateDataMap}
              selectedState={selectedState?.id || null}
            />
          </div>
          <div className="w-full lg:w-1/3 bg-secondary p-6 rounded-lg border border-border h-96">
            <h3 className="text-xl font-bold text-text-primary mb-4">State Information</h3>
            {displayState ? (
              <div>
                <h4 className="text-2xl font-bold text-accent mb-4">{displayState.name}</h4>
                <div className="mb-4">
                  <p className="font-semibold text-text-secondary">Key Mineral Deposits:</p>
                  <ul className="list-disc list-inside text-text-muted">
                    {displayState.minerals.map(mineral => <li key={mineral}>{mineral}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-text-secondary">Processing Factories:</p>
                  <p className="text-2xl font-bold text-text-primary">{displayState.factories}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-text-muted">
                <p>Hover over a state to see details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;