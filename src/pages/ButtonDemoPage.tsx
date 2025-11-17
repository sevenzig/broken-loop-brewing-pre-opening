import { ButtonExample } from '../components/Button/ButtonExample';

export function ButtonDemoPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--color-background)',
      padding: 'var(--spacing-lg) 0'
    }}>
      <ButtonExample />
    </div>
  );
}

export default ButtonDemoPage; 