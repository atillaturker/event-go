export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: "USER" | "ORGANIZER";
  createdAt?: Date;
  updatedAt?: Date;
}
