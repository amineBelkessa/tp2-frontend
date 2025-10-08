import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../lib/api";
import ErrorBanner from "../../components/ErrorBanner";
import Pagination from "../../components/Pagination";

// Types
type Artist = {
  id: string;
  label: string;
  name?: string;
};

type Event = {
  id: string;
  label: string;
  startdate: string;
  enddate: string;
  artists?: Artist[];
};

type DetailedEvent = {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  artists: Artist[];
};

type SpringPage<T> = {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export default function EventsManagement() {
  const [params, setParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pageData, setPageData] = useState<SpringPage<Event> | null>(null);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<DetailedEvent | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [artists, setArtists] = useState<Artist[]>([]);
  
  const [eventForm, setEventForm] = useState({
    label: "",
    startDate: "",
    endDate: "",
    selectedArtists: [] as string[]
  });
  
  const [submitLoading, setSubmitLoading] = useState(false);

  const pageParam = Number(params.get("page") || "1");
  const page = pageParam - 1;
  const size = Number(params.get("size") || "9");

  useEffect(() => {
    loadEvents();
    loadArtists();
  }, [page, size, searchTerm]);

  const loadEvents = () => {
    let alive = true;
    setLoading(true);
    setError("");

    const apiParams: any = { page, size };
    if (searchTerm) {
      apiParams.search = searchTerm;
    }

    api.get<SpringPage<Event>>(`/events`, { params: apiParams })
      .then((res) => {
        if (alive) setPageData(res.data);
      })
      .catch((e: any) => { if (alive) setError(e.message); })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
  };

  const loadArtists = () => {
    api.get<SpringPage<Artist>>(`/artists`, { params: { size: 1000 } })
      .then((res) => setArtists(res.data.content || []))
      .catch(() => {});
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(params);
    newParams.set('page', '1');
    setParams(newParams);
    loadEvents();
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError("");

    try {
      const eventData = {
        label: eventForm.label,
        startDate: eventForm.startDate,
        endDate: eventForm.endDate
      };

      const eventResponse = await api.post('/events', eventData);
      const createdEvent = eventResponse.data;

      if (eventForm.selectedArtists.length > 0 && createdEvent?.id) {
        const addArtistPromises = eventForm.selectedArtists.map(artistId => 
          api.post(`/events/${createdEvent.id}/artists/${artistId}`, {})
        );
        await Promise.all(addArtistPromises);
      }
      
      resetForm();
      setShowCreateForm(false);
      loadEvents();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de l\'événement');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    
    setSubmitLoading(true);
    setError("");

    try {
      const eventData = {
        label: eventForm.label,
        startDate: eventForm.startDate,
        endDate: eventForm.endDate
      };

      await api.put(`/events/${selectedEvent.id}`, eventData);

      // Remove all current artists
      if (selectedEvent.artists && selectedEvent.artists.length > 0) {
        const removePromises = selectedEvent.artists.map(artist =>
          api.delete(`/events/${selectedEvent.id}/artists/${artist.id}`)
        );
        await Promise.all(removePromises);
      }

      // Add selected artists
      if (eventForm.selectedArtists.length > 0) {
        const addPromises = eventForm.selectedArtists.map(artistId =>
          api.post(`/events/${selectedEvent.id}/artists/${artistId}`, {})
        );
        await Promise.all(addPromises);
      }

      resetForm();
      setShowEditForm(false);
      setSelectedEvent(null);
      loadEvents();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification de l\'événement');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    setSubmitLoading(true);
    setError("");

    try {
      await api.delete(`/events/${selectedEvent.id}`);
      setShowDeleteConfirm(false);
      setSelectedEvent(null);
      loadEvents();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression de l\'événement');
    } finally {
      setSubmitLoading(false);
    }
  };

  const openEditForm = async (eventId: string) => {
    setDetailsLoading(true);
    try {
      const response = await api.get<DetailedEvent>(`/events/${eventId}`);
      const event = response.data;
      setSelectedEvent(event);
      setEventForm({
        label: event.label,
        startDate: event.startDate,
        endDate: event.endDate,
        selectedArtists: event.artists?.map(a => a.id) || []
      });
      setShowEditForm(true);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement de l\'événement');
    } finally {
      setDetailsLoading(false);
    }
  };

  const openDeleteConfirm = async (eventId: string) => {
    setDetailsLoading(true);
    try {
      const response = await api.get<DetailedEvent>(`/events/${eventId}`);
      setSelectedEvent(response.data);
      setShowDeleteConfirm(true);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement de l\'événement');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleShowEventDetails = async (eventId: string) => {
    setShowEventDetails(true);
    setDetailsLoading(true);
    setError("");

    try {
      const response = await api.get<DetailedEvent>(`/events/${eventId}`);
      setSelectedEvent(response.data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des détails');
      setSelectedEvent(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const resetForm = () => {
    setEventForm({
      label: "",
      startDate: "",
      endDate: "",
      selectedArtists: []
    });
  };

  const toggleArtistSelection = (artistId: string) => {
    setEventForm(prev => ({
      ...prev,
      selectedArtists: prev.selectedArtists.includes(artistId)
        ? prev.selectedArtists.filter(id => id !== artistId)
        : [...prev.selectedArtists, artistId]
    }));
  };

  // Styles
  const containerStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    minHeight: "100vh",
    height: "100vh",
    width: "100vw",
    margin: 0,
    padding: "20px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
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
    margin: "0 0 20px",
    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
    flexShrink: 0
  };

  const searchBarStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    marginBottom: 15,
    gap: 12,
    flexShrink: 0
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
    background: "linear-gradient(45deg, #667eea, #764ba2)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "12px 24px",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
  };

  const tableStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0
  };

  const thStyle: React.CSSProperties = {
    background: "linear-gradient(45deg, #667eea, #764ba2)",
    color: "#fff",
    padding: "16px",
    textAlign: "left",
    fontWeight: 600,
    fontSize: 14
  };

  const tdStyle: React.CSSProperties = {
    padding: "16px",
    borderBottom: "1px solid #e2e8f0",
    fontSize: 14,
    color: "#2d3748"
  };

  const actionButtonStyle: React.CSSProperties = {
    padding: "6px 12px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    marginRight: 8,
    transition: "all 0.2s ease"
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
      <h1 style={headerStyle}>🎬 Gestion des Événements</h1>
      
      {/* Search Bar */}
      <form onSubmit={handleSearch} style={searchBarStyle}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 Rechercher un événement..."
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
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20, flexShrink: 0 }}>
        <button
          style={buttonStyle}
          onClick={() => {
            resetForm();
            setShowCreateForm(true);
          }}
        >
          ➕ Nouvel événement
        </button>
      </div>

      <ErrorBanner message={error} />
      
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, marginBottom: 20 }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1, color: "#fff", fontSize: 18 }}>
            🎭 Chargement…
          </div>
        ) : pageData && pageData.content.length > 0 ? (
          <>
            <div style={tableStyle}>
              <div style={{ flex: 1, overflow: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                    <tr>
                      <th style={thStyle}>Nom</th>
                      <th style={thStyle}>Dates</th>
                      <th style={thStyle}>Artistes</th>
                      <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageData.content.map((event) => (
                      <tr key={event.id} style={{ transition: "background 0.2s ease" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#f7fafc"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={tdStyle}>
                          <strong>{event.label}</strong>
                        </td>
                        <td style={tdStyle}>
                          {new Date(event.startdate).toLocaleDateString()} - {new Date(event.enddate).toLocaleDateString()}
                        </td>
                        <td style={tdStyle}>
                          {event.artists && event.artists.length > 0 ? (
                            <span style={{ color: "#667eea", fontWeight: 500 }}>
                              {event.artists.length} artiste{event.artists.length > 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span style={{ color: "#a0aec0", fontStyle: "italic" }}>Aucun</span>
                          )}
                        </td>
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          <button
                            onClick={() => handleShowEventDetails(event.id)}
                            style={{ ...actionButtonStyle, background: "#4299e1", color: "#fff" }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#3182ce"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "#4299e1"}
                          >
                            👁️ Voir
                          </button>
                          <button
                            onClick={() => openEditForm(event.id)}
                            style={{ ...actionButtonStyle, background: "#48bb78", color: "#fff" }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#38a169"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "#48bb78"}
                          >
                            ✏️ Modifier
                          </button>
                          <button
                            onClick={() => openDeleteConfirm(event.id)}
                            style={{ ...actionButtonStyle, background: "#f56565", color: "#fff", marginRight: 0 }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#e53e3e"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "#f56565"}
                          >
                            🗑️ Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ flexShrink: 0, display: "flex", justifyContent: "center", marginTop: 20 }}>
              <Pagination 
                page={pageParam} 
                totalPages={pageData.totalPages || 1}
                size={size}
              />
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#fff", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>Aucun événement trouvé</div>
            <div style={{ fontSize: 16, opacity: 0.8 }}>
              {searchTerm ? "Essayez une autre recherche" : "Créez votre premier événement"}
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Event Form */}
      {(showCreateForm || showEditForm) && (
        <div style={formOverlayStyle} onClick={() => { setShowCreateForm(false); setShowEditForm(false); }}>
          <div style={formStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 24, fontSize: 24, fontWeight: 700, color: "#2d3748" }}>
              {showCreateForm ? "🎬 Créer un événement" : "✏️ Modifier l'événement"}
            </h2>
            
            <form onSubmit={showCreateForm ? handleCreateEvent : handleUpdateEvent}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#4a5568" }}>
                Nom de l'événement *
              </label>
              <input
                type="text"
                value={eventForm.label}
                onChange={(e) => setEventForm(prev => ({ ...prev, label: e.target.value }))}
                style={{ ...inputStyle, width: "100%", marginBottom: 16 }}
                required
                placeholder="Ex: Hellfest 2025"
              />
              
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#4a5568" }}>
                Date de début *
              </label>
              <input
                type="date"
                value={eventForm.startDate}
                onChange={(e) => setEventForm(prev => ({ ...prev, startDate: e.target.value }))}
                style={{ ...inputStyle, width: "100%", marginBottom: 16 }}
                required
              />
              
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#4a5568" }}>
                Date de fin *
              </label>
              <input
                type="date"
                value={eventForm.endDate}
                onChange={(e) => setEventForm(prev => ({ ...prev, endDate: e.target.value }))}
                style={{ ...inputStyle, width: "100%", marginBottom: 16 }}
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
                        style={eventForm.selectedArtists.includes(artist.id) ? selectedArtistStyle : artistCheckboxStyle}
                        onClick={() => toggleArtistSelection(artist.id)}
                      >
                        <input
                          type="checkbox"
                          checked={eventForm.selectedArtists.includes(artist.id)}
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
      {showDeleteConfirm && selectedEvent && (
        <div style={formOverlayStyle} onClick={() => setShowDeleteConfirm(false)}>
          <div style={{ ...formStyle, maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 24, fontSize: 24, fontWeight: 700, color: "#e53e3e" }}>
              🗑️ Confirmer la suppression
            </h2>
            <p style={{ marginBottom: 24, fontSize: 16, color: "#4a5568" }}>
              Êtes-vous sûr de vouloir supprimer l'événement <strong>"{selectedEvent.label}"</strong> ?
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
                onClick={handleDeleteEvent}
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

      {/* Event Details Modal */}
      {showEventDetails && (
        <div style={formOverlayStyle} onClick={() => { setShowEventDetails(false); setSelectedEvent(null); }}>
          <div style={{ ...formStyle, maxWidth: 700 }} onClick={(e) => e.stopPropagation()}>
            {detailsLoading ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>🎭</div>
                <div style={{ fontSize: 18, color: "#4a5568" }}>Chargement...</div>
              </div>
            ) : selectedEvent ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                  <h2 style={{ fontSize: 28, fontWeight: 700, color: "#2d3748", margin: 0 }}>
                    🎬 {selectedEvent.label}
                  </h2>
                  <button
                    onClick={() => { setShowEventDetails(false); setSelectedEvent(null); }}
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
                    📅 Dates
                  </h3>
                  <div style={{ fontSize: 16, color: "#2d3748", marginBottom: 8 }}>
                    <strong>Début:</strong> {new Date(selectedEvent.startDate).toLocaleDateString('fr-FR', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </div>
                  <div style={{ fontSize: 16, color: "#2d3748" }}>
                    <strong>Fin:</strong> {new Date(selectedEvent.endDate).toLocaleDateString('fr-FR', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: "#4a5568", marginBottom: 16 }}>
                    🎤 Artistes ({selectedEvent.artists?.length || 0})
                  </h3>
                  
                  {(!selectedEvent.artists || selectedEvent.artists.length === 0) ? (
                    <div style={{ 
                      textAlign: "center", 
                      padding: "30px 20px", 
                      color: "#718096",
                      background: "#f9f9f9",
                      borderRadius: 12,
                      border: "2px dashed #e2e8f0"
                    }}>
                      <div style={{ fontSize: 32, marginBottom: 12 }}>🎭</div>
                      <div style={{ fontSize: 16, fontStyle: "italic" }}>Aucun artiste</div>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
                      {selectedEvent.artists.map((artist) => (
                        <div
                          key={artist.id}
                          style={{
                            background: "linear-gradient(45deg, #667eea, #764ba2)",
                            color: "#fff",
                            borderRadius: 8,
                            padding: 12,
                            textAlign: "center",
                            fontSize: 14,
                            fontWeight: 600
                          }}
                        >
                          🎵 {artist.label}
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