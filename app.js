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

  /* ---- first visit to Home this session: greeting loader. Every other page load: curtain lifts ---- */
  var seen = false;
  try{ seen = sessionStorage.getItem("seen") === "1"; }catch(e){}
  if(isHome && !seen && loader){
    if(curtain) curtain.style.display="none";
    try{ sessionStorage.setItem("seen","1"); }catch(e){}
    document.body.style.overflow="hidden";
    var tl = gsap.timeline({onComplete:function(){ loader.style.display="none"; document.body.style.overflow=""; }});
    gsap.utils.toArray(".loader .word").forEach(function(w){
      tl.fromTo(w,{opacity:0,y:20},{opacity:1,y:0,duration:.18,ease:"power2.out"}).to(w,{opacity:0,duration:.1},"+=.14");
    });
    tl.to(loader,{yPercent:-100,duration:1,ease:"power4.inOut"}).add(intro,"-=.55");
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
