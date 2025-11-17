import { useState } from 'react';
import InfoTabs from '../components/InfoTabs';

/**
 * Demo page for the InfoTabs component
 * Showcases different configurations and usage patterns
 */
export default function InfoTabsDemoPage() {
  const [activeTab, setActiveTab] = useState<'hours' | 'directions' | 'policies'>('hours');
  const [tabChangeCount, setTabChangeCount] = useState(0);

  const handleTabChange = (tab: 'hours' | 'directions' | 'policies') => {
    setActiveTab(tab);
    setTabChangeCount(prev => prev + 1);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: 'var(--spacing-lg)',
      background: 'var(--color-background-secondary)',
      fontFamily: 'var(--font-family-primary)'
    }}>
      <div style={{ 
        maxWidth: 'var(--container-max-width)', 
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          color: 'var(--color-primary)', 
          marginBottom: 'var(--spacing-lg)',
          fontSize: 'var(--font-size-xxl)'
        }}>
          InfoTabs Component Demo
        </h1>
        
        <p style={{ 
          color: 'var(--color-text-secondary)', 
          marginBottom: 'var(--spacing-xl)',
          fontSize: 'var(--font-size-lg)'
        }}>
          Mobile-optimized tabbed component for brewery information
        </p>

        {/* Demo Stats */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 'var(--spacing-lg)',
          marginBottom: 'var(--spacing-xl)',
          flexWrap: 'wrap'
        }}>
          <div style={{
            background: 'var(--color-background)',
            padding: 'var(--spacing-md)',
            borderRadius: 'var(--border-radius)',
            boxShadow: 'var(--shadow-sm)',
            minWidth: '150px'
          }}>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              Active Tab
            </div>
            <div style={{ 
              fontSize: 'var(--font-size-lg)', 
              fontWeight: '600',
              color: 'var(--color-primary)',
              textTransform: 'capitalize'
            }}>
              {activeTab}
            </div>
          </div>
          
          <div style={{
            background: 'var(--color-background)',
            padding: 'var(--spacing-md)',
            borderRadius: 'var(--border-radius)',
            boxShadow: 'var(--shadow-sm)',
            minWidth: '150px'
          }}>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              Tab Changes
            </div>
            <div style={{ 
              fontSize: 'var(--font-size-lg)', 
              fontWeight: '600',
              color: 'var(--color-secondary)'
            }}>
              {tabChangeCount}
            </div>
          </div>
        </div>

        {/* Component Demo */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          marginBottom: 'var(--spacing-xl)'
        }}>
          <InfoTabs 
            initialActiveTab="hours"
            onTabChange={handleTabChange}
          />
        </div>

        {/* Usage Examples */}
        <div style={{ 
          background: 'var(--color-background)', 
          padding: 'var(--spacing-xl)',
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: 'var(--shadow-md)',
          textAlign: 'left'
        }}>
          <h2 style={{ 
            color: 'var(--color-primary)', 
            marginBottom: 'var(--spacing-lg)',
            fontSize: 'var(--font-size-xl)'
          }}>
            Usage Examples
          </h2>
          
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h3 style={{ 
              color: 'var(--color-text)', 
              marginBottom: 'var(--spacing-md)',
              fontSize: 'var(--font-size-lg)'
            }}>
              Basic Usage
            </h3>
            <pre style={{
              background: 'var(--color-background-secondary)',
              padding: 'var(--spacing-md)',
              borderRadius: 'var(--border-radius)',
              overflow: 'auto',
              fontSize: 'var(--font-size-sm)',
              lineHeight: 'var(--line-height-normal)'
            }}>
{`import InfoTabs from '../components/InfoTabs';

<InfoTabs />`}
            </pre>
          </div>

          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h3 style={{ 
              color: 'var(--color-text)', 
              marginBottom: 'var(--spacing-md)',
              fontSize: 'var(--font-size-lg)'
            }}>
              With Callback
            </h3>
            <pre style={{
              background: 'var(--color-background-secondary)',
              padding: 'var(--spacing-md)',
              borderRadius: 'var(--border-radius)',
              overflow: 'auto',
              fontSize: 'var(--font-size-sm)',
              lineHeight: 'var(--line-height-normal)'
            }}>
{`const handleTabChange = (tab) => {
  console.log('Active tab:', tab);
};

<InfoTabs 
  initialActiveTab="directions"
  onTabChange={handleTabChange}
/>`}
            </pre>
          </div>

          <div>
            <h3 style={{ 
              color: 'var(--color-text)', 
              marginBottom: 'var(--spacing-md)',
              fontSize: 'var(--font-size-lg)'
            }}>
              With Custom Styling
            </h3>
            <pre style={{
              background: 'var(--color-background-secondary)',
              padding: 'var(--spacing-md)',
              borderRadius: 'var(--border-radius)',
              overflow: 'auto',
              fontSize: 'var(--font-size-sm)',
              lineHeight: 'var(--line-height-normal)'
            }}>
{`<InfoTabs 
  className="my-custom-tabs"
  initialActiveTab="policies"
/>`}
            </pre>
          </div>
        </div>

        {/* Features List */}
        <div style={{ 
          background: 'var(--color-background)', 
          padding: 'var(--spacing-xl)',
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: 'var(--shadow-md)',
          marginTop: 'var(--spacing-xl)',
          textAlign: 'left'
        }}>
          <h2 style={{ 
            color: 'var(--color-primary)', 
            marginBottom: 'var(--spacing-lg)',
            fontSize: 'var(--font-size-xl)'
          }}>
            Features
          </h2>
          
          <ul style={{
            listStyle: 'none',
            padding: 0,
            display: 'grid',
            gap: 'var(--spacing-md)'
          }}>
            {[
              'Mobile-first design optimized for 375px screens',
              'Real-time business hours and status',
              'Interactive Google Maps integration',
              'Accessible with ARIA labels and keyboard navigation',
              'Responsive design that scales to larger screens',
              'Smooth animations with reduced motion support',
              'Uses breweryInfo.ts as single source of truth',
              'CSS Modules with project design system',
              'TypeScript support with proper interfaces',
              'Touch-friendly tap targets (44px minimum)'
            ].map((feature, index) => (
              <li key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
                padding: 'var(--spacing-sm)',
                background: 'var(--color-background-secondary)',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: 'var(--font-size-sm)'
              }}>
                <span style={{ 
                  color: 'var(--color-success)', 
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 'bold'
                }}>
                  ✓
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 