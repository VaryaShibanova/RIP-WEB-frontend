// useTree.ts
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import {
  fetchUserTrees,
  fetchModeratorTrees,
  fetchTreeById,
  addToTree,
  updateTreeItem,
  removeFromTree,
  submitTree,
  updateTree,
  deleteTree,
  completeTree,
  clearError,
  clearCurrentTree
} from '../slices/treeSlice';

export const useTrees = () => {
  const dispatch = useAppDispatch();
  const trees = useAppSelector(state => state.trees);
  const { user } = useAppSelector(state => state.auth);

  const isModerator = user?.is_moderator;

  const loadUserTrees = useCallback(async () => {
    try {
      if (isModerator) {
        await dispatch(fetchModeratorTrees()).unwrap();
      } else {
        await dispatch(fetchUserTrees()).unwrap();
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error as string };
    }
  }, [dispatch, isModerator]);

  const loadModeratorTrees = useCallback(async (filters?: { status?: string; date_from?: string; date_to?: string }) => {
    try {
      await dispatch(fetchModeratorTrees(filters)).unwrap();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error as string };
    }
  }, [dispatch]);

  const loadTree = useCallback(async (treeId: number) => {
    try {
      await dispatch(fetchTreeById(treeId)).unwrap();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error as string };
    }
  }, [dispatch]);

  const addToTreeItem = useCallback(async (anomalyId: number) => {
    try {
      await dispatch(addToTree(anomalyId)).unwrap();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error as string };
    }
  }, [dispatch]);

  const updateItem = useCallback(async (treeId: number, anomalyId: number, anomalousRings: string) => {
    try {
      await dispatch(updateTreeItem({ treeId, anomalyId, anomalousRings })).unwrap();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error as string };
    }
  }, [dispatch]);

  const removeFromTreeItem = useCallback(async (treeId: number, anomalyId: number) => {
    try {
      await dispatch(removeFromTree({ treeId, anomalyId })).unwrap();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error as string };
    }
  }, [dispatch]);

  const submit = useCallback(async (treeId: number) => {
    try {
      await dispatch(submitTree(treeId)).unwrap();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error as string };
    }
  }, [dispatch]);

  const update = useCallback(async (treeId: number, data: any) => {
    try {
      await dispatch(updateTree({ treeId, data })).unwrap();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error as string };
    }
  }, [dispatch]);

  const remove = useCallback(async (treeId: number) => {
    try {
      await dispatch(deleteTree(treeId)).unwrap();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error as string };
    }
  }, [dispatch]);

  const completeTreeAction = useCallback(async (treeId: number, action: string) => {
    try {
      await dispatch(completeTree({ treeId, action })).unwrap();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error as string };
    }
  }, [dispatch]);

  const resetError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const resetCurrentTree = useCallback(() => {
    dispatch(clearCurrentTree());
  }, [dispatch]);

  return {
    // State
    trees: trees.trees,
    currentTree: trees.currentTree,
    isLoading: trees.isLoading,
    error: trees.error,
    isModerator,
    
    // Actions
    loadUserTrees,
    loadModeratorTrees,
    loadTree,
    addToTree: addToTreeItem,
    updateItem,
    removeFromTree: removeFromTreeItem,
    submit,
    update,
    remove,
    completeTree: completeTreeAction,
    resetError,
    resetCurrentTree,
  };
};