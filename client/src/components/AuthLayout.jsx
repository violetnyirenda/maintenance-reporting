export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <div className="auth-bg-shape auth-bg-shape-a" aria-hidden="true" />
      <div className="auth-bg-shape auth-bg-shape-b" aria-hidden="true" />
      <div className="auth-shell">
        <aside className="auth-brand-panel">
          <div className="auth-panel-inner">
            <h2 className="auth-brand-title">CampusFix</h2>
            <p className="auth-brand-text">
              The official way to report and track maintenance across your university campus.
            </p>
            <div className="auth-feature-cards">
              <div className="auth-feature-card">
                <span className="auth-feature-num">01</span>
                <div>
                  <strong>Report</strong>
                  <p>Log issues with location, photos, and priority</p>
                </div>
              </div>
              <div className="auth-feature-card">
                <span className="auth-feature-num">02</span>
                <div>
                  <strong>Track</strong>
                  <p>Follow status from pending to resolved</p>
                </div>
              </div>
              <div className="auth-feature-card">
                <span className="auth-feature-num">03</span>
                <div>
                  <strong>Resolve</strong>
                  <p>Campus staff update and close tickets</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
        <div className="auth-form-panel">
          <div className="auth-form-inner">
            <h1>{title}</h1>
            <p className="muted">{subtitle}</p>
            {children}
            {footer && <p className="auth-footer">{footer}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
