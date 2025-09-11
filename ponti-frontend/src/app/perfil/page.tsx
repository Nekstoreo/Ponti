"use client";

import MainLayout from "@/components/MainLayout";
import { UserProfileComponent } from "@/components/profile/UserProfile";
import { mockUser, mockAcademicInfo } from "@/data/mockUser";

export default function PerfilPage() {
  const handleEdit = () => {
    // Aquí iría la lógica para editar el perfil
    console.log("Editar perfil");
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <UserProfileComponent
          user={mockUser}
          academicInfo={mockAcademicInfo}
          onEdit={handleEdit}
        />
      </div>
    </MainLayout>
  );
}
