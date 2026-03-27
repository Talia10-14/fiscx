import { useState, useEffect, useRef } from "react";

// ── Design tokens ─────────────────────────────────────────────
const C = {
  green:"#006B3F", green2:"#005232", green3:"#00A35E",
  gold:"#FCD116",  gold2:"#E6BC00",  red:"#C8102E",
  navy:"#0D2D6B",  off:"#F7F8F5",    gray1:"#F0F2EE",
  gray2:"#D8DDD4", gray3:"#9AA394",  gray4:"#5A6357",
  dark:"#111A13",  text:"#1A2318",   textm:"#4A5548",
  white:"#FFFFFF",
};

// ── Shared UI ─────────────────────────────────────────────────
const ShieldLogo = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={C.white}>
    <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z"/>
  </svg>
);

const Logo = () => (
  <a href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
    <div style={{
      width:38, height:38, borderRadius:10,
      background:"rgba(255,255,255,.15)", border:"1.5px solid rgba(255,255,255,.3)",
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>
      <ShieldLogo />
    </div>
    <span style={{ fontSize:"1.4rem", fontWeight:700, color:C.white, letterSpacing:"-.02em" }}>FiscX</span>
  </a>
);

const SubmitBtn = ({ children, loading, disabled, onClick, style:s = {} }) => (
  <button onClick={onClick} disabled={disabled || loading}
    style={{
      width:"100%", padding:14, borderRadius:12, border:"none",
      background: disabled||loading ? C.gray3 : C.green,
      color:C.white, fontFamily:"'Sora',sans-serif", fontSize:"1rem",
      fontWeight:600, cursor: disabled||loading ? "not-allowed" : "pointer",
      transition:"all .2s", display:"flex", alignItems:"center", justifyContent:"center", gap:8,
      ...s,
    }}
    onMouseEnter={e=>{ if(!disabled&&!loading) e.currentTarget.style.background=C.green2; }}
    onMouseLeave={e=>{ if(!disabled&&!loading) e.currentTarget.style.background=disabled?C.gray3:C.green; }}>
    {loading ? "…" : children}
  </button>
);

const GhostBtn = ({ children, onClick }) => (
  <button onClick={onClick} style={{
    width:"100%", padding:13, borderRadius:12,
    border:`1.5px solid ${C.gray2}`, background:"transparent",
    color:C.text, fontFamily:"'Sora',sans-serif", fontSize:".9rem",
    fontWeight:500, cursor:"pointer", transition:"all .2s", marginTop:10,
  }}
  onMouseEnter={e=>{e.currentTarget.style.borderColor=C.green;e.currentTarget.style.color=C.green;}}
  onMouseLeave={e=>{e.currentTarget.style.borderColor=C.gray2;e.currentTarget.style.color=C.text;}}>
    {children}
  </button>
);

const FormInput = ({ label, required, hint, children, style:s={} }) => (
  <div style={{ marginBottom:20, ...s }}>
    {label && (
      <label style={{ display:"block", fontSize:".8rem", fontWeight:600, color:C.text, marginBottom:7 }}>
        {label} {required && <span style={{ color:C.red }}>*</span>}
      </label>
    )}
    {children}
    {hint && <div style={{ fontSize:".75rem", color:C.gray3, marginTop:6 }}>{hint}</div>}
  </div>
);

const TextInput = ({ placeholder, type="text", value, onChange, onFocus, onBlur, style:s={}, ...rest }) => {
  const [focused, setFocused] = useState(false);
  return (
    <input type={type} placeholder={placeholder} value={value} onChange={onChange}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{
        width:"100%", padding:"12px 16px",
        border:`1.5px solid ${focused ? C.green : C.gray2}`,
        borderRadius:10, fontFamily:"'Sora',sans-serif", fontSize:".9rem",
        color:C.text, background:C.white,
        outline:"none", transition:"border-color .2s, box-shadow .2s",
        boxShadow: focused ? `0 0 0 3px rgba(0,107,63,.1)` : "none",
        ...s,
      }}
      {...rest}
    />
  );
};

const SelectInput = ({ value, onChange, children }) => {
  const [focused, setFocused] = useState(false);
  return (
    <select value={value} onChange={onChange}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{
        width:"100%", padding:"12px 16px",
        border:`1.5px solid ${focused ? C.green : C.gray2}`,
        borderRadius:10, fontFamily:"'Sora',sans-serif", fontSize:".9rem",
        color:C.text, background:C.white, outline:"none", cursor:"pointer",
        appearance:"none", transition:"border-color .2s",
        boxShadow: focused ? `0 0 0 3px rgba(0,107,63,.1)` : "none",
      }}>
      {children}
    </select>
  );
};

const Alert = ({ type = "success", children }) => (
  <div style={{
    padding:"12px 16px", borderRadius:10, fontSize:".85rem",
    marginBottom:20, display:"flex", alignItems:"flex-start", gap:10,
    background: type==="success" ? "#F0FAF5" : "#FFF0F0",
    border: `1px solid ${type==="success" ? "#b6dfc8" : "#f5b8bc"}`,
    color: type==="success" ? "#1a6b3a" : "#a31c1c",
  }}>
    <span>{type==="success"?"✓":"⚠"}</span>
    <span>{children}</span>
  </div>
);

// ── AUTH LAYOUT SHELL ─────────────────────────────────────────
const AuthLayout = ({ left, right }) => (
  <div style={{
    display:"grid", gridTemplateColumns:"1fr 1fr",
    minHeight:"100vh", fontFamily:"'Sora',sans-serif",
  }}>
    {left}
    <div style={{
      background:C.off, display:"flex", alignItems:"center",
      justifyContent:"center", padding:"48px 40px",
    }}>
      <div style={{ width:"100%", maxWidth:420 }}>{right}</div>
    </div>
  </div>
);

const AuthLeft = ({ tag, title, titleAccent, subtitle, stats, bottom }) => (
  <div style={{
    background:C.green, padding:"60px 48px",
    display:"flex", flexDirection:"column", justifyContent:"space-between",
    position:"relative", overflow:"hidden",
  }}>
    <div style={{ position:"absolute", top:-120, right:-120, width:400, height:400, borderRadius:"50%", background:"rgba(255,255,255,.04)" }}/>
    <div style={{ position:"absolute", bottom:-80, left:-80, width:280, height:280, borderRadius:"50%", background:"rgba(255,255,255,.04)" }}/>
    <div style={{ position:"relative", zIndex:1 }}><Logo /></div>
    <div style={{ position:"relative", zIndex:1 }}>
      <div style={{
        display:"inline-flex", alignItems:"center", gap:6,
        background:"rgba(255,255,255,.12)", color:C.gold,
        padding:"5px 14px", borderRadius:100,
        fontSize:".72rem", fontWeight:600, letterSpacing:".06em", textTransform:"uppercase",
        marginBottom:24,
      }}>
        <span style={{ width:5, height:5, background:C.gold, borderRadius:"50%" }}/>
        {tag}
      </div>
      <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:"2.4rem", color:C.white, lineHeight:1.15, marginBottom:16 }}>
        {title}<br/>
        <span style={{ color:C.gold }}>{titleAccent}</span>
      </div>
      <p style={{ fontSize:".95rem", color:"rgba(255,255,255,.7)", lineHeight:1.7, marginBottom:32 }}>{subtitle}</p>
      {stats && (
        <div style={{ display:"flex", gap:20 }}>
          {stats.map(([num, label]) => (
            <div key={label} style={{ background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.12)", borderRadius:12, padding:"14px 18px" }}>
              <div style={{ fontSize:"1.5rem", fontWeight:700, color:C.white, fontFamily:"'JetBrains Mono',monospace", lineHeight:1 }}>{num}</div>
              <div style={{ fontSize:".7rem", color:"rgba(255,255,255,.5)", marginTop:3 }}>{label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
    <div style={{ position:"relative", zIndex:1 }}>{bottom}</div>
  </div>
);

// ── PIN KEYPAD ────────────────────────────────────────────────
const PinDots = ({ value, shaking }) => (
  <div style={{
    display:"flex", gap:10, justifyContent:"center", margin:"16px 0",
    animation: shaking ? "shake .35s ease" : "none",
  }}>
    {[0,1,2,3,4,5].map(i => (
      <div key={i} style={{
        width:48, height:56, border:`1.5px solid ${i < value.length ? C.green : C.gray2}`,
        borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:"1.8rem", color:C.green,
        background: i < value.length ? "#F0FAF5" : C.white,
        transition:"all .2s",
      }}>
        {i < value.length ? "●" : "○"}
      </div>
    ))}
  </div>
);

const Keypad = ({ onPress }) => (
  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, maxWidth:240, margin:"0 auto" }}>
    {["1","2","3","4","5","6","7","8","9","👆","0","⌫"].map(k => (
      <button key={k} onClick={() => onPress(k==="⌫"?"del":k==="👆"?"bio":k)}
        style={{
          padding:14, fontSize: k==="👆"?".85rem":"1.1rem", fontWeight:600,
          borderRadius:10, border:`1.5px solid ${C.gray2}`, background:C.white,
          color: k==="👆" ? C.gray3 : C.text,
          cursor:"pointer", fontFamily:"'Sora',sans-serif", transition:"all .2s",
        }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor=C.green;e.currentTarget.style.color=C.green;}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor=C.gray2;e.currentTarget.style.color=k==="👆"?C.gray3:C.text;}}>
        {k}
      </button>
    ))}
  </div>
);

// ════════════════════════════════════════════════════════════════
// LOGIN PAGE
// ════════════════════════════════════════════════════════════════
export function LoginPage({ onSwitch }) {
  const [phone, setPhone] = useState("");
  const [pin, setPin]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [shaking, setShaking]   = useState(false);

  const canSubmit = phone.replace(/\s/g,"").length >= 8 && pin.length === 6;

  function handleKey(k) {
    setError("");
    if (k === "del") setPin(p => p.slice(0,-1));
    else if (k === "bio") alert("Biométrie — intégration flutter_local_auth sur mobile.");
    else if (pin.length < 6) setPin(p => p + k);
  }

  async function handleLogin() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    // Simulate error — replace with real API call
    setError("Numéro ou PIN incorrect. Essais restants : 2/3.");
    setShaking(true);
    setTimeout(() => setShaking(false), 400);
    setPin("");
    setLoading(false);
  }

  const miniPhoneData = [
    { name:"Pagnes ankara ×5", amt:"+7 500", pos:true },
    { name:"Réapprovisionnement", amt:"-12 000", pos:false },
  ];

  return (
    <AuthLayout
      left={
        <AuthLeft
          tag="Bénin · DGI Certifié"
          title="Votre comptabilité"
          titleAccent="certifiée vous attend"
          subtitle="Reconnectez-vous pour consulter vos ventes, votre bilan et votre score de crédit."
          stats={[["782","Score moyen"],["1.2M","FCFA / mois"]]}
          bottom={
            <div>
              {/* Mini phone mockup */}
              <div style={{ width:160, background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.12)", borderRadius:24, padding:10, margin:"0 auto 24px" }}>
                <div style={{ background:"rgba(255,255,255,.06)", borderRadius:16, padding:"14px 10px", display:"flex", flexDirection:"column", gap:8 }}>
                  {miniPhoneData.map(tx => (
                    <div key={tx.name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"rgba(255,255,255,.06)", borderRadius:8, padding:"7px 8px" }}>
                      <span style={{ fontSize:".58rem", color:"rgba(255,255,255,.7)" }}>{tx.name}</span>
                      <span style={{ fontSize:".6rem", fontWeight:600, color:tx.pos?C.green3:C.red }}>{tx.amt}</span>
                    </div>
                  ))}
                  <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,.08)", borderRadius:8, padding:8 }}>
                    <span style={{ fontSize:"1rem", fontWeight:700, color:C.gold, fontFamily:"'JetBrains Mono',monospace" }}>782</span>
                    <div style={{ fontSize:".58rem", color:"rgba(255,255,255,.5)", lineHeight:1.4 }}>Score crédit<br/>Bon profil ✓</div>
                  </div>
                </div>
              </div>
              <div style={{ fontSize:".75rem", color:"rgba(255,255,255,.35)" }}>
                © 2026 FiscX · République du Bénin · fiscx.bj
              </div>
            </div>
          }
        />
      }
      right={
        <>
          <h1 style={{ fontSize:"1.7rem", fontWeight:700, color:C.dark, letterSpacing:"-.02em", marginBottom:6 }}>Bon retour</h1>
          <p style={{ fontSize:".9rem", color:C.gray3, marginBottom:32 }}>Entrez votre numéro et votre PIN pour accéder à votre compte FiscX.</p>

          {error && <Alert type="error">{error}</Alert>}

          <FormInput label="Numéro de téléphone" required>
            <div style={{ display:"flex", gap:8 }}>
              <div style={{
                display:"flex", alignItems:"center", gap:6,
                padding:"12px 14px", background:C.white,
                border:`1.5px solid ${C.gray2}`, borderRadius:10,
                fontSize:".85rem", fontWeight:600, whiteSpace:"nowrap",
              }}>
                🇧🇯 +229
              </div>
              <TextInput
                type="tel" placeholder="97 00 00 00"
                value={phone} onChange={e => setPhone(e.target.value)}
                style={{ flex:1 }}
                maxLength={10}
              />
            </div>
          </FormInput>

          <FormInput label="Code PIN" required>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 }}>
              <span/>
              <a href="/forgot-pin" style={{ fontSize:".78rem", color:C.green, textDecoration:"none" }}>PIN oublié ?</a>
            </div>
            <PinDots value={pin} shaking={shaking} />
            <Keypad onPress={handleKey} />
          </FormInput>

          <SubmitBtn onClick={handleLogin} loading={loading} disabled={!canSubmit} style={{ marginTop:8 }}>
            Se connecter
          </SubmitBtn>

          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"20px 0", color:C.gray3, fontSize:".78rem" }}>
            <div style={{ flex:1, height:1, background:C.gray2 }}/> ou <div style={{ flex:1, height:1, background:C.gray2 }}/>
          </div>

          <button
            onClick={() => alert("Biométrie — intégration flutter_local_auth sur mobile.")}
            style={{
              width:"100%", padding:12, borderRadius:10,
              border:`1.5px solid ${C.gray2}`, background:C.white,
              fontFamily:"'Sora',sans-serif", fontSize:".875rem", fontWeight:500,
              color:C.text, cursor:"pointer", display:"flex",
              alignItems:"center", justifyContent:"center", gap:10, transition:"all .2s",
            }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=C.gray3}
            onMouseLeave={e=>e.currentTarget.style.borderColor=C.gray2}>
            <span style={{ fontSize:"1.1rem" }}>👆</span> Se connecter avec l'empreinte digitale
          </button>

          <p style={{ textAlign:"center", marginTop:24, fontSize:".85rem", color:C.gray3 }}>
            Pas encore de compte ?{" "}
            <a href="#" onClick={e=>{e.preventDefault();onSwitch?.("signup");}}
              style={{ color:C.green, fontWeight:600, textDecoration:"none" }}>
              S'inscrire gratuitement →
            </a>
          </p>
        </>
      }
    />
  );
}

// ════════════════════════════════════════════════════════════════
// SIGNUP PAGE — 3 Steps
// ════════════════════════════════════════════════════════════════

// ── Step 1 — Phone ────────────────────────────────────────────
function SignupStep1({ onNext }) {
  const [phone, setPhone]   = useState("");
  const [operator, setOp]   = useState("mtn");
  const canNext = phone.replace(/\s/g,"").length >= 8;

  return (
    <>
      <h1 style={{ fontSize:"1.7rem", fontWeight:700, color:C.dark, letterSpacing:"-.02em", marginBottom:6 }}>Créer mon compte</h1>
      <p style={{ fontSize:".9rem", color:C.gray3, marginBottom:32 }}>Étape 1 sur 3 — Entrez votre numéro de téléphone béninois</p>

      <FormInput label="Numéro de téléphone" required hint="Numéro MTN ou Moov Money Bénin — un SMS de vérification sera envoyé.">
        <div style={{ display:"flex", gap:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, padding:"12px 14px", background:C.white, border:`1.5px solid ${C.gray2}`, borderRadius:10, fontSize:".85rem", fontWeight:600, whiteSpace:"nowrap" }}>
            🇧🇯 +229
          </div>
          <TextInput type="tel" placeholder="97 00 00 00" value={phone} onChange={e=>setPhone(e.target.value)} style={{flex:1}} maxLength={10}/>
        </div>
      </FormInput>

      <FormInput label="Opérateur">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {[["mtn","📱 MTN MoMo"],["moov","📱 Moov Money"]].map(([id,label]) => (
            <button key={id} onClick={()=>setOp(id)}
              style={{
                padding:"12px 10px", border:`1.5px solid ${operator===id?C.green:C.gray2}`,
                borderRadius:10, background: operator===id?"#F0FAF5":C.white,
                fontFamily:"'Sora',sans-serif", fontSize:".82rem", fontWeight:500,
                color: operator===id?C.green:C.textm, cursor:"pointer",
                display:"flex", alignItems:"center", gap:8, transition:"all .2s",
              }}>
              {label}
            </button>
          ))}
        </div>
      </FormInput>

      <SubmitBtn disabled={!canNext} onClick={() => onNext({ phone, operator })}>
        Recevoir le code SMS →
      </SubmitBtn>

      <div style={{ display:"flex", alignItems:"center", gap:12, margin:"20px 0", color:C.gray3, fontSize:".78rem" }}>
        <div style={{flex:1,height:1,background:C.gray2}}/> déjà inscrit ? <div style={{flex:1,height:1,background:C.gray2}}/>
      </div>
      <p style={{ textAlign:"center", fontSize:".85rem", color:C.gray3 }}>
        <a href="/login" style={{ color:C.green, fontWeight:600, textDecoration:"none" }}>← Se connecter</a>
      </p>
    </>
  );
}

// ── OTP INPUTS ────────────────────────────────────────────────
function OtpInputs({ value, onChange }) {
  const refs = useRef([]);
  const digits = value.split("");
  function handleInput(i, v) {
    const c = v.replace(/\D/g,"").slice(-1);
    const newDigits = [...digits];
    newDigits[i] = c;
    while(newDigits.length < 6) newDigits.push("");
    onChange(newDigits.join(""));
    if (c && i < 5) refs.current[i+1]?.focus();
  }
  function handleKey(e, i) {
    if (e.key==="Backspace" && !digits[i] && i>0) {
      const nd = [...digits]; nd[i-1]="";
      onChange(nd.join(""));
      refs.current[i-1]?.focus();
    }
  }
  return (
    <div style={{ display:"flex", gap:10, justifyContent:"center", margin:"24px 0" }}>
      {[0,1,2,3,4,5].map(i => (
        <input key={i} ref={el=>refs.current[i]=el}
          type="number" maxLength={1} value={digits[i]||""}
          onChange={e=>handleInput(i,e.target.value)}
          onKeyDown={e=>handleKey(e,i)}
          style={{
            width:48, height:56, border:`1.5px solid ${digits[i]?C.green:C.gray2}`,
            borderRadius:10, fontFamily:"'JetBrains Mono',monospace",
            fontSize:"1.4rem", fontWeight:700, textAlign:"center",
            color:C.green, background: digits[i]?"#F0FAF5":C.white,
            outline:"none", transition:"border-color .2s",
            MozAppearance:"textfield",
          }}
          onFocus={e=>{e.currentTarget.style.borderColor=C.green;e.currentTarget.style.boxShadow=`0 0 0 3px rgba(0,107,63,.1)`;}}
          onBlur={e=>{e.currentTarget.style.borderColor=digits[i]?C.green:C.gray2;e.currentTarget.style.boxShadow="none";}}
        />
      ))}
    </div>
  );
}

// ── Step 2 — OTP ──────────────────────────────────────────────
function SignupStep2({ phone, onNext, onBack }) {
  const [otp, setOtp]     = useState("");
  const [secs, setSecs]   = useState(59);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    setSecs(59); setExpired(false);
    const t = setInterval(()=>{
      setSecs(s => {
        if(s<=1) { clearInterval(t); setExpired(true); return 0; }
        return s-1;
      });
    },1000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <h1 style={{ fontSize:"1.7rem", fontWeight:700, color:C.dark, letterSpacing:"-.02em", marginBottom:6 }}>Code de vérification</h1>
      <p style={{ fontSize:".9rem", color:C.gray3, marginBottom:24 }}>
        Étape 2 sur 3 — Code à 6 chiffres envoyé au +229 {phone}
      </p>
      <Alert type="success">Code envoyé par SMS sur votre numéro MTN/Moov.</Alert>
      <OtpInputs value={otp} onChange={setOtp} />
      <div style={{ textAlign:"center", fontSize:".82rem", color:C.gray3, marginTop:12 }}>
        {!expired ? (
          <>Renvoyer le code dans <strong style={{ color:C.green }}>0:{secs<10?"0":""}{secs}</strong></>
        ) : (
          <button onClick={() => { setSecs(59); setExpired(false); }}
            style={{ background:"none", border:"none", color:C.green, fontWeight:600, cursor:"pointer", fontFamily:"'Sora',sans-serif", fontSize:".82rem" }}>
            Renvoyer le code
          </button>
        )}
      </div>
      <SubmitBtn disabled={otp.length < 6} onClick={() => onNext({ otp })} style={{ marginTop:20 }}>
        Vérifier le code →
      </SubmitBtn>
      <GhostBtn onClick={onBack}>← Changer de numéro</GhostBtn>
    </>
  );
}

// ── Step 3 — Profile + PIN ────────────────────────────────────
function SignupStep3({ onSubmit }) {
  const [prenom, setPrenom]       = useState("");
  const [nom, setNom]             = useState("");
  const [activity, setActivity]   = useState("");
  const [langue, setLangue]       = useState("fr");
  const [pin, setPin]             = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [cgu, setCgu]             = useState(false);
  const [loading, setLoading]     = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const fileRef = useRef(null);

  const activities = ["Commerçant","Artisan","Prestataire","Agriculteur"];
  const pinStrength = () => {
    if(pin.length < 6) return null;
    if(/^(.)\1+$/.test(pin) || /^(012345|123456|234567|345678|456789|987654)/.test(pin)) return "weak";
    return "strong";
  };
  const pinsMatch = pin.length===6 && pin===pinConfirm;
  const canSubmit = prenom.length>1 && nom.length>1 && activity && pinsMatch && cgu;

  function handleAvatar(e) {
    const f = e.target.files[0];
    if(!f) return;
    const r = new FileReader();
    r.onload = ev => setAvatarUrl(ev.target.result);
    r.readAsDataURL(f);
  }

  async function handleSubmit() {
    setLoading(true);
    await new Promise(r => setTimeout(r,1500));
    onSubmit?.({ prenom, nom, activity, langue, pin });
    setLoading(false);
  }

  const strength = pinStrength();

  return (
    <>
      <h1 style={{ fontSize:"1.7rem", fontWeight:700, color:C.dark, letterSpacing:"-.02em", marginBottom:6 }}>Votre profil</h1>
      <p style={{ fontSize:".9rem", color:C.gray3, marginBottom:28 }}>Étape 3 sur 3 — Complétez vos informations et créez votre code PIN</p>

      {/* Avatar */}
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:24 }}>
        <div onClick={()=>fileRef.current?.click()}
          style={{
            width:72, height:72, borderRadius:"50%", cursor:"pointer",
            background: avatarUrl ? "transparent" : C.gray1,
            border:`2px dashed ${C.gray2}`,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.8rem",
            backgroundImage: avatarUrl?`url(${avatarUrl})`:"none",
            backgroundSize:"cover", backgroundPosition:"center",
            transition:"all .2s", flexShrink:0,
          }}
          onMouseEnter={e=>{if(!avatarUrl){e.currentTarget.style.borderColor=C.green;e.currentTarget.style.background="#F0FAF5";}}}
          onMouseLeave={e=>{if(!avatarUrl){e.currentTarget.style.borderColor=C.gray2;e.currentTarget.style.background=C.gray1;}}}>
          {!avatarUrl && "📷"}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleAvatar}/>
        <div>
          <div style={{ fontWeight:600, fontSize:".85rem", color:C.text, marginBottom:3 }}>Photo de profil</div>
          <div style={{ fontSize:".8rem", color:C.gray3, lineHeight:1.5 }}>Appuyez pour ajouter une photo (optionnel)</div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
        <FormInput label="Prénom" required style={{ margin:0 }}>
          <TextInput placeholder="Afi" value={prenom} onChange={e=>setPrenom(e.target.value)}/>
        </FormInput>
        <FormInput label="Nom" required style={{ margin:0 }}>
          <TextInput placeholder="Koudossou" value={nom} onChange={e=>setNom(e.target.value)}/>
        </FormInput>
      </div>

      <FormInput label="Type d'activité" required>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {activities.map(a => (
            <button key={a} onClick={()=>setActivity(a)}
              style={{
                padding:"12px 10px", border:`1.5px solid ${activity===a?C.green:C.gray2}`,
                borderRadius:10, background:activity===a?"#F0FAF5":C.white,
                fontFamily:"'Sora',sans-serif", fontSize:".82rem", fontWeight:500,
                color:activity===a?C.green:C.textm, cursor:"pointer",
                display:"flex", alignItems:"center", gap:8, transition:"all .2s",
              }}>
              {a}
            </button>
          ))}
        </div>
      </FormInput>

      <FormInput label="Langue préférée">
        <SelectInput value={langue} onChange={e=>setLangue(e.target.value)}>
          <option value="fr">🇫🇷 Français</option>
          <option value="en">🇬🇧 English</option>
          <option value="fon" disabled>Fon (bientôt disponible)</option>
          <option value="yo"  disabled>Yoruba (bientôt disponible)</option>
        </SelectInput>
      </FormInput>

      <FormInput label="Code PIN — 6 chiffres" required>
        <input type="password" maxLength={6} value={pin} onChange={e=>setPin(e.target.value)}
          placeholder="······"
          style={{
            width:"100%", padding:"10px 16px",
            border:`1.5px solid ${pin.length===6?(strength==="weak"?C.red:C.green):C.gray2}`,
            borderRadius:10, fontFamily:"'JetBrains Mono',monospace",
            fontSize:"1.4rem", textAlign:"center", letterSpacing:".5em",
            outline:"none", transition:"border-color .2s", color:C.green, background:C.white,
          }}
          onFocus={e=>{e.currentTarget.style.borderColor=C.green;e.currentTarget.style.boxShadow=`0 0 0 3px rgba(0,107,63,.1)`;}}
          onBlur={e=>{e.currentTarget.style.boxShadow="none";}}/>
        {pin.length>0 && (
          <>
            <div style={{ display:"flex", gap:4, marginTop:8 }}>
              {["weak","weak","strong"].map((lvl,i)=>(
                <div key={i} style={{
                  flex:1, height:3, borderRadius:2,
                  background: strength ? (i===0?"#C8102E":strength==="strong"&&i<=1?C.green:strength==="strong"&&i===2?C.green:C.gray2) : C.gray2,
                  transition:"background .3s",
                }}/>
              ))}
            </div>
            <div style={{ fontSize:".72rem", marginTop:4, color:strength==="weak"?C.red:C.green }}>
              {strength==="weak" ? "⚠ PIN trop simple (évitez 123456, 111111…)" : pin.length===6?"✓ PIN valide":""}
            </div>
          </>
        )}
      </FormInput>

      <FormInput label="Confirmer le PIN" required>
        <input type="password" maxLength={6} value={pinConfirm} onChange={e=>setPinConfirm(e.target.value)}
          placeholder="······"
          style={{
            width:"100%", padding:"10px 16px",
            border:`1.5px solid ${pinConfirm.length===6?(pinsMatch?C.green:C.red):C.gray2}`,
            borderRadius:10, fontFamily:"'JetBrains Mono',monospace",
            fontSize:"1.4rem", textAlign:"center", letterSpacing:".5em",
            outline:"none", transition:"border-color .2s", color:C.green, background:C.white,
          }}
          onFocus={e=>{e.currentTarget.style.borderColor=C.green;e.currentTarget.style.boxShadow=`0 0 0 3px rgba(0,107,63,.1)`;}}
          onBlur={e=>{e.currentTarget.style.boxShadow="none";}}/>
        {pinConfirm.length===6 && (
          <div style={{ fontSize:".75rem", marginTop:5, color:pinsMatch?C.green:C.red }}>
            {pinsMatch ? "✓ PINs identiques" : "✗ Les PINs ne correspondent pas"}
          </div>
        )}
      </FormInput>

      <div style={{ display:"flex", alignItems:"flex-start", gap:10, margin:"16px 0" }}>
        <input type="checkbox" id="cgu" checked={cgu} onChange={e=>setCgu(e.target.checked)}
          style={{ marginTop:2, accentColor:C.green, width:16, height:16, flexShrink:0, cursor:"pointer" }}/>
        <label htmlFor="cgu" style={{ fontSize:".82rem", color:C.textm, lineHeight:1.5, cursor:"pointer" }}>
          J'accepte les <a href="/cgu" style={{color:C.green,textDecoration:"none"}}>Conditions Générales d'Utilisation</a> et la{" "}
          <a href="/privacy" style={{color:C.green,textDecoration:"none"}}>Politique de confidentialité</a> de FiscX.
          Mes données sont protégées conformément à la{" "}
          <a href="/apdp" style={{color:C.green,textDecoration:"none"}}>loi n°2009-09 (APDP Bénin)</a>.
        </label>
      </div>

      <SubmitBtn disabled={!canSubmit} loading={loading} onClick={handleSubmit}>
        Créer mon compte FiscX 🎉
      </SubmitBtn>
    </>
  );
}

// ── Left step progress panel ──────────────────────────────────
const steps = [
  { num:1, label:"Téléphone",   sub:"Votre numéro Bénin" },
  { num:2, label:"Vérification",sub:"Code SMS OTP" },
  { num:3, label:"Profil & PIN",sub:"Votre compte sécurisé" },
];

function SignupLeftSteps({ current }) {
  return (
    <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", gap:12 }}>
      {steps.map(s => (
        <div key={s.num} style={{
          display:"flex", alignItems:"center", gap:12, padding:"12px 16px",
          borderRadius:12,
          background: s.num===current ? "rgba(255,255,255,.18)" : "rgba(255,255,255,.06)",
          border: `1px solid ${s.num===current ? "rgba(255,255,255,.3)" : "rgba(255,255,255,.08)"}`,
          opacity: s.num>current ? .5 : 1, transition:"all .4s",
        }}>
          <div style={{
            width:28, height:28, borderRadius:"50%",
            background: s.num<current ? C.green3 : s.num===current ? C.gold : "rgba(255,255,255,.15)",
            color: s.num===current ? C.dark : C.white,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:".75rem", fontWeight:700, flexShrink:0, transition:"all .3s",
          }}>
            {s.num<current ? "✓" : s.num}
          </div>
          <div>
            <div style={{ fontSize:".82rem", fontWeight:600, color:C.white }}>{s.label}</div>
            <div style={{ fontSize:".7rem", color:"rgba(255,255,255,.5)" }}>{s.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SignupPage({ onSwitch }) {
  const [step, setStep]     = useState(1);
  const [data, setData]     = useState({});
  const [done, setDone]     = useState(false);
  const progress            = { 1:33, 2:66, 3:100 }[step];

  function handleStep1(d) { setData(p=>({...p,...d})); setStep(2); }
  function handleStep2(d) { setData(p=>({...p,...d})); setStep(3); }
  function handleDone(d)  { setData(p=>({...p,...d})); setDone(true); }

  return (
    <AuthLayout
      left={
        <AuthLeft
          tag="Gratuit · Sans carte bancaire"
          title="Commencez à construire votre"
          titleAccent="dossier de crédit"
          subtitle="Rejoignez les commerçants béninois qui gèrent leur comptabilité avec FiscX — gratuitement jusqu'à 30 ventes par mois."
          stats={[["30s","Saisie vente"],["0 FCFA","Pour commencer"]]}
          bottom={
            <div>
              <SignupLeftSteps current={step}/>
              <div style={{ fontSize:".75rem", color:"rgba(255,255,255,.35)", marginTop:20 }}>
                © 2026 FiscX · République du Bénin · fiscx.bj
              </div>
            </div>
          }
        />
      }
      right={
        done ? (
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:"4rem", marginBottom:16 }}>🎉</div>
            <h2 style={{ fontSize:"1.6rem", fontWeight:700, color:C.green, marginBottom:8 }}>Compte créé !</h2>
            <p style={{ color:C.textm, marginBottom:28 }}>Bienvenue sur FiscX, {data.prenom}. Votre comptabilité certifiée vous attend.</p>
            <SubmitBtn onClick={()=>onSwitch?.("login")}>Accéder à mon compte →</SubmitBtn>
          </div>
        ) : (
          <>
            {/* Progress bar */}
            <div style={{ height:4, background:C.gray2, borderRadius:2, marginBottom:28, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${progress}%`, background:C.green, borderRadius:2, transition:"width .4s ease" }}/>
            </div>
            {step===1 && <SignupStep1 onNext={handleStep1}/>}
            {step===2 && <SignupStep2 phone={data.phone} onNext={handleStep2} onBack={()=>setStep(1)}/>}
            {step===3 && <SignupStep3 onSubmit={handleDone}/>}
            <p style={{ textAlign:"center", marginTop:20, fontSize:".75rem", color:C.gray3 }}>
              Déjà un compte ?{" "}
              <a href="#" onClick={e=>{e.preventDefault();onSwitch?.("login");}}
                style={{ color:C.green, textDecoration:"none" }}>
                Se connecter
              </a>
            </p>
          </>
        )
      }
    />
  );
}

// ════════════════════════════════════════════════════════════════
// ROOT — AuthRouter (wraps both pages with tab switching)
// ════════════════════════════════════════════════════════════════
export default function AuthRouter() {
  const [page, setPage] = useState("login"); // "login" | "signup"

  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Sora',sans-serif}
      @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
      input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}
      input[type=number]{-moz-appearance:textfield}
    `;
    document.head.appendChild(styleEl);
    return () => document.head.removeChild(styleEl);
  }, []);

  return page === "login"
    ? <LoginPage  onSwitch={setPage}/>
    : <SignupPage onSwitch={setPage}/>;
}
