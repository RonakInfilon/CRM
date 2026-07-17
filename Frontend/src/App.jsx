import { BrowserRouter } from "react-router-dom";
import { RoleProvider } from "./context/RoleContext";
import AppRoutes from "./routes";

function App() {
  return (
    <RoleProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </RoleProvider>
  );
}

export default App;