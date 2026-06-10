import React, { useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Stack,
  Chip,
  Paper,
  Avatar,
} from '@mui/material';
import {
  CheckCircle,
  HourglassEmpty,
  PlayCircle,
  Assignment,
  TrendingUp,
  EmojiEvents,
} from '@mui/icons-material';
import { useTasks } from '../hooks/useTasks';

function StatCard({ icon, label, value, color, subtitle }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: `${color}.light`,
              color: `${color}.dark`,
              width: 44,
              height: 44,
            }}
          >
            {icon}
          </Avatar>
          <Typography variant="h4" fontWeight={800} color={`${color}.main`}>
            {value}
          </Typography>
        </Box>
        <Typography variant="body2" fontWeight={600} color="text.primary">
          {label}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

const STATUS_LABEL = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done',
};

const STATUS_COLOR = {
  'todo': 'default',
  'in-progress': 'warning',
  'done': 'success',
};

const PRIORITY_COLOR = {
  low: 'info',
  medium: 'warning',
  high: 'error',
};

export default function Dashboard() {
  const { tasks } = useTasks();

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
    const todo = tasks.filter((t) => t.status === 'todo').length;
    const progress = total ? Math.round((done / total) * 100) : 0;
    const highPriorityPending = tasks.filter(
      (t) => t.priority === 'high' && t.status !== 'done',
    ).length;
    return { total, done, inProgress, todo, progress, highPriorityPending };
  }, [tasks]);

  const recentTasks = useMemo(
    () =>
      [...tasks]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6),
    [tasks],
  );

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor your GitOps learning progress at a glance
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<Assignment />}
            label="Total Tasks"
            value={stats.total}
            color="primary"
            subtitle={`${stats.progress}% complete`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<CheckCircle />}
            label="Completed"
            value={stats.done}
            color="success"
            subtitle="Tasks finished"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PlayCircle />}
            label="In Progress"
            value={stats.inProgress}
            color="warning"
            subtitle="Currently active"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<HourglassEmpty />}
            label="To Do"
            value={stats.todo}
            color="info"
            subtitle="Not started yet"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Recent Tasks
            </Typography>
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {recentTasks.map((task) => (
                <Box
                  key={task.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'background.default',
                    border: '1px solid',
                    borderColor: 'divider',
                    gap: 1,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      noWrap
                      sx={{
                        textDecoration: task.status === 'done' ? 'line-through' : 'none',
                        color: task.status === 'done' ? 'text.secondary' : 'text.primary',
                      }}
                    >
                      {task.title}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {new Date(task.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                    <Chip
                      label={STATUS_LABEL[task.status]}
                      size="small"
                      color={STATUS_COLOR[task.status]}
                      sx={{ fontSize: '0.68rem', height: 20 }}
                    />
                    <Chip
                      label={task.priority}
                      size="small"
                      color={PRIORITY_COLOR[task.priority]}
                      variant="outlined"
                      sx={{ fontSize: '0.68rem', height: 20 }}
                    />
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack spacing={3}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <TrendingUp sx={{ color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={600}>Overall Progress</Typography>
              </Box>
              <Box sx={{ textAlign: 'center', py: 1 }}>
                <Typography variant="h2" fontWeight={800} color="primary.main">
                  {stats.progress}%
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {stats.done} of {stats.total} tasks completed
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={stats.progress}
                  color="primary"
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
            </Paper>

            {stats.highPriorityPending > 0 && (
              <Paper
                sx={{
                  p: 2.5,
                  bgcolor: 'error.light',
                  border: '1px solid',
                  borderColor: 'error.main',
                }}
              >
                <Typography variant="body2" color="error.dark" fontWeight={600}>
                  {stats.highPriorityPending} high-priority task
                  {stats.highPriorityPending !== 1 ? 's' : ''} pending
                </Typography>
                <Typography variant="caption" color="error.dark" sx={{ opacity: 0.8 }}>
                  Focus on these to unblock progress
                </Typography>
              </Paper>
            )}

            {stats.progress === 100 && (
              <Paper
                sx={{
                  p: 2.5,
                  bgcolor: 'success.light',
                  border: '1px solid',
                  borderColor: 'success.main',
                  textAlign: 'center',
                }}
              >
                <EmojiEvents sx={{ color: 'success.dark', fontSize: 32, mb: 0.5 }} />
                <Typography variant="body1" color="success.dark" fontWeight={700}>
                  All tasks complete!
                </Typography>
                <Typography variant="caption" color="success.dark" sx={{ opacity: 0.8 }}>
                  GitOps workflow mastered
                </Typography>
              </Paper>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
