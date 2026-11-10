const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

test("mobile menu hides closed links, isolates content, traps focus and closes on Escape", () => {
  const keyHandlers = {}, mediaHandlers = {};
  const element = () => {
    const classes = new Set(), attrs = {}, handlers = {};
    return {
      handlers, attrs, inert: false,
      classList: { add(c) { classes.add(c); }, remove(c) { classes.delete(c); }, toggle(c,v) { v ? classes.add(c) : classes.delete(c); }, contains(c) { return classes.has(c); } },
      setAttribute(k,v) { attrs[k]=v; }, getAttribute(k) { return attrs[k]; },
      addEventListener(k,v) { handlers[k]=v; }, focus() { document.activeElement=this; }
    };
  };
  const toggle=element(), nav=element(), main=element(), footer=element(), body=element();
  const links=[element(),element(),element()];
  nav.querySelectorAll=()=>links;
  const mobile={matches:true,addEventListener(k,v){mediaHandlers[k]=v;}};
  const document={body,activeElement:null,querySelector(s){return ({'[data-nav-toggle]':toggle,'[data-nav]':nav,main,footer})[s];},addEventListener(k,v){keyHandlers[k]=v;}};
  const source=fs.readFileSync(path.join(__dirname,'../script.js'),'utf8');
  const start=source.indexOf('const setupNavigation =');
  const end=source.indexOf('const setupDialogs =',start);
  vm.runInNewContext(source.slice(start,end)+'\nsetupNavigation();',{document,window:{matchMedia:()=>mobile}});
  assert.equal(nav.inert,true);
  toggle.handlers.click();
  assert.equal(toggle.attrs['aria-expanded'],'true');
  assert.equal(nav.inert,false);
  assert.equal(main.inert,true);
  assert.equal(footer.inert,true);
  document.activeElement=links.at(-1);
  keyHandlers.keydown({key:'Tab',shiftKey:false,preventDefault(){}});
  assert.equal(document.activeElement,toggle);
  keyHandlers.keydown({key:'Escape',preventDefault(){}});
  assert.equal(toggle.attrs['aria-expanded'],'false');
  assert.equal(main.inert,false);
  assert.equal(document.activeElement,toggle);
  toggle.handlers.click();
  mobile.matches=false;
  mediaHandlers.change();
  assert.equal(nav.inert,false);
  assert.equal(body.classList.contains('nav-open'),false);
});
