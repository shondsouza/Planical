import React from 'react'

import Script from 'dangerous-html/react'
import { Helmet } from 'react-helmet'


import Navbar from '../components/navbar'
import Mark from '../components/mark'
import Card from '../components/card'
import Accordion from '../components/accordion'
import Includes from '../components/includes'
import Excludes from '../components/excludes'
import Review from '../components/review'
import Article from '../components/article'
import FAQ from '../components/faq'
import './home.css'

const Home = (props) => {
  return (
    <div className="home-container1">
      <Helmet>
        <title>Planical</title>
        <meta property="og:title" content="Planical" />
      </Helmet>
      <Navbar rootClassName="navbarroot-class-name"></Navbar>
      <section className="home-section10">
        <div className="home-hero">
          <div className="home-content1">
            <main className="home-main1">
              <header className="home-header10">
                <h1 className="home-heading10">
                Prioritize Your Mental Health
                </h1>
                <span className="home-caption1">
                Start improving your mental health and well-being today. Planical shows you how.
                </span>
              </header>
              <div className="home-buttons1">
                <div className="home-get-started1 button">
                  <span className="home-text10">Get started</span>
                </div>
                <div className="home-get-started2 button">
                  <span className="home-text11">View features</span>
                </div>
              </div>
            </main>
            <div className="home-highlight">
              <div className="home-avatars">
                <img
                  alt="image"
                  src="https://images.unsplash.com/photo-1552234994-66ba234fd567?ixid=Mnw5MTMyMXwwfDF8c2VhcmNofDN8fHBvdHJhaXR8ZW58MHx8fHwxNjY3MjQ0ODcx&amp;ixlib=rb-4.0.3&amp;w=200"
                  className="home-image10 avatar"
                />
                <img
                  alt="image"
                  src="https://images.unsplash.com/photo-1610276198568-eb6d0ff53e48?ixid=Mnw5MTMyMXwwfDF8c2VhcmNofDF8fHBvdHJhaXR8ZW58MHx8fHwxNjY3MjQ0ODcx&amp;ixlib=rb-4.0.3&amp;w=200"
                  className="home-image11 avatar"
                />
                <img
                  alt="image"
                  src="https://images.unsplash.com/photo-1618151313441-bc79b11e5090?ixid=Mnw5MTMyMXwwfDF8c2VhcmNofDEzfHxwb3RyYWl0fGVufDB8fHx8MTY2NzI0NDg3MQ&amp;ixlib=rb-4.0.3&amp;w=200"
                  className="home-image12 avatar"
                />
              </div>
              <label className="home-caption2">
                Loved by 10,000+ people like you.
              </label>
            </div>
          </div>
          <div className="home-image13">
            <img
              alt="image"
              src=".\SectionImages\heroimage.png"
              className="home-image14"
            />
          </div>
          <div className="home-image15">
            <img
              alt="image"
              src="/SectionImages/heroimage.png"
              className="home-image16"
            />
          </div>
        </div>
      </section>
      <section className="home-section11">
        <h2 className="home-text12">
          Our doctors and therapists are here, 24/7.
        </h2>
        <div className="home-features1">
          <header className="feature feature-active home-feature1">
            <h3 className="home-text13">Urgent Care</h3>
            <p className="home-text14">Immediate help for urgent needs.</p>
          </header>
          <header className="feature home-feature2">
            <h3 className="home-text15">Chronic Care</h3>
            <p className="home-text16">Support for long-term wellness.</p>
          </header>
          <header className="feature home-feature3">
            <h3 className="home-text17">Mental Health</h3>
            <p className="home-text18">Therapy and care, anytime.</p>
          </header>
        </div>
        <div className="home-note1">
          <div className="home-content2">
            <main className="home-main2">
              <h2 className="home-heading11">
                Prioritize Your Mental Well-Being with Ease
              </h2>
              <p className="home-paragraph1">
                <span>
                Taking care of your mental health should be simple and accessible. 
                Our platform provides seamless access to professional consultations, personalized care, and the support you need to feel your best.
                Stay on top of your scheduled sessions, explore tailored resources, and take the next step toward emotional well-being with confidence.
                </span>
                <br></br>
                <br></br>
                <span>
                  Doloremque laudantium, totam rem aperiam, eaque ipsa quae ab
                  illo inventore veritatis et quasi architecto beatae.
                </span>
                <br></br>
              </p>
            </main>
            <div className="home-explore-more">
              <p className="home-text24">Explore more -&gt;</p>
            </div>
          </div>
          <div className="home-image17">
            <img
              alt="image"
              src="/SectionImages/group 1490.png"
              className="home-image18"
            />
          </div>
        </div>
      </section>
      <section className="home-section12">
        <header className="home-header11">
          <h2 className="home-text25">How does this website help mental health?</h2>
          <span className="home-text26">
          The website connects users to mental health care and offers self-care resources and community support.
          </span>
        </header>
        <section className="home-note2">
          <div className="home-image19">
            <img
              alt="image"
              src="/SectionImages/group 1428.png"
              className="home-image20"
            />
          </div>
          <div className="home-content3">
            <div className="home-main3">
              <div className="home-caption3">
                <span className="section-head">Mind Matters</span>
              </div>
              <div className="home-heading12">
                <h2 className="section-heading">
                  We equip you with tools to boost your mental health and well-being.
                </h2>
                <p className="section-description">
                This website offers professional support, self-care resources, and a community to help you improve your mental health and well-being.                
                </p>
              </div>
            </div>
            <div className="home-get-started3 button">
              <span className="home-text27">Get started</span>
            </div>
          </div>
        </section>
        <section className="home-note3">
          <div className="home-image21">
            <img
              alt="image"
              src="/SectionImages/group 1499.png"
              className="home-image22"
            />
          </div>
          <div className="home-content4">
            <main className="home-main4">
              <header className="home-caption4">
                <span className="home-section14 section-head">
                Your Mental Wellness, Our Priority
                </span>
              </header>
              <main className="home-heading14">
                <header className="home-header12">
                  <h2 className="section-heading">
                    Great care, wherever you are
                  </h2>
                  <p className="section-description">
                  Get instant support from our AI-powered mental health assistant, designed to help you manage stress, anxiety, and emotional well-being anytime, anywhere.
                  </p>
                </header>
                <div className="home-checkmarks">
                  <Mark></Mark>
                  <Mark label="Personalized support tailored to your emotions"></Mark>
                  <Mark label="Evidence-based techniques for stress relief"></Mark>
                </div>
              </main>
            </main>
            <div className="home-get-started4 button">
              <span className="home-text28">Get started</span>
            </div>
          </div>
        </section>
      </section>
      <section className="home-section15">
        <header className="home-header13">
          <header className="home-left1">
            <span className="section-head">Tempor incididunt</span>
            <h2 className="section-heading">
              <span>Meet our network</span>
              <br></br>
              <span>of licensed providers</span>
            </h2>
          </header>
          <div className="home-right1">
            <p className="home-paragraph4 section-description">
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem
              accusantium doloremque laudantium, totam rem aperiam.
            </p>
          </div>
        </header>
        <main className="home-cards1">
          <Card rootClassName="cardroot-class-name"></Card>
          <Card
            icon="/Icons/group 1314.png"
            rootClassName="cardroot-class-name1"
          ></Card>
          <Card
            icon="/Icons/group 1317.png"
            rootClassName="cardroot-class-name2"
          ></Card>
        </main>
      </section>
      <section className="home-section17">
        <div className="home-note4">
          <div className="home-image23">
            <img
              alt="image"
              src="/SectionImages/macbook.png"
              className="home-image24"
            />
          </div>
          <div className="home-content5">
            <div className="home-caption5">
              <span className="section-head">Tempor incididunt</span>
            </div>
            <div className="home-heading17">
              <div className="home-header14">
                <h2 className="section-heading">
                  Tips to get care, answers and advice faster
                </h2>
              </div>
              <Accordion rootClassName="accordionroot-class-name"></Accordion>
            </div>
          </div>
        </div>
      </section>
      <section className="home-section19">
        <div className="home-cube1">
          <div className="home-top1 side"></div>
          <div className="home-front1 side"></div>
          <div className="home-left2 side"></div>
        </div>
        <main className="home-banner">
          <div className="home-header15">
            <h2 className="section-heading">
              Planical makes online doctor visits easier
            </h2>
            <p className="home-description1 section-description">
              Lorem ipsum dolor sit amet!
            </p>
          </div>
          <div className="home-buttons2">
            <div className="home-get-started5 button">
              <span className="home-text32">Get started</span>
            </div>
            <div className="home-book-demo button">
              <span className="home-text33">Book a demo</span>
            </div>
          </div>
        </main>
      </section>
      <section className="home-section20">
        <div className="home-cube2">
          <div className="home-top2 side"></div>
          <div className="home-front2 side"></div>
          <div className="home-left3 side"></div>
        </div>
        <main className="home-pricing1">
          <header className="home-header16">
            <header className="home-left4">
              <span className="section-head">Pricing</span>
              <h2 className="section-heading home-heading20">
                Start small, think big
              </h2>
            </header>
            <div className="home-right2">
              <p className="home-paragraph5 section-description">
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                accusantium doloremque laudantium, totam rem aperiam.
              </p>
            </div>
          </header>
          <div className="home-plans-container">
            <div className="home-switch1">
              <div className="switch">
                <label className="home-text34">Monthly</label>
              </div>
              <div className="home-switch3 switch">
                <label className="home-text35">Yearly</label>
              </div>
            </div>
            <main className="home-plans">
              <div className="home-plan1">
                <div className="home-details1">
                  <div className="home-header17">
                    <label className="home-name1">Basic</label>
                    <div className="home-pricing2">
                      <h1 className="home-price1">$9</h1>
                      <span className="home-duration1">/mo</span>
                    </div>
                  </div>
                  <p className="home-description2">
                    Good for sed quia consequuntur magni dolores eos qui
                    ratione.
                  </p>
                </div>
                <div className="home-buy-details1">
                  <div className="home-buy1 button">
                    <span className="home-text36">
                      <span>Start Basic</span>
                      <br></br>
                    </span>
                  </div>
                  <div className="home-features2">
                    <span className="home-heading21">You will get</span>
                    <div className="home-list1">
                      <Includes rootClassName="includesroot-class-name"></Includes>
                      <Includes rootClassName="includesroot-class-name"></Includes>
                      <Includes rootClassName="includesroot-class-name"></Includes>
                      <Includes rootClassName="includesroot-class-name"></Includes>
                      <Excludes rootClassName="excludesroot-class-name"></Excludes>
                      <Excludes rootClassName="excludesroot-class-name"></Excludes>
                      <Excludes rootClassName="excludesroot-class-name"></Excludes>
                      <Excludes rootClassName="excludesroot-class-name"></Excludes>
                      <Excludes rootClassName="excludesroot-class-name"></Excludes>
                      <Excludes rootClassName="excludesroot-class-name"></Excludes>
                    </div>
                  </div>
                </div>
              </div>
              <div className="home-plan2">
                <div className="home-details2">
                  <div className="home-header18">
                    <label className="home-name2">Professional</label>
                    <div className="home-pricing3">
                      <h1 className="home-price2">$15</h1>
                      <span className="home-duration2">/mo</span>
                    </div>
                  </div>
                  <p className="home-description3">
                    Good for sed quia consequuntur magni dolores eos qui
                    ratione.
                  </p>
                </div>
                <div className="home-buy-details2">
                  <div className="home-buy2 button">
                    <span className="home-text39">
                      <span>Start Professional</span>
                      <br></br>
                    </span>
                  </div>
                  <div className="home-features3">
                    <span className="home-heading22">You will get</span>
                    <div className="home-list2">
                      <Includes rootClassName="includesroot-class-name"></Includes>
                      <Includes rootClassName="includesroot-class-name"></Includes>
                      <Includes rootClassName="includesroot-class-name"></Includes>
                      <Includes rootClassName="includesroot-class-name"></Includes>
                      <Includes rootClassName="includesroot-class-name"></Includes>
                      <Includes rootClassName="includesroot-class-name"></Includes>
                      <Includes rootClassName="includesroot-class-name"></Includes>
                      <Excludes rootClassName="excludesroot-class-name"></Excludes>
                      <Excludes rootClassName="excludesroot-class-name"></Excludes>
                      <Excludes rootClassName="excludesroot-class-name"></Excludes>
                    </div>
                  </div>
                </div>
              </div>
              <div className="home-plan3">
                <div className="home-details3">
                  <div className="home-header19">
                    <label className="home-name3">Enterprise</label>
                    <div className="home-pricing4">
                      <span className="home-price3">$99</span>
                      <span className="home-duration3">/mo</span>
                    </div>
                  </div>
                  <p className="home-description4">
                    Good for sed quia consequuntur magni dolores eos qui
                    ratione.
                  </p>
                </div>
                <div className="home-buy-details3">
                  <div className="home-buy3 button">
                    <span className="home-text42">
                      <span>Start Enterprise</span>
                      <br></br>
                    </span>
                  </div>
                  <div className="home-features4">
                    <span className="home-heading23">You will get</span>
                    <div className="home-list3">
                      <Includes rootClassName="includesroot-class-name"></Includes>
                      <Includes rootClassName="includesroot-class-name"></Includes>
                      <Includes rootClassName="includesroot-class-name"></Includes>
                      <Includes rootClassName="includesroot-class-name"></Includes>
                      <Includes rootClassName="includesroot-class-name"></Includes>
                      <Includes rootClassName="includesroot-class-name"></Includes>
                      <Includes rootClassName="includesroot-class-name"></Includes>
                      <Includes rootClassName="includesroot-class-name"></Includes>
                      <Includes rootClassName="includesroot-class-name"></Includes>
                      <Includes rootClassName="includesroot-class-name"></Includes>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </main>
        <div className="home-help">
          <span className="home-text45">
            <span>Need any help?</span>
            <br></br>
          </span>
          <div className="home-contact-support">
            <p className="home-text48">Contact support -&gt;</p>
          </div>
        </div>
      </section>
      <section className="home-section22">
        <header className="home-header20">
          <header className="home-left5">
            <span className="section-head">Tempor incididunt</span>
            <h2 className="home-heading24 section-heading">
              What users say about us
            </h2>
          </header>
          <div className="home-right3">
            <p className="home-paragraph6 section-description">
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem
              accusantium doloremque laudantium, totam rem aperiam.
            </p>
          </div>
        </header>
        <main className="home-cards2">
          <div className="home-container2">
            <Review rootClassName="reviewroot-class-name"></Review>
            <Review
              quote="“Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.\u2028\u2028Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.”"
              rootClassName="reviewroot-class-name"
            ></Review>
          </div>
          <div className="home-container3">
            <Review
              quote="“Illum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.”"
              rootClassName="reviewroot-class-name"
            ></Review>
            <Review
              quote="“Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.”"
              rootClassName="reviewroot-class-name"
            ></Review>
          </div>
          <div className="home-container4">
            <Review
              quote="“Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae.”"
              rootClassName="reviewroot-class-name"
            ></Review>
            <Review
              quote="“Doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae.”"
              rootClassName="reviewroot-class-name"
            ></Review>
          </div>
        </main>
        <div className="home-view-more">
          <p className="home-text49">View more</p>
        </div>
      </section>
      <section className="home-section24">
        <header className="home-header21">
          <span className="section-head">Articles about us</span>
          <h2 className="home-heading25 section-heading">
            We’re the app on everyone’s lips
          </h2>
        </header>
        <main className="home-cards3">
          <Article rootClassName="articleroot-class-name"></Article>
          <Article
            header="techeu"
            specialHeader="eu"
            rootClassName="articleroot-class-name"
          ></Article>
          <Article
            header="sifted/"
            rootClassName="articleroot-class-name"
          ></Article>
        </main>
      </section>
      <section className="home-section26">
        <header className="home-header22">
          <span className="section-head">FAQ</span>
          <h2 className="home-heading26 section-heading">
            Frequently asked questions
          </h2>
        </header>
        <main className="home-accordion">
          <FAQ rootClassName="fa-qroot-class-name"></FAQ>
        </main>
      </section>
      <section className="home-section28">
        <main className="home-content6">
          <header className="home-header23">
            <h2 className="home-heading27 section-heading">
              Stop searching online for medications and use Planical app!
            </h2>
            <div className="home-buttons3">
              <div className="home-ios button">
                <img
                  alt="image"
                  src="/Icons/apple.png"
                  className="home-icon1"
                />
                <span className="home-text50">Download for iOS</span>
              </div>
              <div className="home-android button">
                <img
                  alt="image"
                  src="/Icons/android.png"
                  className="home-icon2"
                />
                <span className="home-text51">Download for Android</span>
              </div>
            </div>
          </header>
          <img
            alt="image"
            src="/SectionImages/group 1505.png"
            className="home-image25"
          />
        </main>
      </section>
      <footer className="home-footer">
        <div className="home-content7">
          <main className="home-main-content">
            <div className="home-content8">
              <header className="home-main5">
                <div className="home-header24">
                  <img
                    alt="image"
                    src="/Branding/planical7012-ttpb.svg"
                    className="home-branding"
                  />
                  <span className="home-text52">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </span>
                </div>
                <div className="home-socials">
                  <a
                    href="https://example.com"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="home-link1"
                  >
                    <img
                      alt="image"
                      src="/Icons/linkedin.png"
                      className="social"
                    />
                  </a>
                  <a
                    href="https://example.com"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="home-link2"
                  >
                    <img
                      alt="image"
                      src="/Icons/instagram.png"
                      className="social"
                    />
                  </a>
                  <a
                    href="https://example.com"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="home-link3"
                  >
                    <img
                      alt="image"
                      src="/Icons/twitter.png"
                      className="social"
                    />
                  </a>
                </div>
              </header>
              <header className="home-categories">
                <div className="home-category1">
                  <div className="home-header25">
                    <span className="footer-header">Solutions</span>
                  </div>
                  <div className="home-links1">
                    <span className="footer-link">Responsive Web Design</span>
                    <span className="footer-link">Responsive Prototypes</span>
                    <span className="footer-link">Design to Code</span>
                    <span className="footer-link">Static Website Builder</span>
                    <span className="footer-link">
                      Static Website Generator
                    </span>
                  </div>
                </div>
                <div className="home-category2">
                  <div className="home-header26">
                    <span className="footer-header">Company</span>
                  </div>
                  <div className="home-links2">
                    <span className="footer-link">About</span>
                    <span className="footer-link">Team</span>
                    <span className="footer-link">News</span>
                    <span className="footer-link">Partners</span>
                    <span className="footer-link">Careers</span>
                    <span className="footer-link">Press &amp; Media</span>
                  </div>
                </div>
              </header>
            </div>
            <section className="home-copyright1">
              <span className="home-text66">
                © 2022 latitude. All Rights Reserved.
              </span>
            </section>
          </main>
          <main className="home-subscribe">
            <main className="home-main6">
              <h1 className="home-heading28">Subscribe to our newsletter</h1>
              <div className="home-input-field">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="home-textinput input"
                />
                <div className="home-buy4 button">
                  <span className="home-text67">-&gt;</span>
                  <span className="home-text68">
                    <span>Subscribe now</span>
                    <br></br>
                  </span>
                </div>
              </div>
            </main>
            <h1 className="home-notice">
              By subscribing to our newsletter you agree with our Terms and
              Conditions.
            </h1>
          </main>
          <section className="home-copyright2">
            <span className="home-text71">
              © 2022 latitude. All Rights Reserved.
            </span>
          </section>
        </div>
      </footer>
      <div>
        <div className="home-container6">
          <Script
            html={`<script>
    /*
Accordion - Code Embed
*/

/* listenForUrlChangesAccordion() makes sure that if you changes pages inside your app,
the Accordions will still work*/

const listenForUrlChangesAccordion = () => {
      let url = location.href;
      document.body.addEventListener(
        "click",
        () => {
          requestAnimationFrame(() => {
            if (url !== location.href) {
              runAccordionCodeEmbed();
              url = location.href;
            }
          });
        },
        true
      );
    };


const runAccordionCodeEmbed = () => {
    const accordionContainers = document.querySelectorAll('[data-role="accordion-container"]'); // All accordion containers
    const accordionContents = document.querySelectorAll('[data-role="accordion-content"]'); // All accordion content
    const accordionIcons = document.querySelectorAll('[data-role="accordion-icon"]'); // All accordion icons

    accordionContents.forEach((accordionContent) => {
        accordionContent.style.display = "none"; //Hides all accordion contents
    });

    accordionContainers.forEach((accordionContainer, index) => {
        accordionContainer.addEventListener("click", () => {
            accordionContents.forEach((accordionContent) => {
            accordionContent.style.display = "none"; //Hides all accordion contents
            });

            accordionIcons.forEach((accordionIcon) => {
                accordionIcon.style.transform = "rotate(0deg)"; // Resets all icon transforms to 0deg (default)
            });

            accordionContents[index].style.display = "flex"; // Shows accordion content
            accordionIcons[index].style.transform = "rotate(180deg)"; // Rotates accordion icon 180deg
        });
    });
}

runAccordionCodeEmbed()
listenForUrlChangesAccordion()

/*
Here's what the above is doing:
    1. Selects all accordion containers, contents, and icons
    2. Hides all accordion contents
    3. Adds an event listener to each accordion container
    4. When an accordion container is clicked, it:
        - Hides all accordion contents
        - Resets all icon transforms to 0deg (default)
        - Checks if this container has class "accordion-open"
            - If it does, it removes class "accordion-open"
            - If it doesn't, it:
                - Removes class "accordion-open" from all containers
                - Adds class "accordion-open" to this container
                - Shows accordion content
                - Rotates accordion icon 180deg
*/
</script>`}
          ></Script>
        </div>
      </div>
    </div>
  )
}

export default Home
