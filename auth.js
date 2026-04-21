// auth.js — Asociația Dokimasia

const SUPABASE_URL = 'https://jaoxhsyplnkanhqevnnr.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imphb3hoc3lwbG5rYW5ocWV2bm5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MDQ0NTYsImV4cCI6MjA5MTk4MDQ1Nn0.usQM75JBijLwJqPNHifvGFogjQhzH0jJbWnqJGCL1iw'
const ADMIN_EMAIL = 'm.ciprian1387@gmail.com'

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

// ── MODALS ─────────────────────────────────────────────────

function injectModals() {
  if (document.getElementById('modalOverlay')) return

  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal-overlay" id="modalOverlay">
      <div class="modal">
        <button class="modal-close" onclick="closeModal()">x</button>
        <h2>Contul meu</h2>
        <div class="modal-tabs">
          <div class="modal-tab active" id="tabLogin" onclick="switchTab('login')">Autentificare</div>
          <div class="modal-tab" id="tabRegister" onclick="switchTab('register')">Inregistrare</div>
        </div>
        <div id="formLogin">
          <button onclick="loginWithGoogle()" style="width:100%;display:flex;align-items:center;justify-content:center;gap:10px;padding:11px;border:1px solid #ddd;border-radius:6px;background:#fff;cursor:pointer;font-size:0.95rem;font-family:'Georgia',serif;margin-bottom:16px;">
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.05 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-3.55-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Continua cu Google
          </button>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
            <hr style="flex:1;border:none;border-top:1px solid #e0e0e0;">
            <span style="font-size:0.8rem;color:#999;">sau</span>
            <hr style="flex:1;border:none;border-top:1px solid #e0e0e0;">
          </div>
          <div class="form-group"><label>Email</label><input type="email" id="loginEmail" placeholder="email@exemplu.ro" /></div>
          <div class="form-group"><label>Parola</label><input type="password" id="loginPassword" placeholder="........" onkeydown="if(event.key==='Enter')login()" /></div>
          <button class="btn-primary" onclick="login()">Intra in cont</button>
          <p style="text-align:center;margin-top:10px;"><a href="#" onclick="resetPassword();return false;" style="font-size:0.82rem;color:#8B0000;">Ai uitat parola?</a></p>
          <p class="modal-msg" id="loginMsg"></p>
        </div>
        <div id="formRegister" style="display:none">
          <button onclick="loginWithGoogle()" style="width:100%;display:flex;align-items:center;justify-content:center;gap:10px;padding:11px;border:1px solid #ddd;border-radius:6px;background:#fff;cursor:pointer;font-size:0.95rem;font-family:'Georgia',serif;margin-bottom:16px;">
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.05 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-3.55-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Continua cu Google
          </button>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
            <hr style="flex:1;border:none;border-top:1px solid #e0e0e0;">
            <span style="font-size:0.8rem;color:#999;">sau</span>
            <hr style="flex:1;border:none;border-top:1px solid #e0e0e0;">
          </div>
          <div class="form-group"><label>Nume complet</label><input type="text" id="regName" placeholder="Ion Popescu" /></div>
          <div class="form-group"><label>Email</label><input type="email" id="regEmail" placeholder="email@exemplu.ro" /></div>
          <div class="form-group"><label>Parola</label><input type="password" id="regPassword" placeholder="........" onkeydown="if(event.key==='Enter')register()" /></div>
          <button class="btn-primary" onclick="register()">Creeaza cont</button>
          <p class="modal-msg" id="registerMsg"></p>
        </div>
      </div>
    </div>

    <div class="contact-modal-overlay" id="contactModalOverlay">
      <div class="contact-modal" style="background:#fff;border-radius:12px;padding:40px;width:100%;max-width:480px;margin:20px;position:relative;box-shadow:0 8px 32px rgba(0,0,0,0.2);">
        <button class="modal-close" onclick="closeContactModal()">x</button>
        <h2 style="color:#8B0000;font-size:1.5rem;margin-bottom:24px;text-align:center;">Trimite-ne un mesaj</h2>
        <div class="form-group"><label>Numele tau</label><input type="text" id="contactName" placeholder="Ion Popescu" /></div>
        <div class="form-group"><label>Email-ul tau</label><input type="email" id="contactEmail" placeholder="email@exemplu.ro" /></div>
        <div class="form-group"><label>Subiect</label><input type="text" id="contactSubject" placeholder="Subiectul mesajului" /></div>
        <div class="form-group"><label>Mesaj</label><textarea id="contactMessage" placeholder="Scrie mesajul tau aici..." style="width:100%;padding:10px 14px;border:1px solid #ddd;border-radius:6px;font-size:0.95rem;font-family:'Georgia',serif;outline:none;resize:vertical;min-height:100px;"></textarea></div>
        <button class="btn-primary" onclick="sendContactEmail()">Trimite mesajul</button>
        <p class="modal-msg" id="contactMsg"></p>
      </div>
    </div>
  `)

  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal()
  })
  document.getElementById('contactModalOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeContactModal()
  })
  document.addEventListener('click', e => {
    const aw = document.querySelector('.account-wrapper')
    const dd = document.getElementById('accountDropdown')
    if (aw && dd && !aw.contains(e.target)) dd.classList.remove('open')
  })
}

// ── AUTH ───────────────────────────────────────────────────

function toggleAccount() {
  document.getElementById('accountDropdown')?.classList.toggle('open')
}

function openModal(tab) {
  tab = tab || 'login'
  document.getElementById('modalOverlay')?.classList.add('open')
  switchTab(tab)
  document.getElementById('accountDropdown')?.classList.remove('open')
}

function closeModal() {
  document.getElementById('modalOverlay')?.classList.remove('open')
  var lm = document.getElementById('loginMsg')
  var rm = document.getElementById('registerMsg')
  if (lm) lm.textContent = ''
  if (rm) rm.textContent = ''
}

function switchTab(tab) {
  document.getElementById('formLogin').style.display = tab === 'login' ? 'block' : 'none'
  document.getElementById('formRegister').style.display = tab === 'register' ? 'block' : 'none'
  document.getElementById('tabLogin').classList.toggle('active', tab === 'login')
  document.getElementById('tabRegister').classList.toggle('active', tab === 'register')
}

async function loginWithGoogle() {
  // FIX: folosim doar origin+pathname — fara hash, fara query string
  // Astfel evitam "index.html##access_token=..." cu doua #
  var redirectTo = window.location.origin + window.location.pathname
  var result = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: redirectTo }
  })
  if (result.error) alert('Eroare Google: ' + result.error.message)
}

async function login() {
  var msg = document.getElementById('loginMsg')
  msg.textContent = 'Se conecteaza...'
  var result = await sb.auth.signInWithPassword({
    email: document.getElementById('loginEmail').value.trim(),
    password: document.getElementById('loginPassword').value
  })
  if (result.error) {
    msg.textContent = 'Eroare: ' + result.error.message
  } else {
    closeModal()
    updateAccountUI()
  }
}

async function register() {
  var msg = document.getElementById('registerMsg')
  msg.textContent = 'Se inregistreaza...'
  var result = await sb.auth.signUp({
    email: document.getElementById('regEmail').value.trim(),
    password: document.getElementById('regPassword').value,
    options: { data: { full_name: document.getElementById('regName').value.trim() } }
  })
  if (result.error) {
    msg.textContent = 'Eroare: ' + result.error.message
  } else {
    msg.textContent = 'Cont creat! Verifica emailul pentru confirmare.'
    msg.style.color = 'green'
  }
}

async function logout() {
  await sb.auth.signOut()
  updateAccountUI()
}

async function resetPassword() {
  var email = document.getElementById('loginEmail').value.trim()
  var msg = document.getElementById('loginMsg')
  if (!email) { msg.textContent = 'Introdu emailul mai intai.'; return }
  var result = await sb.auth.resetPasswordForEmail(email, { redirectTo: 'https://dokimasia.ro' })
  msg.textContent = result.error ? 'Eroare: ' + result.error.message : 'Email de resetare trimis!'
}

// ── UPDATE UI ──────────────────────────────────────────────

async function updateAccountUI() {
  var result = await sb.auth.getSession()
  var user = result.data.session ? result.data.session.user : null
  window.currentUser = user || null

  var label = document.getElementById('accountLabel')
  var mobLabel = document.getElementById('mobAccountLabel')
  var loggedOut = document.getElementById('loggedOut')
  var loggedIn = document.getElementById('loggedIn')
  var adminBtn = document.getElementById('adminBtn')

  if (user) {
    var name = (user.user_metadata && (user.user_metadata.full_name || user.user_metadata.name)) || user.email
    var firstName = name.split(' ')[0]
    if (label) label.textContent = firstName
    if (mobLabel) mobLabel.textContent = firstName
    if (loggedOut) loggedOut.style.display = 'none'
    if (loggedIn) loggedIn.style.display = 'block'
    if (adminBtn) adminBtn.style.display = (user.email === ADMIN_EMAIL) ? 'block' : 'none'
  } else {
    if (label) label.textContent = 'Contul meu'
    if (mobLabel) mobLabel.textContent = 'Cont'
    if (loggedOut) loggedOut.style.display = 'block'
    if (loggedIn) loggedIn.style.display = 'none'
    if (adminBtn) adminBtn.style.display = 'none'
  }

  if (typeof window.onUserLoaded === 'function') window.onUserLoaded(user)
}

// ── CONTACT ────────────────────────────────────────────────

function openContactModal() {
  document.getElementById('contactModalOverlay')?.classList.add('open')
}

function closeContactModal() {
  document.getElementById('contactModalOverlay')?.classList.remove('open')
  var m = document.getElementById('contactMsg')
  if (m) m.textContent = ''
}

async function sendContactEmail() {
  var name = document.getElementById('contactName').value.trim()
  var email = document.getElementById('contactEmail').value.trim()
  var subject = document.getElementById('contactSubject').value.trim()
  var message = document.getElementById('contactMessage').value.trim()
  var msg = document.getElementById('contactMsg')
  if (!name || !email || !message) { msg.textContent = 'Completeaza toate campurile.'; msg.style.color = '#c00'; return }
  msg.textContent = 'Se trimite...'; msg.style.color = '#8B0000'
  try {
    await sb.from('messages').insert([{ name: name, email: email, subject: subject, message: message }])
    if (typeof emailjs !== 'undefined') {
      await emailjs.send('service_4a8gp1c', 'template_wg7nlez', { name: name, email: email, title: subject || 'Mesaj nou', message: message })
    }
    msg.textContent = 'Mesaj trimis!'; msg.style.color = 'green'
    document.getElementById('contactName').value = ''
    document.getElementById('contactEmail').value = ''
    document.getElementById('contactSubject').value = ''
    document.getElementById('contactMessage').value = ''
    setTimeout(function() { closeContactModal() }, 3000)
  } catch (e) {
    msg.textContent = 'Eroare la trimitere.'; msg.style.color = '#c00'
  }
}

// ── NEWSLETTER ─────────────────────────────────────────────

async function subscribe() {
  var email = document.getElementById('subEmail') ? document.getElementById('subEmail').value.trim() : ''
  var nume = document.getElementById('subNume') ? document.getElementById('subNume').value.trim() : ''
  var msg = document.getElementById('subMsg')
  if (!msg) return
  if (!email) { msg.textContent = 'Introdu emailul.'; return }
  msg.textContent = 'Se proceseaza...'
  var result = await sb.from('abonati').insert([{ email: email, nume: nume || null }])
  if (result.error && result.error.code === '23505') { msg.textContent = 'Esti deja abonat!' }
  else if (result.error) { msg.textContent = 'Eroare: ' + result.error.message }
  else {
    msg.textContent = 'Te-ai abonat! Multumim!'
    var se = document.getElementById('subEmail'); if (se) se.value = ''
    var sn = document.getElementById('subNume'); if (sn) sn.value = ''
  }
}

// ── TRACKING ───────────────────────────────────────────────

async function trackPageView() {
  try {
    var ua = navigator.userAgent
    var device = 'Desktop'
    if (/Mobi|Android/i.test(ua)) device = 'Mobil'
    else if (/Tablet|iPad/i.test(ua)) device = 'Tableta'
    var browser = 'Altul'
    if (/Edg/i.test(ua)) browser = 'Edge'
    else if (/OPR|Opera/i.test(ua)) browser = 'Opera'
    else if (/Chrome/i.test(ua)) browser = 'Chrome'
    else if (/Firefox/i.test(ua)) browser = 'Firefox'
    else if (/Safari/i.test(ua)) browser = 'Safari'
    await sb.from('page_views').insert([{
      page: window.location.pathname || '/',
      user_agent: ua,
      device: device,
      browser: browser,
      referrer: document.referrer || null
    }])
  } catch (e) {}
}

// ── YEAR ───────────────────────────────────────────────────

function setYear() {
  var el = document.getElementById('year')
  if (el) el.textContent = new Date().getFullYear()
}

// ── INIT ───────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
  setYear()
  injectModals()

  sb.auth.onAuthStateChange(function(event, session) {
    if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
      updateAccountUI()
    }
    if (event === 'SIGNED_IN') {
      closeModal()
      if (window.location.hash && window.location.hash.indexOf('access_token') !== -1) {
        history.replaceState(null, '', window.location.pathname)
      }
    }
  })

  trackPageView()
})
