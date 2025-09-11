import MainLayout from "@/components/MainLayout";
import { ServiceDirectory } from "@/components/services/ServiceDirectory";

export default function ServiciosPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <ServiceDirectory />
      </div>
    </MainLayout>
  );
}
