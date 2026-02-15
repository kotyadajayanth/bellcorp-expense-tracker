import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <Link to="/dashboard">Dashboard</Link> |{" "}
      <Link to="/explorer">Explorer</Link> |{" "}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Navbar;
