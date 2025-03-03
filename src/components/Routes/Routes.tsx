import { useEffect } from "react";
import {
  Navigate,
  Route,
  Routes as ReactRouterRoutes,
  useLocation,
} from "react-router-dom";

import Login from "components/LogIn/LogIn";

import ControllersIndex from "pages/ControllersIndex/ControllersIndex";
import ModelsIndex from "pages/ModelsIndex/ModelsIndex";

// Entity Detail pages
import ModelDetails from "pages/ModelDetails/ModelDetails";

import Settings from "pages/Settings/Settings";

// Error pages
import PageNotFound from "pages/PageNotFound/PageNotFound";

import useAnalytics from "hooks/useAnalytics";

export type EntityDetailsRoute = {
  userName: string;
  modelName: string;
  appName: string;
  unitId: string;
  machineId: string;
};

export function Routes() {
  const sendAnalytics = useAnalytics();
  const location = useLocation();

  useEffect(() => {
    // Send an analytics event when the URL changes.
    sendAnalytics({
      path: window.location.href.replace(window.location.origin, ""),
    });
  }, [location, sendAnalytics]);

  return (
    <ReactRouterRoutes>
      <Route path="/" element={<Navigate to="/models" />} />
      <Route
        path="/models"
        element={
          <Login>
            <ModelsIndex />
          </Login>
        }
      />
      <Route
        path="/models/:userName/:modelName/*"
        element={
          <Login>
            <ModelDetails />
          </Login>
        }
      />
      <Route
        path="/controllers"
        element={
          <Login>
            <ControllersIndex />
          </Login>
        }
      />
      <Route
        path="/settings"
        element={
          <Login>
            <Settings />
          </Login>
        }
      />
      <Route path="*" element={<PageNotFound />} />
    </ReactRouterRoutes>
  );
}
