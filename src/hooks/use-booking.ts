import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Table = Database['public']['Tables']['restaurant_tables']['Row'];

const lunchTimeSlots = ["11:30", "12:00", "12:30", "13:00", "13:30", "14:00"];
const dinnerTimeSlots = ["17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"];
const allTimeSlots = [...lunchTimeSlots, ...dinnerTimeSlots];

// This is the new, smarter algorithm.
const findBestTableCombination = (tables: Table[], partySize: number): Table[] => {
    // Sort tables descending by size to prioritize larger tables
    const sortedTables = [...tables].sort((a, b) => b.seats - a.seats);
    let allValidCombinations: Table[][] = [];

    // First, check if any single table can fit the party
    const singleTableFit = sortedTables.find(table => table.seats >= partySize);
    if (singleTableFit) {
        // If a single table fits, we should find the smallest one that does to be efficient.
        const bestSingleTable = sortedTables
            .filter(t => t.seats >= partySize)
            .sort((a, b) => a.seats - b.seats)[0];
        return [bestSingleTable];
    }

    // If no single table fits, find all multi-table combinations
    const findCombinations = (startIndex: number, currentCombination: Table[], currentCapacity: number) => {
        if (currentCapacity >= partySize) {
            allValidCombinations.push([...currentCombination]);
            return;
        }

        if (startIndex === sortedTables.length) {
            return;
        }

        for (let i = startIndex; i < sortedTables.length; i++) {
            currentCombination.push(sortedTables[i]);
            findCombinations(i + 1, currentCombination, currentCapacity + sortedTables[i].seats);
            currentCombination.pop();
        }
    };

    findCombinations(0, [], 0);

    if (allValidCombinations.length === 0) {
        return []; // No combination found
    }

    // Sort the combinations to find the best one:
    // 1. Prioritize combinations with the fewest tables.
    // 2. As a tie-breaker, prioritize the one with the least wasted space.
    allValidCombinations.sort((a, b) => {
        if (a.length !== b.length) {
            return a.length - b.length;
        }
        const capacityA = a.reduce((sum, table) => sum + table.seats, 0);
        const capacityB = b.reduce((sum, table) => sum + table.seats, 0);
        return capacityA - capacityB;
    });

    return allValidCombinations[0];
};


export const useBooking = () => {
    const [timeSlotAvailability, setTimeSlotAvailability] = useState<Record<string, { available: boolean; tables: Table[] }>>({});
    const [loading, setLoading] = useState(false);

    const checkAllAvailability = useCallback(async (selectedDate: string, partySize: number) => {
        setLoading(true);
        const availability: Record<string, { available: boolean; tables: Table[] }> = {};

        for (const time of allTimeSlots) {
            try {
                const { data, error } = await supabase.rpc('get_available_tables', {
                    p_booking_date: selectedDate,
                    p_booking_time: time,
                    // We get all available tables and then let our smart algorithm find the best fit
                    p_party_size: 1, 
                });

                if (error) throw error;
                
                const bestCombination = findBestTableCombination(data || [], partySize);
                availability[time] = {
                    available: bestCombination.length > 0,
                    tables: bestCombination,
                };

            } catch (error) {
                console.error(`Error checking availability for ${time}:`, error);
                availability[time] = { available: false, tables: [] };
            }
        }
        setTimeSlotAvailability(availability);
        setLoading(false);
    }, []);

    return { timeSlotAvailability, loading, checkAllAvailability, allTimeSlots, lunchTimeSlots, dinnerTimeSlots };
};