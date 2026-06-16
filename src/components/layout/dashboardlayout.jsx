import React from "react";
import Navbar from "./navbar.jsx";
// import AppsideBar from "../../layout/AppsideBar.js";

const Dashboardlayout = ({ children, logout }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">

      <div className="flex-1">
        {/* <Navbar logout={logout} /> */}
      <h1 style={{fontSize: "30px"}}>NAVBAR TEST</h1>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Dashboardlayout;