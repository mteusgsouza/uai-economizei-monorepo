import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import "@workspace/ui/globals.css"
import "./styles/binance.css"
import LandingPage from "./pages/landing/index.tsx"
import LoginPage from "./pages/login/index.tsx"
import RegisterPage from "./pages/register/index.tsx"
import ForgotPasswordPage from "./pages/forgot-password/index.tsx"
import ResetPasswordPage from "./pages/reset-password/index.tsx"
import DashboardPage from "./pages/dashboard/index.tsx"
import ProductsPage from "./pages/dashboard/products/index.tsx"
import ProductNewPage from "./pages/dashboard/products/new.tsx"
import ProductEditPage from "./pages/dashboard/products/edit.tsx"
import PostsPage from "./pages/dashboard/posts/index.tsx"
import PostNewPage from "./pages/dashboard/posts/new.tsx"
import PostEditPage from "./pages/dashboard/posts/edit.tsx"
import { ProtectedRoute } from "./components/protected-route.tsx"
import { DashboardLayout } from "./components/dashboard-layout.tsx"
import { AuthProvider } from "./contexts/auth-context.tsx"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { Toaster } from "@workspace/ui/components/sonner"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/dashboard/products" element={<ProductsPage />} />
                  <Route path="/dashboard/products/new" element={<ProductNewPage />} />
                  <Route path="/dashboard/products/:id/edit" element={<ProductEditPage />} />
                  <Route path="/dashboard/posts" element={<PostsPage />} />
                  <Route path="/dashboard/posts/new" element={<PostNewPage />} />
                  <Route path="/dashboard/posts/:id/edit" element={<PostEditPage />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
)
