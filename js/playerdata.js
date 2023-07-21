const BASE_URL = 'https://cc-playerdata-webapp.azuremicroservices.io/api/playerdata';
const PARAMS = '?limit=1000&combineAlts=true'

async function getAll() {
    return fetchJson(BASE_URL + '/most_time' + PARAMS);
}

async function getOverlap(uuid) {
    return fetchJson(BASE_URL + '/overlap/' + uuid + PARAMS);
}

async function getAlts() {
    return fetchJson(BASE_URL + '/alts');
}

async function getPlayer(uuid) {
    return fetchJson(BASE_URL + '/uuid/' + uuid);
}

async function fetchJson(url) {
    let response = await fetch(url);
    return response.json();
}
