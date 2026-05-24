import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Public pages
import Home from "./pages/public/Home";
import IssuesArchive from "./pages/public/IssuesArchive";
import IssueReader from "./pages/public/IssueReader";
import Subscribe from "./pages/public/Subscribe";
import ConfirmEmail from "./pages/public/ConfirmEmail";
import Unsubscribe from "./pages/public/Unsubscribe";
import ReferralLanding from "./pages/public/ReferralLanding";
import Login from "./pages/public/Login";

// Admin pages
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import IssuesList from "./pages/admin/IssuesList";
import IssueEditor from "./pages/admin/IssueEditor";
import SubscribersList from "./pages/admin/SubscribersList";
import AIStudio from "./pages/admin/AIStudio";
import Sponsors from "./pages/admin/Sponsors";
import Referrals from "./pages/admin/Referrals";
import Analytics from "./pages/admin/Analytics";
import Settings from "./pages/admin/Settings";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path={"/"} component={Home} />
      <Route path={"/issues"} component={IssuesArchive} />
      <Route path={"/subscribe"} component={Subscribe} />
      <Route path={"/confirm"} component={ConfirmEmail} />
      <Route path={"/unsubscribe"} component={Unsubscribe} />
      <Route path={"/referral/:code"} component={ReferralLanding} />
      <Route path={"/login"} component={Login} />
      <Route path={"/:slug"} component={IssueReader} />

      {/* Admin routes */}
      <Route path={"/admin/*"}>
        {() => (
          <AdminLayout>
            <Switch>
              <Route path={"/admin/dashboard"} component={Dashboard} />
              <Route path={"/admin/issues"} component={IssuesList} />
              <Route path={"/admin/issues/new"} component={IssueEditor} />
              <Route path={"/admin/issues/:id/edit"} component={IssueEditor} />
              <Route path={"/admin/subscribers"} component={SubscribersList} />
              <Route path={"/admin/ai-studio"} component={AIStudio} />
              <Route path={"/admin/sponsors"} component={Sponsors} />
              <Route path={"/admin/referrals"} component={Referrals} />
              <Route path={"/admin/analytics"} component={Analytics} />
              <Route path={"/admin/settings"} component={Settings} />
              <Route component={NotFound} />
            </Switch>
          </AdminLayout>
        )}
      </Route>

      {/* 404 */}
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable={true}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
