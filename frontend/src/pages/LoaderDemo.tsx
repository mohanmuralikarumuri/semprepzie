import React from 'react';
import SemprepzieLoader from '../components/SemprepzieLoader';

const LoaderDemo: React.FC = () => {
  return (
    <div style={{ padding: '40px', background: '#1a1a2e', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px', color: '#fff', fontSize: '2.5rem' }}>
        Semprepzie Beam Loader Demo
      </h1>
      
      <div style={{ display: 'grid', gap: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ background: '#16213e', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          <h2 style={{ marginBottom: '20px', color: '#fff', fontSize: '1.5rem' }}>Semprepzie Loader</h2>
          <SemprepzieLoader />
        </div>

        <div style={{ background: '#16213e', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          <h2 style={{ marginBottom: '20px', color: '#fff', fontSize: '1.5rem' }}>Animation Features</h2>
          <ul style={{ color: '#fff', lineHeight: '1.8' }}>
            <li>✨ Beam animation following text stroke</li>
            <li>🎨 Gradient blue colors (#00c6ff → #0072ff)</li>
            <li>💫 Glowing text with drop shadow</li>
            <li>⚡ Smooth 3-second loop animation</li>
            <li>📱 Responsive design</li>
          </ul>
        </div>

        <div style={{ background: '#16213e', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          <h2 style={{ marginBottom: '20px', color: '#fff', fontSize: '1.5rem' }}>Usage</h2>
          <pre style={{ background: '#0d1117', padding: '20px', borderRadius: '8px', color: '#58a6ff', overflow: 'auto' }}>
{`import SemprepzieLoader from './components/SemprepzieLoader';

function App() {
  return <SemprepzieLoader />;
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default LoaderDemo;
