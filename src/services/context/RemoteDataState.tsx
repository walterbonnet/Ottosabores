import React, { createContext, useContext, useState, useEffect } from 'react';
import { Recipe, Festival, MultimediaItem } from '../../types';
import { recipesRepository } from '../repositories/recipesRepository';
import { festivalsRepository } from '../repositories/festivalsRepository';
import { multimediaRepository } from '../repositories/multimediaRepository';
import { RECIPES, FESTIVALS, MULTIMEDIA_ITEMS } from '../mockData';

interface RemoteDataContextType {
  recipes: Recipe[];
  festivals: Festival[];
  multimediaItems: MultimediaItem[];
  isLoadingRecipes: boolean;
  isLoadingFestivals: boolean;
  isLoadingMultimedia: boolean;
  refreshRecipes: () => Promise<void>;
  refreshFestivals: () => Promise<void>;
  refreshMultimedia: () => Promise<void>;
}

const RemoteDataContext = createContext<RemoteDataContextType | undefined>(undefined);

export const RemoteDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recipes, setRecipes] = useState<Recipe[]>(RECIPES);
  const [festivals, setFestivals] = useState<Festival[]>(FESTIVALS);
  const [multimediaItems, setMultimediaItems] = useState<MultimediaItem[]>(MULTIMEDIA_ITEMS);

  const [isLoadingRecipes, setIsLoadingRecipes] = useState<boolean>(true);
  const [isLoadingFestivals, setIsLoadingFestivals] = useState<boolean>(true);
  const [isLoadingMultimedia, setIsLoadingMultimedia] = useState<boolean>(true);

  const refreshRecipes = async () => {
    setIsLoadingRecipes(true);
    try {
      const data = await recipesRepository.getAll();
      setRecipes(data.length > 0 ? data : RECIPES);
    } catch (e) {
      setRecipes(RECIPES);
    } finally {
      setIsLoadingRecipes(false);
    }
  };

  const refreshFestivals = async () => {
    setIsLoadingFestivals(true);
    try {
      const data = await festivalsRepository.getAll();
      setFestivals(data.length > 0 ? data : FESTIVALS);
    } catch (e) {
      setFestivals(FESTIVALS);
    } finally {
      setIsLoadingFestivals(false);
    }
  };

  const refreshMultimedia = async () => {
    setIsLoadingMultimedia(true);
    try {
      const data = await multimediaRepository.getAll();
      setMultimediaItems(data.length > 0 ? data : MULTIMEDIA_ITEMS);
    } catch (e) {
      setMultimediaItems(MULTIMEDIA_ITEMS);
    } finally {
      setIsLoadingMultimedia(false);
    }
  };

  useEffect(() => {
    refreshRecipes();
    refreshFestivals();
    refreshMultimedia();
  }, []);

  const value: RemoteDataContextType = {
    recipes,
    festivals,
    multimediaItems,
    isLoadingRecipes,
    isLoadingFestivals,
    isLoadingMultimedia,
    refreshRecipes,
    refreshFestivals,
    refreshMultimedia,
  };

  return <RemoteDataContext.Provider value={value}>{children}</RemoteDataContext.Provider>;
};

export const useRemoteData = () => {
  const context = useContext(RemoteDataContext);
  if (!context) {
    throw new Error('useRemoteData must be used within a RemoteDataProvider');
  }
  return context;
};
