import styles from './DebugPage.module.css';

export function DebugPage() {
  return (
    <div className={styles.container}>
      <h1>Debug Page</h1>
      <p>This page is for debugging purposes.</p>
      
      <section className={styles.debugSection}>
        <h2>Environment Information</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <strong>Node Environment:</strong> {process.env.NODE_ENV}
          </div>
          <div className={styles.infoItem}>
            <strong>Build Time:</strong> {process.env.BUILD_TIME || 'Unknown'}
          </div>
          <div className={styles.infoItem}>
            <strong>Version:</strong> {process.env.VERSION || 'Unknown'}
          </div>
        </div>
      </section>
      
      <section className={styles.debugSection}>
        <h2>Browser Information</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <strong>User Agent:</strong> {navigator.userAgent}
          </div>
          <div className={styles.infoItem}>
            <strong>Language:</strong> {navigator.language}
          </div>
          <div className={styles.infoItem}>
            <strong>Platform:</strong> {navigator.platform}
          </div>
          <div className={styles.infoItem}>
            <strong>Cookie Enabled:</strong> {navigator.cookieEnabled ? 'Yes' : 'No'}
          </div>
        </div>
      </section>
      
      <section className={styles.debugSection}>
        <h2>Screen Information</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <strong>Screen Width:</strong> {screen.width}px
          </div>
          <div className={styles.infoItem}>
            <strong>Screen Height:</strong> {screen.height}px
          </div>
          <div className={styles.infoItem}>
            <strong>Window Width:</strong> {window.innerWidth}px
          </div>
          <div className={styles.infoItem}>
            <strong>Window Height:</strong> {window.innerHeight}px
          </div>
        </div>
      </section>
      
      <section className={styles.debugSection}>
        <h2>Local Storage</h2>
        <div className={styles.storageInfo}>
          <h3>Keys:</h3>
          <ul>
            {Object.keys(localStorage).map(key => (
              <li key={key}>
                <strong>{key}:</strong> {localStorage.getItem(key)}
              </li>
            ))}
          </ul>
        </div>
      </section>
      
      <section className={styles.debugSection}>
        <h2>Session Storage</h2>
        <div className={styles.storageInfo}>
          <h3>Keys:</h3>
          <ul>
            {Object.keys(sessionStorage).map(key => (
              <li key={key}>
                <strong>{key}:</strong> {sessionStorage.getItem(key)}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

export default DebugPage; 