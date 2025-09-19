import { Link, useLocation } from "react-router-dom";
type Props = { page: number; totalPages: number };

function buildHref(search: string, targetPage: number) {
  const p = new URLSearchParams(search);
  p.set("page", String(targetPage));
  return `?${p.toString()}`;
}

export default function Pagination({ page, totalPages }: Props) {
  const { search, pathname } = useLocation();
  if (totalPages <= 1) return null;
  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);
  const btn: React.CSSProperties = { padding:"6px 10px", border:"1px solid #ddd", borderRadius:6, textDecoration:"none" };

  return (
    <nav style={{display:"flex",gap:8,alignItems:"center",marginTop:16}} aria-label="Pagination">
      <Link to={pathname + buildHref(search, 1)} style={btn}>«</Link>
      <Link to={pathname + buildHref(search, prev)} style={btn}>‹</Link>
      <span>Page {page} / {totalPages}</span>
      <Link to={pathname + buildHref(search, next)} style={btn}>›</Link>
      <Link to={pathname + buildHref(search, totalPages)} style={btn}>»</Link>
    </nav>
  );
}
