import React from 'react';

/**
 * Task 2: Lazy-loaded AdminPanel Component
 */
const AdminPanel = () => {
  return (
    <div className="container">
      <h2>Admin / Fleet Manager Dashboard</h2>
      <p style={{ color: '#718096' }}>
        Lazy-loaded administrative panel for DriveEasy operations.
      </p>

      <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h4>Active Fleet Size</h4>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1c3d5e', marginTop: '10px' }}>8 Vehicles</p>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h4>Ongoing Reservations</h4>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2b6cb0', marginTop: '10px' }}>3 Ongoing</p>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h4>Fleet Utilization</h4>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#38a169', marginTop: '10px' }}>75%</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
