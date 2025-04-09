import { useEffect, useRef, useState } from 'react';
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import NotFound from 'components/share/not.found';
import Loading from 'components/share/loading';
import LoginPage from 'pages/auth/login';
import RegisterPage from 'pages/auth/register';
import EmployerRegisterPage from 'pages/auth/employer-register';
import LayoutAdmin from 'components/admin/layout.admin';
import ProtectedRoute from 'components/share/protected-route.ts';
import Header from 'components/client/header.client';
import Footer from 'components/client/footer.client';
import HomePage from 'pages/home';
import styles from 'styles/app.module.scss';
import DashboardPage from './pages/admin/dashboard';
import CompanyPage from './pages/admin/company';
import PermissionPage from './pages/admin/permission';
import ResumePage from './pages/admin/resume';
import RolePage from './pages/admin/role';
import UserPage from './pages/admin/user';
import EmployerVerificationPage from './pages/admin/employer-verification';
import { fetchAccount } from './redux/slice/accountSlide';
import LayoutApp from './components/share/layout.app';
import ViewUpsertJob from './components/admin/job/upsert.job';
import ClientJobPage from './pages/job';
import ClientJobDetailPage from './pages/job/detail';
import ClientCompanyPage from './pages/company';
import ClientCompanyDetailPage from './pages/company/detail';
import JobTabs from './pages/admin/job/job.tabs';
import FavouriteJobsPage from './pages/job/favourite';
import CreateCVForm from './components/client/CreateCVForm';
import SubscriptionPage from './pages/client/subscription';
import SubscriptionPurchasePage from './pages/client/subscription/purchase';
import MyPackagesPage from './pages/client/subscription/my-packages';
import PaymentResultPage from './pages/client/subscription/payment-result';
import SubscriptionManagement from './pages/admin/subscription';
import ProfilePage from './pages/profile';


const LayoutClient = () => {
  const location = useLocation();

  // Check if we're on CV pages to hide the search banner
  const isCVPage = () => {
    const pathname = location.pathname;
    return pathname.includes('/cv') || pathname.includes('/resumes');
  };

  return (
    <div className={styles["layout-app"]}>
      <div className={styles["header-app"]}>
        <Header />
      </div>

      {/* Hide search banner on CV pages */}
      {!isCVPage() && (
        <div className={styles["search-banner-container"]}>
          {/* You can add a search banner component here if needed */}
        </div>
      )}

      <div className={styles["content-app"]}>
        <Outlet />
      </div>
      <div className={styles["footer-app"]}>
        <Footer />
      </div>
    </div>
  );
};

export default function App() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(state => state.account.isLoading);


  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';

    if (token && !isAuthPage) {
      dispatch(fetchAccount());
    } else if (!token && !isAuthPage) {
      // Nếu không có token và không phải trang auth, set isLoading = false
      dispatch({ type: 'account/setLoading', payload: false });
    }
  }, []);

  const router = createBrowserRouter([
    {
      path: "/",
      element: (<LayoutApp><LayoutClient /></LayoutApp>),
      errorElement: <NotFound />,
      children: [
        { index: true, element: <HomePage /> },
        { path: "job", element: <ClientJobPage /> },
        { path: "job/:id", element: <ClientJobDetailPage /> },
        { path: "company", element: <ClientCompanyPage /> },
        { path: "company/:id", element: <ClientCompanyDetailPage /> },
        { path: "company/:id/job", element: <ClientJobPage /> },
        { path: "favourites", element: <FavouriteJobsPage /> },
        { path: "subscription", element: <SubscriptionPage /> },
        { path: "subscription/purchase/:packageId", element: <SubscriptionPurchasePage /> },
        { path: "subscription/my-packages", element: <MyPackagesPage /> },
        { path: "subscription/payment-result", element: <PaymentResultPage /> },
        {
          path: "cv/create",
          element: (
            <ProtectedRoute>
              <CreateCVForm />
            </ProtectedRoute>
          )
        },
        {
          path: "profile",
          element: (
            <ProtectedRoute>
              <LayoutApp>
                <ProfilePage />
              </LayoutApp>
            </ProtectedRoute>
          )
        }
      ],
    },

    {
      path: "/admin",
      element: (<LayoutApp><LayoutAdmin /></LayoutApp>),
      errorElement: <NotFound />,
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          )
        },
        {
          path: "revenue",
          element: (
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          )
        },
        {
          path: "company",
          element:
            <ProtectedRoute>
              <CompanyPage />
            </ProtectedRoute>
        },
        {
          path: "user",
          element:
            <ProtectedRoute>
              <UserPage />
            </ProtectedRoute>
        },

        {
          path: "job",
          children: [
            {
              index: true,
              element: <ProtectedRoute><JobTabs /></ProtectedRoute>
            },
            {
              path: "upsert", element:
                <ProtectedRoute><ViewUpsertJob /></ProtectedRoute>
            }
          ]
        },

        {
          path: "resume",
          element:
            <ProtectedRoute>
              <ResumePage />
            </ProtectedRoute>
        },
        {
          path: "permission",
          element:
            <ProtectedRoute>
              <PermissionPage />
            </ProtectedRoute>
        },
        {
          path: "role",
          element:
            <ProtectedRoute>
              <RolePage />
            </ProtectedRoute>
        },
        {
          path: "employer-verification",
          element:
            <ProtectedRoute>
              <EmployerVerificationPage />
            </ProtectedRoute>
        },
        {
          path: "subscription",
          element:
            <ProtectedRoute>
              <SubscriptionManagement />
            </ProtectedRoute>
        }
      ],
    },


    {
      path: "/login",
      element: <LoginPage />,
    },

    {
      path: "/register",
      element: <RegisterPage />,
    },

    {
      path: "/auth/employer-register",
      element: <EmployerRegisterPage />,
    },

  ]);

  return (
    <>
      {isLoading ? <Loading /> : <RouterProvider router={router} />}
    </>
  )
}