import { useParams } from "react-router-dom";
import "../styles/navbar.css";

function Navbar({ toggleSidebar, logout,name }) {
  return (
    <header className="navbar">
      <button onClick={toggleSidebar}>
        ☰
      </button>

      <h2>{name}</h2>

      <button onClick={logout}>
        Logout
      </button>
    </header>
  );
}

export default Navbar;