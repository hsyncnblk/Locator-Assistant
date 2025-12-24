let isPicking = false;
let highlightBox = null;


chrome.storage.local.get('isPickingActive', (data) => {
    if (data.isPickingActive === false || data.isPickingActive === undefined) {
        isPicking = false; 
    }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.isPickingActive) {
        const isActive = changes.isPickingActive.newValue;
        if (isActive === false) {
            stopPickingMode(); 
        }
    }
});


chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "startPicking") {
    isPicking = true;
    document.body.style.cursor = "crosshair";
    console.log("🎯 Seçim Modu: AÇIK");
  } 
  else if (msg.action === "stopPicking") {
    stopPickingMode();
  }
});

function stopPickingMode() {
  isPicking = false;
  document.body.style.cursor = "default";
  removeHighlight();
  console.log("🛑 Seçim Modu: KAPALI");
}

document.addEventListener("mousemove", (e) => {
  if (!isPicking) return; 
  highlight(e.target);
}, true);

document.addEventListener("click", (e) => {
  if (!isPicking) return; 

  e.preventDefault();
  e.stopPropagation();

  let target = e.target;
  const interactiveTags = ["button", "a", "input", "select", "textarea"];
  
  let parent = target.parentElement;
  let depth = 0;
  while (parent && depth < 3) {
    const tag = parent.tagName.toLowerCase();
    if (interactiveTags.includes(tag) || parent.getAttribute("role") === "button") {
        target = parent;
        break;
    }
    parent = parent.parentElement;
    depth++;
  }



  const locators = generateSmartLocators(target);

  chrome.runtime.sendMessage({
    action: "locatorFound",
    locators: locators
  }).catch(err => console.log("Panel kapalı olabilir:", err));


    flashHighlight(target);

}, true);

function highlight(el) {
  if (!highlightBox) {
    highlightBox = document.createElement("div");
    Object.assign(highlightBox.style, {
      position: "fixed",
      border: "2px solid #3498db",
      background: "rgba(52, 152, 219, 0.2)",
      zIndex: "9999999",
      pointerEvents: "none",
      borderRadius: "4px",
      transition: "all 0.1s ease"
    });
    document.body.appendChild(highlightBox);
  }
  const rect = el.getBoundingClientRect();
  highlightBox.style.top = rect.top + "px";
  highlightBox.style.left = rect.left + "px";
  highlightBox.style.width = rect.width + "px";
  highlightBox.style.height = rect.height + "px";
}

function removeHighlight() {
  if (highlightBox) {
    highlightBox.remove();
    highlightBox = null;
  }
}

function flashHighlight(el) {
    if(!highlightBox) return;
    highlightBox.style.border = "2px solid #2ecc71"; // Yeşil
    highlightBox.style.background = "rgba(46, 204, 113, 0.3)";
    setTimeout(() => {
        if(isPicking) {
            highlightBox.style.border = "2px solid #3498db"; // Maviye dön
            highlightBox.style.background = "rgba(52, 152, 219, 0.2)";
        } else {
            removeHighlight();
        }
    }, 500);
}

function generateSmartLocators(el) {
  const list = [];
  const add = (score, type, value, varName) => {
    if (!list.find(x => x.value === value)) {
        list.push({ score, type, value, varName });
    }
  };

  const tag = el.tagName.toLowerCase();
  const rawText = el.textContent ? el.textContent.trim() : "";
  const cleanText = rawText.replace(/\s+/g, " ").substring(0, 30);
  
  let baseVar = "element";
  if (el.getAttribute("data-testid")) baseVar = el.getAttribute("data-testid");
  else if (el.id && !/\d/.test(el.id)) baseVar = el.id;
  else if (cleanText.length > 0) baseVar = cleanText;
  
  baseVar = baseVar.replace(/[^a-zA-Z0-9]/g, "");
  if (baseVar.length === 0) baseVar = tag;
  baseVar = baseVar.charAt(0).toLowerCase() + baseVar.slice(1); // camelCase başla

  const testAttrs = ["data-testid", "data-cy", "data-test", "data-automation-id"];
  testAttrs.forEach(attr => {
    if (el.hasAttribute(attr)) {
        add(100, "Test ID", `[${attr}="${el.getAttribute(attr)}"]`, baseVar);
    }
  });

  if (cleanText.length > 0 && ["button", "a", "label", "h1", "h2", "span", "div"].includes(tag)) {
      add(95, "Text", cleanText, baseVar);
  }

  if (el.id) {
    if (!/\d/.test(el.id)) {
        add(90, "ID", `#${el.id}`, baseVar);
    } else {
        add(40, "Dynamic ID", `#${el.id}`, baseVar);
    }
  }

  if (el.getAttribute("placeholder")) {
      add(85, "Placeholder", `[placeholder="${el.getAttribute("placeholder")}"]`, baseVar + "Input");
  }

  if (el.name) {
      add(80, "Name", `[name="${el.name}"]`, el.name);
  }


  if (tag === "input" && el.type) {
      add(70, "Input Type", `input[type="${el.type}"]`, baseVar);
  }

  if (el.classList.length > 0) {
      const validClasses = [...el.classList].filter(c => !/\d/.test(c) && !['active', 'focus', 'hover'].includes(c));
      if (validClasses.length > 0) {
          add(60, "Class", `.${validClasses.join(".")}`, baseVar);
      }
  }

  add(50, "Abs XPath", getAbsoluteXPath(el), baseVar);

  return list.sort((a, b) => b.score - a.score);
}

function getAbsoluteXPath(element) {
    if (element.tagName.toLowerCase() === 'html') return '/html[1]';
    if (element === document.body) return '/html[1]/body[1]';
    let ix = 0;
    const siblings = element.parentNode ? element.parentNode.childNodes : [];
    for (let i = 0; i < siblings.length; i++) {
        const sibling = siblings[i];
        if (sibling === element) return getAbsoluteXPath(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
        if (sibling.nodeType === 1 && sibling.tagName === element.tagName) ix++;
    }
    return '';
}