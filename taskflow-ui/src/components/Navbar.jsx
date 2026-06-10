import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Chip,
} from '@mui/material';
import { CheckCircleOutline, Dashboard, FormatListBulleted } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', path: '/', icon: <Dashboard sx={{ fontSize: 16 }} /> },
  { label: 'Tasks', path: '/tasks', icon: <FormatListBulleted sx={{ fontSize: 16 }} /> },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: 'primary.main',
        backgroundImage: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <CheckCircleOutline sx={{ fontSize: 28, mr: 0.5 }} />
        <Typography
          variant="h6"
          fontWeight={700}
          letterSpacing="-0.5px"
          sx={{ flexGrow: 1 }}
        >
          TaskFlow
          <Typography
            component="span"
            variant="caption"
            sx={{ ml: 1, opacity: 0.7, fontWeight: 400 }}
          >
            GitOps Demo
          </Typography>
        </Typography>

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {navItems.map(({ label, path, icon }) => {
            const active = location.pathname === path;
            return (
              <Button
                key={path}
                component={Link}
                to={path}
                startIcon={icon}
                size="small"
                sx={{
                  color: 'white',
                  bgcolor: active ? 'rgba(255,255,255,0.2)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
                  px: 2,
                  borderRadius: 2,
                }}
              >
                {label}
              </Button>
            );
          })}
        </Box>

        <Chip
          label="Argo CD"
          size="small"
          sx={{
            ml: 1,
            bgcolor: 'rgba(255,255,255,0.15)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            fontWeight: 600,
            fontSize: '0.7rem',
          }}
        />
      </Toolbar>
    </AppBar>
  );
}
