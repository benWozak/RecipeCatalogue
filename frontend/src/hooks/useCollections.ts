import { useState, useEffect } from 'react';
import { Collection, CollectionCreate, CollectionUpdate } from '@/types/recipe';
import { collectionService, CollectionWithStats } from '@/services/collectionService';
import { useUser } from './useUser';

// Global state to persist collections across components
let globalCollections: Collection[] = [];
let globalCollectionsWithStats: CollectionWithStats[] = [];
const subscribers: Set<(collections: Collection[]) => void> = new Set();
const statsSubscribers: Set<(collections: CollectionWithStats[]) => void> = new Set();

// Global fetch state to prevent concurrent requests
let isFetchingCollections = false;
let isFetchingStats = false;
let collectionsPromise: Promise<void> | null = null;
let statsPromise: Promise<void> | null = null;

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>(globalCollections);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, getToken } = useUser();

  useEffect(() => {
    // Subscribe to global state changes
    const updateCollections = (newCollections: Collection[]) => {
      setCollections(newCollections);
    };
    
    subscribers.add(updateCollections);
    
    // Fetch collections from API with deduplication
    const fetchCollections = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      // If data already exists, use it immediately
      if (globalCollections.length > 0) {
        setCollections(globalCollections);
        setIsLoading(false);
        setError(null);
        return;
      }

      // If a fetch is already in progress, wait for it
      if (isFetchingCollections && collectionsPromise) {
        try {
          await collectionsPromise;
          setCollections(globalCollections);
          setIsLoading(false);
          setError(null);
        } catch (err) {
          setError(err as Error);
          setIsLoading(false);
        }
        return;
      }

      // Start a new fetch
      isFetchingCollections = true;
      setIsLoading(true);
      
      collectionsPromise = (async () => {
        try {
          const token = await getToken();
          if (!token) {
            throw new Error('Unable to get auth token');
          }

          const response = await collectionService.getCollections(token);
          
          if (response.success && response.data) {
            globalCollections = response.data;
            notifySubscribers();
            setError(null);
          } else {
            throw new Error(response.error || 'Failed to fetch collections');
          }
        } catch (err) {
          setError(err as Error);
          throw err;
        } finally {
          isFetchingCollections = false;
          collectionsPromise = null;
          setIsLoading(false);
        }
      })();

      try {
        await collectionsPromise;
      } catch {
        // Error already handled above
      }
    };

    fetchCollections();

    // Cleanup subscription
    return () => {
      subscribers.delete(updateCollections);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return { collections, isLoading, error };
}

export function useCollectionsWithStats() {
  const [collections, setCollections] = useState<CollectionWithStats[]>(globalCollectionsWithStats);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, getToken } = useUser();

  useEffect(() => {
    // Subscribe to global state changes
    const updateCollections = (newCollections: CollectionWithStats[]) => {
      setCollections(newCollections);
    };
    
    statsSubscribers.add(updateCollections);
    
    // Fetch collections with stats from API with deduplication
    const fetchCollections = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      // If data already exists, use it immediately
      if (globalCollectionsWithStats.length > 0) {
        setCollections(globalCollectionsWithStats);
        setIsLoading(false);
        setError(null);
        return;
      }

      // If a fetch is already in progress, wait for it
      if (isFetchingStats && statsPromise) {
        try {
          await statsPromise;
          setCollections(globalCollectionsWithStats);
          setIsLoading(false);
          setError(null);
        } catch (err) {
          setError(err as Error);
          setIsLoading(false);
        }
        return;
      }

      // Start a new fetch
      isFetchingStats = true;
      setIsLoading(true);
      
      statsPromise = (async () => {
        try {
          const token = await getToken();
          if (!token) {
            throw new Error('Unable to get auth token');
          }

          const response = await collectionService.getCollectionsWithStats(token);
          
          if (response.success && response.data) {
            globalCollectionsWithStats = response.data;
            notifyStatsSubscribers();
            setError(null);
          } else {
            throw new Error(response.error || 'Failed to fetch collections');
          }
        } catch (err) {
          setError(err as Error);
          throw err;
        } finally {
          isFetchingStats = false;
          statsPromise = null;
          setIsLoading(false);
        }
      })();

      try {
        await statsPromise;
      } catch {
        // Error already handled above
      }
    };

    fetchCollections();

    // Cleanup subscription
    return () => {
      statsSubscribers.delete(updateCollections);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return { collections, isLoading, error };
}

// Helper functions to notify all subscribers
const notifySubscribers = () => {
  subscribers.forEach(callback => callback([...globalCollections]));
};

const notifyStatsSubscribers = () => {
  statsSubscribers.forEach(callback => callback([...globalCollectionsWithStats]));
};

export function useCreateCollection() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, getToken } = useUser();

  const createCollection = async (data: CollectionCreate): Promise<Collection> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Unable to get auth token');
      }

      const response = await collectionService.createCollection(data, token);
      
      if (response.success && response.data) {
        // Add to global state and notify subscribers
        globalCollections.push(response.data);
        globalCollectionsWithStats.push({ ...response.data, recipe_count: 0 });
        notifySubscribers();
        notifyStatsSubscribers();
        
        // Invalidate collections stats to refresh recipe counts
        await refreshCollectionsStats();

        return response.data;
      } else {
        throw new Error(response.error || 'Failed to create collection');
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to create collection');
    } finally {
      setIsLoading(false);
    }
  };

  return { createCollection, isLoading };
}

export function useUpdateCollection() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, getToken } = useUser();

  const updateCollection = async (id: string, data: CollectionUpdate): Promise<Collection> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Unable to get auth token');
      }

      const response = await collectionService.updateCollection(id, data, token);
      
      if (response.success && response.data) {
        // Update global state and notify subscribers
        const collectionIndex = globalCollections.findIndex(c => c.id === id);
        const statsIndex = globalCollectionsWithStats.findIndex(c => c.id === id);
        
        if (collectionIndex !== -1) {
          globalCollections[collectionIndex] = response.data;
        }
        
        if (statsIndex !== -1) {
          globalCollectionsWithStats[statsIndex] = { 
            ...response.data, 
            recipe_count: globalCollectionsWithStats[statsIndex].recipe_count 
          };
        }
        
        notifySubscribers();
        notifyStatsSubscribers();

        return response.data;
      } else {
        throw new Error(response.error || 'Failed to update collection');
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to update collection');
    } finally {
      setIsLoading(false);
    }
  };

  return { updateCollection, isLoading };
}

export function useDeleteCollection() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, getToken } = useUser();

  const deleteCollection = async (id: string): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Unable to get auth token');
      }

      const response = await collectionService.deleteCollection(id, token);
      
      if (response.success) {
        // Remove from global state and notify subscribers
        const collectionIndex = globalCollections.findIndex(c => c.id === id);
        const statsIndex = globalCollectionsWithStats.findIndex(c => c.id === id);
        
        if (collectionIndex !== -1) {
          globalCollections.splice(collectionIndex, 1);
        }
        
        if (statsIndex !== -1) {
          globalCollectionsWithStats.splice(statsIndex, 1);
        }
        
        notifySubscribers();
        notifyStatsSubscribers();
      } else {
        throw new Error(response.error || 'Failed to delete collection');
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to delete collection');
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteCollection, isLoading };
}

// Helper function to refresh collections stats
async function refreshCollectionsStats(): Promise<void> {
  // Reset the global state to force a fresh fetch
  globalCollectionsWithStats = [];
  isFetchingStats = false;
  statsPromise = null;
  
  // Notify all stats subscribers to trigger a re-fetch
  notifyStatsSubscribers();
}