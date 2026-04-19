// ═══════════════════════════════════════════════
// header.js — Asociația Dokimasia
// Header comun, autentificare, modal login
// ═══════════════════════════════════════════════

const SUPABASE_URL = 'https://jaoxhsyplnkanhqevnnr.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imphb3hoc3lwbG5rYW5ocWV2bm5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MDQ0NTYsImV4cCI6MjA5MTk4MDQ1Nn0.usQM75JBijLwJqPNHifvGFogjQhzH0jJbWnqJGCL1iw'
const ADMIN_EMAIL = 'm.ciprian1387@gmail.com'
const EMAILJS_PUBLIC_KEY = 'cPvtBWK6KReX_pqhM'
const EMAILJS_SERVICE = 'service_4a8gp1c'
const EMAILJS_TEMPLATE = 'template_wg7nlez'
const PAYPAL_BUTTON_ID = 'N4UH5HAY9C7LJ'

// Injectează CSS header
;(function injectCSS() {
  const style = document.createElement('style')
  style.textContent = `
    /* ─── HEADER ─── */
    header { border-bottom: 1px solid #e0e0e0; box-shadow: 0 2px 6px rgba(0,0,0,0.07); background:#fff; }
    .header-top { display: grid; grid-template-columns: auto 1fr auto; align-items: center; padding: 12px 40px; gap: 16px; }
    .header-logo img { height: 80px; width: auto; display: block; }
    .header-center { text-align: center; }
    .header-title { display: block; font-size: clamp(1rem, 3vw, 2rem); font-weight: bold; color: #8B0000; text-transform: uppercase; letter-spacing: 3px; white-space: nowrap; }
    .header-motto { display: block; font-size: clamp(0.65rem, 1.5vw, 0.95rem); color: #8B0000; font-weight: normal; letter-spacing: 2px; margin-top: 4px; white-space: nowrap; }
    .header-right { display: flex; align-items: center; gap: 12px; justify-content: flex-end; }
    .social-icons { display: flex; align-items: center; gap: 10px; }
    .social-icons a { display: flex; align-items: center; transition: opacity 0.2s; cursor: pointer; }
    .social-icons a:hover { opacity: 0.7; }
    .social-icons svg { width: 26px; height: 26px; }
    .btn-account { display: flex; align-items: center; gap: 6px; background: #8B0000; color: #fff; padding: 8px 16px; border-radius: 6px; font-size: 0.85rem; font-family: 'Georgia', serif; cursor: pointer; border: none; transition: background 0.2s; white-space: nowrap; }
    .btn-account:hover { background: #6a0000; }
    .account-wrapper { position: relative; }
    .account-dropdown { display: none; position: absolute; top: 110%; right: 0; background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.12); min-width: 180px; z-index: 200; padding: 8px 0; }
    .account-dropdown.open { display: block; }
    .account-dropdown a { display: block; padding: 10px 20px; font-size: 0.9rem; color: #333; transition: background 0.15s; }
    .account-dropdown a:hover { background: #f5f5f5; color: #8B0000; }
    nav.main-nav { background: #8B0000; display: flex; width: 100%; }
    nav.main-nav a { flex: 1; color: #fff; font-size: 0.95rem; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; text-align: center; padding: 13px 0; transition: background 0.2s; border-right: 1px solid rgba(255,255,255,0.4); text-decoration:none; }
    nav.main-nav a:last-child { border-right: none; }
    nav.main-nav a:hover, nav.main-nav a.active { background: rgba(255,255,255,0.15); }
    .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; background: none; border: none; }
    .hamburger span { display: block; width: 26px; height: 3px; background: #8B0000; border-radius: 2px; }
    .paypal-wrap { display: flex; align-items: center; }
    /* Mobile header */
    .mobile-header { display: none; }
    .mob-account-btn { background: #8B0000; color: #fff; border: none; border-radius: 6px; padding: 8px 12px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: 'Georgia', serif; font-size: 0.8rem; }
    /* Modal */
    .modal-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; }
    .modal-overlay.open { display: flex; }
    .modal { background: #fff; border-radius: 12px; padding: 40px; width: 100%; max-width: 400px; margin: 20px; position: relative; box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
    .modal h2 { color: #8B0000; font-size: 1.5rem; margin-bottom: 24px; text-align: center; font-family: 'Georgia', serif; }
    .modal-close { position: absolute; top: 16px; right: 20px; font-size: 1.5rem; cursor: pointer; color: #999; background: none; border: none; }
    .modal-close:hover { color: #8B0000; }
    .modal-tabs { display: flex; margin-bottom: 24px; border-bottom: 2px solid #e0e0e0; }
    .modal-tab { flex: 1; text-align: center; padding: 10px; cursor: pointer; font-size: 0.95rem; color: #999; border-bottom: 3px solid transparent; margin-bottom: -2px; transition: all 0.2s; font-family: 'Georgia', serif; }
    .modal-tab.active { color: #8B0000; border-bottom-color: #8B0000; font-weight: bold; }
    .modal-msg { text-align: center; font-size: 0.85rem; margin-top: 12px; min-height: 20px; color: #8B0000; }
    .modal .form-group { margin-bottom: 16px; }
    .modal .form-group label { display: block; font-size: 0.85rem; color: #555; margin-bottom: 6px; font-family: 'Georgia', serif; }
    .modal .form-group input { width: 100%; padding: 10px 14px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.95rem; font-family: 'Georgia', serif; outline: none; transition: border 0.2s; }
    .modal .form-group input:focus { border-color: #8B0000; }
    .modal .form-group textarea { width: 100%; padding: 10px 14px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.95rem; font-family: 'Georgia', serif; outline: none; resize: vertical; min-height: 100px; }
    .modal .form-group textarea:focus { border-color: #8B0000; }
    .btn-primary { background: #8B0000; color: #fff; padding: 12px 30px; border-radius: 6px; font-size: 1rem; font-family: 'Georgia', serif; transition: background 0.2s; display: inline-block; border: none; cursor: pointer; width: 100%; margin-top: 8px; }
    .btn-primary:hover { background: #6a0000; }
    /* Contact modal */
    .contact-modal-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; }
    .contact-modal-overlay.open { display: flex; }
    .contact-modal { background: #fff; border-radius: 12px; padding: 40px; width: 100%; max-width: 480px; margin: 20px; position: relative; box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
    .contact-modal h2 { color: #8B0000; font-size: 1.5rem; margin-bottom: 24px; text-align: center; font-family: 'Georgia', serif; }
    /* Footer */
    footer { background: #8B0000; color: #fff; text-align: center; padding: 30px 20px; font-size: 0.85rem; margin-top: auto; }
    footer a { color: #f5c0c0; text-decoration: none; }
    footer a:hover { color: #fff; }
    @media (max-width: 768px) {
      .header-top { display: none !important; }
      nav.main-nav { display: none !important; }
      .mobile-header { display: block; background: #fff; border-bottom: 1px solid #e0e0e0; box-shadow: 0 2px 6px rgba(0,0,0,0.07); }
      .mob-row1 { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; }
      .mob-logo img { height: 50px; width: auto; }
      .mob-row2 { text-align: center; padding: 6px 16px 2px; }
      .mob-title { display: block; font-size: 1.05rem; font-weight: bold; color: #8B0000; text-transform: uppercase; letter-spacing: 2px; }
      .mob-motto { display: block; font-size: 0.68rem; color: #8B0000; letter-spacing: 1px; margin-top: 2px; }
      .mob-row4 { display: flex; justify-content: center; padding: 6px 16px 10px; border-top: 1px solid #f0e0e0; }
      .mob-hamburger { display: flex; flex-direction: column; gap: 5px; cursor: pointer; background: none; border: none; padding: 6px; }
      .mob-hamburger span { display: block; width: 28px; height: 3px; background: #8B0000; border-radius: 2px; }
      .mob-nav { display: none; flex-direction: column; background: #8B0000; }
      .mob-nav.open { display: flex; }
      .mob-nav a { color: #fff; text-align: center; padding: 14px; font-size: 0.9rem; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.2); text-decoration: none; }
      .mob-nav a:last-child { border-bottom: none; }
      .modal { padding: 24px 16px; }
    }
  `
  document.head.appendChild(style)
})()

// Injectează HTML header + modal + footer
;(function injectHTML() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html'

  function navLink(href, label) {
    const active = currentPage === href ? ' class="active"' : ''
    return `<a href="${href}"${active}>${label}</a>`
  }

  const headerHTML = `
<header>
  <div class="header-top">
    <a href="index.html" class="header-logo"><img src="Logo.gif" alt="Asociatia Dokimasia" /></a>
    <a href="index.html" class="header-center">
      <span class="header-title">Asociația Dokimasia</span>
      <span class="header-motto">Învățare. Implicare. Progres.</span>
    </a>
    <div class="header-right">
      <div class="paypal-wrap">
        <form action="https://www.paypal.com/donate" method="post" target="_top" style="display:flex;align-items:center;">
          <input type="hidden" name="hosted_button_id" value="${PAYPAL_BUTTON_ID}" />
          <button type="submit" style="background:#8B0000;color:#fff;border:none;border-radius:6px;padding:8px 18px;font-size:0.88rem;font-family:'Georgia',serif;cursor:pointer;font-weight:bold;letter-spacing:1px;" onmouseover="this.style.background='#6a0000'" onmouseout="this.style.background='#8B0000'">Donează</button>
          <img alt="" border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1" />
        </form>
      </div>
      <div class="social-icons">
        <a onclick="openContactModal()" title="Contact" style="cursor:pointer;">
          <svg viewBox="0 0 24 24" fill="none" stroke="#8B0000" stroke-width="2"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
        </a>
        <a href="https://facebook.com" target="_blank" title="Facebook">
          <svg viewBox="0 0 24 24" fill="#1877F2"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
        </a>
        <a href="https://instagram.com" target="_blank" title="Instagram">
          <svg viewBox="0 0 24 24"><defs><linearGradient id="igH" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#f09433"/><stop offset="50%" stop-color="#dc2743"/><stop offset="100%" stop-color="#bc1888"/></linearGradient></defs>
          <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#igH)"/>
          <circle cx="12" cy="12" r="4" fill="none" stroke="white" stroke-width="2"/>
          <circle cx="17.5" cy="6.5" r="1" fill="white"/></svg>
        </a>
        <a href="https://wa.me/40700000000" target="_blank" title="WhatsApp">
          <svg viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.857L.054 23.61a.75.75 0 00.916.919l5.858-1.516A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.95 9.95 0 01-5.187-1.449l-.362-.216-3.676.952.981-3.565-.236-.376A9.954 9.954 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
        </a>
      </div>
      <div class="account-wrapper">
        <button class="btn-account" onclick="toggleAccount()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span id="accountLabel">Contul meu</span>
        </button>
        <div class="account-dropdown" id="accountDropdown">
          <div id="loggedOut">
            <a href="#" onclick="openModal('login')">Autentificare</a>
            <a href="#" onclick="openModal('register')">Înregistrare</a>
          </div>
          <div id="loggedIn" style="display:none">
            <div id="adminBtn" style="display:none"><a href="admin.html" style="color:#8B0000;font-weight:bold;">⚙ Panou Admin</a></div>
            <a href="cont.html">Profilul meu</a>
            <a href="#" onclick="doLogout()">Deconectare</a>
          </div>
        </div>
      </div>
      <button class="hamburger" onclick="toggleMenu()"><span></span><span></span><span></span></button>
    </div>
  </div>
  <nav class="main-nav" id="mainNav">
    ${navLink('index.html','Acasă')}
    ${navLink('despre.html','Despre noi')}
    ${navLink('proiecte.html','Proiecte')}
    ${navLink('noutati.html','Noutăți')}
    ${navLink('contact.html','Contact')}
  </nav>
</header>

<!-- MOBILE HEADER -->
<div class="mobile-header">
  <div class="mob-row1">
    <a href="index.html" class="mob-logo"><img src="Logo.gif" alt="Asociatia Dokimasia" /></a>
    <div style="display:flex;align-items:center;gap:8px;">
      <form action="https://www.paypal.com/donate" method="post" target="_top" style="display:inline;">
        <input type="hidden" name="hosted_button_id" value="${PAYPAL_BUTTON_ID}" />
        <button type="submit" style="background:#8B0000;color:#fff;border:none;border-radius:6px;padding:8px 12px;font-size:0.8rem;font-family:'Georgia',serif;cursor:pointer;font-weight:bold;">Donează</button>
        <img alt="" border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1" />
      </form>
      <button onclick="openContactModal()" style="background:#8B0000;color:#fff;border:none;border-radius:6px;padding:8px 10px;cursor:pointer;display:flex;align-items:center;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
      </button>
      <div style="position:relative;">
        <button class="mob-account-btn" onclick="toggleMobAccount()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span id="mobAccountLabel">Cont</span>
        </button>
        <div id="mobAccountDropdown" style="display:none;position:absolute;top:110%;right:0;background:#fff;border:1px solid #e0e0e0;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,0.12);min-width:180px;z-index:500;padding:8px 0;">
          <div id="mobLoggedOut">
            <a href="#" onclick="openModal('login');closeMobAccount()" style="display:block;padding:10px 20px;font-size:0.9rem;color:#333;">Autentificare</a>
            <a href="#" onclick="openModal('register');closeMobAccount()" style="display:block;padding:10px 20px;font-size:0.9rem;color:#333;">Înregistrare</a>
          </div>
          <div id="mobLoggedIn" style="display:none;">
            <div id="mobAdminBtn" style="display:none;"><a href="admin.html" style="display:block;padding:10px 20px;font-size:0.9rem;color:#8B0000;font-weight:bold;">⚙ Panou Admin</a></div>
            <a href="cont.html" style="display:block;padding:10px 20px;font-size:0.9rem;color:#333;">Profilul meu</a>
            <a href="#" onclick="doLogout();closeMobAccount()" style="display:block;padding:10px 20px;font-size:0.9rem;color:#333;">Deconectare</a>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="mob-row2">
    <span class="mob-title">Asociația Dokimasia</span>
    <span class="mob-motto">Învățare. Implicare. Progres.</span>
  </div>
  <div class="mob-row4">
    <button class="mob-hamburger" onclick="toggleMobMenu()"><span></span><span></span><span></span></button>
  </div>
  <nav class="mob-nav" id="mobNav">
    ${navLink('index.html','Acasă')}
    ${navLink('despre.html','Despre noi')}
    ${navLink('proiecte.html','Proiecte')}
    ${navLink('noutati.html','Noutăți')}
    ${navLink('contact.html','Contact')}
  </nav>
</div>

<!-- MODAL LOGIN -->
<div class="modal-overlay" id="modalOverlay">
  <div class="modal">
    <button class="modal-close" onclick="closeModal()">×</button>
    <h2>Contul meu</h2>
    <div class="modal-tabs">
      <div class="modal-tab active" id="tabLogin" onclick="switchTab('login')">Autentificare</div>
      <div class="modal-tab" id="tabRegister" onclick="switchTab('register')">Înregistrare</div>
    </div>
    <div id="formLogin">
      <button onclick="loginWithGoogle()" style="width:100%;display:flex;align-items:center;justify-content:center;gap:10px;padding:11px;border:1px solid #ddd;border-radius:6px;background:#fff;cursor:pointer;font-size:0.95rem;font-family:'Georgia',serif;margin-bottom:16px;">
        <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.05 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-3.55-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
        Continuă cu Google
      </button>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
        <hr style="flex:1;border:none;border-top:1px solid #e0e0e0;">
        <span style="font-size:0.8rem;color:#999;">sau</span>
        <hr style="flex:1;border:none;border-top:1px solid #e0e0e0;">
      </div>
      <div class="form-group"><label>Email</label><input type="email" id="loginEmail" placeholder="email@exemplu.ro" /></div>
      <div class="form-group"><label>Parolă</label><input type="password" id="loginPassword" placeholder="••••••••" /></div>
      <button class="btn-primary" onclick="doLogin()">Intră în cont</button>
      <p style="text-align:center;margin-top:10px;"><a href="#" onclick="doResetPassword()" style="font-size:0.82rem;color:#8B0000;">Ai uitat parola?</a></p>
      <p class="modal-msg" id="loginMsg"></p>
    </div>
    <div id="formRegister" style="display:none">
      <div class="form-group"><label>Nume complet</label><input type="text" id="regName" placeholder="Ion Popescu" /></div>
      <div class="form-group"><label>Email</label><input type="email" id="regEmail" placeholder="email@exemplu.ro" /></div>
      <div class="form-group"><label>Parolă</label><input type="password" id="regPassword" placeholder="••••••••" /></div>
      <button class="btn-primary" onclick="doRegister()">Creează cont</button>
      <p class="modal-msg" id="registerMsg"></p>
    </div>
  </div>
</div>

<!-- MODAL CONTACT -->
<div class="contact-modal-overlay" id="contactModalOverlay">
  <div class="contact-modal">
    <button class="modal-close" onclick="closeContactModal()">×</button>
    <h2>Trimite-ne un mesaj</h2>
    <div class="form-group"><label>Numele tău</label><input type="text" id="contactName" placeholder="Ion Popescu" /></div>
    <div class="form-group"><label>Email-ul tău</label><input type="email" id="contactEmail" placeholder="email@exemplu.ro" /></div>
    <div class="form-group"><label>Subiect</label><input type="text" id="contactSubject" placeholder="Subiectul mesajului" /></div>
    <div class="form-group"><label>Mesaj</label><textarea id="contactMessage" placeholder="Scrie mesajul tău aici..."></textarea></div>
    <button class="btn-primary" onclick="doSendEmail()">Trimite mesajul</button>
    <p class="modal-msg" id="contactMsg"></p>
  </div>
</div>
`

  // Insert header before first child of body
  document.body.insertAdjacentHTML('afterbegin', headerHTML)

  // Footer
  const footerHTML = `
<footer>
  <p>© ${new Date().getFullYear()} Asociația Dokimasia. Toate drepturile rezervate.</p>
  <p style="margin-top:8px"><a href="contact.html">contact@dokimasia.ro</a></p>
</footer>`
  
  // Only add footer if page doesn't already have one
  if (!document.querySelector('footer')) {
    document.body.insertAdjacentHTML('beforeend', footerHTML)
  }
})()

// ═══════════════════════════════════════════════
// SUPABASE + AUTH
// ═══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async function() {
  // Init Supabase
  const { createClient } = window.supabase
  window.sb = createClient(SUPABASE_URL, SUPABASE_KEY)

  // Init EmailJS if available
  if (window.emailjs) {
    window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY })
  }

  // Handle Google OAuth redirect (token in URL hash)
  if (window.location.hash.includes('access_token')) {
    await window.sb.auth.getSession()
    // Clean URL
    history.replaceState(null, '', window.location.pathname)
  }

  // Listen for auth changes
  window.sb.auth.onAuthStateChange((event, session) => {
    updateAccountUI()
    if (event === 'SIGNED_IN') closeModal()
  })

  // Initial UI update
  updateAccountUI()

  // Track page view
  try {
    await window.sb.from('page_views').insert({ page: window.location.pathname, user_agent: navigator.userAgent })
  } catch(e) {}

  // Set footer year
  const yearEl = document.getElementById('year')
  if (yearEl) yearEl.textContent = new Date().getFullYear()
})

// ═══════════════════════════════════════════════
// UI FUNCTIONS
// ═══════════════════════════════════════════════
function toggleMenu() {
  document.getElementById('mainNav').classList.toggle('open')
}
function toggleMobMenu() {
  document.getElementById('mobNav').classList.toggle('open')
}
function toggleAccount() {
  document.getElementById('accountDropdown').classList.toggle('open')
}
function toggleMobAccount() {
  const dd = document.getElementById('mobAccountDropdown')
  dd.style.display = dd.style.display === 'none' ? 'block' : 'none'
}
function closeMobAccount() {
  document.getElementById('mobAccountDropdown').style.display = 'none'
}

document.addEventListener('click', function(e) {
  const aw = document.querySelector('.account-wrapper')
  if (aw && !aw.contains(e.target)) {
    const dd = document.getElementById('accountDropdown')
    if (dd) dd.classList.remove('open')
  }
})

// ═══════════════════════════════════════════════
// MODAL LOGIN
// ═══════════════════════════════════════════════
function openModal(tab) {
  document.getElementById('modalOverlay').classList.add('open')
  switchTab(tab || 'login')
  const dd = document.getElementById('accountDropdown')
  if (dd) dd.classList.remove('open')
}
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open')
}
document.addEventListener('click', function(e) {
  const overlay = document.getElementById('modalOverlay')
  if (overlay && e.target === overlay) closeModal()
})
function switchTab(tab) {
  document.getElementById('formLogin').style.display = tab === 'login' ? 'block' : 'none'
  document.getElementById('formRegister').style.display = tab === 'register' ? 'block' : 'none'
  document.getElementById('tabLogin').classList.toggle('active', tab === 'login')
  document.getElementById('tabRegister').classList.toggle('active', tab === 'register')
}

// ═══════════════════════════════════════════════
// MODAL CONTACT
// ═══════════════════════════════════════════════
function openContactModal() {
  document.getElementById('contactModalOverlay').classList.add('open')
}
function closeContactModal() {
  document.getElementById('contactModalOverlay').classList.remove('open')
  document.getElementById('contactMsg').textContent = ''
}
document.addEventListener('click', function(e) {
  const overlay = document.getElementById('contactModalOverlay')
  if (overlay && e.target === overlay) closeContactModal()
})

// ═══════════════════════════════════════════════
// AUTH FUNCTIONS
// ═══════════════════════════════════════════════
async function loginWithGoogle() {
  const { error } = await window.sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: 'https://dokimasia.ro/' + window.location.pathname.split('/').pop() }
  })
  if (error) alert('Eroare Google: ' + error.message)
}

async function doLogin() {
  const email = document.getElementById('loginEmail').value
  const password = document.getElementById('loginPassword').value
  const msg = document.getElementById('loginMsg')
  msg.textContent = 'Se conectează...'
  const { error } = await window.sb.auth.signInWithPassword({ email, password })
  if (error) { msg.textContent = 'Eroare: ' + error.message; msg.style.color = '#c00' }
  else { closeModal(); updateAccountUI() }
}

async function doRegister() {
  const name = document.getElementById('regName').value
  const email = document.getElementById('regEmail').value
  const password = document.getElementById('regPassword').value
  const msg = document.getElementById('registerMsg')
  const { error } = await window.sb.auth.signUp({ email, password, options: { data: { full_name: name } } })
  if (error) { msg.textContent = 'Eroare: ' + error.message; msg.style.color = '#c00' }
  else { msg.textContent = 'Cont creat! Poți să te loghezi acum.'; msg.style.color = 'green' }
}

async function doLogout() {
  await window.sb.auth.signOut()
  updateAccountUI()
}

async function doResetPassword() {
  const email = document.getElementById('loginEmail').value.trim()
  const msg = document.getElementById('loginMsg')
  if (!email) { msg.textContent = 'Introdu emailul mai întâi.'; msg.style.color = '#c00'; return }
  const { error } = await window.sb.auth.resetPasswordForEmail(email, { redirectTo: 'https://dokimasia.ro' })
  if (error) { msg.textContent = 'Eroare: ' + error.message; msg.style.color = '#c00' }
  else { msg.textContent = 'Email de resetare trimis!'; msg.style.color = 'green' }
}

async function updateAccountUI() {
  if (!window.sb) return
  const { data: { user } } = await window.sb.auth.getUser()
  const label = document.getElementById('accountLabel')
  const mobLabel = document.getElementById('mobAccountLabel')
  const loggedOut = document.getElementById('loggedOut')
  const loggedIn = document.getElementById('loggedIn')
  const mobLoggedOut = document.getElementById('mobLoggedOut')
  const mobLoggedIn = document.getElementById('mobLoggedIn')

  if (user) {
    const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email
    const firstName = name.split(' ')[0]
    if (label) label.textContent = firstName
    if (mobLabel) mobLabel.textContent = firstName
    if (loggedOut) loggedOut.style.display = 'none'
    if (loggedIn) loggedIn.style.display = 'block'
    if (mobLoggedOut) mobLoggedOut.style.display = 'none'
    if (mobLoggedIn) mobLoggedIn.style.display = 'block'
    if (user.email === ADMIN_EMAIL) {
      const adminBtn = document.getElementById('adminBtn')
      const mobAdminBtn = document.getElementById('mobAdminBtn')
      if (adminBtn) adminBtn.style.display = 'block'
      if (mobAdminBtn) mobAdminBtn.style.display = 'block'
    }
  } else {
    if (label) label.textContent = 'Contul meu'
    if (mobLabel) mobLabel.textContent = 'Cont'
    if (loggedOut) loggedOut.style.display = 'block'
    if (loggedIn) loggedIn.style.display = 'none'
    if (mobLoggedOut) mobLoggedOut.style.display = 'block'
    if (mobLoggedIn) mobLoggedIn.style.display = 'none'
  }
}

// ═══════════════════════════════════════════════
// SEND EMAIL
// ═══════════════════════════════════════════════
async function doSendEmail() {
  const name = document.getElementById('contactName').value.trim()
  const email = document.getElementById('contactEmail').value.trim()
  const subject = document.getElementById('contactSubject').value.trim()
  const message = document.getElementById('contactMessage').value.trim()
  const msg = document.getElementById('contactMsg')

  if (!name || !email || !subject || !message) {
    msg.textContent = 'Te rugăm să completezi toate câmpurile.'
    msg.style.color = '#c00'; return
  }
  msg.textContent = 'Se trimite...'; msg.style.color = '#8B0000'
  try {
    if (window.emailjs) {
      await window.emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, { name, email, title: subject, message })
    }
    if (window.sb) {
      await window.sb.from('messages').insert({ name, email, subject, message, citit: false })
    }
    msg.textContent = '✅ Mesajul a fost trimis! Îți mulțumim.'; msg.style.color = 'green'
    document.getElementById('contactName').value = ''
    document.getElementById('contactEmail').value = ''
    document.getElementById('contactSubject').value = ''
    document.getElementById('contactMessage').value = ''
  } catch(e) {
    msg.textContent = 'Eroare la trimitere. Încearcă din nou.'; msg.style.color = '#c00'
  }
}
