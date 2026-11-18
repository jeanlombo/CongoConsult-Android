import { SITE_PUBLIC_URL } from './config.js';

const fallbackServices = [
  {id:1,title:'Études & enquêtes',description:'Des données fiables et des analyses rigoureuses pour éclairer les décisions.',icon:'chart'},
  {id:2,title:'Recrutement',description:'Identifier, évaluer et mobiliser les talents adaptés à vos besoins.',icon:'users',featured:1},
  {id:3,title:'Suivi-évaluation',description:'Mesurer les résultats et mieux piloter les programmes et projets.',icon:'search'},
  {id:4,title:'Conseil en gestion',description:'Renforcer l’organisation, la stratégie et la performance des équipes.',icon:'briefcase'},
  {id:5,title:'Collecte & analyse de données',description:'Transformer les informations de terrain en connaissances utiles.',icon:'database'},
  {id:6,title:'Formation & accompagnement',description:'Développer les compétences et accompagner les transformations.',icon:'book'}
];
const fallbackPlatforms = [
  {key:'etresorerie',name:'eTrésorerie',subtitle:'Gestion et suivi de la trésorerie',icon:'wallet',url:''},
  {key:'easycompta',name:'EasyCompta',subtitle:'Comptabilité et reporting financier',icon:'chart',url:''},
  {key:'rh',name:'Gestion RH',subtitle:'Employés, présences et paie',icon:'users',url:''}
];
const baseData = {
  company: {name:'AFRICA CONSULTING GROUP SARL',about:'AFRICA CONSULTING GROUP SARL accompagne les organisations à travers le conseil, les études, le recrutement et le suivi-évaluation. Les contenus présentés sont provisoires jusqu’à validation par la société.',email:'',phone:'+243 851 328 013',address:''},
  services:fallbackServices, platforms:fallbackPlatforms, articles:[], projects:[]
};
const cloneBase = () => JSON.parse(JSON.stringify(baseData));
let data = cloneBase();
let connected = false;
let screen = 'home';
let sheetOpen = false;
const $ = (s) => document.querySelector(s);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons = {
  wallet:'<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18m-6 5h3M7 6V4h12"/>',
  chart:'<path d="M4 19V10m5 9V6m5 13v-7m5 7V4"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.2a4 4 0 0 1 0 7.6"/>',
  search:'<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6M8 11l2 2 4-5"/>',
  briefcase:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12a20 20 0 0 0 18 0"/>',
  database:'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v7c0 1.7 4 3 9 3s9-1.3 9-3V5M3 12v7c0 1.7 4 3 9 3s9-1.3 9-3v-7"/>',
  book:'<path d="M4 20a3 3 0 0 1 3-3h13V3H7a3 3 0 0 0-3 3v14Zm0 0a3 3 0 0 0 3 2h13"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c7 7 7 11 0 18M12 3c-7 7-7 11 0 18"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>'
};
const svg = (type) => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[type] || icons.briefcase}</svg>`;
const safeExternal = (s) => { try { const u = new URL(String(s)); return u.protocol==='https:' ? u.toString() : ''; } catch { return ''; } };
const isLocal = (u) => ['localhost','127.0.0.1'].includes(u.hostname);
const currentSite = () => {
  let raw = localStorage.getItem('cc_site_url') || SITE_PUBLIC_URL;
  if (!raw) return '';
  try {
    const u = new URL(raw);
    if (u.username || u.password || (u.protocol!=='https:' && !(u.protocol==='http:' && isLocal(u)))) return '';
    u.search = '';u.hash='';
    return u.toString().replace(/\/*$/, '/') ;
  } catch {return '';}
};
function showToast(msg) { const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>el.classList.remove('show'),3800); }
function imageUrl(raw) {
  if (!raw || !currentSite()) return '';
  try {
    const url = new URL(raw,currentSite());
    return url.protocol==='https:' || (url.protocol==='http:' && isLocal(url)) ? url.toString() : '';
  } catch { return ''; }
}
function emptyState(title, message) {return `<div class="empty-box"><div class="empty-symbol">✳</div><h3>${esc(title)}</h3><p>${esc(message)}</p></div>`;}
function render() {
  $('#home-count-services').textContent=String(data.services.length).padStart(2,'0');
  $('#home-platforms').innerHTML=data.platforms.slice(0,3).map((p)=>`<button type="button" class="platform-mini" data-go="platforms"><div class="pm-icon">${svg(p.icon)}</div><strong>${esc(p.name)}</strong><small>${safeExternal(p.url)?'Accès disponible':'À configurer'}</small></button>`).join('');
  $('#home-services').innerHTML=data.services.slice(0,5).map((s)=>`<button type="button" class="service-card ${s.featured ? 'featured':''}" data-service="${esc(s.id)}" aria-label="Découvrir le service ${esc(s.title)}"><span class="service-symbol">${svg(s.icon)}</span><span class="service-card-copy"><strong>${esc(s.title)}</strong><span>${esc(s.description)}</span></span><span class="service-card-more">Voir le détail →</span></button>`).join('')||emptyState('Nos services','Aucun service disponible.');
  drawServiceList($('#search-services').value);
  $('#platform-list').innerHTML=data.platforms.map((p)=>{
    const href=safeExternal(p.url);
    return `<article class="platform-full"><div class="pf-head"><div class="pf-icon">${svg(p.icon)}</div><div><h3>${esc(p.name)}</h3><small>${href?'Accès en ligne':'Lien non configuré'}</small></div></div><p class="pf-description">${esc(p.subtitle)}</p><button class="pf-action" type="button" ${href?`data-external="${esc(href)}"`:'disabled'}><span>${href?'Ouvrir la plateforme':'Bientôt disponible'}</span><span>↗</span></button></article>`;
  }).join('');
  $('#news-list').innerHTML=data.articles.length ? data.articles.map((a,i)=>{
    const url=imageUrl(a.image_url||a.image_path);
    return `<article class="news-item">${url?`<img alt="" loading="lazy" src="${esc(url)}">`:''}<div class="news-content"><small>${esc(a.published_at?new Date(a.published_at.replace(' ','T')).toLocaleDateString('fr-FR'):'PUBLICATION')}</small><h3>${esc(a.title)}</h3><p>${esc(a.excerpt)}</p><button class="news-more" data-article="${i}" type="button">Lire la publication →</button></div></article>`;}).join('') : emptyState('Actualités à venir','Les nouvelles publications validées dans l’administration apparaîtront automatiquement ici.');
  $('#projects-list').innerHTML=data.projects.length ? data.projects.map((p,i)=>{
    const url=imageUrl(p.image_url||p.image_path);
    return `<article class="news-item">${url?`<img alt="" loading="lazy" src="${esc(url)}">`:''}<div class="news-content"><small>${esc([p.sector,p.year_label].filter(Boolean).join(' · ')||'RÉALISATION')}</small><h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p></div></article>`;}).join('') : emptyState('Réalisations à venir','Seules les réalisations confirmées par AFRICA CONSULTING GROUP SARL seront présentées ici.');
  $('#about-text').textContent=data.company.about;
  $('#contact-details').innerHTML=[['E-mail',data.company.email],['Téléphone',data.company.phone],['Adresse',data.company.address]].filter((a)=>a[1]).map(([title,value])=>`<div class="detail-row"><span>✦</span><div><b>${esc(title)}</b><small>${esc(value)}</small></div></div>`).join('');
  $('#connection-banner').classList.toggle('online',connected);
  $('#connection-text').textContent=connected?'Connecté au serveur AFRICA CONSULTING GROUP SARL':'Mode démonstration · Connectez le serveur PHP/MySQL';
}
function drawServiceList(q=''){
  q=(q||'').toLocaleLowerCase('fr').trim();
  const matches=data.services.filter(s=>(s.title+' '+s.description).toLocaleLowerCase('fr').includes(q));
  $('#service-list').innerHTML=matches.length?matches.map((s)=>`<button type="button" class="service-line ${s.featured?'featured':''}" data-service="${esc(s.id)}" aria-label="Découvrir le service ${esc(s.title)}"><span class="list-symbol">${svg(s.icon)}</span><span class="line-content"><strong>${esc(s.title)}</strong><span>${esc(s.description)}</span></span><span class="line-arrow" aria-hidden="true">↗</span></button>`).join(''):emptyState('Aucun résultat','Essaie avec un autre mot-clé.');
}
function go(name) {
  if (!$('#screen-'+name)) return;
  screen=name; document.querySelectorAll('[data-screen]').forEach(e=>e.classList.toggle('active',e.dataset.screen===name));
  document.querySelectorAll('.nav-item').forEach(e=>{e.classList.toggle('active',e.dataset.go===name);if(e.dataset.go===name)e.setAttribute('aria-current','page');else e.removeAttribute('aria-current')});
  $('#main').scrollTo({top:0,behavior:'instant'});closeSheet();
}
function openSheet(html){sheetOpen=true;$('#sheet-content').innerHTML=html;$('#overlay').hidden=false;$('#close-overlay').focus();}
function closeSheet(){sheetOpen=false;$('#overlay').hidden=true;$('#sheet-content').innerHTML='';}
window.africaHandleBack=()=>{if(sheetOpen){closeSheet();return true;}if(screen!=='home'){go('home');return true;}return false;};
function moreSheet() {
  const site=currentSite();
  openSheet(`<h2>Votre espace AFRICA CONSULTING GROUP SARL</h2><p>Découvrez nos rubriques et paramètres.</p>
    <button class="sheet-row" data-go="about">À propos de AFRICA CONSULTING GROUP SARL <span>↗</span></button>
    <button class="sheet-row" data-go="projects">Nos réalisations <span>↗</span></button>
    <button class="sheet-row" data-config="1">Configurer la connexion <span>⚙</span></button>
    ${site?`<button class="sheet-row" data-external="${esc(safeExternal(site+'admin/login.php'))}">Administration web <span>↗</span></button>`:''}
    <small>Application mobile V1 · PHP/MySQL + Capacitor · Les fonctionnalités administrateur restent sécurisées sur le site web.</small>`);
}
function configSheet(){
  openSheet(`<h2>Connexion au serveur</h2><p>Renseigne l'adresse publique HTTPS du dossier <b>public</b> de ton site PHP/MySQL. Exemple : https://ton-site.cd/public/</p>
  <form id="site-config-form"><label for="site-url-input">Adresse du site public</label><input class="sheet-input" name="siteurl" id="site-url-input" type="url" value="${esc(currentSite())}" placeholder="https://votre-domaine.cd/public/" autocomplete="off"/>
  <button type="submit" class="primary-button">Enregistrer et synchroniser <span>↗</span></button></form><p>Pour les tests locaux, utilise l'URL accessible depuis ton téléphone sur le réseau, de préférence en HTTPS via un tunnel de développement. <b>localhost</b> sur le téléphone ne pointe pas vers ton PC.</p>`);
}
async function loadData(){
  const root=currentSite(),btn=$('#refresh-data');
  if(!root){connected=false;data=cloneBase();render();return;}
  btn.classList.add('refresh-spinning');
  try{
    const response=await fetch(new URL('api/mobile.php',root),{method:'GET',headers:{Accept:'application/json'},cache:'no-store',signal:AbortSignal.timeout(12000)});
    if(!response.ok) throw new Error('HTTP '+response.status);
    const result=await response.json();
    if(!result.ok || !result.data) throw new Error('Réponse de serveur invalide');
    data={...cloneBase(),...result.data};
    data.company={...baseData.company,...result.data.company};
    data.services=Array.isArray(result.data.services)?result.data.services:fallbackServices;
    data.platforms=Array.isArray(result.data.platforms)?result.data.platforms:fallbackPlatforms;
    data.articles=Array.isArray(result.data.articles)?result.data.articles:[];
    data.projects=Array.isArray(result.data.projects)?result.data.projects:[];
    connected=Boolean(result.database_connected);
    if(!connected)showToast('Serveur accessible, base MySQL indisponible.');
  }catch(e){connected=false;data=cloneBase();showToast('Connexion impossible. Mode démonstration.');}
  finally{btn.classList.remove('refresh-spinning');render();}
}
async function submitContact(form){
  const status=$('#form-status');
  if(!form.reportValidity())return;
  if(!currentSite()||!connected){status.textContent='Connecte d’abord le serveur PHP/MySQL pour envoyer ce message.';showToast('Envoi indisponible hors connexion.');return;}
  const body=Object.fromEntries(new FormData(form));
  const btn=$('#send-message');btn.disabled=true;status.textContent='Envoi en cours…';
  try{
    const r=await fetch(new URL('api/mobile.php',currentSite()),{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
    const result=await r.json().catch(()=>({ok:false,message:'Réponse invalide du serveur.'}));
    if(!r.ok||!result.ok)throw new Error(result.message||'Envoi impossible.');
    form.reset();status.textContent='Message envoyé. Merci !';showToast('Message transmis à AFRICA CONSULTING GROUP SARL.');
  }catch(e){status.textContent=e.message||'Échec de l’envoi. Réessaie plus tard.';showToast('Message non transmis.');}
  finally{btn.disabled=false;}
}
async function openExternal(url) {
  const safe=safeExternal(url);
  if(!safe){showToast('Lien HTTPS non configuré.');return;}
  try{ if(typeof window.africaOpenExternal==='function') await window.africaOpenExternal(safe);else window.open(safe,'_blank','noopener,noreferrer'); }
  catch{showToast('Impossible d’ouvrir ce lien.');}
}
function showArticle(i){const a=data.articles[i];if(!a)return;
  const safeBody=esc(a.body||a.excerpt).replace(/\n/g,'<br>');
  openSheet(`<h2>${esc(a.title)}</h2><p>${safeBody}</p>`);
}
// Les services sont dynamiques : utiliser les identifiants renvoyés par l'API,
// sans liens codés en dur ni changement du serveur PHP/MySQL.
function findService(id) {
  return data.services.find((s) => String(s.id) === String(id));
}
function showService(id) {
  const service = findService(id);
  if (!service) { showToast('Ce service n’est plus disponible.'); return; }
  openSheet(`<span class="service-sheet-tag">NOTRE EXPERTISE</span>
    <h2>${esc(service.title)}</h2>
    <p>${esc(service.description)}</p>
    <p>Pour connaître les modalités de cet accompagnement, envoyez-nous votre demande directement depuis l’application.</p>
    <button type="button" class="primary-button service-sheet-request" data-service-contact="${esc(service.id)}">Demander un accompagnement <span>↗</span></button>
    <button type="button" class="sheet-row" data-go="services">Voir tous les services <span>↗</span></button>`);
}
function requestService(id) {
  const service = findService(id);
  if (!service) return;
  go('contact');
  const subject = $('#contact-form [name="subject"]');
  if (subject) subject.value = `Demande de renseignements : ${service.title}`.slice(0, 190);
  $('#contact-form [name="message"]')?.focus();
}
document.addEventListener('click',(e)=>{
  const b=e.target.closest('[data-service-contact],[data-service],[data-go],[data-article],[data-external],[data-config]');
  if(!b)return;
  if('serviceContact' in b.dataset){requestService(b.dataset.serviceContact);return;}
  if('service' in b.dataset){showService(b.dataset.service);return;}
  if(b.dataset.go){go(b.dataset.go);return;}
  if('article' in b.dataset){showArticle(Number(b.dataset.article));return;}
  if(b.dataset.external){openExternal(b.dataset.external);return;}
  if(b.dataset.config)configSheet();
});
$('#search-services').addEventListener('input',e=>drawServiceList(e.target.value));
$('#refresh-data').addEventListener('click',()=>loadData());
$('#open-more').addEventListener('click',moreSheet);
$('#connection-config').addEventListener('click',configSheet);
$('#close-overlay').addEventListener('click',closeSheet);
$('#overlay').addEventListener('click',e=>{if(e.target.id==='overlay')closeSheet();});
$('#contact-form').addEventListener('submit',(e)=>{e.preventDefault();submitContact(e.currentTarget)});
document.addEventListener('submit',(e)=>{
  if(e.target.id!=='site-config-form')return;
  e.preventDefault();
  const raw=e.target.elements.siteurl.value.trim();
  if(!raw){localStorage.removeItem('cc_site_url');closeSheet();loadData();return;}
  try{
    const u=new URL(raw);
    if(u.username||u.password||(u.protocol!=='https:'&&!(u.protocol==='http:'&&isLocal(u))))throw new Error();
    u.search='';u.hash='';
    localStorage.setItem('cc_site_url',u.toString().replace(/\/*$/,'/'));
    closeSheet();loadData();
  }catch {showToast('Utilise une URL HTTPS valide (HTTP local réservé aux tests).');}
});
render();
loadData();
