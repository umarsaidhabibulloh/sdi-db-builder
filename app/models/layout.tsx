// app/models/layout.tsx
import ModelsShell from "./ModelsShell";
import { query } from "@/lib/db";

export default async function ModelsLayout({ children }: { children: React.ReactNode }) {
    // server-side fetch of model names for the sidebar
    const res = await query("SELECT name FROM db_models ORDER BY created_at DESC");
    const models: { name: string }[] = res.rows || [];

    return <ModelsShell models={models}>{children}</ModelsShell>;
}
