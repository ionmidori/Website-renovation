
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types
export interface RoomData {
    shape: 'rectangle';
    area: number;
    height: number;
    width: number;
    length: number;
}

export type DesignStyle = 'minimal_zen' | 'industrial_loft' | 'scandi' | 'rustic_modern' | 'japandi' | 'boho_chic' | 'luxury_classic';

interface RenovationContextType {
    roomData: RoomData;
    setRoomData: (data: RoomData) => void;
    furnitureStyle: DesignStyle;
    setFurnitureStyle: (style: DesignStyle) => void;
}

const RenovationContext = createContext<RenovationContextType | undefined>(undefined);

export const RenovationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [roomData, setRoomData] = useState<RoomData>({
        shape: 'rectangle',
        area: 20,
        height: 2.7,
        width: 4.47,
        length: 4.47,
    });

    const [furnitureStyle, setFurnitureStyle] = useState<DesignStyle>('minimal_zen');

    return (
        <RenovationContext.Provider value={{
            roomData,
            setRoomData,
            furnitureStyle,
            setFurnitureStyle
        }}>
            {children}
        </RenovationContext.Provider>
    );
};

export const useRenovation = () => {
    const context = useContext(RenovationContext);
    if (!context) {
        throw new Error("useRenovation must be used within a RenovationProvider");
    }
    return context;
};
