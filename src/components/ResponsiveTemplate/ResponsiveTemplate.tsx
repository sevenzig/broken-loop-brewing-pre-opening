import styles from './ResponsiveTemplate.module.css';

interface ResponsiveTemplateProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * ResponsiveTemplate - Demonstrates standardized responsive design patterns
 * 
 * This component serves as a template for creating new responsive components
 * that follow the established breakpoint standards.
 * 
 * @example
 * <ResponsiveTemplate title="Example" description="This shows responsive patterns">
 *   <div>Content here</div>
 * </ResponsiveTemplate>
 */
export function ResponsiveTemplate({
  title = 'Responsive Template',
  description = 'This component demonstrates the standardized responsive design patterns used across the project.',
  children,
  className = ''
}: ResponsiveTemplateProps) {
  return (
    <section className={`${styles.responsiveTemplate} ${className}`}>
      <div className={styles.sectionContent}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
        
        <div className={styles.contentGrid}>
          {children}
        </div>
      </div>
    </section>
  );
} 