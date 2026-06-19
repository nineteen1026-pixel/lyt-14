import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppLayout } from "@/components/Layout/AppLayout";
import { Dashboard } from "@/pages/Dashboard";
import { Plants } from "@/pages/Plants";
import { PlantForm } from "@/pages/Plants/PlantForm";
import { PlantDetail } from "@/pages/Plants/PlantDetail";
import { CareLogs } from "@/pages/CareLogs";
import { CareLogForm } from "@/pages/CareLogs/CareLogForm";
import { Leaves } from "@/pages/Leaves";
import { LeafForm } from "@/pages/Leaves/LeafForm";
import { Pests } from "@/pages/Pests";
import { PestForm } from "@/pages/Pests/PestForm";
import { DataCenter } from "@/pages/DataCenter";
import { CarePlans } from "@/pages/CarePlans";
import { CarePlanForm } from "@/pages/CarePlans/CarePlanForm";
import { Environment } from "@/pages/Environment";
import { EnvironmentForm } from "@/pages/Environment/EnvironmentForm";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "plants", element: <Plants /> },
      { path: "plants/new", element: <PlantForm /> },
      { path: "plants/:id", element: <PlantDetail /> },
      { path: "plants/:id/edit", element: <PlantForm /> },
      { path: "care-logs", element: <CareLogs /> },
      { path: "care-logs/new", element: <CareLogForm /> },
      { path: "care-plans", element: <CarePlans /> },
      { path: "care-plans/new", element: <CarePlanForm /> },
      { path: "care-plans/:id/edit", element: <CarePlanForm /> },
      { path: "leaves", element: <Leaves /> },
      { path: "leaves/new", element: <LeafForm /> },
      { path: "pests", element: <Pests /> },
      { path: "pests/new", element: <PestForm /> },
      { path: "environment", element: <Environment /> },
      { path: "environment/new", element: <EnvironmentForm /> },
      { path: "data", element: <DataCenter /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
