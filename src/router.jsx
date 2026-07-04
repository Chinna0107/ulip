import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import AdminLayout from './components/Layout/AdminLayout';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import GenericPage from './pages/GenericPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      // Overall ULIP Routes
      {
        path: 'overall-ulip',
        children: [
          { path: 'cc-indent', element: <GenericPage title="Overall ULIP - C&C Indent" sheetName="C&C Indents" /> },
          { path: 'department-grant', element: <GenericPage title="Overall ULIP - Department Grant" sheetName="Department Grant " /> },
          { path: 'capital', element: <GenericPage title="Overall ULIP - Capital" sheetName="Capital" /> },
          { path: 'man-power', element: <GenericPage title="Overall ULIP - Man Power" sheetName="Manpower " /> },
          { path: 'tada-indents', element: <GenericPage title="Overall ULIP - TADA Indents" sheetName="TADA Indents" /> },
          { path: 'prioritized-equipments', element: <GenericPage title="Overall ULIP - Prioritized Equipments" sheetName="Prioritized  Equipments" /> },
        ]
      },
      // Startup Grant Routes
      {
        path: 'startup-grant',
        children: [
          { path: 'details', element: <GenericPage title="Startup Grant Details" sheetName="Start up Grant " /> },
          { path: 'cc-indents', element: <GenericPage title="Startup Grant - C&C Indents" sheetName="C&C Indents_Startup grant" /> },
          { path: 'capital', element: <GenericPage title="Startup Grant - Capital" sheetName="Capital_Start up" /> },
          { path: 'overheads', element: <GenericPage title="Startup Grant - Overheads" sheetName="Overheads" /> },
          { path: 'tech-hr-budget', element: <GenericPage title="Startup Grant - Tech HR Budget" sheetName="Tech HR Budget" /> },
          { path: 'irg-indent-details', element: <GenericPage title="Startup Grant - IRG Indent Details" sheetName="IRG Indent details" /> },
          { path: 'no-of-pa', element: <GenericPage title="Startup Grant - No of PA-I,II" sheetName="No of PA-I, II" /> },
          { path: 'consolidated', element: <GenericPage title="Startup Grant - Consolidated" sheetName="Consolidated " /> },
          { path: 'ulip-budget', element: <GenericPage title="Startup Grant - ULIP Budget" sheetName="ULIP Budget" /> },
        ]
      }
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />
  }
]);
