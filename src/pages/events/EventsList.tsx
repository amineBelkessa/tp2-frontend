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

  // IMPORTANT : l'API est 0-based
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

  const currentPage = pageData?.number ?? page; // 0-based

  // Enhanced styling objects
  const containerStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    minHeight: "100vh",
    width: "100vw",
    padding: "20px",
    boxSizing: "border-box",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  };

  const headerStyle: React.CSSProperties = {
    fontSize: 32,
    fontWeight: 700,
    color: "#fff",
    textAlign: "center",
    margin: "0 0 30px",
    textShadow: "0 2px 4px rgba(0,0,0,0.3)"
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gap: 24,
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    width: "100%",
    maxWidth: "none"
  };

  const cardStyle: React.CSSProperties = {
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    position: "relative"
  };

  const posterStyle: React.CSSProperties = {
    width: "100%",
    height: 180,
    background: "linear-gradient(45deg, #f0f0f0, #e0e0e0)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 48,
    color: "#999",
    position: "relative",
    overflow: "hidden"
  };

  const contentStyle: React.CSSProperties = {
    padding: 20
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 20,
    fontWeight: 600,
    color: "#2d3748",
    marginBottom: 8,
    lineHeight: 1.3
  };

  const infoStyle: React.CSSProperties = {
    fontSize: 14,
    color: "#718096",
    marginBottom: 6
  };

  const artistTagStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: 20,
    background: "linear-gradient(45deg, #667eea, #764ba2)",
    color: "#fff",
    fontSize: 12,
    fontWeight: 500,
    margin: "4px 4px 0 0"
  };

  const detailsButtonStyle: React.CSSProperties = {
    background: "linear-gradient(45deg, #667eea, #764ba2)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 14,
    fontWeight: 500,
    textDecoration: "none",
    display: "inline-block",
    marginTop: 12,
    transition: "all 0.3s ease"
  };

  const loadingStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "50vh",
    fontSize: 18,
    color: "#fff"
  };

  const emptyStateStyle: React.CSSProperties = {
    textAlign: "center",
    padding: "60px 20px",
    color: "#fff"
  };

  const paginationContainerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    marginTop: 40,
    paddingBottom: 40
  };

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>🎬 Liste des événements</h1>
      <ErrorBanner message={error} />
      
      {loading && (
        <div style={loadingStyle}>
          <div>🎭 Chargement…</div>
        </div>
      )}

      {!loading && pageData && (
        <>
          {pageData.content.length === 0 ? (
            <div style={emptyStateStyle}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
              <div style={{ fontSize: 20, fontWeight: 600 }}>Aucun événement trouvé</div>
              <div style={{ fontSize: 16, opacity: 0.8 }}>Essayez d'ajuster vos critères de recherche</div>
            </div>
          ) : (
            <div style={gridStyle}>
              {pageData.content.map((ev) => {
                const count = ev.artists?.length ?? 0;
                const preview = (ev.artists ?? []).slice(0, 3);

                return (
                  <div
                    key={ev.id}
                    style={cardStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                      e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0) scale(1)";
                      e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.2)";
                    }}
                  >
                    <div style={posterStyle}>
                      🎬
                    </div>
                    
                    <div style={contentStyle}>
                      <h3 style={titleStyle}>{ev.label}</h3>
                      
                      <div style={infoStyle}>
                        Du {new Date(ev.startdate).toLocaleDateString()} au {new Date(ev.enddate).toLocaleDateString()}
                      </div>
                      
                      {count > 0 && (
                        <div style={{ marginTop: 12 }}>
                          {preview.map((a, i) => (
                            <span key={a.id ?? String(i)} style={artistTagStyle}>
                              {a.name ?? a.label ?? `Artiste ${i+1}`}
                            </span>
                          ))}
                          {count > 3 && (
                            <span style={{ ...artistTagStyle, background: "#e2e8f0", color: "#4a5568" }}>
                              +{count - 3} autres
                            </span>
                          )}
                        </div>
                      )}
                      
                      <Link
                        to={`/events/${ev.id}`}
                        style={detailsButtonStyle}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        Détails →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={paginationContainerStyle}>
            <Pagination 
              page={(currentPage ?? 0) + 1} 
              totalPages={pageData.totalPages || 1} 
            />
          </div>
        </>
      )}
    </div>
  );
}