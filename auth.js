// ============================================================
// auth.js — Modul comun Asociația Dokimasia
// Include pe fiecare pagină cu: <script src="auth.js"></script>
// DUPĂ: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// ============================================================

const SUPABASE_URL = 'https://jaoxhsyplnkanhqevnnr.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imphb3hoc3lwbG5rYW5ocWV2bm5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MDQ0NTYsImV4cCI6MjA5MTk4MDQ1Nn0.usQM75JBijLwJqPNHifvGFogjQhzH0jJbWnqJGCL1iw'
const ADMIN_EMAIL = 'm.ciprian1387@gmail.com'

// Client Supabase global — disponibil pe toată pagina ca `sb`
const { createClient } = supabase
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    storageKey: 'dokimasia-auth',
    storage: window.localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// ── INJECTARE HTML MODALS ──────────────────────────────────
// Injectăm modalele în DOM automat, dacă nu există deja
function injectModals() {
  if (!document.getElementById('modalOverlay')) {
    document.body.insertAdjacentHTML('beforeend', `
    <!-- Modal Login/Register -->
    <div class="modal-overlay" id="modalOverlay">
      <div class="modal">
        <button class="modal-close" onclick="closeModal()">×</button>
        <h2>Contul meu</h2>
        <div class="modal-tabs">
          <div class="modal-tab active" id="tabLogin" onclick="switchTab('login')">Autentificare</div>
          <div class="modal-tab" id="tabRegister" onclick="switchTab('register')">Înregistrare</div>
        </div>
        <div id="formLogin">
          <button onclick="loginWithGoogle()" style="width:100%;display:flex;align-items:center;justify-content:center;gap:10px;padding:11px;border:1px solid #ddd;border-radius:6px;background:#fff;cursor:pointer;font-size:0.95rem;font-family:'Georgia',serif;margin-bottom:16px;transition:background 0.2s;" onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='#fff'">
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.05 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-3.55-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Continuă cu Google
          </button>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
            <hr style="flex:1;border:none;border-top:1px solid #e0e0e0;">
            <span style="font-size:0.8rem;color:#999;">sau</span>
            <hr style="flex:1;border:none;border-top:1px solid #e0e0e0;">
          </div>
          <div class="form-group"><label>Email</label><input type="email" id="loginEmail" placeholder="email@exemplu.ro" /></div>
          <div class="form-group"><label>Parolă</label><input type="password" id="loginPassword" placeholder="••••••••" onkeydown="if(event.key==='Enter')login()" /></div>
          <button class="btn-primary" onclick="login()">Intră în cont</button>
          <p style="text-align:center;margin-top:10px;"><a href="#" onclick="resetPassword()" style="font-size:0.82rem;color:#8B0000;">Ai uitat parola?</a></p>
          <p class="modal-msg" id="loginMsg"></p>
        </div>
        <div id="formRegister" style="display:none">
          <button onclick="loginWithGoogle()" style="width:100%;display:flex;align-items:center;justify-content:center;gap:10px;padding:11px;border:1px solid #ddd;border-radius:6px;background:#fff;cursor:pointer;font-size:0.95rem;font-family:'Georgia',serif;margin-bottom:16px;transition:background 0.2s;" onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='#fff'">
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.05 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-3.55-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Continuă cu Google
          </button>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
            <hr style="flex:1;border:none;border-top:1px solid #e0e0e0;">
            <span style="font-size:0.8rem;color:#999;">sau</span>
            <hr style="flex:1;border:none;border-top:1px solid #e0e0e0;">
          </div>
          <div class="form-group"><label>Nume complet</label><input type="text" id="regName" placeholder="Ion Popescu" /></div>
          <div class="form-group"><label>Email</label><input type="email" id="regEmail" placeholder="email@exemplu.ro" /></div>
          <div class="form-group"><label>Parolă</label><input type="password" id="regPassword" placeholder="••••••••" onkeydown="if(event.key==='Enter')register()" /></div>
          <button class="btn-primary" onclick="register()">Creează cont</button>
          <p class="modal-msg" id="registerMsg"></p>
        </div>
      </div>
    </div>

    <!-- Modal Contact -->
    <div class="contact-modal-overlay" id="contactModalOverlay">
      <div class="contact-modal" style="background:#fff;border-radius:12px;padding:40px;width:100%;max-width:480px;margin:20px;position:relative;box-shadow:0 8px 32px rgba(0,0,0,0.2);">
        <button class="modal-close" onclick="closeContactModal()">×</button>
        <h2 style="color:#8B0000;font-size:1.5rem;margin-bottom:24px;text-align:center;">Trimite-ne un mesaj</h2>
        <div class="form-group"><label>Numele tău</label><input type="text" id="contactName" placeholder="Ion Popescu" /></div>
        <div class="form-group"><label>Email-ul tău</label><input type="email" id="contactEmail" placeholder="email@exemplu.ro" /></div>
        <div class="form-group"><label>Subiect</label><input type="text" id="contactSubject" placeholder="Subiectul mesajului" /></div>
        <div class="form-group"><label>Mesaj</label><textarea id="contactMessage" placeholder="Scrie mesajul tău aici..." style="width:100%;padding:10px 14px;border:1px solid #ddd;border-radius:6px;font-size:0.95rem;font-family:'Georgia',serif;outline:none;resize:vertical;min-height:100px;"></textarea></div>
        <button class="btn-primary" onclick="sendContactEmail()">Trimite mesajul</button>
        <p class="modal-msg" id="contactMsg"></p>
      </div>
    </div>
    `)
  }

  // Închide modalele la click pe overlay
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal()
  })
  document.getElementById('contactModalOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeContactModal()
  })

  // Închide dropdown cont la click în afară
  document.addEventListener('click', e => {
    const aw = document.querySelector('.account-wrapper')
    const dd = document.getElementById('accountDropdown')
    if (aw && dd && !aw.contains(e.target)) dd.classList.remove('open')
  })
}

// ── AUTH FUNCTIONS ─────────────────────────────────────────

function toggleAccount() {
  document.getElementById('accountDropdown')?.classList.toggle('open')
}

function openModal(tab = 'login') {
  document.getElementById('modalOverlay')?.classList.add('open')
  switchTab(tab)
  document.getElementById('accountDropdown')?.classList.remove('open')
}

function closeModal() {
  document.getElementById('modalOverlay')?.classList.remove('open')
  document.getElementById('loginMsg').textContent = ''
  document.getElementById('registerMsg').textContent = ''
}

function switchTab(tab) {
  document.getElementById('formLogin').style.display = tab === 'login' ? 'block' : 'none'
  document.getElementById('formRegister').style.display = tab === 'register' ? 'block' : 'none'
  document.getElementById('tabLogin').classList.toggle('active', tab === 'login')
  document.getElementById('tabRegister').classList.toggle('active', tab === 'register')
}

async function loginWithGoogle() {
  const currentPage = window.location.href
  await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: currentPage }
  })
}

async function login() {
  const msg = document.getElementById('loginMsg')
  msg.textContent = 'Se conectează...'
  const { error } = await sb.auth.signInWithPassword({
    email: document.getElementById('loginEmail').value.trim(),
    password: document.getElementById('loginPassword').value
  })
  if (error) {
    msg.textContent = 'Eroare: ' + error.message
  } else {
    closeModal()
    updateAccountUI()
  }
}

async function register() {
  const msg = document.getElementById('registerMsg')
  msg.textContent = 'Se înregistrează...'
  const { error } = await sb.auth.signUp({
    email: document.getElementById('regEmail').value.trim(),
    password: document.getElementById('regPassword').value,
    options: { data: { full_name: document.getElementById('regName').value.trim() } }
  })
  if (error) {
    msg.textContent = 'Eroare: ' + error.message
  } else {
    msg.textContent = '✅ Cont creat! Verifică emailul pentru confirmare.'
    msg.style.color = 'green'
  }
}

async function logout() {
  await sb.auth.signOut()
  updateAccountUI()
}

async function resetPassword() {
  const email = document.getElementById('loginEmail').value.trim()
  const msg = document.getElementById('loginMsg')
  if (!email) { msg.textContent = 'Introdu emailul mai întâi.'; return }
  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://dokimasia.ro'
  })
  msg.textContent = error ? 'Eroare: ' + error.message : '✅ Email de resetare trimis!'
}

// ── UPDATE UI ──────────────────────────────────────────────

async function updateAccountUI() {
  const { data: { session } } = await sb.auth.getSession()
  const user = session?.user

  // Expunem userul curent global (util pentru alte scripturi din pagină)
  window.currentUser = user || null

  const label = document.getElementById('accountLabel')
  const mobLabel = document.getElementById('mobAccountLabel')
  const loggedOut = document.getElementById('loggedOut')
  const loggedIn = document.getElementById('loggedIn')
  const adminBtn = document.getElementById('adminBtn')

  if (user) {
    const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email
    const firstName = name.split(' ')[0]
    if (label) label.textContent = firstName
    if (mobLabel) mobLabel.textContent = firstName
    if (loggedOut) loggedOut.style.display = 'none'
    if (loggedIn) loggedIn.style.display = 'block'
    if (adminBtn) adminBtn.style.display = user.email === ADMIN_EMAIL ? 'block' : 'none'
  } else {
    if (label) label.textContent = 'Contul meu'
    if (mobLabel) mobLabel.textContent = 'Cont'
    if (loggedOut) loggedOut.style.display = 'block'
    if (loggedIn) loggedIn.style.display = 'none'
    if (adminBtn) adminBtn.style.display = 'none'
  }

  // Callback opțional: paginile pot defini window.onUserLoaded(user)
  if (typeof window.onUserLoaded === 'function') {
    window.onUserLoaded(user)
  }
}

// ── CONTACT MODAL ──────────────────────────────────────────

function openContactModal() {
  document.getElementById('contactModalOverlay')?.classList.add('open')
}

function closeContactModal() {
  document.getElementById('contactModalOverlay')?.classList.remove('open')
  document.getElementById('contactMsg').textContent = ''
}

async function sendContactEmail() {
  const name = document.getElementById('contactName').value.trim()
  const email = document.getElementById('contactEmail').value.trim()
  const subject = document.getElementById('contactSubject').value.trim()
  const message = document.getElementById('contactMessage').value.trim()
  const msg = document.getElementById('contactMsg')

  if (!name || !email || !message) {
    msg.textContent = 'Te rugăm să completezi toate câmpurile.'
    msg.style.color = '#c00'
    return
  }

  msg.textContent = 'Se trimite...'
  msg.style.color = '#8B0000'

  try {
    // Salvează în Supabase
    await sb.from('messages').insert([{ name, email, subject, message }])

    // Trimite prin EmailJS dacă e disponibil
    if (typeof emailjs !== 'undefined') {
      await emailjs.send('service_4a8gp1c', 'template_wg7nlez', {
        name, email, title: subject || 'Mesaj nou', message
      })
    }

    msg.textContent = '✅ Mesajul a fost trimis! Îți mulțumim.'
    msg.style.color = 'green'
    document.getElementById('contactName').value = ''
    document.getElementById('contactEmail').value = ''
    document.getElementById('contactSubject').value = ''
    document.getElementById('contactMessage').value = ''
    setTimeout(() => closeContactModal(), 3000)
  } catch (e) {
    msg.textContent = 'Eroare la trimitere. Încearcă din nou.'
    msg.style.color = '#c00'
  }
}

// ── NEWSLETTER ─────────────────────────────────────────────

async function subscribe() {
  const email = document.getElementById('subEmail')?.value.trim()
  const nume = document.getElementById('subNume')?.value.trim()
  const msg = document.getElementById('subMsg')
  if (!msg) return
  if (!email) { msg.textContent = 'Te rugăm să introduci emailul.'; return }
  msg.textContent = 'Se procesează...'
  const { error } = await sb.from('abonati').insert([{ email, nume: nume || null }])
  if (error?.code === '23505') {
    msg.textContent = 'Ești deja abonat!'
  } else if (error) {
    msg.textContent = 'Eroare: ' + error.message
  } else {
    msg.textContent = '✅ Te-ai abonat cu succes! Mulțumim!'
    if (document.getElementById('subEmail')) document.getElementById('subEmail').value = ''
    if (document.getElementById('subNume')) document.getElementById('subNume').value = ''
  }
}

// ── PAGE TRACKING ──────────────────────────────────────────

async function trackPageView() {
  try {
    const ua = navigator.userAgent
    let device = 'Desktop'
    if (/Mobi|Android/i.test(ua)) device = 'Mobil'
    else if (/Tablet|iPad/i.test(ua)) device = 'Tableta'

    let browser = 'Altul'
    if (/Edg/i.test(ua)) browser = 'Edge'
    else if (/OPR|Opera/i.test(ua)) browser = 'Opera'
    else if (/Chrome/i.test(ua)) browser = 'Chrome'
    else if (/Firefox/i.test(ua)) browser = 'Firefox'
    else if (/Safari/i.test(ua)) browser = 'Safari'

    let city = null, country = null, ip = null
    try {
      // Cache în sessionStorage — un singur apel per sesiune browser, nu per pagină
      const cached = sessionStorage.getItem('dok_geo')
      if (cached) {
        const g = JSON.parse(cached)
        city = g.city; country = g.country; ip = g.ip
      } else {
        const geo = await fetch('https://ipapi.co/json/').then(r => r.json())
        city = geo.city || null
        country = geo.country_name || null
        ip = geo.ip || null
        sessionStorage.setItem('dok_geo', JSON.stringify({ city, country, ip }))
      }
    } catch (e) {}

    await sb.from('page_views').insert([{
      page: window.location.pathname || '/',
      user_agent: ua,
      device,
      browser,
      referrer: document.referrer || null,
      city,
      country,
      ip
    }])

    // Timp petrecut pe pagină
    const startTime = Date.now()
    window.addEventListener('beforeunload', () => {
      const time_spent = Math.round((Date.now() - startTime) / 1000)
      navigator.sendBeacon(
        SUPABASE_URL + '/rest/v1/page_views',
        JSON.stringify({ time_spent })
      )
    })
  } catch (e) {}
}

// ── YEAR ───────────────────────────────────────────────────

function setYear() {
  const el = document.getElementById('year')
  if (el) el.textContent = new Date().getFullYear()
}

// ── INIT ───────────────────────────────────────────────────
// Rulează când DOM-ul e gata

document.addEventListener('DOMContentLoaded', async () => {
  setYear()
  injectModals()

  // Supabase detectează automat tokenul din URL (#access_token=...)
  // după un redirect Google OAuth — getSession() îl preia și salvează în localStorage
  await sb.auth.getSession()

  updateAccountUI()
  trackPageView()

  sb.auth.onAuthStateChange((event, session) => {
    if (['INITIAL_SESSION', 'SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED'].includes(event)) {
      updateAccountUI()
    }
    if (event === 'SIGNED_IN') {
      closeModal()
      // Curăță hash-ul din URL după login cu Google
      if (window.location.hash.includes('access_token')) {
        history.replaceState(null, '', window.location.pathname + window.location.search)
      }
    }
  })
})
