import { Outlet, NavLink } from "react-router-dom";

export default function App() {
  return (
    <div style={{fontFamily:"system-ui, Arial, sans-serif"}}>
      <header style={{padding:"12px 16px", borderBottom:"1px solid #ddd"}}>
        <b>TP2 — Events & Artists</b>
        <nav style={{marginTop:8}}>
          <NavLink to="/events" style={{marginRight:12}}>Événements</NavLink>
        </nav>
      </header>
      <main style={{maxWidth:900, margin:"16px auto", padding:"0 16px"}}>
        <Outlet />
      </main>
    </div>
  );
}
