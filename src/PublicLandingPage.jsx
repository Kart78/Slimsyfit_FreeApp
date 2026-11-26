import { useEffect, useState } from "react";
import { ChevronRight, Download } from "lucide-react";

const asset = (path) => "/assets/slimsyfit" + path;
const FEATURE_IMAGES = {
  nutrition: asset("/images/nutrition/front-plan-bowl.png"),
  hydration: asset("/images/icons/water-drop.png?v=20261002-real4"),
  activity: asset("/images/activity/move-today.png"),
  weight: asset("/images/wellness/weight-bmi-bmr.png?v=20261002-plain-monitor"),
  coach: asset("/images/coach/coach-ava.png"),
};

export default function PublicLandingPage({ onNew, onSignIn }) {
  const [showUpdate, setShowUpdate] = useState(() => {
    try {
      return localStorage.getItem("slimsyfit_public_seen_v1_1") !== "1";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    document.body.classList.add("public-landing");
    return () => document.body.classList.remove("public-landing");
  }, []);

  const openPlay = () => {
    onNew();
  };

  const dismissUpdate = () => {
    try {
      localStorage.setItem("slimsyfit_public_seen_v1_1", "1");
    } catch {}
    setShowUpdate(false);
  };

  const features = [
    {
      image: FEATURE_IMAGES.nutrition,
      title: "Nutrition",
      text: "Log meals, calories, and macros with a clear daily nutrition view.",
      tint: "#EAF9F2",
    },
    {
      image: FEATURE_IMAGES.hydration,
      title: "Hydration",
      text: "Track daily water intake and stay consistent with your hydration goal.",
      tint: "#EAF4FF",
    },
    {
      image: FEATURE_IMAGES.activity,
      title: "Activity",
      text: "Record daily movement and build a repeatable activity habit.",
      tint: "#FFF3E7",
    },
    {
      image: FEATURE_IMAGES.weight,
      title: "Weight & Progress",
      text: "Track weight trends while keeping BMI and BMR as supporting health metrics.",
      tint: "#F2EEFF",
    },
  ];

  return (
    <div className="public-home">
      <header className="public-nav">
        <div className="public-nav-inner">
          <a className="public-brand" href="/" aria-label="SlimSyFit home">
            <img src={asset("/logo.png")} alt="SlimSyFit" />
            <span>SlimSyFit</span>
          </a>
          <nav aria-label="Public navigation">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#how-it-works">About</a>
            <button type="button" className="public-nav-signin" onClick={onSignIn}>Sign in</button>
            <a className="public-nav-cta" href="#how-it-works" onClick={e=>{e.preventDefault();onNew()}}>Start free</a>
          </nav>
        </div>
      </header>

      <main>
        {showUpdate && (
          <section className="public-release-strip" aria-label="SlimSyFit v1.1 update">
            <div className="public-release-copy">
              <span>NEW</span>
              <strong>SlimSyFit FreeApp is here</strong>
              <p>Manual nutrition, hydration insights, activity progress, sleep and clearer weight tracking — all free.</p>
            </div>
            <div className="public-release-images" aria-hidden="true">
              <img src={FEATURE_IMAGES.nutrition} alt="" />
              <img src={FEATURE_IMAGES.hydration} alt="" />
              <img src={FEATURE_IMAGES.activity} alt="" />
              <img src={FEATURE_IMAGES.weight} alt="" />
              <img src={FEATURE_IMAGES.coach} alt="" />
            </div>
            <button type="button" className="public-release-dismiss" onClick={dismissUpdate} aria-label="Dismiss update">×</button>
          </section>
        )}

        <section className="public-hero">
          <div className="public-hero-copy">
            <div className="public-eyebrow">Your Journey. Your Way.</div>
            <h1>Build a Healthier You, Your Way</h1>
            <p>Personalized daily tracking for nutrition, activity, hydration, progress, and healthier everyday habits — free, with no AI.</p>
            <div className="public-hero-actions">
              <a className="public-play-cta" href="#start-free" onClick={e=>{e.preventDefault();onNew()}}>
                <Download size={20} /> Start free
              </a>
              <button type="button" className="public-secondary-cta" onClick={onNew}>Build my plan</button>
            </div>
            <div className="public-benefit-line">
              <span>Nutrition</span><span>Hydration</span><span>Activity</span><span>Weight & Progress</span>
            </div>
          </div>

          <div className="public-hero-visual" aria-label="SlimSyFit FreeApp preview">
            <div className="public-phone">
              <div className="public-phone-top">SlimSyFit</div>
              <div className="public-phone-card accent">
                <div>
                  <small>Your personal plan</small>
                  <strong>Nutrition, activity and habits tailored to you</strong>
                </div>
                <ChevronRight size={20} />
              </div>

              <div className="public-metric-grid">
                <div>
                  <img className="public-metric-image nutrition" src={FEATURE_IMAGES.nutrition} alt="" />
                  <b>Nutrition</b><span>2/4 meals</span>
                </div>
                <div>
                  <img className="public-metric-image hydration" src={FEATURE_IMAGES.hydration} alt="" />
                  <b>Hydration</b><span>6/8 cups</span>
                </div>
                <div>
                  <img className="public-metric-image activity" src={FEATURE_IMAGES.activity} alt="" />
                  <b>Activity</b><span>20/30 min</span>
                </div>
                <div>
                  <img className="public-metric-image weight" src={FEATURE_IMAGES.weight} alt="" />
                  <b>Weight & Progress</b><span>178 lbs · BMI 24.8</span>
                </div>
              </div>

              <div className="public-progress-card">
                <span>Today’s focus</span>
                <strong>Make healthy choices one step at a time</strong>
                <div><i style={{width:"72%"}} /></div>
              </div>
            </div>
          </div>
        </section>

        <section className="public-section" id="features">
          <div className="public-section-head">
            <span>Why SlimSyFit</span>
            <h2>Your daily wellness dashboard, built around actions that matter</h2>
          </div>

          <div className="public-feature-grid">
            {features.map((f) => (
              <article key={f.title} className="public-feature-card">
                <div className="public-feature-image" style={{ background:f.tint }}>
                  <img src={f.image} alt="" aria-hidden="true" loading="lazy" decoding="async" />
                </div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="public-story-grid">
          <article>
            <div className="public-story-copy">
              <span>Personalized Guidance</span>
              <h2>A plan built around your goals</h2>
              <p>Set your goals, preferences, and routine. SlimSyFit turns that context into practical nutrition, activity, and wellness guidance.</p>
            </div>
            <div className="public-story-visual visual-one">
              <div className="mini-phone">
                <b>Your Personal Plan</b>
                <div>Balanced meals</div><div>Hydration goal</div><div>Daily movement</div><div>Mindset focus</div>
              </div>
            </div>
          </article>

          <article>
            <div className="public-story-visual visual-two">
              <div className="chat-card">
                <img className="public-coach-avatar" src={FEATURE_IMAGES.coach} alt="" loading="lazy" decoding="async" />
                <b>Daily Coach Tips</b>
                <p>Keep building your healthy habits!</p>
                <span>Meal guidance</span><span>Activity ideas</span><span>Motivation</span>
              </div>
            </div>
            <div className="public-story-copy">
              <span>Wellness Habits</span>
              <h2>Guidance when you need it</h2>
              <p>Use your personal goals and check-ins to build consistent daily wellness routines without AI.</p>
            </div>
          </article>

          <article>
            <div className="public-story-copy">
              <span>Healthy Habits</span>
              <h2>Small steps. Meaningful progress.</h2>
              <p>Track what matters, stay consistent, and build routines you can keep using long after the first week.</p>
            </div>
            <div className="public-story-visual visual-three">
              <div className="habit-card"><b>Today</b><span>Nutrition ✓</span><span>Hydration ✓</span><span>Activity 20/30 min</span><span>Progress 72%</span></div>
            </div>
          </article>
        </section>

        <section className="public-how" id="how-it-works">
          <div className="public-section-head">
            <span>How it works</span>
            <h2>Three steps to start building healthier habits</h2>
          </div>
          <div className="public-steps">
            <div><em>1</em><h3>Tell us your goals</h3><p>Choose the goals and preferences that matter to you.</p></div>
            <div><em>2</em><h3>View your free plan</h3><p>See a clear, non-AI habit plan based on your survey answers.</p></div>
            <div><em>3</em><h3>Track and stay consistent</h3><p>Follow your progress and keep healthy habits moving forward.</p></div>
          </div>
          <a className="public-play-cta center" href="#start-free" onClick={e=>{e.preventDefault();onNew()}}>
            <Download size={20} /> Start SlimSyFit FreeApp
          </a>
        </section>

        <section className="public-final-cta">
          <h2>Your Journey. Your Way.</h2>
          <p>Start building healthier habits today with personalized, manual wellness tracking.</p>
          <a className="public-play-cta" href="#start-free" onClick={e=>{e.preventDefault();onNew()}}>
            <Download size={20} /> Start free
          </a>
        </section>
      </main>

      <footer className="public-footer">
        <span>© SlimSyFit FreeApp</span>
        <div><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a><a href="/delete-account.html">Delete account</a><a href="/about">About</a></div>
      </footer>

      <div className="public-mobile-sticky">
        <span><b>SlimSyFit</b><small>Healthy habits, made personal</small></span>
        <button type="button" onClick={openPlay}>Start free</button>
      </div>
    </div>
  );
}

