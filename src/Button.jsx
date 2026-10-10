export const Button = ({ label, background = '#6d28d9' }) => (
  <button type="button" style={{ background, color: '#ffffff', border: 0, borderRadius: 8, padding: '12px 20px', font: '16px sans-serif' }}>
    {label}
  </button>
);
