import { createElement, Fragment } from 'react';
import { createBrowserRouter, Outlet, ScrollRestoration } from 'react-router';
import Home from './components/Home';
import AddEditSubscription from './components/AddEditSubscription';
import SubscriptionDetail from './components/SubscriptionDetail';
import PaymentMethods from './components/PaymentMethods';
import Settings from './components/Settings';

function RootLayout() {
  return createElement(
    Fragment,
    null,
    createElement(ScrollRestoration, null),
    createElement(Outlet, null)
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      {
        path: '',
        Component: Home,
      },
      {
        path: 'subscription/new',
        Component: AddEditSubscription,
      },
      {
        path: 'subscription/:id/edit',
        Component: AddEditSubscription,
      },
      {
        path: 'subscription/:id',
        Component: SubscriptionDetail,
      },
      {
        path: 'payment-methods',
        Component: PaymentMethods,
      },
      {
        path: 'settings',
        Component: Settings,
      },
    ],
  },
]);

