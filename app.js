/* Shared by every page: nav colour, clock, smooth scroll, page transitions, loader, cursor, scroll effects. */
(function(){
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var curtain = document.getElementById("curtain");
  var loader = document.getElementById("loader");
  var nav = document.getElementById("nav");
  var isHome = document.body.dataset.page === "home";

  /* every page starts at the top after a transition */
  try{ history.scrollRestoration = "manual"; }catch(e){}
  window.scrollTo(0,0);

  /* ---- nav colour: ivory over dark sections, navy over vanilla ---- */
  var darkEls = [].slice.call(document.querySelectorAll("[data-dark]"));
  function navTheme(){
    var dark = darkEls.some(function(el){ var r = el.getBoundingClientRect(); return r.top <= 40 && r.bottom >= 40; });
    nav.classList.toggle("ink", !dark);
  }
  window.addEventListener("scroll", navTheme, {passive:true});
  window.addEventListener("resize", navTheme);
  navTheme();

  /* ---- Miami clock in the footer ---- */
  var clock = document.getElementById("clock");
  function tick(){
    try{ clock.textContent = new Date().toLocaleTimeString("en-US",{timeZone:"America/New_York",hour:"numeric",minute:"2-digit"}) + " ET"; }catch(e){}
  }
  if(clock){ tick(); setInterval(tick, 30000); }

  function showAll(){
    if(curtain) curtain.style.display="none";
    if(loader) loader.style.display="none";
    document.body.style.overflow="";
  }
  if(!window.gsap || reduce){ showAll(); return; }
  gsap.registerPlugin(ScrollTrigger);

  /* ---- smooth scroll (delete this block to turn off) ---- */
  if(window.Lenis){
    var lenis = new Lenis({duration:1.15});
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function(t){ lenis.raf(t*1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ---- starting states are set here, so the page stays fully visible if scripts fail ---- */
  var st = document.getElementById("statement");
  if(st){
    st.innerHTML = st.textContent.split(" ").map(function(w){ return '<span class="w">'+w+'</span>'; }).join(" ");
    gsap.set(".statement .w",{opacity:.18});
  }
  gsap.set(".line>span",{yPercent:110});
  gsap.set(".reveal",{opacity:0,y:60});

  function scrollEffects(){
    if(isHome){
      gsap.to("#name",{xPercent:-4,ease:"none",scrollTrigger:{trigger:".hero",start:"top top",end:"bottom top",scrub:true}});
      gsap.to(".hero-photo",{yPercent:12,ease:"none",scrollTrigger:{trigger:".hero",start:"top top",end:"bottom top",scrub:true}});
    }
    if(st){ gsap.to(".statement .w",{opacity:1,stagger:.08,ease:"none",scrollTrigger:{trigger:".statement",start:"top 75%",end:"bottom 55%",scrub:true}}); }
    gsap.utils.toArray(".reveal").forEach(function(el){
      gsap.to(el,{opacity:1,y:0,duration:1.1,ease:"expo.out",scrollTrigger:{trigger:el,start:"top 92%"}});
    });
    gsap.from("footer .cta",{y:80,opacity:0,duration:1.2,ease:"expo.out",scrollTrigger:{trigger:"footer",start:"top 80%"}});
    ScrollTrigger.refresh();
  }

  function intro(){
    gsap.to(".line>span",{yPercent:0,duration:1.3,ease:"expo.out",stagger:.12});
    if(isHome){
      gsap.from(".hero-photo",{y:80,opacity:0,duration:1.4,ease:"expo.out"});
      gsap.from(".badge,.hero-tag",{opacity:0,y:20,duration:1,delay:.5,stagger:.12,ease:"power3.out"});
    }
    gsap.from(".page-head p",{opacity:0,y:20,duration:1,delay:.4,ease:"power3.out"});
    scrollEffects();
  }

  /* ---- logo loader: rays wiggle out one by one, then we dive into the moon until the screen is yellow, then fade to the site ---- */
  function runLogoLoader(){
    var svg = document.getElementById("lsvg"), zoom = document.getElementById("lzoom");
    var D = svg.dataset, cx = +D.cx, cy = +D.cy, tx = +D.tx, ty = +D.ty, tr = +D.tr, vbx = +D.vbx, vby = +D.vby, vbw = +D.vbw;
    var rays = gsap.utils.toArray("#lsvg .ray"), solid = ["#lmoon","#lspike","#ldot"];
    var stops = gsap.utils.toArray("#fire stop");

    var box = svg.getBoundingClientRect(), rs = box.width / vbw;
    var sx = box.left + (tx - vbx) * rs, sy = box.top + (ty - vby) * rs;
    var far = Math.hypot(innerWidth/2, innerHeight/2);
    var S = (far * 1.25) / (tr * rs);
    var moveX = (innerWidth/2 - sx) / rs, moveY = (innerHeight/2 - sy) / rs;

    gsap.set(solid,{opacity:0, scale:.85, svgOrigin:cx+" "+cy});
    rays.forEach(function(r){
      gsap.set(r,{x:-(+r.dataset.dx)*.85, y:-(+r.dataset.dy)*.85, scale:.2, rotation:0, opacity:0, transformOrigin:"50% 50%"});
    });

    var shimmer = stops.map(function(st,i){
      return gsap.to(st,{attr:{offset:(+st.getAttribute("offset")) + (i===0?.05:.03)}, duration:.5+i*.1, repeat:-1, yoyo:true, ease:"sine.inOut"});
    });

    var tl = gsap.timeline({onComplete:function(){
      shimmer.forEach(function(t){ t.kill(); });
      loader.style.display = "none";
      document.body.style.overflow = "";
    }});

    tl.to(solid,{opacity:1, scale:1, duration:.45, ease:"back.out(1.6)"},0);

    var STEP = .06, T0 = .45;
    rays.forEach(function(r,i){
      var t = T0 + i*STEP, dir = (i % 2 ? -1 : 1);
      tl.to(r,{opacity:1, duration:.12, ease:"none"},t)
        .to(r,{x:0, y:0, scale:1, duration:.5, ease:"back.out(1.7)"},t)
        .fromTo(r,{rotation:dir*22},{rotation:0, duration:.9, ease:"elastic.out(1,0.28)"},t);
    });

    var Z = T0 + (rays.length-1)*STEP + .55;
    tl.to(rays,{opacity:0, duration:.5, ease:"power1.in"},Z+.1);
    tl.to(zoom,{scale:S, x:moveX, y:moveY, svgOrigin:tx+" "+ty, duration:1.3, ease:"power3.inOut"},Z);

    tl.to(loader,{opacity:0, duration:.8, ease:"power2.inOut"},Z+1.05);
    tl.add(intro,Z+1.05);

    function skip(){ tl.timeScale(5); }
    loader.addEventListener("click",skip);
    window.addEventListener("keydown",function(e){ if(e.key==="Escape"||e.key==="Enter") skip(); });
  }

  /* ---- first visit to Home this session: greeting loader. Every other page load: curtain lifts ---- */
  var seen = false;
  try{ seen = sessionStorage.getItem("seen") === "1"; }catch(e){}
  if(isHome && !seen && loader){
    if(curtain) curtain.style.display="none";
    try{ sessionStorage.setItem("seen","1"); }catch(e){}
    document.body.style.overflow="hidden";
    window.__loaderStarted = true;
    runLogoLoader();
  } else {
    if(loader) loader.style.display="none";
    if(curtain){
      gsap.set(curtain,{yPercent:0});
      gsap.to(curtain,{yPercent:-100,duration:.9,delay:.1,ease:"power4.inOut",onComplete:function(){ curtain.style.display="none"; }});
      gsap.delayedCall(.5,intro);
    } else { intro(); }
  }

  /* ---- page transitions: the curtain rises, then we navigate ---- */
  var leaving = false;
  document.querySelectorAll("a[href]").forEach(function(a){
    var href = a.getAttribute("href");
    if(!href || href.charAt(0)==="#" || /^(mailto:|tel:|https?:)/.test(href) || a.target==="_blank") return;
    a.addEventListener("click",function(e){
      if(e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      if(leaving) return;
      leaving = true;
      if(curtain){
        curtain.style.display="flex";
        gsap.fromTo(curtain,{yPercent:100},{yPercent:0,duration:.8,ease:"power4.inOut",onComplete:function(){ window.location.href = href; }});
      } else { window.location.href = href; }
    });
  });
  /* back/forward cache: never leave the curtain stuck over the page */
  window.addEventListener("pageshow",function(e){ if(e.persisted){ leaving=false; if(curtain) curtain.style.display="none"; } });

  /* ---- cursor label on cards ---- */
  var cur = document.getElementById("cursor");
  if(cur){
    var xTo = gsap.quickTo(cur,"x",{duration:.4,ease:"power3"});
    var yTo = gsap.quickTo(cur,"y",{duration:.4,ease:"power3"});
    window.addEventListener("mousemove",function(e){ xTo(e.clientX); yTo(e.clientY); });
    document.querySelectorAll(".card").forEach(function(c){
      c.addEventListener("mouseenter",function(){ cur.textContent = c.dataset.label || "View"; cur.classList.add("on"); });
      c.addEventListener("mouseleave",function(){ cur.classList.remove("on"); });
    });
  }
})();
