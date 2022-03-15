async function handleUpdate(result,sender) {
  // ignore updates from content scripts
  if ("type" in result) {
    return
  }
  
  document.querySelector("#adCountTotal").innerHTML = result.adCountTotal;
  document.querySelector("#adCount24Hr").innerHTML = result.adCount24HrTotal;

  // Create table
  const tabs = await chrome.tabs.query({ windowId: window.WINDOW_ID_CURRENT });

  const adTable = document.querySelector("#adsByTab");
  while (adTable.firstChild) {
    adTable.firstChild.remove(); 
  }
  for (tab of tabs) {
    const tableRow = document.createElement("tr");
    const tabName = document.createElement("td");
    tabName.classList.add("tabTitle");
    tabName.appendChild(document.createTextNode(`${tab.title} - `));
    const tabData = document.createElement("td");
    tabData.appendChild(document.createTextNode(result.adsByTab[tab.id] | 0));
    tableRow.appendChild(tabName);
    tableRow.appendChild(tabData);
    adTable.appendChild(tableRow);
  }
}


// Initialization - add the pre-existing count
chrome.runtime.sendMessage({ "type": "READ" }, handleUpdate);

// Callback - receive updates from current page
chrome.runtime.onMessage.addListener(handleUpdate);