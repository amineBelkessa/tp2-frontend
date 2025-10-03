import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../../lib/api";
import type { Event } from "../../types";
import ErrorBanner from "../../components/ErrorBanner";
import Pagination from "../../components/Pagination";

// Artist type
type Artist = {
  id: string;
  label: string;
  name?: string;
};

// Detailed Event type (based on your API response)
type DetailedEvent = {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  artists: Artist[];
};

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
  
  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCreateArtistForm, setShowCreateArtistForm] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventDetails, setEventDetails] = useState<DetailedEvent | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [createEventForm, setCreateEventForm] = useState({
    label: "",
    startDate: "",
    endDate: "",
    selectedArtists: [] as string[]
  });
  const [createArtistForm, setCreateArtistForm] = useState({
    label: ""
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  // IMPORTANT : l'API est 0-based, mais l'URL est 1-based pour l'utilisateur
  const pageParam = Number(params.get("page") || "1"); // Page 1-based from URL
  const page = pageParam - 1; // Convert to 0-based for API
  const size = Number(params.get("size") || "9"); // Match your API call

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");

    // Load events with pagination
    const loadEvents = api.get<SpringPage<Event>>(`/events`, { params: { page, size } });
    
    // Load all artists for the form (no pagination needed)
    const loadArtists = api.get<SpringPage<Artist>>(`/artists`, { params: { size: 1000 } });

    Promise.all([loadEvents, loadArtists])
      .then(([eventsRes, artistsRes]) => {
        if (alive) {
          setPageData(eventsRes.data);
          setArtists(artistsRes.data.content || []);
        }
      })
      .catch((e: any) => { if (alive) setError(e.message); })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
  }, [page, size]);

  const currentPage = pageData?.number ?? page; // 0-based

  // Handle create event
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError("");

    try {
      // First create the event without artists
      const eventData = {
        label: createEventForm.label,
        startDate: createEventForm.startDate,
        endDate: createEventForm.endDate
      };

      const eventResponse = await api.post('/events', eventData);
      const createdEvent = eventResponse.data;

      // Then add artists to the event if any are selected
      if (createEventForm.selectedArtists.length > 0 && createdEvent?.id) {
        // Add each artist to the event using the specific endpoint
        const addArtistPromises = createEventForm.selectedArtists.map(artistId => 
          api.post(`/events/${createdEvent.id}/artists/${artistId}`, {})
        );

        // Wait for all artists to be added
        await Promise.all(addArtistPromises);
      }
      
      // Reset form and close
      setCreateEventForm({
        label: "",
        startDate: "",
        endDate: "",
        selectedArtists: []
      });
      setShowCreateForm(false);
      
      // Refresh events list - go back to page 1 (displayed as page 1 to user)
      const newParams = new URLSearchParams(window.location.search);
      newParams.set('page', '1');
      window.location.href = `${window.location.pathname}?${newParams.toString()}`;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de l\'événement');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle create artist
  const handleCreateArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError("");

    try {
      await api.post('/artists', {
        label: createArtistForm.label
      });
      
      // Reset form and close
      setCreateArtistForm({ label: "" });
      setShowCreateArtistForm(false);
      
      // Refresh artists list
      const artistsRes = await api.get<SpringPage<Artist>>(`/artists`, { params: { size: 1000 } });
      setArtists(artistsRes.data.content || []);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de l\'artiste');
    } finally {
      setSubmitLoading(false);
    }
  };

  const toggleArtistSelection = (artistId: string) => {
    setCreateEventForm(prev => ({
      ...prev,
      selectedArtists: prev.selectedArtists.includes(artistId)
        ? prev.selectedArtists.filter(id => id !== artistId)
        : [...prev.selectedArtists, artistId]
    }));
  };

  // Handle show event details
  const handleShowEventDetails = async (eventId: string) => {
    setSelectedEventId(eventId);
    setShowEventDetails(true);
    setDetailsLoading(true);
    setError("");

    try {
      const response = await api.get<DetailedEvent>(`/events/${eventId}`);
      setEventDetails(response.data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des détails');
      setEventDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeEventDetails = () => {
    setShowEventDetails(false);
    setSelectedEventId(null);
    setEventDetails(null);
    setDetailsLoading(false);
  };

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

  const buttonStyle: React.CSSProperties = {
    background: "linear-gradient(45deg, #667eea, #764ba2)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "12px 24px",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginRight: 16,
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
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
    maxWidth: 600,
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
    outline: "none",
    transition: "border-color 0.3s ease"
  };

  const artistCheckboxStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    padding: "8px 12px",
    margin: "4px 0",
    borderRadius: 8,
    border: "2px solid #e2e8f0",
    cursor: "pointer",
    transition: "all 0.3s ease"
  };

  const selectedArtistStyle: React.CSSProperties = {
    ...artistCheckboxStyle,
    background: "linear-gradient(45deg, #667eea, #764ba2)",
    color: "#fff",
    borderColor: "transparent"
  };

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>🎬 Liste des événements</h1>
      
      {/* Action buttons */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 30 }}>
        <button
          style={buttonStyle}
          onClick={() => setShowCreateForm(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(102, 126, 234, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.3)";
          }}
        >
          ➕ Nouvel événement
        </button>
        
        <button
          style={buttonStyle}
          onClick={() => setShowCreateArtistForm(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(102, 126, 234, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.3)";
          }}
        >
          🎤 Nouvel artiste
        </button>
      </div>

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
                      
                      <button
                        onClick={() => handleShowEventDetails(ev.id)}
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
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={paginationContainerStyle}>
            <Pagination 
              page={pageParam} 
              totalPages={pageData.totalPages || 1}
              size={size}
            />
          </div>
        </>
      )}

      {/* Create Event Form */}
      {showCreateForm && (
        <div style={formOverlayStyle} onClick={() => setShowCreateForm(false)}>
          <div style={formStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 24, fontSize: 24, fontWeight: 700, color: "#2d3748" }}>
              🎬 Créer un nouvel événement
            </h2>
            
            <form onSubmit={handleCreateEvent}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#4a5568" }}>
                Nom de l'événement *
              </label>
              <input
                type="text"
                value={createEventForm.label}
                onChange={(e) => setCreateEventForm(prev => ({ ...prev, label: e.target.value }))}
                style={inputStyle}
                required
                placeholder="Ex: Hellfest 2025"
              />
              
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#4a5568" }}>
                Date de début *
              </label>
              <input
                type="date"
                value={createEventForm.startDate}
                onChange={(e) => setCreateEventForm(prev => ({ ...prev, startDate: e.target.value }))}
                style={inputStyle}
                required
              />
              
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#4a5568" }}>
                Date de fin *
              </label>
              <input
                type="date"
                value={createEventForm.endDate}
                onChange={(e) => setCreateEventForm(prev => ({ ...prev, endDate: e.target.value }))}
                style={inputStyle}
                required
              />
              
              {artists.length > 0 && (
                <>
                  <label style={{ display: "block", marginBottom: 12, fontWeight: 600, color: "#4a5568" }}>
                    Artistes (optionnel)
                  </label>
                  <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 16 }}>
                    {artists.map((artist) => (
                      <div
                        key={artist.id}
                        style={createEventForm.selectedArtists.includes(artist.id) ? selectedArtistStyle : artistCheckboxStyle}
                        onClick={() => toggleArtistSelection(artist.id)}
                      >
                        <input
                          type="checkbox"
                          checked={createEventForm.selectedArtists.includes(artist.id)}
                          onChange={() => {}}
                          style={{ marginRight: 8 }}
                        />
                        {artist.label}
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
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
                  {submitLoading ? "Création..." : "Créer l'événement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Artist Form */}
      {showCreateArtistForm && (
        <div style={formOverlayStyle} onClick={() => setShowCreateArtistForm(false)}>
          <div style={formStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 24, fontSize: 24, fontWeight: 700, color: "#2d3748" }}>
              🎤 Créer un nouvel artiste
            </h2>
            
            <form onSubmit={handleCreateArtist}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#4a5568" }}>
                Nom de l'artiste *
              </label>
              <input
                type="text"
                value={createArtistForm.label}
                onChange={(e) => setCreateArtistForm(prev => ({ ...prev, label: e.target.value }))}
                style={inputStyle}
                required
                placeholder="Ex: Train Fantôme"
              />
              
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowCreateArtistForm(false)}
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
                  {submitLoading ? "Création..." : "Créer l'artiste"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventDetails && (
        <div style={formOverlayStyle} onClick={closeEventDetails}>
          <div style={{
            ...formStyle,
            maxWidth: 700,
            maxHeight: "85vh"
          }} onClick={(e) => e.stopPropagation()}>
            {detailsLoading ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>🎭</div>
                <div style={{ fontSize: 18, color: "#4a5568" }}>Chargement des détails...</div>
              </div>
            ) : eventDetails ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                  <h2 style={{ fontSize: 28, fontWeight: 700, color: "#2d3748", margin: 0 }}>
                    🎬 {eventDetails.label}
                  </h2>
                  <button
                    onClick={closeEventDetails}
                    style={{
                      background: "#e2e8f0",
                      color: "#4a5568",
                      border: "none",
                      borderRadius: "50%",
                      width: 40,
                      height: 40,
                      cursor: "pointer",
                      fontSize: 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Event Dates */}
                <div style={{ 
                  background: "linear-gradient(45deg, #f7fafc, #edf2f7)", 
                  borderRadius: 12, 
                  padding: 20, 
                  marginBottom: 24,
                  border: "2px solid #e2e8f0"
                }}>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: "#4a5568", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                    📅 Dates de l'événement
                  </h3>
                  <div style={{ fontSize: 16, color: "#2d3748", marginBottom: 8 }}>
                    <strong>Début:</strong> {new Date(eventDetails.startDate).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div style={{ fontSize: 16, color: "#2d3748", marginBottom: 12 }}>
                    <strong>Fin:</strong> {new Date(eventDetails.endDate).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  {eventDetails.startDate === eventDetails.endDate ? (
                    <div style={{ 
                      padding: "8px 12px", 
                      background: "linear-gradient(45deg, #48bb78, #38a169)", 
                      color: "#fff", 
                      borderRadius: 6, 
                      fontSize: 14, 
                      fontWeight: 600,
                      textAlign: "center"
                    }}>
                      📍 Événement d'une journée
                    </div>
                  ) : (
                    <div style={{ 
                      padding: "8px 12px", 
                      background: "linear-gradient(45deg, #ed8936, #dd6b20)", 
                      color: "#fff", 
                      borderRadius: 6, 
                      fontSize: 14, 
                      fontWeight: 600,
                      textAlign: "center"
                    }}>
                      📍 Événement de {Math.ceil((new Date(eventDetails.endDate).getTime() - new Date(eventDetails.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} jours
                    </div>
                  )}
                </div>

                {/* Artists Section */}
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: "#4a5568", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    🎤 Artistes participants ({eventDetails.artists?.length || 0})
                  </h3>
                  
                  {(!eventDetails.artists || eventDetails.artists.length === 0) ? (
                    <div style={{ 
                      textAlign: "center", 
                      padding: "30px 20px", 
                      color: "#718096",
                      background: "#f9f9f9",
                      borderRadius: 12,
                      border: "2px dashed #e2e8f0"
                    }}>
                      <div style={{ fontSize: 32, marginBottom: 12 }}>🎭</div>
                      <div style={{ fontSize: 16, fontStyle: "italic" }}>Aucun artiste associé à cet événement</div>
                    </div>
                  ) : (
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                      gap: 12,
                      maxHeight: 200,
                      overflowY: "auto"
                    }}>
                      {eventDetails.artists.map((artist, index) => (
                        <div
                          key={artist.id || index}
                          style={{
                            background: "linear-gradient(45deg, #667eea, #764ba2)",
                            color: "#fff",
                            borderRadius: 8,
                            padding: 12,
                            textAlign: "center",
                            fontSize: 14,
                            fontWeight: 600,
                            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                            transition: "all 0.3s ease",
                            cursor: "pointer"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 6px 16px rgba(102, 126, 234, 0.4)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.3)";
                          }}
                        >
                          🎵 {artist.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Event ID */}
                <div style={{ 
                  marginTop: 24, 
                  padding: 16, 
                  background: "#f8f9fa", 
                  borderRadius: 8, 
                  fontSize: 12, 
                  color: "#6c757d",
                  textAlign: "center",
                  border: "1px solid #e9ecef"
                }}>
                  ID: <code style={{ background: "#e9ecef", padding: "2px 6px", borderRadius: 3 }}>{eventDetails.id}</code>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>❌</div>
                <div style={{ fontSize: 18, color: "#e53e3e" }}>Impossible de charger les détails</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}