import React, { createContext, useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const UniqueIdContext = createContext<{ generateId: () => string } | null>(null);

export const UniqueIdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [ids] = useState(new Set<string>());

    const generateId = () => {
        let id: string;
        do {
            id = uuidv4();
        } while (ids.has(id));
        ids.add(id);
        return id;
    };

    return (
        <UniqueIdContext.Provider value={{ generateId }}>
            {children}
        </UniqueIdContext.Provider>
    );
};

export const useUniqueId = () => {
    const context = useContext(UniqueIdContext);
    if (!context) {
        throw new Error("useUniqueId must be used within a UniqueIdProvider");
    }
    return context.generateId();
};
