html,
body,
#root {
  margin: 0;
  min-height: 100%;
  background: #0b0b0b;
  color: #fff;
}

* {
  box-sizing: border-box;
}

/* ===== LOGIN PAGE ===== */

.login-page {
  min-height: 100vh;
  position: relative;
  font-family: "Inter", sans-serif;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 40%, #1a1a1a 0%, #111 38%, #000 100%),
    linear-gradient(to bottom, rgba(255,255,255,0.03), transparent),
    radial-gradient(circle at 80% 20%, rgba(255,255,255,0.025), transparent);
}

.login-bg::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(255,255,255,0.025), transparent 58%);
}

.login-container {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(520px, 700px) minmax(320px, 380px);
  align-items: center;
  justify-content: center;
  column-gap: 72px;
  padding: 80px 56px;
}

.login-left {
  max-width: 700px;
}

.tag {
  font-size: 11px;
  letter-spacing: 0.34em;
  color: #7f7f7f;
  margin-bottom: 18px;
}

.title {
  font-size: 72px;
  line-height: 0.96;
  font-weight: 200;
  margin: 0 0 30px 0;
  letter-spacing: -0.04em;
}

.title span {
  font-weight: 800;
  font-style: italic;
}

.desc {
  color: #a7a7a7;
  max-width: 390px;
  font-size: 17px;
  line-height: 1.65;
}

.login-right {
  width: 100%;
  max-width: 380px;
  justify-self: start;
}

.small {
  font-size: 10px;
  letter-spacing: 0.3em;
  color: #727272;
  margin: 0 0 18px 0;
}

.input-line {
  display: flex;
  align-items: center;
  gap: 14px;
  border-bottom: 1px solid rgba(255,255,255,0.16);
  padding: 10px 0 12px;
  margin-bottom: 26px;
}

.input-line span {
  font-size: 18px;
  color: #b8b8b8;
  white-space: nowrap;
}

.input-line input {
  background: none;
  border: none;
  outline: none;
  color: white;
  font-size: 18px;
  width: 100%;
  letter-spacing: 0.08em;
  padding: 0;
}

.input-line input::placeholder {
  color: rgba(255,255,255,0.25);
}

.btn {
  width: 100%;
  height: 64px;
  background: #f3f3f3;
  color: #111;
  border: none;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.28em;
  cursor: pointer;
  transition: 0.2s;
}

.btn:hover {
  opacity: 0.92;
}

.error {
  color: #ff6b6b;
  margin: -8px 0 14px 0;
  font-size: 14px;
}

/* ===== GENERIC ===== */

.header {
  padding: 18px 40px;
  display: flex;
  justify-content: space-between;
}

.container {
  padding: 40px;
}

/* ===== LOGIN RESPONSIVE ===== */

@media (max-width: 1100px) {
  .login-container {
    grid-template-columns: 1fr;
    row-gap: 48px;
    max-width: 760px;
    padding: 72px 32px;
  }

  .login-right {
    max-width: 420px;
  }

  .title {
    font-size: 56px;
  }
}

@media (max-width: 640px) {
  .login-container {
    padding: 48px 20px;
  }

  .title {
    font-size: 42px;
  }

  .desc {
    font-size: 15px;
  }

  .btn {
    height: 58px;
    font-size: 12px;
  }
}

/* ===== HOME PAGE ===== */

.home-page {
  min-height: 100vh;
  position: relative;
  background: #131313;
  color: #f5f5f5;
  overflow-x: hidden;
  font-family: "Inter", sans-serif;
}

.home-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(255,255,255,0.05), transparent 30%),
    radial-gradient(circle at 70% 35%, rgba(255,255,255,0.04), transparent 32%),
    linear-gradient(to bottom, #131313, #111111 40%, #131313 100%);
  pointer-events: none;
}

.home-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28px 56px;
  background: rgba(14, 14, 14, 0.72);
  backdrop-filter: blur(16px);
}

.home-logo {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0.22em;
}

.home-nav-links {
  display: flex;
  align-items: center;
  gap: 36px;
}

.home-nav-links a {
  color: rgba(255,255,255,0.45);
  text-decoration: none;
  text-transform: uppercase;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  transition: 0.2s ease;
}

.home-nav-links a:hover,
.home-nav-links a.active {
  color: #ffffff;
}

.home-account-btn {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.14);
  color: #fff;
  padding: 10px 16px;
  cursor: pointer;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.14em;
}

.home-main {
  position: relative;
  z-index: 2;
  padding: 56px;
}

.home-hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 40px;
  margin-bottom: 72px;
}

.home-hero-left {
  max-width: 820px;
}

.verified-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: rgba(255,255,255,0.58);
}

.verified-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #fff;
}

.home-title {
  margin: 0;
  font-size: 78px;
  line-height: 0.92;
  font-weight: 800;
  letter-spacing: -0.05em;
  text-transform: uppercase;
}

.summary-card {
  width: 320px;
  background: #1b1b1b;
  padding: 28px;
  flex-shrink: 0;
}

.summary-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-label {
  margin: 0;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: rgba(255,255,255,0.4);
}

.summary-value {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: -0.02em;
}

.summary-divider {
  height: 1px;
  background: rgba(255,255,255,0.1);
  margin: 18px 0;
}

.entry-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
  margin-bottom: 96px;
}

.entry-card {
  position: relative;
  min-height: 420px;
  background: #1b1b1b;
  padding: 34px;
  text-decoration: none;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: background 0.25s ease, transform 0.25s ease;
}

.entry-card:hover {
  background: #252525;
  transform: translateY(-2px);
}

.entry-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.entry-icon {
  font-size: 28px;
  opacity: 0.9;
}

.entry-number {
  font-size: 11px;
  letter-spacing: 0.16em;
  color: rgba(255,255,255,0.4);
}

.entry-bottom h2 {
  margin: 0 0 14px;
  font-size: 34px;
  line-height: 0.95;
  text-transform: uppercase;
  letter-spacing: -0.03em;
}

.entry-bottom p {
  margin: 0;
  max-width: 230px;
  font-size: 15px;
  line-height: 1.65;
  color: rgba(255,255,255,0.62);
}

.entry-line {
  width: 100%;
  height: 1px;
  background: rgba(255,255,255,0.2);
  margin-top: 28px;
}

.home-feature {
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: 0;
  align-items: center;
  margin-bottom: 40px;
}

.feature-image {
  min-height: 460px;
  background:
    linear-gradient(to right, rgba(19,19,19,0.2), rgba(19,19,19,0.7)),
    radial-gradient(circle at 40% 40%, rgba(255,255,255,0.09), transparent 30%),
    #1a1a1a;
}

.feature-content {
  margin-left: -54px;
  background: transparent;
  position: relative;
  z-index: 2;
}

.feature-content h3 {
  margin: 0 0 20px;
  font-size: 64px;
  line-height: 0.95;
  text-transform: uppercase;
  letter-spacing: -0.05em;
}

.feature-content p {
  margin: 0 0 28px;
  max-width: 470px;
  font-size: 18px;
  line-height: 1.7;
  color: rgba(255,255,255,0.66);
}

.feature-btn {
  background: #fff;
  color: #111;
  border: none;
  padding: 16px 26px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  cursor: pointer;
}

@media (max-width: 1100px) {
  .home-hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .entry-grid {
    grid-template-columns: 1fr;
  }

  .home-feature {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .feature-content {
    margin-left: 0;
  }

  .home-title {
    font-size: 56px;
  }
}

@media (max-width: 768px) {
  .home-nav,
  .home-main {
    padding-left: 20px;
    padding-right: 20px;
  }

  .home-nav {
    flex-wrap: wrap;
    gap: 16px;
  }

  .home-nav-links {
    width: 100%;
    gap: 18px;
    flex-wrap: wrap;
  }

  .home-title {
    font-size: 42px;
  }

  .summary-card {
    width: 100%;
  }

  .entry-card {
    min-height: 320px;
  }

  .feature-content h3 {
    font-size: 42px;
  }

  .feature-content p {
    font-size: 16px;
  }
}

/* ===== PROFILE PAGE ===== */

.profile-page {
  min-height: 100vh;
  position: relative;
  background: #131313;
  color: #f2f2f2;
  overflow-x: hidden;
  font-family: "Inter", sans-serif;
}

.profile-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 10%, rgba(255,255,255,0.04), transparent 22%),
    linear-gradient(to bottom, rgba(255,255,255,0.02), transparent 20%),
    #131313;
  pointer-events: none;
}

.profile-nav {
  position: sticky;
  top: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 26px 36px;
  background: rgba(14, 14, 14, 0.72);
  backdrop-filter: blur(16px);
}

.profile-logo {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: #fff;
}

.profile-nav-links {
  display: flex;
  align-items: center;
  gap: 36px;
}

.profile-nav-links a {
  color: rgba(255,255,255,0.48);
  text-decoration: none;
  text-transform: uppercase;
  font-size: 14px;
  font-weight: 700;
  transition: 0.2s ease;
}

.profile-nav-links a:hover,
.profile-nav-links a.active {
  color: #fff;
  border-bottom: 1px solid #fff;
  padding-bottom: 4px;
}

.profile-account-btn {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.14);
  color: #fff;
  padding: 10px 16px;
  cursor: pointer;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.14em;
}

.profile-main {
  position: relative;
  z-index: 2;
  padding: 34px 36px 80px;
}

.profile-hero {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 24px;
  margin-bottom: 42px;
}

.profile-eyebrow {
  margin: 0 0 18px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.4em;
  color: rgba(255,255,255,0.42);
}

.profile-name {
  margin: 0;
  font-size: 64px;
  line-height: 0.95;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: -0.05em;
  color: #fff;
}

.profile-owner-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}

.profile-owner-line {
  width: 38px;
  height: 1px;
  background: #fff;
  display: inline-block;
}

.profile-owner-row p {
  margin: 0;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: rgba(255,255,255,0.58);
}

.profile-hero-right {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
}

.profile-mini-label {
  margin: 0 0 6px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.28em;
  color: rgba(255,255,255,0.4);
}

.profile-membership-id {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #fff;
}

.profile-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(280px, 0.95fr);
  gap: 32px;
  align-items: stretch;
}

.vehicle-card {
  position: relative;
  min-height: 450px;
  background:
    linear-gradient(to bottom, rgba(0,0,0,0.14), rgba(0,0,0,0.5)),
    radial-gradient(circle at 60% 35%, rgba(255,255,255,0.12), transparent 26%),
    linear-gradient(135deg, #1b1b1b 0%, #101010 100%);
  border: 1px solid rgba(255,255,255,0.06);
  padding: 34px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.vehicle-card-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05), transparent 30%),
    linear-gradient(to bottom right, transparent 40%, rgba(255,255,255,0.03));
  pointer-events: none;
}

.vehicle-top,
.vehicle-bottom {
  position: relative;
  z-index: 2;
}

.vehicle-top h2 {
  margin: 0 0 8px;
  font-size: 28px;
  text-transform: uppercase;
  letter-spacing: -0.03em;
}

.vehicle-top p {
  margin: 0;
  color: rgba(255,255,255,0.58);
  font-size: 16px;
}

.vehicle-bottom h3 {
  margin: 0 0 18px;
  font-size: 60px;
  line-height: 0.95;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: -0.05em;
}

.vehicle-meta-row {
  display: flex;
  align-items: flex-end;
  gap: 26px;
  flex-wrap: wrap;
}

.vehicle-meta-label {
  display: block;
  margin-bottom: 6px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.24em;
  color: rgba(255,255,255,0.42);
}

.vehicle-meta-row strong {
  font-size: 26px;
  letter-spacing: 0.08em;
}

.vehicle-outline-btn {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.2);
  color: #fff;
  padding: 12px 22px;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.22em;
  cursor: pointer;
  transition: 0.2s ease;
}

.vehicle-outline-btn:hover {
  background: #fff;
  color: #111;
}

.profile-side {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.contact-card {
  background: #1a1a1a;
  border: 1px solid rgba(255,255,255,0.05);
  padding: 34px;
  min-height: 220px;
}

.contact-icon {
  font-size: 24px;
  margin-bottom: 28px;
  color: rgba(255,255,255,0.72);
}

.contact-block + .contact-block {
  margin-top: 30px;
}

.contact-value {
  margin: 0;
  font-size: 32px;
  font-weight: 300;
  letter-spacing: -0.03em;
}

.contact-email {
  margin: 0;
  font-size: 22px;
  font-weight: 300;
  line-height: 1.4;
}

.membership-card {
  background: #f1f1f1;
  color: #111;
  padding: 34px;
  min-height: 210px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.membership-top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.membership-badge {
  font-size: 18px;
}

.membership-legacy {
  font-size: 24px;
  font-style: italic;
  font-weight: 800;
}

.membership-card h4 {
  margin: 18px 0 0;
  font-size: 46px;
  line-height: 0.9;
  text-transform: uppercase;
  letter-spacing: -0.04em;
}

.membership-bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 18px;
}

.membership-bottom-row p {
  margin: 0;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

.membership-bottom-row span {
  font-size: 24px;
}

.profile-info-grid {
  margin-top: 44px;
  padding-top: 34px;
  border-top: 1px solid rgba(255,255,255,0.08);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 36px;
}

.info-column h5 {
  margin: 0 0 18px;
  font-size: 12px;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.22em;
}

.info-column ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.info-column li {
  color: rgba(255,255,255,0.64);
  font-size: 16px;
  line-height: 2;
}

.profile-concierge-cta {
  margin-top: 60px;
  padding-top: 44px;
  border-top: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}

.profile-concierge-copy h3 {
  margin: 0 0 12px;
  font-size: 42px;
  text-transform: uppercase;
  letter-spacing: -0.04em;
}

.profile-concierge-copy p {
  margin: 0;
  max-width: 620px;
  font-size: 18px;
  line-height: 1.7;
  color: rgba(255,255,255,0.62);
}

.profile-cta-btn {
  background: #f1f1f1;
  color: #111;
  text-decoration: none;
  padding: 18px 26px;
  min-width: 250px;
  text-align: center;
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

.profile-footer {
  padding: 70px 36px 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-footer-logo {
  font-size: 18px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.24em;
}

.profile-footer-links {
  display: flex;
  gap: 28px;
  flex-wrap: wrap;
}

.profile-footer-links a {
  color: rgba(255,255,255,0.45);
  text-decoration: none;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

.profile-footer-copy {
  color: rgba(255,255,255,0.35);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

@media (max-width: 1100px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }

  .profile-info-grid {
    grid-template-columns: 1fr;
  }

  .profile-concierge-cta {
    flex-direction: column;
    align-items: flex-start;
  }

  .profile-name {
    font-size: 48px;
  }

  .vehicle-bottom h3 {
    font-size: 44px;
  }
}

@media (max-width: 820px) {
  .profile-nav {
    padding: 20px;
    flex-wrap: wrap;
    gap: 16px;
  }

  .profile-nav-links {
    gap: 18px;
    flex-wrap: wrap;
  }

  .profile-main {
    padding: 22px 20px 60px;
  }

  .profile-hero {
    grid-template-columns: 1fr;
  }

  .profile-hero-right {
    align-items: flex-start;
  }

  .profile-name {
    font-size: 40px;
  }

  .vehicle-card {
    min-height: 360px;
    padding: 24px;
  }

  .vehicle-bottom h3 {
    font-size: 36px;
  }

  .contact-value {
    font-size: 26px;
  }

  .contact-email {
    font-size: 18px;
  }

  .membership-card h4 {
    font-size: 34px;
  }

  .profile-concierge-copy h3 {
    font-size: 32px;
  }

  .profile-concierge-copy p {
    font-size: 16px;
  }
}
