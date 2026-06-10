import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'taskflow_tasks';

const defaultTasks = [
  {
    id: uuidv4(),
    title: 'Set up Minikube cluster',
    description: 'Install and configure Minikube for local Kubernetes development. Enable the ingress addon.',
    status: 'done',
    priority: 'high',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Install Argo CD in cluster',
    description: 'Deploy Argo CD to the argocd namespace and expose the server via port-forward or ingress.',
    status: 'done',
    priority: 'high',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Create Helm chart for taskflow-ui',
    description: 'Write Helm chart with deployment, service, and ingress templates. Make replicas and image tag configurable.',
    status: 'in-progress',
    priority: 'high',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Set up GitHub Actions CI/CD pipeline',
    description: 'Configure workflow to build Docker image, push to Docker Hub, and update values.yaml in gitops repo.',
    status: 'in-progress',
    priority: 'medium',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Configure Argo CD Application manifest',
    description: 'Create the ArgoCD Application CRD pointing to the gitops repo with automated sync and self-heal enabled.',
    status: 'todo',
    priority: 'medium',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Test end-to-end GitOps workflow',
    description: 'Push a code change, verify GitHub Actions builds the image, and confirm Argo CD rolls out the new version automatically.',
    status: 'todo',
    priority: 'low',
    createdAt: new Date().toISOString(),
  },
];

export function useTasks() {
  const [tasks, setTasks] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultTasks;
    } catch {
      return defaultTasks;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // storage quota exceeded — silently ignore
    }
  }, [tasks]);

  const addTask = useCallback((taskData) => {
    const newTask = {
      id: uuidv4(),
      ...taskData,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateTaskStatus = useCallback((id, status) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }, []);

  return { tasks, addTask, deleteTask, updateTaskStatus };
}
