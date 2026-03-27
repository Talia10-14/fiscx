import { useState, useEffect, useRef } from "react";

// ── Design tokens ─────────────────────────────────────────────
const C = {
  green:  "#006B3F", green2: "#005232", green3: "#00A35E",
  gold:   "#FCD116", gold2:  "#E6BC00",
  red:    "#C8102E",
  navy:   "#0D2D6B", navy2:  "#07184A",
  off:    "#F7F8F5", gray1:  "#F0F2EE", gray2:  "#D8DDD4",
  gray3:  "#9AA394", gray4:  "#5A6357",
  dark:   "#111A13", text:   "#1A2318", textm:  "#4A5548",
  white:  "#FFFFFF",
};

const styles = {
  // Inject Google Fonts once
  fonts: `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap');`,
  global: `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    body{font-family:'Sora',sans-serif;color:${C.text};background:${C.off};overflow-x:hidden}
    h1,h2,h3{font-weight:600;line-height:1.15}
    p{line-height:1.7;color:${C.textm}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
    @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    @keyframes waFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
    @keyframes barGrow{from{width:0}}
    .reveal{opacity:0;transform:translateY(28px);transition:opacity .6s ease,transform .6s ease}
    .reveal.visible{opacity:1;transform:translateY(0)}
    .feat-card:hover .feat-link-arrow{transform:translateX(4px)}
  `,
};

// ── Utility components ────────────────────────────────────────
const Btn = ({ href="#", variant="primary", size="md", children, style:s={} }) => {
  const base = {
    display:"inline-flex", alignItems:"center", gap:6,
    padding: size==="xl" ? "17px 36px" : size==="lg" ? "14px 28px" : "9px 20px",
    borderRadius: size==="xl"||size==="lg" ? 20 : 12,
    fontFamily:"'Sora',sans-serif",
    fontSize: size==="xl" ? "1.05rem" : size==="lg" ? "1rem" : ".875rem",
    fontWeight:500, cursor:"pointer", textDecoration:"none",
    border:"none", transition:"all .2s",
  };
  const variants = {
    primary:      { background:C.green, color:C.white },
    ghost:        { background:"transparent", border:`1.5px solid ${C.gray2}`, color:C.text },
    gold:         { background:C.gold, color:C.dark, fontWeight:600 },
    white:        { background:C.white, color:C.green, fontWeight:600 },
    outlineWhite: { background:"transparent", border:`2px solid rgba(255,255,255,.4)`, color:C.white },
  };
  return (
    <a href={href} style={{...base,...variants[variant],...s}}
      onMouseEnter={e=>{
        if(variant==="primary") { e.currentTarget.style.background=C.green2; e.currentTarget.style.transform="translateY(-1px)"; }
        if(variant==="ghost")   { e.currentTarget.style.borderColor=C.green; e.currentTarget.style.color=C.green; }
        if(variant==="gold"||variant==="white") e.currentTarget.style.transform="translateY(-1px)";
      }}
      onMouseLeave={e=>{
        if(variant==="primary") { e.currentTarget.style.background=C.green; e.currentTarget.style.transform=""; }
        if(variant==="ghost")   { e.currentTarget.style.borderColor=C.gray2; e.currentTarget.style.color=C.text; }
        if(variant==="gold"||variant==="white") e.currentTarget.style.transform="";
      }}>
      {children}
    </a>
  );
};

const SectionTag = ({ children, dark=false }) => (
  <div style={{
    display:"inline-flex", alignItems:"center", gap:6,
    background: dark ? "rgba(255,255,255,.1)" : C.gray1,
    color: dark ? C.gold : C.green,
    padding:"5px 14px", borderRadius:100,
    fontSize:".75rem", fontWeight:600, letterSpacing:".05em", textTransform:"uppercase",
    marginBottom:20,
  }}>
    <span style={{width:6,height:6,background:dark?C.gold:C.green,borderRadius:"50%"}}/>
    {children}
  </div>
);

// ── Reveal hook ───────────────────────────────────────────────
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add("reveal");
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { el.classList.add("visible"); io.disconnect(); }
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

const Reveal = ({ children, delay=0, style:s={} }) => {
  const ref = useReveal();
  return <div ref={ref} style={{transitionDelay:`${delay}s`,...s}}>{children}</div>;
};

// ── FLAG STRIP ────────────────────────────────────────────────
const FlagStrip = () => (
  <div style={{display:"flex",height:6}}>
    {[C.green, C.gold, C.red].map((c,i) => <div key={i} style={{flex:1,background:c}}/>)}
  </div>
);

// ── NAVIGATION ───────────────────────────────────────────────
const Nav = () => (
  <nav style={{
    position:"sticky", top:0, zIndex:100,
    background:"rgba(247,248,245,.92)", backdropFilter:"blur(12px)",
    borderBottom:`1px solid ${C.gray2}`,
    padding:"0 5vw", display:"flex", alignItems:"center",
    justifyContent:"space-between", height:64,
  }}>
    <a href="#" style={{display:"flex",alignItems:"center",gap:10,textDecoration:"none"}}>
      <div style={{width:36,height:36,background:C.green,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill={C.white}>
          <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z"/>
        </svg>
      </div>
      <span style={{fontSize:"1.3rem",fontWeight:700,color:C.green,letterSpacing:"-.02em"}}>FiscX</span>
    </a>
    <ul style={{display:"flex",gap:32,listStyle:"none"}}>
      {[["#comment","Comment ça marche"],["#fonctionnalites","Fonctionnalités"],["#score","Score crédit"],["#banques","Banques"],["#tarifs","Tarifs"]].map(([href,label]) => (
        <li key={href}><a href={href} style={{textDecoration:"none",fontSize:".875rem",fontWeight:500,color:C.textm,transition:"color .2s"}}
          onMouseEnter={e=>e.target.style.color=C.green}
          onMouseLeave={e=>e.target.style.color=C.textm}>{label}</a></li>
      ))}
    </ul>
    <div style={{display:"flex",gap:10,alignItems:"center"}}>
      <Btn variant="ghost">Se connecter</Btn>
      <Btn variant="primary">Télécharger l'app</Btn>
    </div>
  </nav>
);

// ── PHONE MOCKUP ──────────────────────────────────────────────
const PhoneMockup = () => (
  <div style={{position:"relative",padding:"20px 60px 20px 40px"}}>
    {/* Floating cards */}
    {[
      { top:30, right:-30, label:"Score de crédit", value:"782 / 1000", green:true, delay:0 },
      { bottom:80, left:-40, label:"Bilan certifié", value:"QR ✓ DGI", green:false, delay:"2s" },
      { top:160, right:-50, label:"Sync automatique", value:"MTN · Moov ✓", green:false, delay:"1s" },
    ].map((fc,i) => (
      <div key={i} style={{
        position:"absolute", background:C.white, borderRadius:14, padding:"10px 14px",
        boxShadow:"0 2px 24px rgba(0,0,0,.08)", fontSize:".75rem",
        animation:`floatY ${3+i}s ease-in-out infinite`,
        animationDelay:fc.delay||0,
        top:fc.top, bottom:fc.bottom, right:fc.right, left:fc.left,
        zIndex:10,
      }}>
        <div style={{fontSize:".65rem",color:C.gray3,marginBottom:2}}>{fc.label}</div>
        <div style={{fontWeight:600,color:fc.green?C.green:C.text}}>{fc.value}</div>
      </div>
    ))}
    {/* Phone frame */}
    <div style={{width:280,margin:"0 auto",background:C.dark,borderRadius:40,padding:14,boxShadow:"0 32px 80px rgba(0,0,0,.25)"}}>
      <div style={{width:100,height:30,background:C.dark,borderRadius:"0 0 20px 20px",margin:"0 auto",position:"relative",zIndex:2}}/>
      <div style={{background:C.white,borderRadius:28,overflow:"hidden",aspectRatio:"9/19"}}>
        <div style={{background:"#F4F6F4",height:"100%",display:"flex",flexDirection:"column"}}>
          <div style={{background:C.green,padding:"40px 16px 20px",display:"flex",flexDirection:"column",gap:4}}>
            <span style={{fontSize:".65rem",color:"rgba(255,255,255,.7)",fontWeight:500}}>Bonjour 👋</span>
            <span style={{fontSize:".95rem",fontWeight:600,color:C.white}}>Afi Koudossou</span>
          </div>
          <div style={{margin:16,background:C.white,borderRadius:16,padding:14,boxShadow:"0 2px 12px rgba(0,0,0,.08)"}}>
            <div style={{fontSize:".6rem",color:C.gray3,fontWeight:500,textTransform:"uppercase",letterSpacing:".05em"}}>Solde net — Aujourd'hui</div>
            <div style={{fontSize:"1.4rem",fontWeight:700,color:C.green,fontFamily:"'JetBrains Mono',monospace",margin:"2px 0"}}>47 500</div>
            <div style={{fontSize:".6rem",color:C.gray3}}>FCFA · mis à jour il y a 2 min</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,margin:"0 16px"}}>
            {[["🛒","Vente",C.green,C.white],["💸","Dépense","#FEE8EB",C.red]].map(([icon,label,bg,col]) => (
              <div key={label} style={{padding:10,borderRadius:12,textAlign:"center",background:bg,fontSize:".6rem",fontWeight:600,color:col}}>
                <span style={{fontSize:"1.1rem",display:"block",marginBottom:3}}>{icon}</span>{label}
              </div>
            ))}
          </div>
          <div style={{margin:"12px 16px 0",display:"flex",flexDirection:"column",gap:8}}>
            <div style={{fontSize:".6rem",fontWeight:600,color:C.gray4,textTransform:"uppercase",letterSpacing:".05em"}}>Opérations récentes</div>
            {[
              ["Pagnes ankara ×12","Il y a 1h","+18 000",true],
              ["Réapprovisionnement","Ce matin","-25 000",false],
              ["Tissus wax ×5","Hier 16h32","+12 500",true],
            ].map(([name,date,amt,pos]) => (
              <div key={name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.white,padding:"8px 10px",borderRadius:10}}>
                <div>
                  <div style={{fontSize:".62rem",fontWeight:500,color:C.text}}>{name}</div>
                  <div style={{fontSize:".55rem",color:C.gray3}}>{date}</div>
                </div>
                <div style={{fontSize:".65rem",fontWeight:600,color:pos?C.green:C.red}}>{amt}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ── HERO ─────────────────────────────────────────────────────
const Hero = () => (
  <section style={{
    minHeight:"calc(100vh - 70px)", display:"grid",
    gridTemplateColumns:"1fr 1fr", alignItems:"center",
    gap:"4vw", padding:"80px 5vw", position:"relative", overflow:"hidden",
  }}>
    <div style={{position:"absolute",top:-200,right:-200,width:700,height:700,
      background:"radial-gradient(circle,rgba(0,107,63,.08) 0%,transparent 70%)",pointerEvents:"none"}}/>
    <div>
      <div style={{display:"inline-flex",alignItems:"center",gap:8,background:C.green,color:C.white,
        padding:"6px 14px",borderRadius:100,fontSize:".78rem",fontWeight:500,letterSpacing:".04em",marginBottom:24}}>
        <span style={{width:6,height:6,background:C.gold,borderRadius:"50%",animation:"pulse 2s infinite"}}/>
        Bénin · DGI Certifié · SYSCOHADA
      </div>
      <h1 style={{fontSize:"clamp(2.4rem,5vw,4rem)",color:C.dark,marginBottom:20,letterSpacing:"-.03em"}}>
        Votre boutique mérite une vraie{" "}
        <em style={{fontStyle:"normal",fontFamily:"'DM Serif Display',serif",color:C.green}}>comptabilité</em>
      </h1>
      <p style={{fontSize:"1.1rem",maxWidth:480,marginBottom:36}}>
        Enregistrez chaque vente en 30 secondes. Obtenez un bilan certifié. Accédez au crédit bancaire — même sans connexion internet.
      </p>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:40}}>
        <Btn variant="primary" size="xl">Commencer gratuitement</Btn>
        <Btn variant="ghost" size="xl" href="#comment">▶ Voir une démo</Btn>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:16}}>
        <span style={{color:C.gold,fontSize:"1rem",letterSpacing:2}}>★★★★★</span>
        <span style={{fontSize:".82rem",color:C.gray3}}>Gratuit jusqu'à 30 ventes / mois · Aucune carte requise</span>
      </div>
    </div>
    <Reveal><PhoneMockup/></Reveal>
  </section>
);

// ── LOGOS BAND ───────────────────────────────────────────────
const LogosBand = () => (
  <Reveal>
    <div style={{background:C.white,borderTop:`1px solid ${C.gray2}`,borderBottom:`1px solid ${C.gray2}`,
      padding:"28px 5vw",display:"flex",alignItems:"center",justifyContent:"center",gap:32,flexWrap:"wrap"}}>
      <span style={{fontSize:".75rem",color:C.gray3,fontWeight:500,letterSpacing:".06em",textTransform:"uppercase"}}>Reconnu par</span>
      {[["DGI Bénin",C.green],["BCEAO",C.navy],["MTN MoMo",C.gold],["Moov Money",C.red],["SYSCOHADA",C.gray4],["BOA Bénin",C.navy]].map(([label,dot]) => (
        <div key={label} style={{display:"flex",alignItems:"center",gap:8,fontSize:".82rem",fontWeight:600,
          color:C.gray4,padding:"8px 16px",borderRadius:8,border:`1px solid ${C.gray2}`,cursor:"default",transition:"all .2s"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=C.green;e.currentTarget.style.color=C.green}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=C.gray2;e.currentTarget.style.color=C.gray4}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:dot}}/>{label}
        </div>
      ))}
    </div>
  </Reveal>
);

// ── STEPS ────────────────────────────────────────────────────
const HowItWorks = () => (
  <section id="comment" style={{padding:"100px 5vw",background:C.white}}>
    <SectionTag>Comment ça marche</SectionTag>
    <h2 style={{fontSize:"clamp(1.8rem,3.5vw,2.6rem)",color:C.dark,marginBottom:12,letterSpacing:"-.02em"}}>Simple comme bonjour</h2>
    <p style={{fontSize:"1.05rem",maxWidth:560,marginBottom:56}}>Trois étapes pour passer de zéro comptabilité à un dossier de crédit bancaire reconnu.</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:0,position:"relative"}}>
      <div style={{position:"absolute",top:28,left:"calc(16.66% + 16px)",right:"calc(16.66% + 16px)",height:2,background:C.gray2}}/>
      {[
        ["1","🛒","Saisir","Enregistrez chaque vente et dépense en 30 secondes. Fonctionne sans internet — synchronisation automatique dès que vous retrouvez le réseau MTN ou Moov."],
        ["2","📄","Certifier","Votre bilan SYSCOHADA est généré automatiquement chaque mois. Chaque document porte un QR code vérifiable — impossible à falsifier."],
        ["3","🏦","Emprunter","Accordez l'accès à votre banque en 1 tap. Votre dossier certifié part automatiquement. Le banquier voit 12 mois de données réelles."],
      ].map(([num,icon,title,desc],i) => (
        <Reveal key={num} delay={i*0.1} style={{textAlign:"center",padding:"0 24px",position:"relative",zIndex:1}}>
          <div style={{width:56,height:56,borderRadius:"50%",background:C.white,border:`2px solid ${C.green}`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem",fontWeight:700,
            color:C.green,margin:"0 auto 20px"}}>
            {num}
          </div>
          <span style={{fontSize:"1.8rem",marginBottom:14,display:"block"}}>{icon}</span>
          <h3 style={{fontWeight:600,color:C.dark,marginBottom:8}}>{title}</h3>
          <p style={{fontSize:".875rem"}}>{desc}</p>
        </Reveal>
      ))}
    </div>
  </section>
);

// ── FEATURES ─────────────────────────────────────────────────
const features = [
  ["📶","Mode hors-ligne complet","Saisissez sans internet jusqu'à 72h. Tout se synchronise automatiquement dès que vous retrouvez le réseau MTN ou Moov Bénin."],
  ["📦","Gestion du stock","Alertes automatiques quand un produit est en rupture. Inventaire en temps réel, calculé à partir de vos ventes."],
  ["📊","Bilan SYSCOHADA certifié","Journal de caisse, compte de résultat et bilan annuel générés automatiquement. Format conforme à la DGI Bénin."],
  ["🧮","Taxe Synthétique automatique","FiscX calcule votre impôt selon le Code Général des Impôts béninois. Mise à jour automatique après chaque Loi de Finances."],
  ["🔐","QR code anti-falsification","Chaque bilan porte un QR code signé cryptographiquement. Le banquier vérifie en 10 secondes sur fiscx.bj/verify."],
  ["🎙️","Saisie vocale","Enregistrez une vente en parlant à l'application. Français dès le lancement — Fon, Yoruba et Bariba en préparation."],
];

const Features = () => (
  <section id="fonctionnalites" style={{padding:"100px 5vw",background:C.off}}>
    <SectionTag>Fonctionnalités</SectionTag>
    <h2 style={{fontSize:"clamp(1.8rem,3.5vw,2.6rem)",color:C.dark,marginBottom:12,letterSpacing:"-.02em"}}>Tout ce dont votre commerce a besoin</h2>
    <p style={{fontSize:"1.05rem",maxWidth:560,marginBottom:56}}>Conçu pour les marchés béninois — petite connexion, grands écrans Android, FCFA uniquement.</p>
    <Reveal>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:1,background:C.gray2,border:`1px solid ${C.gray2}`,borderRadius:20,overflow:"hidden"}}>
        {features.map(([icon,title,desc]) => (
          <div key={title} style={{background:C.white,padding:"32px 28px",transition:"background .2s",cursor:"default"}}
            onMouseEnter={e=>e.currentTarget.style.background=C.gray1}
            onMouseLeave={e=>e.currentTarget.style.background=C.white}>
            <div style={{width:48,height:48,borderRadius:12,background:C.gray1,display:"flex",alignItems:"center",
              justifyContent:"center",fontSize:"1.4rem",marginBottom:18,border:`1px solid ${C.gray2}`}}>
              {icon}
            </div>
            <h3 style={{fontWeight:600,color:C.dark,marginBottom:8,fontSize:"1.1rem"}}>{title}</h3>
            <p style={{fontSize:".875rem",lineHeight:1.65}}>{desc}</p>
            <a href="#" className="feat-link" style={{display:"inline-flex",alignItems:"center",gap:4,marginTop:14,
              fontSize:".82rem",fontWeight:500,color:C.green,textDecoration:"none"}}>
              En savoir plus <span className="feat-link-arrow" style={{transition:"transform .2s"}}>→</span>
            </a>
          </div>
        ))}
      </div>
    </Reveal>
  </section>
);

// ── SCORE DE CRÉDIT ──────────────────────────────────────────
const scoreBars = [
  ["CA moyen 3 mois",         214, 300, 71],
  ["Régularité des saisies",  200, 250, 80],
  ["Taux d'annulation",       170, 200, 85],
  ["Ancienneté",              100, 150, 67],
  ["Diversité des produits",   36, 100, 36],
];
const scoreCriteria = [
  ["30%", C.green,         "Chiffre d'affaires moyen",   "Revenu mensuel moyen sur les 3 derniers mois. Plus votre commerce tourne, plus vous gagnez de points.","Données : vos ventes FiscX",C.green],
  ["25%", C.green,         "Régularité des saisies",     "Combien de jours par semaine vous enregistrez dans l'app. Saisir tous les jours = données fiables = score élevé.","Données : fréquence d'usage",C.green],
  ["20%", C.red,           "Taux d'annulation",          "Annuler beaucoup de ventes juste avant une demande de prêt est un signal de fraude. Ce critère protège les banques — et votre réputation.","Indicateur anti-fraude",C.red],
  ["15%", C.gold2,         "Ancienneté sur FiscX",       "Un historique long = un commerce stable. Score plafonné à 600/1000 avant 3 mois d'utilisation.","Durée d'utilisation active",C.green],
  ["10%", C.navy,          "Diversité des produits",     "Un commerce qui vend plusieurs produits résiste mieux aux crises. La diversité réduit le risque de chute brutale du CA.","Nombre de produits actifs",C.green],
];

const ScoreSection = () => (
  <section id="score" style={{padding:"100px 5vw",background:C.white}}>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:80,alignItems:"center"}}>
      <Reveal>
        <SectionTag>Score de crédit</SectionTag>
        <h2 style={{fontSize:"clamp(1.8rem,3.5vw,2.6rem)",color:C.dark,marginBottom:12,letterSpacing:"-.02em"}}>Un score transparent, pas une boîte noire</h2>
        <p style={{marginBottom:28}}>Vous voyez exactement comment votre score est calculé, et quoi faire pour l'améliorer. Conforme au Bureau d'Information sur le Crédit (BIC-UEMOA).</p>
        {/* Gauge */}
        <div style={{width:220,height:220,margin:"0 auto",position:"relative"}}>
          <svg viewBox="0 0 200 120" fill="none" width="100%" height="100%">
            <path d="M 20 100 A 80 80 0 0 1 180 100" stroke={C.gray1} strokeWidth="14" strokeLinecap="round"/>
            <path d="M 20 100 A 80 80 0 0 1 180 100" stroke={C.green} strokeWidth="14" strokeLinecap="round"
              strokeDasharray="251.2" strokeDashoffset="70"/>
            <circle cx="20"  cy="100" r="5" fill={C.red}/>
            <circle cx="100" cy="20"  r="5" fill={C.gold}/>
            <circle cx="180" cy="100" r="5" fill={C.green}/>
            <text x="10"  y="116" fontSize="9" fill={C.gray3} fontFamily="sans-serif">0</text>
            <text x="92"  y="14"  fontSize="9" fill={C.gray3} fontFamily="sans-serif">500</text>
            <text x="170" y="116" fontSize="9" fill={C.gray3} fontFamily="sans-serif">1000</text>
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <div style={{fontSize:"3rem",fontWeight:700,color:C.green,fontFamily:"'JetBrains Mono',monospace",lineHeight:1}}>720</div>
            <div style={{fontSize:".75rem",color:C.gray3,marginTop:4}}>Bon profil</div>
          </div>
        </div>
        {/* Bars */}
        <div style={{marginTop:32,display:"flex",flexDirection:"column",gap:14}}>
          {scoreBars.map(([name,pts,max,pct]) => (
            <div key={name}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:".82rem",fontWeight:500,color:C.text}}>{name}</span>
                <span style={{fontSize:".75rem",color:C.gray3}}>{pts} / {max} pts</span>
              </div>
              <div style={{height:6,background:C.gray1,borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,background:C.green,borderRadius:3,
                  animation:"barGrow .8s ease"}}/>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {scoreCriteria.map(([weight,badgeBg,name,explain,tag,tagCol]) => (
            <div key={name} style={{display:"flex",gap:16,alignItems:"flex-start",padding:18,
              background:C.gray1,borderRadius:12,border:`1px solid ${C.gray2}`,transition:"border-color .2s",cursor:"default"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=C.green}
              onMouseLeave={e=>e.currentTarget.style.borderColor=C.gray2}>
              <div style={{minWidth:48,height:48,borderRadius:10,background:badgeBg,
                color:badgeBg===C.gold2?C.dark:C.white,display:"flex",alignItems:"center",justifyContent:"center",
                fontWeight:700,fontSize:".9rem"}}>
                {weight}
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,color:C.dark,fontSize:".9rem",marginBottom:3}}>{name}</div>
                <div style={{fontSize:".8rem",color:C.textm,lineHeight:1.55}}>{explain}</div>
                <span style={{marginTop:6,display:"inline-block",background:C.white,border:`1px solid ${C.gray2}`,
                  color:tagCol,fontSize:".7rem",fontWeight:600,padding:"2px 8px",borderRadius:20}}>
                  {tag}
                </span>
              </div>
            </div>
          ))}
          <Btn variant="primary" size="lg" style={{alignSelf:"flex-start",marginTop:8}}>Calculer mon score estimé</Btn>
        </div>
      </Reveal>
    </div>
  </section>
);

// ── BANQUE ───────────────────────────────────────────────────
const bankRows = [
  ["Afi K. · Textile",      "782", "good", "1,2M FCFA", "green"],
  ["Moussa B. · Épicerie",  "741", "good", "890K FCFA",  "amber"],
  ["Rosine A. · Couture",   "598", "mid",  "450K FCFA",  "green"],
  ["Kofi D. · Électronique","512", "mid",  "320K FCFA",  "amber"],
  ["Fatou S. · Maraîchage", "287", "low",  "180K FCFA",  "green"],
];
const pillColors = { good:["rgba(0,163,94,.2)","#00d47a"], mid:["rgba(252,209,22,.15)",C.gold], low:["rgba(200,16,46,.2)","#ff6b7a"] };
const dotColors  = { green:"#00A35E", amber:C.gold };

const BankSection = () => (
  <section id="banques" style={{padding:"100px 5vw",background:C.navy,color:C.white}}>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:80,alignItems:"center"}}>
      <Reveal>
        <SectionTag dark>Pour les banques</SectionTag>
        <h2 style={{fontSize:"clamp(1.8rem,3.5vw,2.6rem)",color:C.white,marginBottom:12,letterSpacing:"-.02em"}}>
          Analysez des dossiers certifiés, pas des promesses
        </h2>
        <p style={{color:"rgba(255,255,255,.7)",marginBottom:32}}>
          Pour la première fois, vous accédez à 12 mois de données comptables réelles d'un commerçant informel — vérifiées, infalsifiables, et consenties.
        </p>
        {[
          ["🔐","Données certifiées — zéro falsification","Chaque bilan est signé cryptographiquement. Un scan QR suffit pour confirmer que les chiffres n'ont pas été altérés."],
          ["✅","Consentement explicite et révocable","Vous n'accédez qu'aux dossiers expressément partagés. Le consentement est traçable et auditable pour la BCEAO."],
          ["📊","Score BIC-UEMOA compatible","Le scoring FiscX est conforme aux directives du Bureau d'Information sur le Crédit — intégrable dans vos processus de décision."],
        ].map(([icon,title,desc]) => (
          <div key={title} style={{display:"flex",gap:16,alignItems:"flex-start",marginBottom:24}}>
            <div style={{width:44,height:44,borderRadius:10,background:"rgba(255,255,255,.08)",
              border:"1px solid rgba(255,255,255,.12)",display:"flex",alignItems:"center",
              justifyContent:"center",fontSize:"1.2rem",flexShrink:0}}>
              {icon}
            </div>
            <div>
              <div style={{fontWeight:600,color:C.white,marginBottom:4}}>{title}</div>
              <div style={{fontSize:".85rem",color:"rgba(255,255,255,.6)",lineHeight:1.6}}>{desc}</div>
            </div>
          </div>
        ))}
        <Btn variant="gold" size="lg" style={{marginTop:8}}>Devenir partenaire →</Btn>
      </Reveal>

      <Reveal delay={0.15}>
        <div style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.12)",borderRadius:20,padding:24,overflow:"hidden"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <span style={{fontSize:".8rem",fontWeight:600,color:"rgba(255,255,255,.5)",textTransform:"uppercase",letterSpacing:".06em"}}>Tableau de bord — BOA Bénin</span>
            <span style={{fontSize:".65rem",color:"rgba(255,255,255,.3)"}}>Mis à jour il y a 2 min</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
            {[["Dossiers actifs","147","↑ +12 ce mois"],["Score moyen","681","↑ +23 pts"],["En attente","8","Demandes de prêt"]].map(([label,value,delta]) => (
              <div key={label} style={{background:"rgba(255,255,255,.06)",borderRadius:10,padding:12}}>
                <div style={{fontSize:".62rem",color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:".05em"}}>{label}</div>
                <div style={{fontSize:"1.3rem",fontWeight:700,color:C.white,fontFamily:"'JetBrains Mono',monospace"}}>{value}</div>
                <div style={{fontSize:".65rem",color:C.green3}}>{delta}</div>
              </div>
            ))}
          </div>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr>{["Commerçant","Score","CA moy.","Statut"].map(h => (
                <th key={h} style={{fontSize:".62rem",textAlign:"left",color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".06em",padding:"6px 8px",borderBottom:"1px solid rgba(255,255,255,.08)"}}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {bankRows.map(([name,score,level,ca,dot]) => (
                <tr key={name}>
                  <td style={{fontSize:".72rem",padding:"10px 8px",color:"rgba(255,255,255,.8)",borderBottom:"1px solid rgba(255,255,255,.06)"}}>{name}</td>
                  <td style={{padding:"10px 8px",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
                    <span style={{display:"inline-block",padding:"2px 8px",borderRadius:20,fontSize:".65rem",fontWeight:600,background:pillColors[level][0],color:pillColors[level][1]}}>{score}</span>
                  </td>
                  <td style={{fontSize:".72rem",padding:"10px 8px",color:"rgba(255,255,255,.8)",borderBottom:"1px solid rgba(255,255,255,.06)"}}>{ca}</td>
                  <td style={{fontSize:".72rem",padding:"10px 8px",color:"rgba(255,255,255,.8)",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
                    <span style={{width:7,height:7,borderRadius:"50%",background:dotColors[dot],display:"inline-block",marginRight:5}}/>
                    {dot==="green"?"Actif":"En étude"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
    </div>
  </section>
);

// ── TÉMOIGNAGES ──────────────────────────────────────────────
const testimonials = [
  ["AK",C.green,"Afi Koudossou","Vendeuse textile · Marché Dantokpa, Cotonou","Avant FiscX, je savais jamais combien je gagnais vraiment. Maintenant j'ai mon bilan en PDF, la banque m'a accordé un prêt de 500 000 FCFA."],
  ["MB",C.navy, "Moussa Bello",  "Épicier · Marché de Parakou",                "L'app marche même quand MTN coupe. Je saisie à l'étal, ça se synchronise le soir. Le score de crédit a tout changé pour moi."],
  ["RA",C.gold2,"Romuald Akakpo","Expert-comptable · ONECCA Bénin, Cotonou",   "Je gère 28 clients commerçants depuis une seule app. Les bilans SYSCOHADA se génèrent en quelques secondes. Un gain de temps énorme."],
];

const Testimonials = () => (
  <section style={{padding:"100px 5vw",background:C.white}}>
    <SectionTag>Témoignages</SectionTag>
    <h2 style={{fontSize:"clamp(1.8rem,3.5vw,2.6rem)",color:C.dark,marginBottom:12,letterSpacing:"-.02em"}}>Ils ont sauté le pas</h2>
    <p style={{fontSize:"1.05rem",maxWidth:560,marginBottom:56}}>Des commerçants béninois qui utilisent FiscX au quotidien, depuis Cotonou jusqu'à Parakou.</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
      {testimonials.map(([initials,avatarBg,name,loc,quote],i) => (
        <Reveal key={name} delay={i*0.1}>
          <div style={{background:C.white,border:`1px solid ${C.gray2}`,borderRadius:20,padding:"28px 24px",
            display:"flex",flexDirection:"column",transition:"box-shadow .2s",cursor:"default"}}
            onMouseEnter={e=>e.currentTarget.style.boxShadow="0 2px 24px rgba(0,0,0,.08)"}
            onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
            <div style={{color:C.gold,fontSize:".9rem",marginBottom:14}}>★★★★★</div>
            <p style={{fontSize:".9rem",lineHeight:1.7,flex:1,fontStyle:"italic",color:C.text}}>"{quote}"</p>
            <div style={{display:"flex",alignItems:"center",gap:12,marginTop:20,paddingTop:16,borderTop:`1px solid ${C.gray2}`}}>
              <div style={{width:40,height:40,borderRadius:"50%",background:avatarBg,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontWeight:700,fontSize:".85rem",color:avatarBg===C.gold2?C.dark:C.white}}>
                {initials}
              </div>
              <div>
                <div style={{fontSize:".85rem",fontWeight:600,color:C.dark}}>{name}</div>
                <div style={{fontSize:".75rem",color:C.gray3}}>{loc}</div>
              </div>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  </section>
);

// ── TARIFS ───────────────────────────────────────────────────
const Pricing = () => (
  <section id="tarifs" style={{padding:"100px 5vw",background:C.off}}>
    <div style={{textAlign:"center",marginBottom:56}}>
      <SectionTag>Tarifs</SectionTag>
      <h2 style={{fontSize:"clamp(1.8rem,3.5vw,2.6rem)",color:C.dark,marginBottom:12,letterSpacing:"-.02em"}}>Simple et transparent</h2>
      <p style={{fontSize:"1.05rem",maxWidth:560,margin:"0 auto"}}>Commencez gratuitement. Passez au Pro quand votre commerce grandit.</p>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,maxWidth:700,margin:"0 auto"}}>
      <Reveal>
        <div style={{background:C.white,border:`1px solid ${C.gray2}`,borderRadius:20,padding:"32px 28px"}}>
          <div style={{fontSize:".75rem",fontWeight:600,color:C.gray3,textTransform:"uppercase",letterSpacing:".06em",marginBottom:12}}>Gratuit</div>
          <div style={{fontSize:"2.4rem",fontWeight:700,color:C.dark,fontFamily:"'JetBrains Mono',monospace"}}>
            0 <span style={{fontSize:"1rem",color:C.gray3,fontFamily:"'Sora',sans-serif"}}>FCFA/mois</span>
          </div>
          <div style={{fontSize:".85rem",color:C.textm,margin:"8px 0 24px"}}>Pour découvrir FiscX</div>
          <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:10,marginBottom:28}}>
            {[["✓",C.green,"30 transactions / mois"],["✓",C.green,"Gestion du stock"],["✓",C.green,"Mode hors-ligne"],["–",C.gray3,"Bilan certifié"],["–",C.gray3,"Score de crédit"]].map(([check,col,label]) => (
              <li key={label} style={{fontSize:".875rem",display:"flex",gap:8,alignItems:"center"}}>
                <span style={{color:col}}>{check}</span>{label}
              </li>
            ))}
          </ul>
          <Btn variant="ghost" style={{width:"100%",justifyContent:"center"}}>Commencer</Btn>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div style={{background:C.green,borderRadius:20,padding:"32px 28px",position:"relative"}}>
          <div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",
            background:C.gold,color:C.dark,fontSize:".72rem",fontWeight:700,
            padding:"4px 14px",borderRadius:20,whiteSpace:"nowrap"}}>
            Le plus populaire
          </div>
          <div style={{fontSize:".75rem",fontWeight:600,color:"rgba(255,255,255,.6)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:12}}>Pro</div>
          <div style={{fontSize:"2.4rem",fontWeight:700,color:C.white,fontFamily:"'JetBrains Mono',monospace"}}>
            2 000 <span style={{fontSize:"1rem",color:"rgba(255,255,255,.6)",fontFamily:"'Sora',sans-serif"}}>FCFA/mois</span>
          </div>
          <div style={{fontSize:".85rem",color:"rgba(255,255,255,.6)",margin:"8px 0 24px"}}>Via MTN MoMo ou Moov Money</div>
          <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:10,marginBottom:28}}>
            {["Transactions illimitées","Bilan SYSCOHADA certifié + QR","Score de crédit BIC-UEMOA","Déclaration Taxe Synthétique","Accès module bancaire"].map(label => (
              <li key={label} style={{fontSize:".875rem",display:"flex",gap:8,alignItems:"center",color:C.white}}>
                <span style={{color:C.gold}}>✓</span>{label}
              </li>
            ))}
          </ul>
          <Btn variant="gold" style={{width:"100%",justifyContent:"center"}}>Passer au Pro</Btn>
        </div>
      </Reveal>
    </div>
  </section>
);

// ── CTA FINAL ────────────────────────────────────────────────
const CtaFinal = () => (
  <section style={{background:C.green,textAlign:"center",padding:"120px 5vw"}}>
    <h2 style={{color:C.white,fontSize:"clamp(1.8rem,3.5vw,2.6rem)",maxWidth:600,margin:"0 auto 16px",letterSpacing:"-.02em"}}>
      Rejoignez les commerçants béninois qui gèrent leur comptabilité avec FiscX
    </h2>
    <p style={{color:"rgba(255,255,255,.7)",maxWidth:460,margin:"0 auto 40px",fontSize:"1.05rem"}}>
      Téléchargez l'app sur Android. Gratuit, sans carte bancaire, sans engagement.
    </p>
    <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
      <Btn variant="white" size="xl">⬇ Télécharger sur Android</Btn>
      <Btn variant="outlineWhite" size="xl">Voir une démo</Btn>
    </div>
    <p style={{marginTop:28,fontSize:".8rem",color:"rgba(255,255,255,.5)"}}>Gratuit · Pas de carte bancaire requise · Résiliable à tout moment</p>
  </section>
);

// ── FOOTER ───────────────────────────────────────────────────
const Footer = () => (
  <footer style={{background:C.dark,color:"rgba(255,255,255,.5)",padding:"64px 5vw 32px"}}>
    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:48,marginBottom:48}}>
      <div>
        <div style={{fontSize:"1.4rem",fontWeight:700,color:C.white,marginBottom:10}}>FiscX</div>
        <div style={{fontSize:".85rem",lineHeight:1.7}}>Votre comptabilité, certifiée.<br/>Digitaliser la gestion financière du secteur informel béninois.</div>
        <div style={{marginTop:20,display:"flex",gap:8,alignItems:"center"}}>
          {[C.green,C.gold,C.red].map((c,i)=><span key={i} style={{width:16,height:10,background:c,borderRadius:2,display:"inline-block"}}/>)}
          <span style={{fontSize:".78rem",color:"rgba(255,255,255,.3)",marginLeft:4}}>République du Bénin · fiscx.bj</span>
        </div>
      </div>
      {[
        ["Produit",["Fonctionnalités","Tarifs","Score de crédit","Pour les banques","Télécharger l'app"]],
        ["Légal",["Conditions d'utilisation","Confidentialité","Conformité APDP","Politique de données","Mentions légales"]],
        ["Contact",["Support WhatsApp","contact@fiscx.bj","Cotonou, Bénin","Devenir partenaire","Presse & médias"]],
      ].map(([title,links]) => (
        <div key={title}>
          <div style={{fontSize:".75rem",fontWeight:600,color:"rgba(255,255,255,.8)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:16}}>{title}</div>
          <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:10}}>
            {links.map(link => (
              <li key={link}><a href="#" style={{textDecoration:"none",fontSize:".85rem",color:"rgba(255,255,255,.4)",transition:"color .2s"}}
                onMouseEnter={e=>e.target.style.color=C.green3}
                onMouseLeave={e=>e.target.style.color="rgba(255,255,255,.4)"}>{link}</a></li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:24,borderTop:"1px solid rgba(255,255,255,.08)",fontSize:".78rem"}}>
      <span>© 2026 FiscX · République du Bénin · Tous droits réservés</span>
      <div style={{display:"flex",gap:10}}>
        {["DGI Bénin","APDP Conforme","BIC-UEMOA","SYSCOHADA"].map(badge => (
          <span key={badge} style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:6,padding:"4px 12px",fontSize:".72rem"}}>{badge}</span>
        ))}
      </div>
    </div>
  </footer>
);

// ── WHATSAPP ─────────────────────────────────────────────────
const WhatsAppBtn = () => (
  <a href="https://wa.me/22900000000" target="_blank" rel="noreferrer" style={{
    position:"fixed",bottom:28,right:28,zIndex:200,width:56,height:56,borderRadius:"50%",
    background:"#25D366",color:C.white,display:"flex",alignItems:"center",justifyContent:"center",
    boxShadow:"0 4px 20px rgba(37,211,102,.4)",textDecoration:"none",
    animation:"waFloat 3s ease-in-out infinite",
  }}>
    <svg width="28" height="28" viewBox="0 0 24 24" fill={C.white}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  </a>
);

// ── ROOT APP ─────────────────────────────────────────────────
export default function FiscX() {
  useEffect(() => {
    // Inject styles
    const styleEl = document.createElement("style");
    styleEl.textContent = styles.fonts + styles.global;
    document.head.appendChild(styleEl);
    return () => document.head.removeChild(styleEl);
  }, []);

  return (
    <>
      <Nav />
      <FlagStrip />
      <Hero />
      <LogosBand />
      <HowItWorks />
      <Features />
      <ScoreSection />
      <BankSection />
      <Testimonials />
      <Pricing />
      <CtaFinal />
      <Footer />
      <WhatsAppBtn />
    </>
  );
}
