import {
  FormControl, IconButton, InputAdornment, InputLabel, MenuItem,
  Paper, Select, TextField, Toolbar
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import type { UserFilterStatus } from './type';

type Props = {
  filterStatus: UserFilterStatus;
  setFilterStatus: (v: UserFilterStatus) => void;
  setSearch: (v: string) => void;
};

export const UsersFilter = ({ filterStatus, setFilterStatus, setSearch }: Props) => {
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchFilter), 500);
    return () => clearTimeout(t);
  }, [searchFilter, setSearch]);

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 3 }}>
      <Toolbar sx={{ gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Buscar por nombre..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchFilter && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchFilter('')}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: 170 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            value={filterStatus}
            label="Estado"
            onChange={(e) => setFilterStatus(e.target.value as UserFilterStatus)}
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="active">Activos</MenuItem>
            <MenuItem value="inactive">Inactivos</MenuItem>
          </Select>
        </FormControl>
      </Toolbar>
    </Paper>
  );
};