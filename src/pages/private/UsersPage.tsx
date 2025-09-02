//src/pages/private/UsersPage.tsx
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import type { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { useAlert, useAxios } from '../../hooks';
import { errorHelper, hanleZodError } from '../../helpers';
import { UsersHeader } from '../../components/users/UsersHeader';
import { UsersFilter } from '../../components/users/UsersFilter';
import { UsersTable } from '../../components/users/UsersTable';
import { UserDialog, type UserActionState } from '../../components/users/UserDialog';
import type { UserType, UserFilterStatus, UserStatus } from '../../components/users/type';
import z from 'zod';

const createSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  confirmPassword: z.string().min(6)
}).refine(d => d.password === d.confirmPassword, { message: 'Las contraseñas no coinciden', path: ['confirmPassword'] });

const editSchema = z.object({ username: z.string().min(3) });

export const UsersPage = () => {
  const axios = useAxios();
  const { showAlert } = useAlert();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<UserFilterStatus>('all'); // 👈

  const [users, setUsers] = useState<UserType[]>([]);
  const [total, setTotal] = useState(0);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UserType | null>(null);

  useEffect(() => { listUsers(); }, [search, filterStatus, paginationModel, sortModel]); // eslint-disable-line

  /*const normalizeUser = (u: any): UserType => ({
    id: u.id ?? u.userId ?? u._id,
    username: u.username ?? u.name ?? u.email ?? '',
    // Soporta backends con status o con active:boolean
    status: typeof u.status === 'string'
      ? (u.status === 'active' ? 'active' : 'inactive')
      : (u.active === true ? 'active' : 'inactive'),
  });*/
  type BackendUserRaw = {
  id?: number | string;
  userId?: number | string;
  _id?: number | string;
  username?: string;
  name?: string;
  email?: string;
  status?: 'active' | 'inactive' | string | null | undefined;
  active?: boolean | null | undefined;
  };

  const toStatus = (raw: BackendUserRaw['status'] | BackendUserRaw['active']): UserStatus => {
    if (typeof raw === 'string') return raw.toLowerCase() === 'active' ? 'active' : 'inactive';
    if (typeof raw === 'boolean') return raw ? 'active' : 'inactive';
    return 'inactive';
  };

  const normalizeUser = (u: BackendUserRaw): UserType => ({
    // Asumimos que el backend SIEMPRE trae algún id; si no, puedes poner un fallback propio.
    id: (u.id ?? u.userId ?? u._id)!,
    username: u.username ?? u.name ?? u.email ?? '',
    status: toStatus(u.status ?? u.active),
  });
  const listUsers = async () => {
    try {
      const orderBy = sortModel[0]?.field;
      const orderDir = sortModel[0]?.sort;

      const res = await axios.get('/users', {
        params: {
          page: paginationModel.page + 1,
          limit: paginationModel.pageSize,
          search,
          // backend del profe: status=active|inactive ; fallback para active=true|false
          status: filterStatus === 'all' ? undefined : filterStatus,
          active: filterStatus === 'all' ? undefined : (filterStatus === 'active' ? true : false),
          orderBy, orderDir
        }
      });

      const arr = (res.data.data ?? res.data.items ?? res.data.users ?? []) as BackendUserRaw[];
      const mapped: UserType[] = Array.isArray(arr) ? arr.map(normalizeUser) : [];
      setUsers(mapped);

      const totalVal = res.data.total ?? res.data.count ?? res.data.meta?.total ?? mapped.length;
      setTotal(Number(totalVal) || 0);
    } catch (e) {
      showAlert(errorHelper(e), 'error');
    }
  };

  // ✅ Toggle compatible con ambos estilos (status y active)
  const onToggleStatus = async (id: number | string, status: UserStatus) => {
    try {
      const confirmed = window.confirm('¿Estás seguro de que quieres cambiar el estado?');
      if (!confirmed) return;

      const next: UserStatus = status === 'active' ? 'inactive' : 'active';

      const tries = [
        // Backend del profe (lo que te pasó tu amigo)
        () => axios.patch(`/users/${id}`, { status: next }),
        () => axios.patch(`/users/${id}/status`, { status: next }),
        () => axios.put(`/users/${id}`, { status: next }),

        // Fallback a boolean
        () => axios.patch(`/users/${id}`, { active: next === 'active' }),
        () => axios.patch(`/users/${id}/active`, { active: next === 'active' }),
        () => axios.put(`/users/${id}`,   { active: next === 'active' }),
      ];

      let lastErr: unknown = null;
      for (const t of tries) {
        try { await t(); lastErr = null; break; } catch (e) { lastErr = e; }
      }
      if (lastErr) throw lastErr;

      showAlert('Usuario modificado', 'success');
      listUsers();
    } catch (error) {
      showAlert(errorHelper(error), 'error');
    }
  };

  const onDelete = async (id: number | string) => {
    try {
      const ok = window.confirm('¿Eliminar usuario?');
      if (!ok) return;
      await axios.delete(`/users/${id}`);
      showAlert('Usuario eliminado', 'success');
      listUsers();
    } catch (e) {
      showAlert(errorHelper(e), 'error');
    }
  };

  const onOpen = () => { setEditing(null); setOpen(true); };
  const onEdit = (u: UserType) => { setEditing(u); setOpen(true); };
  const onClose = () => { setOpen(false); setEditing(null); };

  const onSubmit = async (_: UserActionState | undefined, formData: FormData) => {
    const raw = {
      username: (formData.get('username') as string) ?? '',
      password: (formData.get('password') as string) ?? '',
      confirmPassword: (formData.get('confirmPassword') as string) ?? '',
    };

    try {
      if (editing?.id) {
        editSchema.parse({ username: raw.username });
        // No fuerzo status aquí para no romper PUT si no acepta ese campo
        await axios.put(`/users/${editing.id}`, { username: raw.username });
        showAlert('Usuario actualizado', 'success');
      } else {
        createSchema.parse(raw);
        await axios.post('/users', { username: raw.username, password: raw.password });
        showAlert('Usuario creado', 'success');
      }
      listUsers(); onClose();
      return;
    } catch (e) {
      const err = hanleZodError<typeof raw>(e, raw);
      showAlert(err.message, 'error');
      return err;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <UsersHeader onOpen={onOpen} />
      <UsersFilter
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        setSearch={setSearch}
      />
      <UsersTable
        users={users}
        rowCount={total}
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        sortModel={sortModel}
        setSortModel={setSortModel}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleStatus={onToggleStatus}
      />
      <UserDialog open={open} onClose={onClose} editing={editing} onSubmit={onSubmit} />
    </Box>
  );
};