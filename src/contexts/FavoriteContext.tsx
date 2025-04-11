import React, { createContext, useContext, useState, useEffect } from 'react';
import { IJob } from '@/types/backend';
import { callFetchUserFavourites } from '@/config/api';
import { useSelector } from 'react-redux';

interface FavoriteContextType {
    favoriteJobs: IJob[];
    isLoading: boolean;
    refreshFavorites: () => Promise<void>;
    isJobFavorited: (jobId: number) => boolean;
    toggleFavorite: (jobId: number, isFavorited: boolean) => void;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

export const FavoriteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [favoriteJobs, setFavoriteJobs] = useState<IJob[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const userId = useSelector((state: any) => state.account.user?.id);

    const fetchFavorites = async () => {
        if (!userId) return;

        setIsLoading(true);
        try {
            const res = await callFetchUserFavourites(userId);
            if (res?.data) {
                setFavoriteJobs(res.data);

                // Update localStorage for each favorite job
                res.data.forEach((job: IJob) => {
                    localStorage.setItem(`favourite_${job.id}`, 'true');
                });
            }
        } catch (error) {
            console.error("Error fetching favorites:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchFavorites();
    }, [userId]);

    const isJobFavorited = (jobId: number): boolean => {
        return favoriteJobs.some(job => Number(job.id) === jobId);
    };

    const toggleFavorite = (jobId: number, isFavorited: boolean) => {
        if (isFavorited) {
            // Add to favorites
            localStorage.setItem(`favourite_${jobId}`, 'true');
        } else {
            // Remove from favorites
            localStorage.removeItem(`favourite_${jobId}`);
        }

        // Refresh the favorites list
        fetchFavorites();
    };

    return (
        <FavoriteContext.Provider
            value={{
                favoriteJobs,
                isLoading,
                refreshFavorites: fetchFavorites,
                isJobFavorited,
                toggleFavorite
            }}
        >
            {children}
        </FavoriteContext.Provider>
    );
};

export const useFavorites = (): FavoriteContextType => {
    const context = useContext(FavoriteContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoriteProvider');
    }
    return context;
}; 