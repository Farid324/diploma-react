export type UserStatus = 'active' | 'inactive';

export type UserType = {
  id: number | string;
  username: string;
  status: UserStatus; // 👈 clave: usamos status, no active
};

export type UserFilterStatus = 'all' | UserStatus;