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
import BrandsPage from "./pages/dashboard/brands/index.tsx"
import BrandNewPage from "./pages/dashboard/brands/new.tsx"
import BrandEditPage from "./pages/dashboard/brands/edit.tsx"
import CategoriesPage from "./pages/dashboard/categories/index.tsx"
import CategoryNewPage from "./pages/dashboard/categories/new.tsx"
import CategoryEditPage from "./pages/dashboard/categories/edit.tsx"
import CepPage from "./pages/dashboard/cep/index.tsx"
import CepNewPage from "./pages/dashboard/cep/new.tsx"
import CepEditPage from "./pages/dashboard/cep/edit.tsx"
import OrdersPage from "./pages/dashboard/orders/index.tsx"
import OrderDetailPage from "./pages/dashboard/orders/detail.tsx"
import UsersPage from "./pages/dashboard/users/index.tsx"
import UserDetailPage from "./pages/dashboard/users/detail.tsx"
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
                  <Route path="/dashboard/brands" element={<BrandsPage />} />
                  <Route path="/dashboard/brands/new" element={<BrandNewPage />} />
                  <Route path="/dashboard/brands/:id/edit" element={<BrandEditPage />} />
                  <Route path="/dashboard/categories" element={<CategoriesPage />} />
                  <Route path="/dashboard/categories/new" element={<CategoryNewPage />} />
                  <Route path="/dashboard/categories/:id/edit" element={<CategoryEditPage />} />
                  <Route path="/dashboard/cep" element={<CepPage />} />
                  <Route path="/dashboard/cep/new" element={<CepNewPage />} />
                  <Route path="/dashboard/cep/:id/edit" element={<CepEditPage />} />
                  <Route path="/dashboard/orders" element={<OrdersPage />} />
                  <Route path="/dashboard/orders/:id" element={<OrderDetailPage />} />
                  <Route path="/dashboard/users" element={<UsersPage />} />
                  <Route path="/dashboard/users/:id" element={<UserDetailPage />} />
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
