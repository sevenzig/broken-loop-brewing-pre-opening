import styles from './Footer.module.css';
import { breweryInfo } from '../../data/breweryInfo';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerGrid}>
          {/* Contact Information */}
          <div className={styles.footerSection}>
            <h3 className={styles.sectionTitle}>Visit Us</h3>
            <address className={styles.address}>
              <p>{breweryInfo.address.full}</p>
              <p>
                <a href={breweryInfo.contact.phone.link} className={styles.phoneLink}>
                  {breweryInfo.contact.phone.formatted}
                </a>
              </p>
              <p>
                <a href={`mailto:${breweryInfo.contact.email}`} className={styles.emailLink}>
                  {breweryInfo.contact.email}
                </a>
              </p>
            </address>
          </div>

          {/* Hours */}
          <div className={styles.footerSection}>
            <h3 className={styles.sectionTitle}>Hours</h3>
            <div className={styles.hoursList}>
              {breweryInfo.getBusinessHours().map((day, index) => (
                <div key={index} className={styles.hoursItem}>
                  <span className={styles.dayName}>{day.day}:</span>
                  <span className={styles.dayHours}>{day.hours}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Social Media */}
          <div className={styles.footerSection}>
            <h3 className={styles.sectionTitle}>Follow Us</h3>
            <div className={styles.socialLinks}>
              {breweryInfo.social.facebook && (
                <a 
                  href={breweryInfo.social.facebook} 
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Facebook"
                >
                  Facebook
                </a>
              )}
              {breweryInfo.social.instagram && (
                <a 
                  href={breweryInfo.social.instagram} 
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Instagram"
                >
                  Instagram
                </a>
              )}
              {breweryInfo.social.twitter && (
                <a 
                  href={breweryInfo.social.twitter} 
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Twitter"
                >
                  Twitter
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.footerSection}>
            <h3 className={styles.sectionTitle}>Quick Links</h3>
            <nav className={styles.quickLinks}>
              <a href="/beer" className={styles.quickLink}>Our Beers</a>
              <a href="/food" className={styles.quickLink}>Food Menu</a>
              <a href="/events" className={styles.quickLink}>Events</a>
              <a href="/about" className={styles.quickLink}>About Us</a>
              <a href="/faq" className={styles.quickLink}>FAQ</a>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.footerBottom}>
          <p className={styles.copyright}>
            © {currentYear} {breweryInfo.name}. All rights reserved.
          </p>
          <p className={styles.tagline}>
            {breweryInfo.tagline}
          </p>
        </div>
      </div>
    </footer>
  );
} 