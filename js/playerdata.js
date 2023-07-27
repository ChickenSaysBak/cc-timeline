const BASE_URL = "https://cc-playerdata-webapp.azuremicroservices.io/api/playerdata";

async function getMostTime(all) {
    return fetchJson(BASE_URL + "/most_time" + (all ? "" : "?limit=1000&combineAlts=true"));
}

async function getOverlap(uuid) {
    return fetchJson(BASE_URL + "/overlap/" + uuid + "?limit=1000&combineAlts=true");
}

async function getAlts() {
    return fetchJson(BASE_URL + "/alts");
}

async function getPlayer(uuid, combineAlts) {
    return fetchJson(BASE_URL + "/uuid/" + uuid + (combineAlts ? "?combineAlts=true" : ""));
}

async function fetchJson(url) {
    let response = await fetch(url);
    return response.json();
}
