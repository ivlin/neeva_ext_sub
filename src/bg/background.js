// Only maintain second-level granularity
const SECONDS_PER_DAY = 86400;

const adsByTab = {};
let adCountTotal = 0;
let adCountTimeline = Array(SECONDS_PER_DAY).fill(0);
let updateTimestamp = Array(SECONDS_PER_DAY).fill(0);
let adCount24HrTotal = 0;

// Update the timeline
function updateTimeline(oldData=[], oldDataTs) {
  const now = Math.floor(Date.now() / 1000);
  
  for (let ind of oldData) {
    adCountTimeline[ind] = oldData[ind];
    updateTimestamp[ind] = oldDataTs[ind];
  }

  adCount24HrTotal = adCountTimeline.reduce((cum,cur,ind) => 
    (updateTimestamp[ind] > now - SECONDS_PER_DAY) ? (cum + cur) : cum, 0);
}

// Initialization - add the pre-existing count
chrome.storage.local.get(["adCountTotal", "adCountTimeline", "updateTimestamp"], 
  function(result){ 
    if (result.adCountTotal) {
      adCountTotal += result.adCountTotal;
      updateTimeline(result.adCountTimeline, result.updateTimestamp);
    }
  }
);

// Callback - handle updates from the current pages
function handleRead(request, sender, sendResponse) {
  updateTimeline();
  console.log({ "adCountTotal": adCountTotal, "adCount24HrTotal": adCount24HrTotal, "adsByTab": adsByTab});
  sendResponse({ "adCountTotal": adCountTotal, "adCount24HrTotal": adCount24HrTotal, "adsByTab": adsByTab});
}

function handleWrite(request, sender) {
  // Update counts and timeline
  adCountTotal += request.adCount;
  adsByTab[sender.tab.id] = (adsByTab[sender.tab.id] | 0) + request.adCount;

  // Handle multiple requests in the same second
  if (request.timestamp == updateTimestamp[request.timestamp % SECONDS_PER_DAY]) {
    adCountTimeline[request.timestamp % SECONDS_PER_DAY] += request.adCount;
  } 
  else {
    adCountTimeline[request.timestamp % SECONDS_PER_DAY] = request.adCount;
    updateTimestamp[request.timestamp % SECONDS_PER_DAY] = request.timestamp;
  }

  // Update storage
  chrome.storage.local.set({ "adCountTotal": adCountTotal, "adCountTimeline": adCountTimeline, "updateTimestamp": updateTimestamp});
  // Update popup
  updateTimeline();
  chrome.runtime.sendMessage({ "adCountTotal": adCountTotal, "adCount24HrTotal": adCount24HrTotal, "adsByTab": adsByTab });
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.type == "READ") { handleRead(request, sender, sendResponse); }
    else if (request.type == "WRITE") { handleWrite(request, sender); }
  }
);
