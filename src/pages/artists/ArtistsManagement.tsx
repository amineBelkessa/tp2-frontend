import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../lib/api";
import ErrorBanner from "../../components/ErrorBanner";
import Pagination from "../../components/Pagination";

// Types
type Artist = {
  id: string;
  label: string;
  events?: Event[];
};

type Event = {
  id: string;
  label: string;
  startDate?: string;
  endDate?: string;
};

type DetailedArtist = {
  id: string;
  label: string;
  events: Event[];
};

type SpringPage<T> = {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export default function ArtistsManagement() {
  const [params, setParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pageData, setPageData] = useState<SpringPage<Artist> | null>(null);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArtistDetails, setShowArtistDetails] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<DetailedArtist | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  const [artistForm, setArtistForm] = useState({
    label: ""
  });
  
  const [submitLoading, setSubmitLoading] = useState(false);

  const pageParam = Number(params.get("page") || "1");
  const page = pageParam - 1;
  const size = Number(params.get("size") || "12");

  useEffect(() => {
    loadArtists();
  }, [page, size, searchTerm]);

  const loadArtists = () => {
    let alive = true;
    setLoading(true);
    setError("");

    const apiParams: any = { page, size };
    if (searchTerm) {
      apiParams.label = searchTerm;
    }

    api.get<SpringPage<Artist>>(`/artists`, { params: apiParams })
      .then((res) => {
        if (alive) setPageData(res.data);
      })
      .catch((e: any) => { if (alive) setError(e.message); })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(params);
    newParams.set('page', '1');
    setParams(newParams);
    loadArtists();
  };

  const handleCreateArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError("");

    try {
      await api.post('/artists', {
        label: artistForm.label
      });
      
      resetForm();
      setShowCreateForm(false);
      loadArtists();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de l\'artiste');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdateArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArtist) return;
    
    setSubmitLoading(true);
    setError("");

    try {
      await api.put(`/artists/${selectedArtist.id}`, {
        label: artistForm.label
      });

      resetForm();
      setShowEditForm(false);
      setSelectedArtist(null);
      loadArtists();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification de l\'artiste');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteArtist = async () => {
    if (!selectedArtist) return;
    
    setSubmitLoading(true);
    setError("");

    try {
      await api.delete(`/artists/${selectedArtist.id}`);
      setShowDeleteConfirm(false);
      setSelectedArtist(null);
      loadArtists();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression de l\'artiste');
    } finally {
      setSubmitLoading(false);
    }
  };

  const openEditForm = async (artistId: string) => {
    setDetailsLoading(true);
    try {
      const response = await api.get<DetailedArtist>(`/artists/${artistId}`);
      const artist = response.data;
      setSelectedArtist(artist);
      setArtistForm({
        label: artist.label
      });
      setShowEditForm(true);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement de l\'artiste');
    } finally {
      setDetailsLoading(false);
    }
  };

  const openDeleteConfirm = async (artistId: string) => {
    setDetailsLoading(true);
    try {
      const response = await api.get<DetailedArtist>(`/artists/${artistId}`);
      setSelectedArtist(response.data);
      setShowDeleteConfirm(true);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement de l\'artiste');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleShowArtistDetails = async (artistId: string) => {
    setShowArtistDetails(true);
    setDetailsLoading(true);
    setError("");

    try {
      const response = await api.get<DetailedArtist>(`/artists/${artistId}`);
      setSelectedArtist(response.data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des détails');
      setSelectedArtist(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const resetForm = () => {
    setArtistForm({
      label: ""
    });
  };

  // Styles
  const containerStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    minHeight: "100vh",
    height: "100vh",
    width: "100vw",
    margin: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    boxSizing: "border-box",
    overflow: "auto",
    position: "fixed",
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

  const searchBarStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    marginBottom: 20,
    gap: 12
  };

  const inputStyle: React.CSSProperties = {
    padding: "12px 16px",
    border: "2px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 16,
    outline: "none",
    transition: "border-color 0.3s ease",
    minWidth: 300
  };

  const buttonStyle: React.CSSProperties = {
    background: "linear-gradient(45deg, #f093fb, #f5576c)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "12px 24px",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(240, 147, 251, 0.4)"
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gap: 24,
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
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
    cursor: "pointer"
  };

  const cardHeaderStyle: React.CSSProperties = {
    background: "linear-gradient(45deg, #f093fb, #f5576c)",
    padding: "20px",
    textAlign: "center"
  };

  const cardContentStyle: React.CSSProperties = {
    padding: 20
  };

  const actionButtonStyle: React.CSSProperties = {
    padding: "8px 16px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    marginRight: 8,
    transition: "all 0.2s ease",
    marginTop: 8
  };

  const formOverlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 20
  };

  const formStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: 16,
    padding: 32,
    maxWidth: 500,
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
  };

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>🎤 Gestion des Artistes</h1>
      
      {/* Search Bar */}
      <form onSubmit={handleSearch} style={searchBarStyle}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 Rechercher un artiste..."
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>
          Rechercher
        </button>
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              const newParams = new URLSearchParams(params);
              newParams.set('page', '1');
              setParams(newParams);
            }}
            style={{ ...buttonStyle, background: "#e2e8f0", color: "#4a5568" }}
          >
            Effacer
          </button>
        )}
      </form>

      {/* Action Buttons */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 30 }}>
        <button
          style={buttonStyle}
          onClick={() => {
            resetForm();
            setShowCreateForm(true);
          }}
        >
          ➕ Nouvel artiste
        </button>
      </div>

      <ErrorBanner message={error} />
      
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh", color: "#fff", fontSize: 18 }}>
          🎭 Chargement…
        </div>
      ) : pageData && pageData.content.length > 0 ? (
        <>
          <div style={gridStyle}>
            {pageData.content.map((artist) => (
              <div
                key={artist.id}
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
                <div style={cardHeaderStyle}>
                  <div style={{ fontSize: 48, marginBottom: 8 }}>🎤</div>
                  <h3 style={{ fontSize: 20, fontWeight: 600, color: "#fff", margin: 0 }}>
                    {artist.label}
                  </h3>
                </div>
                
                <div style={cardContentStyle}>
                  <div style={{ fontSize: 14, color: "#718096", marginBottom: 12, textAlign: "center" }}>
                    {artist.events && artist.events.length > 0 ? (
                      <span style={{ color: "#f5576c", fontWeight: 500 }}>
                        {artist.events.length} événement{artist.events.length > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span style={{ fontStyle: "italic" }}>Aucun événement</span>
                    )}
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button
                      onClick={() => handleShowArtistDetails(artist.id)}
                      style={{ ...actionButtonStyle, background: "#4299e1", color: "#fff", width: "100%", marginRight: 0 }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#3182ce"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "#4299e1"}
                    >
                      👁️ Voir les détails
                    </button>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => openEditForm(artist.id)}
                        style={{ ...actionButtonStyle, background: "#48bb78", color: "#fff", flex: 1, marginRight: 0 }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#38a169"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "#48bb78"}
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(artist.id)}
                        style={{ ...actionButtonStyle, background: "#f56565", color: "#fff", flex: 1, marginRight: 0 }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#e53e3e"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "#f56565"}
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 40, paddingBottom: 40 }}>
            <Pagination 
              page={pageParam} 
              totalPages={pageData.totalPages || 1}
              size={size}
            />
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#fff" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎤</div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>Aucun artiste trouvé</div>
          <div style={{ fontSize: 16, opacity: 0.8 }}>
            {searchTerm ? "Essayez une autre recherche" : "Créez votre premier artiste"}
          </div>
        </div>
      )}

      {/* Create/Edit Artist Form */}
      {(showCreateForm || showEditForm) && (
        <div style={formOverlayStyle} onClick={() => { setShowCreateForm(false); setShowEditForm(false); }}>
          <div style={formStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 24, fontSize: 24, fontWeight: 700, color: "#2d3748" }}>
              {showCreateForm ? "🎤 Créer un artiste" : "✏️ Modifier l'artiste"}
            </h2>
            
            <form onSubmit={showCreateForm ? handleCreateArtist : handleUpdateArtist}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#4a5568" }}>
                Nom de l'artiste *
              </label>
              <input
                type="text"
                value={artistForm.label}
                onChange={(e) => setArtistForm(prev => ({ ...prev, label: e.target.value }))}
                style={{ ...inputStyle, width: "100%", marginBottom: 16 }}
                required
                placeholder="Ex: Metallica"
              />
              
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => { setShowCreateForm(false); setShowEditForm(false); resetForm(); }}
                  style={{
                    background: "#e2e8f0",
                    color: "#4a5568",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 20px",
                    cursor: "pointer"
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  style={{
                    ...buttonStyle,
                    margin: 0,
                    opacity: submitLoading ? 0.7 : 1
                  }}
                >
                  {submitLoading ? "En cours..." : (showCreateForm ? "Créer" : "Modifier")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && selectedArtist && (
        <div style={formOverlayStyle} onClick={() => setShowDeleteConfirm(false)}>
          <div style={{ ...formStyle, maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 24, fontSize: 24, fontWeight: 700, color: "#e53e3e" }}>
              🗑️ Confirmer la suppression
            </h2>
            <p style={{ marginBottom: 24, fontSize: 16, color: "#4a5568" }}>
              Êtes-vous sûr de vouloir supprimer l'artiste <strong>"{selectedArtist.label}"</strong> ?
              {selectedArtist.events && selectedArtist.events.length > 0 && (
                <span style={{ display: "block", marginTop: 12, color: "#e53e3e", fontWeight: 600 }}>
                  ⚠️ Cet artiste est associé à {selectedArtist.events.length} événement{selectedArtist.events.length > 1 ? 's' : ''}.
                </span>
              )}
              Cette action est irréversible.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  background: "#e2e8f0",
                  color: "#4a5568",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 20px",
                  cursor: "pointer"
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteArtist}
                disabled={submitLoading}
                style={{
                  background: "#f56565",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 20px",
                  cursor: "pointer",
                  opacity: submitLoading ? 0.7 : 1
                }}
              >
                {submitLoading ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Artist Details Modal */}
      {showArtistDetails && (
        <div style={formOverlayStyle} onClick={() => { setShowArtistDetails(false); setSelectedArtist(null); }}>
          <div style={{ ...formStyle, maxWidth: 700 }} onClick={(e) => e.stopPropagation()}>
            {detailsLoading ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>🎭</div>
                <div style={{ fontSize: 18, color: "#4a5568" }}>Chargement...</div>
              </div>
            ) : selectedArtist ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                  <h2 style={{ fontSize: 28, fontWeight: 700, color: "#2d3748", margin: 0 }}>
                    🎤 {selectedArtist.label}
                  </h2>
                  <button
                    onClick={() => { setShowArtistDetails(false); setSelectedArtist(null); }}
                    style={{
                      background: "#e2e8f0",
                      color: "#4a5568",
                      border: "none",
                      borderRadius: "50%",
                      width: 40,
                      height: 40,
                      cursor: "pointer",
                      fontSize: 20
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ 
                  background: "linear-gradient(45deg, #f7fafc, #edf2f7)", 
                  borderRadius: 12, 
                  padding: 20, 
                  marginBottom: 24,
                  border: "2px solid #e2e8f0"
                }}>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: "#4a5568", marginBottom: 12 }}>
                    ℹ️ Informations
                  </h3>
                  <div style={{ fontSize: 16, color: "#2d3748" }}>
                    <strong>ID:</strong> <code style={{ background: "#e9ecef", padding: "2px 6px", borderRadius: 3, fontSize: 13 }}>{selectedArtist.id}</code>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: "#4a5568", marginBottom: 16 }}>
                    🎬 Événements associés ({selectedArtist.events?.length || 0})
                  </h3>
                  
                  {(!selectedArtist.events || selectedArtist.events.length === 0) ? (
                    <div style={{ 
                      textAlign: "center", 
                      padding: "30px 20px", 
                      color: "#718096",
                      background: "#f9f9f9",
                      borderRadius: 12,
                      border: "2px dashed #e2e8f0"
                    }}>
                      <div style={{ fontSize: 32, marginBottom: 12 }}>🎬</div>
                      <div style={{ fontSize: 16, fontStyle: "italic" }}>Aucun événement associé</div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 300, overflowY: "auto" }}>
                      {selectedArtist.events.map((event) => (
                        <div
                          key={event.id}
                          style={{
                            background: "linear-gradient(45deg, #f093fb, #f5576c)",
                            color: "#fff",
                            borderRadius: 8,
                            padding: 16,
                            boxShadow: "0 4px 12px rgba(240, 147, 251, 0.3)"
                          }}
                        >
                          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                            🎬 {event.label}
                          </div>
                          {event.startDate && event.endDate && (
                            <div style={{ fontSize: 13, opacity: 0.9 }}>
                              📅 {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}