import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { apiUrl, imageUrl } from './common';

type City = { id: number; name: string; city_code: number; state_code: string; status: string };
type CityDropdown = { key: string; value: string };
type Rating = { rating: number; count: number };

interface AppContextType {
    cities: CityDropdown[];
    states:any;
    rawStates:any;
    rawCities: City[];
    rating: Rating | null;
    offerImg : string;
}

export const AppContext = createContext<AppContextType>({
    cities: [],
    states:[],
    rawStates:[],
    rawCities: [],
    rating: null,
    offerImg:`${imageUrl}banner/1.jpg`,
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [cities, setCities] = useState<any>([]);
    const [states, setStates] = useState<any>([]);
    const [rawCities, setRawCities] = useState<any>([]);
    const [rawStates, setRawStates] = useState<any>([]);
    const [rating, setRating] = useState<any>();
    const [offerImg, setofferImg] = useState<any>(`${imageUrl}banner/1.jpg`);
    let cityArray:any = [];
    let stateArray:any = [];
    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await fetch(`${apiUrl}appList`);
                const result = await response.json();
                console.log("result", result)
                setRating(result.rating);
                setofferImg(result.offerImg);
                if (Array.isArray(result.states)) {
                    stateArray = result.states;
                }
                setRawStates(stateArray);
                const stateDropdown = stateArray.map((c: City) => ({
                    key: c.state_code.toString(),
                    value: c.name
                }));
                setStates(stateDropdown);
                if (Array.isArray(result.city)) {
                    cityArray = result.city;
                }
                setRawCities(cityArray);
            } catch (error) {
                setRawCities(cityArray);
                const cityDropdown = cityArray.map((c: City) => ({
                    key: c.city_code.toString(),
                    value: c.name
                }));
                setCities(cityDropdown);
                console.error('Error fetching cities:', error);
            }
        };

        fetchCities();
    }, []);

    return (
        <AppContext.Provider value={{ cities, states, rawStates, rawCities,rating,offerImg }}>
            {children}
        </AppContext.Provider>
    );
};
