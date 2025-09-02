import { Box, Button, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

export const UsersHeader = ({ onOpen }: { onOpen: () => void }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
    <Typography variant="h5" fontWeight="bold">Usuarios</Typography>
    <Button variant="contained" startIcon={<AddIcon />} onClick={onOpen} sx={{ borderRadius: 3 }}>
      Nuevo usuario
    </Button>
  </Box>
);