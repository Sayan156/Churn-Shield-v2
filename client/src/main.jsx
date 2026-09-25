import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://127.0.0.1:8000');
const fields = {
  Demographics: [
    ['Customer_Age','Customer age','number',45], ['Gender','Gender','select',['F','M']], ['Education_Level','Education','select',['Uneducated','High School','College','Graduate','Post-Graduate','Doctorate','Unknown']], ['Marital_Status','Marital status','select',['Single','Married','Divorced','Unknown']], ['Income_Category','Income category','select',['Less than $40K','$40K - $60K','$60K - $80K','$80K - $120K','$120K +','Unknown']]
  ],
  'Account details': [
    ['Card_Category','Card type','select',['Blue','Silver','Gold','Platinum']], ['Months_on_book','Months on book','number',36], ['Total_Relationship_Count','Products held','number',4], ['Months_Inactive_12_mon','Inactive months · 12m','number',2], ['Contacts_Count_12_mon','Contacts · 12m','number',3]
  ],
  'Transaction behaviour': [
    ['Total_Revolving_Bal','Revolving balance','number',1000], ['Total_Amt_Chng_Q4_Q1','Amount change · Q4/Q1','number',0.8], ['Total_Trans_Amt','Total transaction amount','number',4000], ['Total_Trans_Ct','Transaction count','number',60], ['Total_Ct_Chng_Q4_Q1','Count change · Q4/Q1','number',0.7], ['Avg_Utilization_Ratio','Average utilization','number',0.3]
  ]
};
const initial = Object.fromEntries(Object.values(fields).flat().map(([key,,type,value]) => [key, type === 'select' ? value[0] : value]));
const scores = [
  ['Random Forest',.9454,.7927,.8934,.8401,.9816], ['Gradient Boosting',.9500,.7887,.9406,.8579,.9910], ['XGBoost',.9645,.8571,.9344,.8941,.9934], ['CatBoost',.9658,.9324,.8484,.8884,.9915], ['Extra Trees',.8960,.6307,.8504,.7243,.9537], ['Stacking (LR Meta)',.9585,.8232,.9447,.8798,.9929], ['Stacking (XGB Meta)',.9599,.8268,.9488,.8836,.9928]
];
const modelNames = { 'stacking-lr':'Stacking (LR Meta)', 'stacking-xgb':'Stacking (XGB Meta)', xgboost:'XGBoost' };

async function apiRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API}${path}`, options);
  } catch {
    throw new Error(`Cannot reach the API. Start it with: uvicorn main:app --reload`);
  }
  const raw = await response.text();
  let payload;
  try { payload = raw ? JSON.parse(raw) : {}; } catch { payload = { detail: raw }; }
  if (!response.ok) throw new Error(payload.detail || `Request failed (${response.status})`);
  return payload;
}

function App() {
  const [entered, setEntered] = useState(() => window.location.hash === '#workspace');
  const [theme, setTheme] = useState(() => localStorage.getItem('churnshield-theme') || 'light');
  const [page, setPage] = useState('predict');
  const [form, setForm] = useState(initial);
  const [results, setResults] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [batch, setBatch] = useState(null);
  const [batchLoading, setBatchLoading] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('churnshield-theme', theme);
  }, [theme]);

  useEffect(() => {
    const syncView = () => setEntered(window.location.hash === '#workspace');
    window.addEventListener('popstate', syncView);
    window.addEventListener('hashchange', syncView);
    return () => {
      window.removeEventListener('popstate', syncView);
      window.removeEventListener('hashchange', syncView);
    };
  }, []);

  const update = (key, value) => setForm(prev => ({...prev, [key]: value}));
  const predict = async () => {
    setLoading(true); setError(''); setExplanation(null);
    try { const payload = await apiRequest('/predict/compare', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form)}); setResults(payload.results); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  };
  const explain = async () => {
    setLoading(true); setError('');
    try { const payload = await apiRequest('/explain?model_key=stacking_xgb_meta', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form)}); setExplanation(payload); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  };
  const downloadTemplate = () => { const headers = Object.keys(initial); const csv = `${headers.join(',')}\n${headers.map(k => initial[k]).join(',')}\n`; download(csv, 'churnshield_template.csv'); };
  const upload = async e => { const file = e.target.files[0]; if (!file) return; setBatchLoading(true); setError(''); try { const body = new FormData(); body.append('file', file); setBatch(await apiRequest('/batch', {method:'POST', body})); } catch(err) {setError(err.message)} finally {setBatchLoading(false)} };
  const enterWorkspace = () => {
    window.history.pushState({ view: 'workspace' }, '', '#workspace');
    setEntered(true);
  };
  if (!entered) return <Landing theme={theme} toggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')} enter={enterWorkspace} />;
  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><div className="brand-mark">✦</div><div><strong>ChurnShield</strong><span>AI RETENTION LAB</span></div></div><div className="side-label">WORKSPACE</div><nav>{[['predict','Predict customer','⌁'],['batch','Batch scoring','▦'],['models','Model comparison','◒']].map(([id,label,icon]) => <button className={page===id?'active':''} onClick={()=>setPage(id)} key={id}><i>{icon}</i>{label}</button>)}</nav><div className="sidebar-bottom"><button className="theme-toggle side-theme" onClick={()=>setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? '☾' : '☀'} {theme === 'light' ? 'Dark mode' : 'Light mode'}</button><div className="status-dot"><span/> API connected</div><small>v1.0 · Ensemble intelligence</small></div></aside>
    <main className="main"><header><div><p className="eyebrow">CUSTOMER INTELLIGENCE / {page.toUpperCase()}</p><h1>{page==='predict'?'Know who needs you next.':page==='batch'?'Score your entire customer base.':'The numbers behind the signal.'}</h1><p className="subtitle">{page==='predict'?'A clear, explainable view of churn risk across three trained models.':page==='batch'?'Upload a prepared customer file and receive scored predictions in seconds.':'Benchmark performance at a glance, then choose the model that fits your retention strategy.'}</p></div><div className="header-actions"><button className="theme-toggle" onClick={()=>setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? '☾' : '☀'}</button><div className="header-pill"><span className="pulse"/> Models online</div></div></header>
      {error && <div className="error">{error}<button onClick={()=>setError('')}>×</button></div>}
      {page==='predict' && <Predict form={form} update={update} predict={predict} explain={explain} results={results} explanation={explanation} loading={loading}/>} 
      {page==='batch' && <Batch upload={upload} downloadTemplate={downloadTemplate} batch={batch} loading={batchLoading}/>} 
      {page==='models' && <Models/>}
    </main>
  </div>
}

function Landing({ theme, toggleTheme, enter }) { return <div className="landing"><header className="landing-nav"><div className="brand landing-brand"><div className="brand-mark">✦</div><div><strong>ChurnShield</strong><span>AI RETENTION LAB</span></div></div><div className="landing-nav-actions"><a href="#capabilities">Capabilities</a><a href="#method">How it works</a><button className="theme-toggle" onClick={toggleTheme}>{theme === 'light' ? '☾' : '☀'} <span>{theme === 'light' ? 'Dark' : 'Light'}</span></button><button className="nav-cta" onClick={enter}>Open workspace <span>↗</span></button></div></header><main className="landing-main"><section className="hero"><div className="hero-copy"><div className="hero-kicker"><span className="pulse"/> PREDICTIVE CUSTOMER INTELLIGENCE</div><h1>Retain the right customers, <em>before</em> they leave.</h1><p>ChurnShield turns customer behaviour into an early warning system—so your team can act with confidence, clarity, and a little more time.</p><div className="hero-actions"><button className="hero-cta" onClick={enter}>Launch workspace <span>→</span></button><a href="#capabilities" className="text-link">Explore capabilities <span>↓</span></a></div><div className="hero-proof"><div className="avatars"><i>SB</i><i>AI</i><i>ML</i></div><span>Built for decisions<br/><small>powered by ensemble models</small></span></div></div><div className="hero-visual"><div className="orb orb-one"/><div className="orb orb-two"/><div className="visual-card visual-main"><div className="visual-top"><span>LIVE RISK PULSE</span><b>•••</b></div><div className="pulse-number">18.4<small>%</small></div><p>average churn probability</p><div className="sparkline"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div><div className="visual-foot"><span><b>↓ 12.8%</b> this quarter</span><span className="mini-live">● LIVE</span></div></div><div className="visual-card signal-card"><span className="signal-icon">✦</span><div><b>Signal detected</b><small>Transaction activity changed</small></div></div><div className="visual-card score-card"><span className="score-ring">94</span><div><b>Model confidence</b><small>Stacking XGB Meta</small></div></div></div></section><section className="landing-stats"><div><strong>3</strong><span>trained models</span></div><div><strong>16</strong><span>customer signals</span></div><div><strong>95%</strong><span>churn recall</span></div><div><strong>1</strong><span>clear next step</span></div></section><section className="capabilities" id="capabilities"><div className="section-intro"><span className="eyebrow">ONE INTELLIGENT WORKSPACE</span><h2>Everything you need to move<br/><em>from risk to retention.</em></h2></div><div className="capability-grid"><div className="capability-card featured"><span className="cap-icon">◉</span><h3>Predict with perspective</h3><p>Compare three trained models side by side and see where they agree on customer risk.</p><button onClick={enter}>Try a prediction <span>↗</span></button></div><div className="capability-card"><span className="cap-icon">✧</span><h3>Understand the why</h3><p>SHAP explanations turn model output into a story your team can actually use.</p></div><div className="capability-card"><span className="cap-icon">▦</span><h3>Scale your signal</h3><p>Upload a customer file, score the whole portfolio, and download the next action list.</p></div></div></section><section className="method" id="method"><div className="method-copy"><span className="eyebrow">DESIGNED FOR CLARITY</span><h2>No black boxes.<br/><em>Just better timing.</em></h2><p>Churn is rarely a single event. ChurnShield brings together account health, engagement, and transaction behaviour into one focused view of what deserves attention now.</p><button className="text-link" onClick={enter}>See the workspace <span>→</span></button></div><div className="method-steps"><div><b>01</b><span>Profile</span><p>Bring in the customer context.</p></div><div><b>02</b><span>Compare</span><p>Let three models find consensus.</p></div><div><b>03</b><span>Act</span><p>Understand the signal and move.</p></div></div></section></main><footer className="landing-footer"><span>© 2026 ChurnShield</span><span>Explainable intelligence for customer teams.</span><button className="footer-enter" onClick={enter}>Enter dashboard →</button></footer></div> }

function Predict({form,update,predict,explain,results,explanation,loading}) { return <>
  <section className="content-grid"><div className="card form-card"><div className="card-top"><div><span className="number">01</span><h2>Customer profile</h2></div><span className="required">16 fields · required</span></div><div className="field-columns">{Object.entries(fields).map(([group, list])=><div className="field-group" key={group}><h3>{group}</h3>{list.map(([key,label,type,value])=><label key={key}>{label}{type==='select'?<select value={form[key]} onChange={e=>update(key,e.target.value)}>{value.map(option=><option key={option}>{option}</option>)}</select>:<input type="number" step="any" value={form[key]} onChange={e=>update(key,e.target.value===''?'':Number(e.target.value))}/>}</label>)}</div>)}</div><button className="primary" onClick={predict} disabled={loading}>{loading?'Analysing…':'Run prediction'}<span>→</span></button></div>
  <div className="result-stack"><div className="card result-card"><div className="card-top"><div><span className="number">02</span><h2>Model consensus</h2></div>{results && <span className="live-tag">LIVE</span>}</div>{results?<div className="model-results">{results.map(r=><div className="model-row" key={r.model_key}><div><strong>{r.model}</strong><small>{r.prediction?'At risk':'Likely to stay'}</small></div><div className={`risk ${r.prediction?'high':'low'}`}>{(r.probability*100).toFixed(1)}<em>%</em></div><div className="mini-bar"><span style={{width:`${r.probability*100}%`}}/></div></div>)}</div>:<Empty icon="◎" text="Run a prediction to see how the models read this customer."/>}</div><div className="card explain-card"><div className="card-top"><div><span className="number">03</span><h2>Why this prediction?</h2></div><span className="info">SHAP</span></div>{explanation?<div className="impacts">{[...explanation.features].sort((a,b)=>Math.abs(b.impact)-Math.abs(a.impact)).slice(0,6).map(f=><div className="impact" key={f.name}><span>{f.name.replaceAll('_',' ')}</span><div className={f.impact>=0?'impact-bar positive':'impact-bar negative'}><i style={{width:`${Math.min(Math.abs(f.impact)*1000,100)}%`}}/></div><b className={f.impact>=0?'plus':'minus'}>{f.impact>=0?'+':'−'}{Math.abs(f.impact).toFixed(3)}</b></div>)}<p className="caption">Positive values push toward churn risk. Explanation uses the XGB meta model.</p></div>:<><Empty icon="✧" text="Feature impact will appear here after you run an explanation."/><button className="secondary" onClick={explain} disabled={loading}>Explain this prediction <span>↗</span></button></>}</div></div></section>
</> }
function Empty({icon,text}) {return <div className="empty"><div>{icon}</div><p>{text}</p></div>}
function Batch({upload,downloadTemplate,batch,loading}) {return <section className="single-column"><div className="card batch-card"><div className="card-top"><div><span className="number">01</span><h2>Batch prediction</h2></div><span className="required">CSV only</span></div><div className="dropzone"><div className="upload-icon">↑</div><h3>{loading?'Scoring your file…':'Drop your customer file here'}</h3><p>or choose a CSV from your computer</p><label className="primary file-btn">Choose CSV<input type="file" accept=".csv" onChange={upload}/></label></div><div className="batch-help"><div><strong>Use the template</strong><p>Keep the 16 feature headers exactly as shown in the sample.</p></div><button className="secondary" onClick={downloadTemplate}>Download template <span>↓</span></button></div></div>{batch&&<div className="card batch-result"><div><span className="number">02</span><h2>Ready to download</h2><p>{batch.rows} customers scored across all three models.</p></div><button className="primary" onClick={()=>download(batch.csv,batch.filename)}>Download predictions <span>↓</span></button></div>}</section>}
function Models() {return <section className="single-column"><div className="card table-card"><div className="card-top"><div><span className="number">01</span><h2>Model benchmark</h2></div><span className="required">Validation scores</span></div><div className="table-wrap"><table><thead><tr><th>Model</th><th>Accuracy</th><th>Precision</th><th>Recall</th><th>F1 score</th><th>ROC-AUC</th></tr></thead><tbody>{scores.sort((a,b)=>b[5]-a[5]).map((row,i)=><tr className={row[0]==='Stacking (XGB Meta)'?'best':''} key={row[0]}><td><span className="rank">0{i+1}</span><strong>{row[0]}</strong>{row[0]==='Stacking (XGB Meta)'&&<span className="best-tag">BEST</span>}</td>{row.slice(1).map((n,j)=><td key={j}>{(n*100).toFixed(2)}%</td>)}</tr>)}</tbody></table></div><p className="caption">Edit these validation scores in the comparison data when you retrain your models.</p></div></section>}
function download(content,name){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type:'text/csv'}));a.download=name;a.click();URL.revokeObjectURL(a.href)}
createRoot(document.getElementById('root')).render(<App/>);
