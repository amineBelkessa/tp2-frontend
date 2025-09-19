import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../../lib/api";
import type { Event } from "../../types";
import ErrorBanner from "../../components/ErrorBanner";
import Pagination from "../../components/Pagination";

// Typage du payload Spring Page
type SpringPage<T> = {
  content: T[];
  number: number;        // page courante (0-based)
  size: number;
  totalElements: number;
  totalPages: number;
};

export default function EventsList() {
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pageData, setPageData] = useState<SpringPage<Event> | null>(null);

  // IMPORTANT : l’API est 0-based
  const page = Number(params.get("page") || "0");
  const size = Number(params.get("size") || "10");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");

    api.get<SpringPage<Event>>(`/events`, { params: { page, size } })
      .then((res) => { if (alive) setPageData(res.data); })
      .catch((e: any) => { if (alive) setError(e.message); })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
  }, [page, size]);

  const card: React.CSSProperties = { border:"1px solid #eee", borderRadius:12, padding:12, background:"#fff" };
  const grid: React.CSSProperties = { display:"grid", gap:12, gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))" };
  const tag: React.CSSProperties = { display:"inline-block", padding:"2px 8px", borderRadius:999, background:"#f1f3f5", marginRight:6, marginTop:6, fontSize:12 };

  const currentPage = pageData?.number ?? page; // 0-based

  return (
    <div>
      <h2 style={{fontSize:18, fontWeight:600, margin:"8px 0 12px"}}>Liste des événements</h2>
      <ErrorBanner message={error} />
      {loading && <div>Chargement…</div>}

      {!loading && pageData && (
        <>
          <div style={grid}>
            {pageData.content.map((ev) => {
              const count = ev.artists?.length ?? 0;
              const preview = (ev.artists ?? []).slice(0, 3);

              return (
                <div key={ev.id} style={card}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                    <div style={{fontWeight:600}}>{ev.label}</div>
                    <Link to={`/events/${ev.id}`} style={{padding:"6px 10px",border:"1px solid #ddd",borderRadius:6,textDecoration:"none"}}>Détails</Link>
                  </div>
                  <div style={{marginTop:6, fontSize:14, color:"#555"}}>
                    Du {new Date(ev.startdate).toLocaleDateString()} au {new Date(ev.enddate).toLocaleDateString()}
                  </div>
                  {count > 0 && (
                    <div style={{marginTop:6}}>
                      {preview.map((a, i) => (
                        <span key={a.id ?? String(i)} style={tag}>{a.name ?? a.label ?? `Artiste ${i+1}`}</span>
                      ))}
                      {count > 3 && <span style={tag}>+{count - 3} autres</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination : l’API est 0-based, notre composant attend une page 1-based pour l’affichage utilisateur.
             On lui donne (currentPage+1) et totalPages tel quel. */}
          <Pagination page={(currentPage ?? 0) + 1} totalPages={pageData.totalPages || 1} />
        </>
      )}
    </div>
  );
}
