// import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Signin from './pages/Signin.jsx';
import Account from './pages/Account.jsx';
import NavBar from './components/NavBar.jsx';
import NotFound from './pages/NotFound.jsx';
import SelectRole from './pages/SelectRole.jsx';
import PublicRoute from './guards/publicRoute.jsx';
import ProtectedRoute from './guards/protectedRoute.jsx';
import OutletDashboard from './pages/OutletDashboard.js';
import RiderDashboard from './pages/RiderDashboard.js';
import PaymentSuccess from './pages/PaymentSuccess.js';
import { useAppData } from './context/AppContext.js';
import OrderSuccess from './pages/OrderSuccess.js';
import OutletPage from './pages/OutletPage.js';
import OrderPage from './pages/OrderPage.js';
import Checkout from './pages/Checkout.js';
import Address from './pages/Address.js';
import Orders from './pages/Orders.js';
import Admin from './pages/Admin.js';
import Cart from './pages/Cart.js';

const router = createBrowserRouter([
{
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: (
          <div>
            <NavBar />
            <Home />
          </div>
        ),
      },
      {
        path: "/select-role",
        element: <SelectRole />,
      },
      {
        path: "/account",
        element: <Account />,
      },
      {
        path: "/outlet/:outletId",
        element: <div>
          <NavBar />
          <OutletPage />
        </div>,
      },
      {
        path: "/cart",
        element: <Cart />,
      },
      {
        path: "/orders",
        element: <Orders />,
      },
      {
        path: "/order/:orderId",
        element: <OrderPage />,
      },
      {
        path: "/address",
        element: <Address />,
      },
      {
        path: "/checkout",
        element: <Checkout />,
      },
      {
        path: "/paymentsuccess/:paymentId",
        element: <PaymentSuccess />,
      },
      {
        path: "/ordersuccess",
        element: <OrderSuccess />,
      },


      
      {
        path: "/seller",
        element: <OutletDashboard />,
      },
      {
        path: "/rider",
        element: <RiderDashboard />,
      },
      {
        path: "/admin",
        element: <Admin />,
      },
    ],
  },

{
    element: <PublicRoute />,
    children: [
      {
        path: "/login",
        element: <Signin />,
      },
    ],
  },


  {
    path: "*",
    element:
    <div>
      <NotFound />
    </div>,
  }
]);


const App = () => {
  const { loading } = useAppData();

  if (loading) {
    return (
      <h1 className="text-2xl font-bold text-red-500 text-center mt-56">
        Loading...
      </h1>
    );
  }

  return (
    <div className=" text-3xl ">
      <RouterProvider router={router} />
    </div>
  )
}

export default App
