import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import Documents from "./pages/Documents";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const RootLayout = () => (
  <TooltipProvider>
    <Sonner />
    <Outlet />
  </TooltipProvider>
);

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <Documents /> },
          { path: "/editor", element: <Index /> },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

const App = () => <RouterProvider router={router} />;

export default App;
