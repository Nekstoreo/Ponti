import { mockUser } from "@/data/mockUser";
import { UserProfile } from "@/data/types";

export interface LoginInput {
  studentId: string;
  password: string;
}

export async function login({ studentId, password }: LoginInput): Promise<{
  profile: UserProfile;
  isFirstLogin: boolean;
}> {
  // Simula latencia de red
  await new Promise((r) => setTimeout(r, 700));

  if (studentId === "000123456" && password === "password") {
    return { profile: mockUser, isFirstLogin: true };
  }

  const error = new Error("ID o contraseña incorrectos. Por favor, verifica tus datos.");
  // Attach a code for potential UI-level handling
  (error as Error & { code: string }).code = "INVALID_CREDENTIALS";
  throw error;
}


