import React from 'react';
import { Box, Typography, Chip, Stack } from '@mui/material';
import { RocketLaunch, GitHub, Hub } from '@mui/icons-material';

const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: { xs: 2, sm: 3, md: 4 },
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        mt: 'auto',
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          TaskFlow UI — Production GitOps demo with Argo CD &amp; Minikube
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <Hub sx={{ fontSize: 15, color: 'text.disabled' }} />
          <Typography variant="caption" color="text.disabled">
            Kubernetes
          </Typography>
          <GitHub sx={{ fontSize: 15, color: 'text.disabled' }} />
          <Typography variant="caption" color="text.disabled">
            GitOps
          </Typography>
          <RocketLaunch sx={{ fontSize: 15, color: 'primary.main' }} />
          <Chip
            label={`v${APP_VERSION}`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.72rem',
              height: 22,
              borderRadius: 1,
            }}
          />
        </Stack>
      </Box>
    </Box>
  );
}
