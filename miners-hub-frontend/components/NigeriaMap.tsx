import React from 'react';
import Nigeria from '@svg-maps/nigeria';
import { MapLocationData } from '../lib/types';

interface NigeriaMapProps {
    onStateHover: (stateId: string | null) => void;
    onStateClick: (stateId: string) => void;
    stateData: Map<string, MapLocationData>;
    selectedState: string | null;
}

const NigeriaMap: React.FC<NigeriaMapProps> = ({ onStateHover, onStateClick, stateData, selectedState }) => {
    return (
        <svg viewBox={Nigeria.viewBox} className="w-full h-full">
            <g>
                {Nigeria.locations.map((location) => {
                    const isMiningState = stateData.has(location.id);
                    const isSelected = selectedState === location.id;

                    let fillClass = 'fill-slate-300 hover:fill-slate-400 dark:fill-slate-700 dark:hover:fill-slate-600';

                    if (isMiningState) {
                        if (isSelected) {
                            fillClass = 'fill-yellow-500 dark:fill-yellow-400 drop-shadow-lg scale-105 z-10'; // Yellow for selected
                        } else {
                            fillClass = 'fill-accent hover:fill-amber-500 dark:fill-amber-600 dark:hover:fill-amber-500 hover:drop-shadow-lg';
                        }
                    }

                    return (
                        <path
                            key={location.id}
                            id={location.id}
                            d={location.path}
                            className={`stroke-white stroke-[0.5px] transition-all duration-300 ease-in-out cursor-pointer ${fillClass}`}
                            onMouseEnter={() => onStateHover(location.id)}
                            onMouseLeave={() => onStateHover(null)}
                            onClick={() => onStateClick(location.id)}
                        >
                            <title>{location.name}</title>
                        </path>
                    );
                })}
            </g>
        </svg>
    );
};

export default NigeriaMap;