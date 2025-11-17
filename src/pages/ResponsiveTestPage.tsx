import { ResponsiveTemplate } from '../components/ResponsiveTemplate/ResponsiveTemplate';

/**
 * ResponsiveTestPage - Test page for verifying responsive breakpoints
 * 
 * This page helps developers test and verify that all responsive
 * breakpoints are working correctly across different viewport sizes.
 */
export function ResponsiveTestPage() {
  const testItems = [
    { id: 1, title: 'Mobile Portrait', description: '320px - 480px' },
    { id: 2, title: 'Mobile Landscape', description: '481px - 768px' },
    { id: 3, title: 'Tablet', description: '769px - 1024px' },
    { id: 4, title: 'Desktop Small', description: '1025px - 1200px' },
    { id: 5, title: 'Desktop Large', description: '1201px+' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <ResponsiveTemplate 
        title="Responsive Breakpoint Test"
        description="Resize your browser window to see how the grid adapts to different viewport sizes. Each card represents a different breakpoint range."
      >
        {testItems.map(item => (
          <div 
            key={item.id}
            style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              textAlign: 'center'
            }}
          >
            <h3 style={{ color: '#1a4d5c', marginBottom: '0.5rem' }}>
              {item.title}
            </h3>
            <p style={{ color: '#666', margin: 0 }}>
              {item.description}
            </p>
          </div>
        ))}
      </ResponsiveTemplate>

      <ResponsiveTemplate 
        title="Touch Target Test"
        description="These buttons should be at least 44px tall on mobile devices for proper touch interaction."
        className="touch-target-test"
      >
        <button 
          style={{
            background: '#1a4d5c',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Touch Target Button
        </button>
        <button 
          style={{
            background: '#d4af37',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Another Button
        </button>
        <button 
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Success Button
        </button>
        <button 
          style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Error Button
        </button>
      </ResponsiveTemplate>

      <ResponsiveTemplate 
        title="Typography Scaling Test"
        description="Typography should scale appropriately across different viewport sizes."
      >
        <div style={{ textAlign: 'center', width: '100%' }}>
          <h1 style={{ color: '#1a4d5c', marginBottom: '1rem' }}>
            H1 - Main Heading
          </h1>
          <h2 style={{ color: '#1a4d5c', marginBottom: '1rem' }}>
            H2 - Secondary Heading
          </h2>
          <h3 style={{ color: '#1a4d5c', marginBottom: '1rem' }}>
            H3 - Tertiary Heading
          </h3>
          <p style={{ color: '#666', lineHeight: '1.6' }}>
            This is a paragraph of text that demonstrates how typography scales 
            across different viewport sizes. The text should remain readable 
            and well-proportioned on all devices.
          </p>
        </div>
      </ResponsiveTemplate>
    </div>
  );
} 

export default ResponsiveTestPage; 