import React from "react";
import Footer from "@/Components/Footer";
import Meta from "@/Components/Meta";
import FeatureToggles from "@/Components/AdminPanel/FeatureToggles";

const FeatureTogglesPage = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Meta title="Feature Toggles | Admin" />
      <main className="flex-grow-1">
        <FeatureToggles />
      </main>
      <Footer />
    </div>
  );
};

export default FeatureTogglesPage;
