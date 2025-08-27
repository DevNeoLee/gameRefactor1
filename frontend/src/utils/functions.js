import HOST from "../utils/routes";
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const createSessionDB = async (variation, ktf, nm) => {
    try {
        // Ensure HOST ends with a slash and remove any double slashes
        const baseUrl = HOST.endsWith('/') ? HOST : `${HOST}/`;
        const apiUrl = `${baseUrl}api/session`;
        
        const response = await fetch(apiUrl, {  
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST", 
            body: JSON.stringify({variation: variation, ktf: ktf, nm: nm})
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error:', response.status, errorText);
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();

        return data;
    } catch (err) {
        console.error('Error creating session:', err);
        throw err; // Re-throw to let caller handle the error
    }
}

export const useTrackPageTime = () => {
  const location = useLocation();
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    // Reset start time when location changes
    setStartTime(Date.now());

    return () => {
      // On unmount, calculate the time spent on this page
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      // console.log(`User spent ${timeSpent} seconds on ${location.pathname}.`);
      // Here you can also store the timeSpent if needed
    };
  }, [location]); // Trigger effect on location change

  return startTime; // Optional: return startTime if needed
};




