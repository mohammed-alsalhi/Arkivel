import { requireModule } from "@/modules/enabled";
import ImportForm from "./ImportForm";

export const dynamic = "force-dynamic";

export default async function ImportPage() {
  await requireModule("import");
  return <ImportForm />;
}
