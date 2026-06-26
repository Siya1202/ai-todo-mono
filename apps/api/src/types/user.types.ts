export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
}
