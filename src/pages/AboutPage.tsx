import { breweryInfo } from '../data/breweryInfo';
import styles from './AboutPage.module.css';

interface StaffMember {
  name: string;
  title: string;
  bio: string;
  image: string;
}

const staffMembers: StaffMember[] = [
  {
    name: "Jonathan Golon",
    title: "Head Brewer & Co-Founder",
    bio: "With over 5 years of brewing experience, Jonathan brings his passion for innovative beer recipes and sustainable brewing practices to every batch.",
    image: "/images/staff/sarah-johnson.jpg"
  }
];

function AboutPage() {
  return (
    <div className={styles.aboutPage}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1>About Broken Loop Brewing</h1>
          <p className={styles.heroSubtitle}>Crafting exceptional beer with passion, innovation, and community spirit</p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className={styles.storySection}>
        <div className={styles.container}>
          <div className={styles.storyGrid}>
            <div className={styles.storyText}>
              <h2>About Broken Loop</h2>
              <h3>The Loop Was Made to Be Broken.</h3>
              <p>
                We started Broken Loop Brewing Co. to create a brewery experience that doesn't feel like just another stop on your routine. For us, beer matters—but so does the space, the pace, and the people you share it with. And the space you drink it in should make you want to stay a while, not rush to the next thing.
              </p>
              <p>
                The name "Broken Loop" is about more than just a clever turn of phrase. It's a reminder to step out of autopilot. To try something new. To slow down, even if just for a pint.
              </p>
              <p>
                And yes—there's a literal broken loop too. The traffic detection loops at the intersection right outside the brewery have been broken for years. If you've ever sat at a red light there for no reason, you've felt it. It's always driven us crazy. There's something poetic about fixing the feeling instead of the loop.
              </p>
              <p>
                Broken Loop wasn't built on a whim. It's been years in the making—through late-night planning sessions, hundreds of brewery visits, notes on napkins, and so many spreadsheets. Like most things worth building, it took time, patience, and a lot of talking ourselves into the risk.
              </p>
              <p>
                We're proud to be located in Colonie, in the former home of Yonder Farms—a place with deep roots in the community. We looked at countless locations, but when we learned of the possibility here, we knew it was the one. We're honored to try to give the property a second life and for it to return to being a local place of gathering.
              </p>
              <p>
                We built this place for people who want something a little more intentional. Who aren't just looking to pass the time, but to spend it well. A brewery that doesn't push you through, but invites you to stay. A place where beer is thoughtful, the space is relaxed, and the goal isn't speed—it's connection.
              </p>
              <p>
                We're a team that believes in doing things thoughtfully. Our beers are brewed for flavor and drinkabilty, not flash. Our space is designed to bring people together. And our team is here to help you find something you didn't know you were looking for.
              </p>
              <p>
                Whether you're building a flight, bringing your kids, relaxing on the patio, or catching up with friends in the beer garden—we're glad you took the detour.
              </p>
              <p>
                Thanks for being part of it.
              </p>
            </div>
            <div className={styles.storyImage}>
              <img src="/images/brewery-interior.jpg" alt="Inside Broken Loop Brewing" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className={styles.missionSection}>
        <div className={styles.container}>
          <h2>Our Mission</h2>
          <div className={styles.missionGrid}>
            <div className={styles.missionCard}>
              <div className={styles.missionIcon}>🍺</div>
              <h3>Exceptional Quality</h3>
              <p>We are committed to brewing the highest quality craft beer using premium ingredients and time-tested techniques combined with innovative approaches.</p>
            </div>
            <div className={styles.missionCard}>
              <div className={styles.missionIcon}>🌱</div>
              <h3>Sustainability</h3>
              <p>Environmental responsibility guides our brewing process, from sourcing local ingredients to implementing eco-friendly practices throughout our operations.</p>
            </div>
            <div className={styles.missionCard}>
              <div className={styles.missionIcon}>🤝</div>
              <h3>Community</h3>
              <p>We believe beer is best shared. Our taproom serves as a gathering place where neighbors become friends and memories are made over great beer.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Staff Section */}
      <section className={styles.staffSection}>
        <div className={styles.container}>
          <h2>Meet Our Team</h2>
          <p className={styles.staffIntro}>
            The passionate people behind every pint - our dedicated team brings together decades 
            of brewing expertise, hospitality experience, and genuine love for craft beer.
          </p>
          <div className={styles.staffGrid}>
            {staffMembers.map((member, index) => (
              <div key={index} className={styles.staffCard}>
                <div className={styles.staffImageContainer}>
                  <img 
                    src={member.image} 
                    alt={member.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/placeholder-staff.jpg';
                    }}
                  />
                </div>
                <div className={styles.staffInfo}>
                  <h3>{member.name}</h3>
                  <h4>{member.title}</h4>
                  <p>{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={styles.valuesSection}>
        <div className={styles.container}>
          <h2>What We Stand For</h2>
          <div className={styles.valuesList}>
            <div className={styles.valueItem}>
              <strong>Innovation with Tradition:</strong> We honor brewing heritage while constantly experimenting with new flavors and techniques.
            </div>
            <div className={styles.valueItem}>
              <strong>Local First:</strong> Supporting our community through local sourcing, partnerships, and creating gathering spaces.
            </div>
            <div className={styles.valueItem}>
              <strong>Quality Over Quantity:</strong> Every batch is carefully crafted with no shortcuts, ensuring consistency and excellence.
            </div>
            <div className={styles.valueItem}>
              <strong>Inclusive Community:</strong> Our doors are open to everyone who appreciates good beer and good company.
            </div>
            <div className={styles.valueItem}>
              <strong>Environmental Stewardship:</strong> Minimizing our impact through sustainable practices and responsible resource use.
            </div>
          </div>
        </div>
      </section>

      {/* Visit Us Section */}
      <section className={styles.visitSection}>
        <div className={styles.container}>
          <div className={styles.visitGrid}>
            <div className={styles.visitText}>
              <h2>Visit Our Brewery</h2>
              <p>
                Come experience Broken Loop Brewing firsthand. Our taproom offers a welcoming 
                atmosphere where you can sample our latest creations, enjoy food from local 
                partners, and see our brewing process in action.
              </p>
              <p>
                Whether you're a beer enthusiast or just curious about craft brewing, our 
                knowledgeable staff is always happy to share our story and help you discover 
                your new favorite beer.
              </p>
              <div className={styles.visitInfo}>
                <p><strong>Address:</strong> {breweryInfo.address?.full || "Visit us at our brewery location"}</p>
                <p><strong>Phone:</strong> {breweryInfo.contact?.phone?.formatted || "(555) 123-BEER"}</p>
              </div>
            </div>
            <div className={styles.visitImage}>
              <img src="/images/brewery-exterior.jpg" alt="Broken Loop Brewing exterior" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage; 