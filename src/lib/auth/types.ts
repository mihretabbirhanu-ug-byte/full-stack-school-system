export type Role = "admin" | "teacher" | "student" | "parent";

export type SessionPayload = {
  sub: string; // user id
  role: Role;
  username: string;
  iat: number; // seconds since epoch
  exp: number; // seconds since epoch
};

