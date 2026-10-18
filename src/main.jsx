/* eslint-disable react-refresh/only-export-components -- entry file */
import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import SiteLayout from "./layouts/SiteLayout.jsx";
import Home from "./pages/Home.jsx";
import LoadingFallback from "./components/LoadingFallback.jsx";

// Multi-page build (v28): every section of the old one-pager is now its own
// route inside the shared SiteLayout chrome. Home stays eager (it owns the
// cinematic hero); everything else code-splits for a lighter first paint.
const AboutPage = lazy(() => import("./pages/AboutPage.jsx"));
const SkillsPage = lazy(() => import("./pages/SkillsPage.jsx"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage.jsx"));
const ServicesPage = lazy(() => import("./pages/ServicesPage.jsx"));
const JourneyPage = lazy(() => import("./pages/JourneyPage.jsx"));
const ContactPage = lazy(() => import("./pages/ContactPage.jsx"));
const CertificatesPage = lazy(() => import("./pages/CertificatesPage.jsx"));
const Admin = lazy(() => import("./pages/Admin.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

const page = (Comp) => (
  <Suspense fallback={<LoadingFallback />}>
    <Comp />
  </Suspense>
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={page(AboutPage)} />
          <Route path="/skills" element={page(SkillsPage)} />
          <Route path="/projects" element={page(ProjectsPage)} />
          <Route path="/services" element={page(ServicesPage)} />
          <Route path="/journey" element={page(JourneyPage)} />
          <Route path="/certificates" element={page(CertificatesPage)} />
          <Route path="/contact" element={page(ContactPage)} />
        </Route>
        <Route path="/admin" element={page(Admin)} />
        <Route path="*" element={page(NotFound)} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
