import { pageMetadata } from "@/utils/seo";
import HomeClient from "@/components/HomeClient";

// Exportar metadata para SEO
export const metadata = pageMetadata.home;

export default function Home() {
  return <HomeClient />;
}
