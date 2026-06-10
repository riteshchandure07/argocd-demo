import React, { useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Paper,
  Divider,
} from '@mui/material';
import { Add, Search, FilterList } from '@mui/icons-material';
import TaskCard from '../components/TaskCard';
import AddTaskDialog from '../components/AddTaskDialog';
import { useTasks } from '../hooks/useTasks';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const PRIORITY_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export default function TaskList() {
  const { tasks, addTask, deleteTask, updateTaskStatus } = useTasks();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (search) {
        const q = search.toLowerCase();
        if (!t.title.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      return true;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Tasks
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {filtered.length} of {tasks.length} tasks shown
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
          disableElevation
          size="large"
        >
          Add Task
        </Button>
      </Box>

      <Paper sx={{ p: 2.5, mb: 3 }}>
        <Stack spacing={2}>
          <TextField
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />

          <Divider />

          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <FilterList sx={{ color: 'text.secondary', fontSize: 18 }} />
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Status:
              </Typography>
              <ToggleButtonGroup
                value={statusFilter}
                exclusive
                onChange={(_, v) => v && setStatusFilter(v)}
                size="small"
              >
                {STATUS_OPTIONS.map(({ value, label }) => (
                  <ToggleButton
                    key={value}
                    value={value}
                    sx={{ textTransform: 'none', px: 2, py: 0.5, fontSize: '0.8rem' }}
                  >
                    {label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Priority:
              </Typography>
              <ToggleButtonGroup
                value={priorityFilter}
                exclusive
                onChange={(_, v) => v && setPriorityFilter(v)}
                size="small"
              >
                {PRIORITY_OPTIONS.map(({ value, label }) => (
                  <ToggleButton
                    key={value}
                    value={value}
                    sx={{ textTransform: 'none', px: 2, py: 0.5, fontSize: '0.8rem' }}
                  >
                    {label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Box>
        </Stack>
      </Paper>

      {filtered.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 10,
            px: 2,
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tasks found
          </Typography>
          <Typography variant="body2" color="text.disabled">
            {tasks.length === 0
              ? 'Add your first task to get started'
              : 'Try adjusting your search or filters'}
          </Typography>
          {tasks.length === 0 && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setDialogOpen(true)}
              disableElevation
              sx={{ mt: 3 }}
            >
              Add First Task
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {filtered.map((task) => (
            <Grid item xs={12} sm={6} lg={4} key={task.id}>
              <TaskCard
                task={task}
                onDelete={deleteTask}
                onStatusChange={updateTaskStatus}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <AddTaskDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdd={addTask}
      />
    </Box>
  );
}
