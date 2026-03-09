import { useState, useCallback } from 'react';
import { taskApi } from '../services/taskApi';
import toast from 'react-hot-toast';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10,
  });

  const fetchTasks = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskApi.getTasks(params);
      const { data } = response.data;
      setTasks(data.content);
      setPagination({
        currentPage: data.number,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
        pageSize: data.size,
      });
    } catch (err) {
      const msg = err.displayMessage || 'Failed to fetch tasks';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (taskData) => {
    setLoading(true);
    try {
      const response = await taskApi.createTask(taskData);
      toast.success('Task created successfully!');
      return response.data.data;
    } catch (err) {
      const msg = err.displayMessage || 'Failed to create task';
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTask = useCallback(async (id, taskData) => {
    setLoading(true);
    try {
      const response = await taskApi.updateTask(id, taskData);
      toast.success('Task updated successfully!');
      return response.data.data;
    } catch (err) {
      const msg = err.displayMessage || 'Failed to update task';
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTaskStatus = useCallback(async (id, status) => {
    try {
      const response = await taskApi.updateTaskStatus(id, status);
      toast.success('Status updated!');
      return response.data.data;
    } catch (err) {
      const msg = err.displayMessage || 'Failed to update status';
      toast.error(msg);
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (id) => {
    try {
      await taskApi.deleteTask(id);
      toast.success('Task deleted successfully!');
    } catch (err) {
      const msg = err.displayMessage || 'Failed to delete task';
      toast.error(msg);
      throw err;
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    pagination,
    fetchTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
  };
};