import Sidebar from "~/components/layouts/Sidebar";
import { ProjectedRoute } from "~/components/ProjectedRoute";
import { SidebarProvider } from "~/components/ui/sidebar";
import { handleItemSelect } from "~/lib/utils";
import { useNavigate } from "react-router";

export default function Budget() {
    const navigate = useNavigate();


    return (
        <SidebarProvider>
            <ProjectedRoute>
                <Sidebar
                    selectedItem="budget"
                    onItemSelect={(item) => handleItemSelect(item, navigate)}
                />
                <div>
                    <h1>Budgets</h1>
                </div>
            </ProjectedRoute>
        </SidebarProvider>
    );
}