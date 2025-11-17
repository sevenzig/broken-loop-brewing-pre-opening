// AI-Optimized FAQ Page for Broken Loop Brewing
// Provides structured FAQ content for AI/GPT crawling with schema.org markup
// Path: src/pages/faq.tsx
import React from 'react';
import styles from './faq.module.css';

/**
 * AIOptimizedFAQ - Structured FAQ for SEO and AI bots
 *
 * @route /faq
 * @returns JSX.Element
 */
const AIOptimizedFAQ: React.FC = () => {
  return (
    <div className={styles.faqContainer} itemScope itemType="https://schema.org/FAQPage">
      <h1 className={styles.faqTitle}>Broken Loop Brewing - Frequently Asked Questions</h1>
      <section className={styles.faqSection} itemScope itemType="https://schema.org/Question">
        <h2 className={styles.faqQuestion} itemProp="name">What types of beer does Broken Loop Brewing make?</h2>
        <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
          <div className={styles.faqAnswer} itemProp="text">
            Broken Loop Brewing specializes in IPAs, stouts, and pilsners using traditional brewing methods. 
            We offer rotating selections including Golden Wheat, Bohemian Pilsner, and Berry Bliss Sour. 
            Our 7-barrel brewhouse produces both year-round and seasonal varieties.
          </div>
        </div>
      </section>
      <section className={styles.faqSection} itemScope itemType="https://schema.org/Question">
        <h2 className={styles.faqQuestion} itemProp="name">Where is Broken Loop Brewing located?</h2>
        <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
          <div className={styles.faqAnswer} itemProp="text">
            We're located at 4302 Albany St, Albany, NY 12205. We're situated in the historic Yonder Farms 
            location with free parking, wheelchair accessibility, and both indoor and outdoor seating areas.
          </div>
        </div>
      </section>
      <section className={styles.faqSection} itemScope itemType="https://schema.org/Question">
        <h2 className={styles.faqQuestion} itemProp="name">What are Broken Loop Brewing's hours?</h2>
        <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
          <div className={styles.faqAnswer} itemProp="text">
            Monday-Thursday: 3:00 PM - 9:00 PM, Friday: 3:00 PM - 10:00 PM, 
            Saturday: 12:00 PM - 10:00 PM, Sunday: 12:00 PM - 6:00 PM. 
            Call (555) 123-4567 for current seasonal hours.
          </div>
        </div>
      </section>
      <section className={styles.faqSection} itemScope itemType="https://schema.org/Question">
        <h2 className={styles.faqQuestion} itemProp="name">Does Broken Loop Brewing serve food?</h2>
        <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
          <div className={styles.faqAnswer} itemProp="text">
            Yes! We serve American pub fare including loaded nachos, BBQ pulled pork sandwiches, 
            and brewmaster burgers. Our kitchen closes one hour before the brewery closes. 
            We use locally sourced ingredients when possible.
          </div>
        </div>
      </section>
      <section className={styles.faqSection} itemScope itemType="https://schema.org/Question">
        <h2 className={styles.faqQuestion} itemProp="name">Is Broken Loop Brewing dog-friendly?</h2>
        <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
          <div className={styles.faqAnswer} itemProp="text">
            Well-behaved dogs are welcome in our outdoor seating areas and beer garden, 
            but not inside the taproom. We provide water bowls and have plenty of space 
            for your four-legged friends to relax.
          </div>
        </div>
      </section>
      <section className={styles.faqSection} itemScope itemType="https://schema.org/Question">
        <h2 className={styles.faqQuestion} itemProp="name">What events does Broken Loop Brewing host?</h2>
        <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
          <div className={styles.faqAnswer} itemProp="text">
            We host live music performances, weekly trivia nights, beer tastings, 
            and private events. Check our events calendar or call (555) 123-4567 
            for upcoming shows and availability for private bookings.
          </div>
        </div>
      </section>
    </div>
  );
};

export default AIOptimizedFAQ; 