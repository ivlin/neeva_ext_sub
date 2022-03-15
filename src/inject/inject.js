/**
 *  Constants
 */
const MUTATION_CONFIG = { attributes: true, childList: true, subtree: true };
const QUERY_KEY_BY_SEARCH = {
	"DUCKDUCKGO": "q"
};
const QUERY_DELIMITER = "&";
const KEY_VALUE_DELIMITER = "=";
const SEARCH_ENGINE = "DUCKDUCKGO";
const SEARCH_MODIFIER = "+in+2021";
const SEARCH_MODIFIER_PATTERN = `.*\\+in\\+2021$`;
const AD_COLOR = "#D66";

/**
 * Set up listeners on initialization
 */
let ad_counter = 0;
var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);
		
		updateAds();
		var observer = new MutationObserver(updateAds);
		observer.observe(document, MUTATION_CONFIG);
	}
}, 10);

/**
 * Redirect the page query to have a suffix of "in 2021"
 */
function updateQuery() {
	const query_parameters = window.location.search.substring(1).split(QUERY_DELIMITER);
	for (let ind in query_parameters) {
		const [key, val] = query_parameters[ind].split(KEY_VALUE_DELIMITER);
		if (key == QUERY_KEY_BY_SEARCH[SEARCH_ENGINE] && !val.toLower().match(SEARCH_MODIFIER_PATTERN)) {
			query_parameters[ind] += SEARCH_MODIFIER;
			window.location.search = window.location.search.substring(0,1) + query_parameters.join(QUERY_DELIMITER);
		}
	}
}

/**
 * Color all ads red, send the number and timestamp
 */
function updateAds() {
	const ads = document.querySelectorAll('.badge--ad, #ads > *');
	ads.forEach((element, id) => { element.closest("[data-testid='ad'], .module, #ads > *").style.backgroundColor = AD_COLOR });
	const diff = ads.length - ad_counter;
	if (diff){
		ad_counter += diff;
		chrome.runtime.sendMessage({ "adCount": diff, "timestamp": Math.floor(Date.now()/1000), "type": "WRITE" });
	}
}

/**
 * Page initializtion calls
 */
updateQuery();