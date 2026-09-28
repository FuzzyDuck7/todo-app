import React, { createContext, useContext, useState, useCallback } from 'react';

const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskModalData, setTaskModalData] = useState(null); // null for new, object for edit

  const [selectedTaskId, setSelectedTaskId] = useState(null); // for details modal
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Global search input in navbar
  const [globalSearch, setGlobalSearch] = useState('');

  // Global refresh counter that triggers refetches across views
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const openCreateTaskModal = useCallback((initialProps = {}) => {
    setTaskModalData(initialProps);
    setIsTaskModalOpen(true);
  }, []);

  const openEditTaskModal = useCallback((task) => {
    setTaskModalData(task);
    setIsTaskModalOpen(true);
  }, []);

  const closeTaskModal = useCallback(() => {
    setIsTaskModalOpen(false);
    setTaskModalData(null);
  }, []);

  const openTaskDetails = useCallback((taskId) => {
    setSelectedTaskId(taskId);
  }, []);

  const closeTaskDetails = useCallback(() => {
    setSelectedTaskId(null);
  }, []);

  const openCreateProjectModal = useCallback(() => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  }, []);

  const openEditProjectModal = useCallback((project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  }, []);

  const closeProjectModal = useCallback(() => {
    setIsProjectModalOpen(false);
    setEditingProject(null);
  }, []);

  return (
    <TaskContext.Provider
      value={{
        isTaskModalOpen,
        taskModalData,
        openCreateTaskModal,
        openEditTaskModal,
        closeTaskModal,

        selectedTaskId,
        openTaskDetails,
        closeTaskDetails,

        isProjectModalOpen,
        editingProject,
        openCreateProjectModal,
        openEditProjectModal,
        closeProjectModal,

        globalSearch,
        setGlobalSearch,

        refreshKey,
        triggerRefresh,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
