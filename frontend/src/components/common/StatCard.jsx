import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'primary', subtitle, badgeText, badgeColor = 'success' }) => {
  const bgStyles = {
    primary: { bg: '#e0e7ff', text: '#4338ca' },
    success: { bg: '#d1fae5', text: '#065f46' },
    warning: { bg: '#fef3c7', text: '#92400e' },
    danger: { bg: '#fee2e2', text: '#991b1b' },
    info: { bg: '#e0f2fe', text: '#0369a1' },
    purple: { bg: '#ede9fe', text: '#6d28d9' },
  };

  const style = bgStyles[color] || bgStyles.primary;

  return (
    <div className="card-modern stat-card h-100">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <span className="text-muted small fw-bold text-uppercase">{title}</span>
        {Icon && (
          <div
            className="icon-wrapper"
            style={{ backgroundColor: style.bg, color: style.text }}
          >
            <Icon size={22} />
          </div>
        )}
      </div>

      <div className="d-flex align-items-baseline gap-2 mt-1">
        <h2 className="fw-bolder mb-0 text-dark">{value}</h2>
        {badgeText && (
          <span className={`badge badge-soft-${badgeColor} rounded-pill`}>
            {badgeText}
          </span>
        )}
      </div>

      {subtitle && <p className="text-muted small mb-0 mt-2">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
