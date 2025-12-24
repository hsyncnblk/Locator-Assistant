let currentFramework = "selenium-pf";

const toggle = document.getElementById("toggle-picker");
const statusText = document.getElementById("status-text");
const frameworkSelect = document.getElementById("framework-select");
const resultsDiv = document.getElementById("results-container");
const notification = document.getElementById("notification");
const closeBtn = document.getElementById("close-btn");


chrome.storage.local.set({ isPickingActive: true });


closeBtn.addEventListener("click", () => {

  if (toggle.checked) {
    toggle.checked = false;
    statusText.textContent = "Seçim Kapalı";
    statusText.style.color = "#888";
  }
  

  chrome.storage.local.set({ isPickingActive: false }); 

  sendMsg("stopPicking"); 
  window.close();         
});

toggle.addEventListener("change", () => {
  const isOn = toggle.checked;
  statusText.textContent = isOn ? "Seçim Modu: AÇIK" : "Seçim Kapalı";
  statusText.style.color = isOn ? "#2ecc71" : "#888";
  
  sendMsg(isOn ? "startPicking" : "stopPicking");
});

frameworkSelect.addEventListener("change", (e) => {
  currentFramework = e.target.value;

});


chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "locatorFound") {
    renderResults(msg.locators);
  }
});


window.addEventListener('pagehide', () => {
  chrome.storage.local.set({ isPickingActive: false }); 

  if (toggle.checked) {
    sendMsg("stopPicking");
  }
});


function sendMsg(action) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { action: action }).catch(() => {
      });
    }
  });
}

function renderResults(locators) {
  resultsDiv.innerHTML = "";
  
  locators.forEach(loc => {
    const formattedCode = formatCode(loc);
    
    let scoreClass = "score-low";
    if (loc.score >= 90) scoreClass = "score-high";
    else if (loc.score >= 60) scoreClass = "score-mid";

    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <div class="card-header">
        <span>${loc.type}</span>
        <span class="${scoreClass}">%${loc.score} Güven</span>
      </div>
      <div class="code-box" title="Kopyalamak için tıkla">${formattedCode}</div>
    `;

    div.querySelector(".code-box").addEventListener("click", () => {
      navigator.clipboard.writeText(formattedCode);
      showNotification();
    });

    resultsDiv.appendChild(div);
  });
}

function formatCode(loc) {
  const val = loc.value;
  const varName = loc.varName || "element";

  switch (currentFramework) {
    case "selenium-pf": // Page Factory (@FindBy)
      let strategy = "xpath";
      let actualVal = val;

      if (loc.type === "ID") {
        strategy = "id";
        actualVal = val.replace("#", ""); 
      } else if (loc.type === "Name") {
        strategy = "name";
        actualVal = val.replace('[name="', '').replace('"]', '');
      } else if (loc.type === "Class") {
        strategy = "css"; 
      } else if (loc.type === "Text") {
        strategy = "xpath";
        actualVal = `//*[normalize-space()='${val}']`;
      } else if (!val.startsWith("//") && !val.startsWith("(")) {
        strategy = "css";
      }

      // 'private'
      return `@FindBy(${strategy} = "${actualVal}")\n private WebElement ${varName};`;

    case "playwright":
      if (loc.type === "Text") return `await page.getByText('${val}').click();`;
      if (loc.type === "Test ID") return `await page.getByTestId('${val.replace(/[\[\]"]/g, '').split('=')[1]}').click();`;
      if (loc.type === "Placeholder") return `await page.getByPlaceholder('${val.replace(/\[placeholder="|"]/g, '')}').fill('...');`;
      return `await page.locator('${val}').click();`;

    case "cypress":
      if (loc.type === "Text") return `cy.contains('${val}').click();`;
      return `cy.get('${val}').should('be.visible');`;

    case "selenium": 
      if (val.startsWith("//")) return `driver.findElement(By.xpath("${val}"));`;
      return `driver.findElement(By.cssSelector("${val}"));`;

    default:
      return val;
  }
}

function showNotification() {
  notification.classList.add("show");
  setTimeout(() => notification.classList.remove("show"), 2000);
}