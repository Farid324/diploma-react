import {
  Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, TextField, IconButton, InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useActionState, useState } from 'react';
import type { ActionState } from '../../interfaces';
import { createInitialState } from '../../helpers';
import type { UserType } from './type';

type CreateValues = {
  username: string;
  password: string;
  confirmPassword: string;
};
type EditValues = {
  username: string;
};
type FormValues = Partial<CreateValues & EditValues>;

export type UserActionState = ActionState<FormValues>;

type Props = {
  open: boolean;
  onClose: () => void;
  editing?: UserType | null;
  onSubmit: (_: UserActionState | undefined, data: FormData) => Promise<UserActionState | undefined>;
};

export const UserDialog = ({ open, onClose, editing, onSubmit }: Props) => {
  const initialState = createInitialState<FormValues>();
  const [state, submitAction, isPending] = useActionState(onSubmit, initialState);

  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  const showPasswords = !editing;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editing ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
      <Box key={editing?.id ?? 'new'} component="form" action={submitAction}>
        <DialogContent>
          <TextField
            name="username"
            margin="dense"
            label="Usuario"
            fullWidth
            required
            disabled={isPending}
            defaultValue={state?.formData?.username || editing?.username || ''}
            error={!!state?.errors?.username}
            helperText={state?.errors?.username}
            sx={{ mb: 2 }}
          />

          {showPasswords && (
            <>
              <TextField
                name="password"
                margin="dense"
                label="Contraseña"
                type={showPwd ? 'text' : 'password'}
                fullWidth
                required
                disabled={isPending}
                defaultValue={state?.formData?.password}
                error={!!state?.errors?.password}
                helperText={state?.errors?.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPwd(v => !v)} edge="end" aria-label="toggle password">
                        {showPwd ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                name="confirmPassword"
                margin="dense"
                label="Confirmar contraseña"
                type={showPwd2 ? 'text' : 'password'}
                fullWidth
                required
                disabled={isPending}
                defaultValue={state?.formData?.confirmPassword}
                error={!!state?.errors?.confirmPassword}
                helperText={state?.errors?.confirmPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPwd2(v => !v)} edge="end" aria-label="toggle password">
                        {showPwd2 ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={isPending}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isPending}
            startIcon={isPending ? <CircularProgress size={18} /> : null}>
            {editing ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};