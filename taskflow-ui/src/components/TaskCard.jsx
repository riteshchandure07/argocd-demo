import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  IconButton,
  Box,
  Select,
  MenuItem,
  FormControl,
  Tooltip,
} from '@mui/material';
import { Delete, AccessTime, FiberManualRecord } from '@mui/icons-material';

const STATUS_CONFIG = {
  'todo': { label: 'To Do', color: 'default' },
  'in-progress': { label: 'In Progress', color: 'warning' },
  'done': { label: 'Done', color: 'success' },
};

const PRIORITY_CONFIG = {
  low: { color: 'info', dot: '#3b82f6' },
  medium: { color: 'warning', dot: '#f59e0b' },
  high: { color: 'error', dot: '#ef4444' },
};

export default function TaskCard({ task, onDelete, onStatusChange }) {
  const priorityConf = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const statusConf = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
  const isDone = task.status === 'done';

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        opacity: isDone ? 0.75 : 1,
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 8px 24px rgb(99 102 241 / 0.12)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{
              lineHeight: 1.4,
              textDecoration: isDone ? 'line-through' : 'none',
              color: isDone ? 'text.secondary' : 'text.primary',
              mr: 1,
            }}
          >
            {task.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <FiberManualRecord sx={{ fontSize: 10, color: priorityConf.dot, mr: 0.3 }} />
            <Chip
              label={task.priority}
              color={priorityConf.color}
              size="small"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.68rem' }}
            />
          </Box>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, lineHeight: 1.6 }}
        >
          {task.description}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.disabled' }}>
          <AccessTime sx={{ fontSize: 13 }} />
          <Typography variant="caption">
            {new Date(task.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, justifyContent: 'space-between' }}>
        <FormControl size="small">
          <Select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value)}
            sx={{ minWidth: 140, fontSize: '0.8rem' }}
          >
            <MenuItem value="todo">To Do</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="done">Done</MenuItem>
          </Select>
        </FormControl>

        <Tooltip title="Delete task" placement="top">
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(task.id)}
            sx={{
              '&:hover': { bgcolor: 'error.light' },
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
