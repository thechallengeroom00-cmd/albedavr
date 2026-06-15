export default function HomePage() {
  return (
    <main className="container">
      <header className="header">
        <div className="logo">GeeGee<span>AI</span></div>
        <a className="btn secondary" href="/admin">Admin</a>
      </header>
      <section className="grid two">
        <div className="card">
          <h1 className="h1">Veilige AI-workshops voor kinderen en jongeren.</h1>
          <p className="muted">Versie 1 starter: nickname-login, topickeuze, chat, moderatie, live dashboard, eindscherm en certificaatbasis.</p>
          <div className="row" style={{ marginTop: 24 }}>
            <a className="btn" href="/workshop">Kies je workshoplocatie</a>
            <a className="btn ok" href="/ron-vr">Start Ron VR-prototype</a>
            <a className="btn secondary" href="/admin/workshops/DEMO123">Live dashboard</a>
          </div>
        </div>
        <div className="card">
          <h2 className="h2">V1 uitgangspunten</h2>
          <div className="grid">
            <span className="badge">Anoniem met nickname</span>
            <span className="badge">Basisschool / middelbare school modus</span>
            <span className="badge">Modules aan/uit</span>
            <span className="badge">Input + output moderatie</span>
            <span className="badge">Eindscherm centraal pushen</span>
            <span className="badge">Certificaat op nickname</span>
          </div>
        </div>
      </section>
    </main>
  );
}
