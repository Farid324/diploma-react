import { DataGrid, type GridColDef, type GridRenderCellParams,
  type GridPaginationModel, type GridSortModel } from '@mui/x-data-grid';
import { Box, Chip, IconButton, Stack, Tooltip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, ToggleOn, ToggleOff } from '@mui/icons-material';
import type { UserType, UserStatus } from './type';

type Props = {
  users: UserType[];
  rowCount: number;
  paginationModel: GridPaginationModel;
  setPaginationModel: (m: GridPaginationModel) => void;
  sortModel: GridSortModel;
  setSortModel: (m: GridSortModel) => void;
  onEdit: (u: UserType) => void;
  onDelete: (id: number | string) => void;
  onToggleStatus: (id: number | string, status: UserStatus) => void; // 👈
};

export const UsersTable = ({
  users, rowCount, paginationModel, setPaginationModel,
  sortModel, setSortModel, onEdit, onDelete, onToggleStatus
}: Props) => {
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90, sortable: true },
    { field: 'username', headerName: 'Usuario', flex: 1, sortable: true },
    {
      field: 'status', headerName: 'Estado', width: 150, sortable: true,
      renderCell: (p: GridRenderCellParams<UserType>) => (
        <Chip
          label={p.row.status === 'active' ? 'Activo' : 'Inactivo'}
          color={p.row.status === 'active' ? 'success' : 'default'}
          variant="outlined"
          size="small"
        />
      )
    },
    {
      field: 'actions', headerName: 'Acciones', width: 210, sortable: false, filterable: false,
      renderCell: (p: GridRenderCellParams<any, UserType>) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => onEdit(p.row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title={p.row.status === 'active' ? 'Inactivar' : 'Activar'}>
            <IconButton
              size="small"
              color={p.row.status === 'active' ? 'warning' : 'success'}
              onClick={() => onToggleStatus(p.row.id, p.row.status)}
            >
              {p.row.status === 'active' ? <ToggleOff fontSize="small" /> : <ToggleOn fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Eliminar">
            <IconButton size="small" color="error" onClick={() => onDelete(p.row.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  return (
    <Box height={545}>
      <DataGrid
        rows={users}
        columns={columns}
        rowCount={rowCount}
        paginationMode="server"
        sortingMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        pageSizeOptions={[5, 10, 20]}
        disableColumnFilter
      />
    </Box>
  );
};