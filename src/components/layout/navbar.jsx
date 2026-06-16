import "../../styles/navbar.css";

function Navbar({ toggleSidebar, logout }) {
  return (
    <header className="navbar">
      <button onClick={toggleSidebar}>
        ☰
      </button>

      <h2>Dashboard</h2>

      <button onClick={logout}>
        Logout
      </button>
    </header>
  );
}

export default Navbar;