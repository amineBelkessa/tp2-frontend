import { Link } from "react-router-dom";

export default function HomePage() {
  const containerStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    boxSizing: "border-box"
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 56,
    fontWeight: 800,
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
    textShadow: "0 4px 8px rgba(0,0,0,0.3)"
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginBottom: 60,
    opacity: 0.95,
    maxWidth: 600
  };

  const cardsContainerStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 32,
    maxWidth: 1200,
    width: "100%",
    padding: "0 20px"
  };

  const cardStyle: React.CSSProperties = {
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: 40,
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.25)",
    backdropFilter: "blur(10px)",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    transition: "all 0.4s ease",
    cursor: "pointer",
    textDecoration: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    overflow: "hidden"
  };

  const iconStyle: React.CSSProperties = {
    fontSize: 72,
    marginBottom: 24,
    filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))"
  };

  const cardTitleStyle: React.CSSProperties = {
    fontSize: 28,
    fontWeight: 700,
    color: "#2d3748",
    marginBottom: 12,
    textAlign: "center"
  };

  const cardDescStyle: React.CSSProperties = {
    fontSize: 15,
    color: "#718096",
    textAlign: "center",
    lineHeight: 1.6,
    marginBottom: 24
  };

  const buttonStyle: React.CSSProperties = {
    background: "linear-gradient(45deg, #667eea, #764ba2)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "14px 32px",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
  };

  const cards = [
    {
      to: "/events",
      icon: "🎬",
      title: "Liste des Événements",
      description: "Parcourez et découvrez tous les événements disponibles avec leurs détails et artistes participants.",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      to: "/events/manage",
      icon: "⚙️",
      title: "Gérer les Événements",
      description: "Créez, modifiez et supprimez des événements. Gérez les dates et associez des artistes.",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      to: "/artists/manage",
      icon: "🎤",
      title: "Gérer les Artistes",
      description: "Administrez votre base d'artistes. Ajoutez de nouveaux talents et consultez leurs événements.",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    }
  ];

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: 800, width: "100%", textAlign: "center", marginBottom: 40 }}>
        <h1 style={titleStyle}>
          🎭 Gestionnaire d'Événements
        </h1>
        <p style={subtitleStyle}>
          Plateforme complète pour gérer vos événements et artistes en toute simplicité
        </p>
      </div>

      <div style={cardsContainerStyle}>
        {cards.map((card, index) => (
          <Link
            key={index}
            to={card.to}
            style={cardStyle}
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLElement;
              target.style.transform = "translateY(-12px) scale(1.03)";
              target.style.boxShadow = "0 20px 60px rgba(0, 0, 0, 0.35)";
              const overlay = target.querySelector('.card-overlay') as HTMLElement;
              if (overlay) overlay.style.opacity = "0.1";
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLElement;
              target.style.transform = "translateY(0) scale(1)";
              target.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.25)";
              const overlay = target.querySelector('.card-overlay') as HTMLElement;
              if (overlay) overlay.style.opacity = "0";
            }}
          >
            <div 
              className="card-overlay"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: card.gradient,
                opacity: 0,
                transition: "opacity 0.3s ease",
                pointerEvents: "none",
                zIndex: 0
              }}
            />
            
            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={iconStyle}>{card.icon}</div>
              <h2 style={cardTitleStyle}>{card.title}</h2>
              <p style={cardDescStyle}>{card.description}</p>
              
              <button
                style={buttonStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(102, 126, 234, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.3)";
                }}
              >
                Accéder →
              </button>
            </div>
          </Link>
        ))}
      </div>

      <div style={{
        marginTop: 80,
        padding: "24px 32px",
        background: "rgba(255, 255, 255, 0.15)",
        borderRadius: 16,
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.2)"
      }}>
        <p style={{
          color: "#fff",
          fontSize: 14,
          margin: 0,
          opacity: 0.9
        }}>
          💡 <strong>Astuce:</strong> Utilisez la barre de recherche pour trouver rapidement des événements ou artistes spécifiques
        </p>
      </div>
    </div>
  );
}