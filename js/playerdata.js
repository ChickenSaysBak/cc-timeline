let playerdata = undefined;

async function loadData() {

    if (playerdata) return;

    let csv = await fetch("cc-playerdata.csv");
    let data = await csv.text();

    playerdata = $.csv.toObjects(data).map(player => ({
        uuid: player.uuid,
        username: player.username,
        firstPlayed: parseInt(player.first_played, 10),
        lastPlayed: parseInt(player.last_played, 10),
        rank: parseInt(player.rank, 10),
        owner: player.owner ? player.owner : null
    }));

}

async function getMostTime(all) {

    await loadData();

    if (!all) {

        const ownerMap = playerdata.reduce((acc, p) => {
            
            const key = p.owner || p.uuid;
            const currentEntry = acc[key];
        
            acc[key] = {
                firstPlayed: currentEntry ? Math.min(currentEntry.firstPlayed, p.firstPlayed) : p.firstPlayed,
                lastPlayed: currentEntry ? Math.max(currentEntry.lastPlayed, p.lastPlayed) : p.lastPlayed,
            };
        
            return acc;
        
        }, {});
        
        return playerdata
            .filter(p => p.owner === null)
            .map(p => ({
                ...p,
                firstPlayed: ownerMap[p.uuid].firstPlayed,
                lastPlayed: ownerMap[p.uuid].lastPlayed,
            }))
            .sort((p1, p2) => (p2.lastPlayed - p2.firstPlayed) - (p1.lastPlayed - p1.firstPlayed))
            .slice(0, 1000);

    }

    return playerdata.toSorted((p1, p2) => (p2.lastPlayed - p2.firstPlayed) - (p1.lastPlayed - p1.firstPlayed));

}

async function getOverlap(uuid) {

    await loadData();

    const compatiblePlayers = playerdata.reduce((acc, p) => {

        const key = p.owner || p.uuid;

        if (!acc[key]) acc[key] = {minFirstPlayed: Infinity, maxLastPlayed: -Infinity};
        acc[key].minFirstPlayed = Math.min(acc[key].minFirstPlayed, p.firstPlayed);
        acc[key].maxLastPlayed = Math.max(acc[key].maxLastPlayed, p.lastPlayed);

        return acc;

    }, {});

    const player = compatiblePlayers[uuid];

    return playerdata
    .filter(p => !p.owner)
    .filter(p => {
      const relatedPlayer = compatiblePlayers[p.uuid] || {};
      return relatedPlayer.minFirstPlayed < player.maxLastPlayed && relatedPlayer.maxLastPlayed > player.minFirstPlayed;
    })
    .map(p => ({
      ...p,
      firstPlayed: compatiblePlayers[p.uuid].minFirstPlayed,
      lastPlayed: compatiblePlayers[p.uuid].maxLastPlayed
    }))
    .sort((p1, p2) => {
      const p1Diff = Math.abs(p1.firstPlayed - player.minFirstPlayed) + Math.abs(p1.lastPlayed - player.maxLastPlayed);
      const p2Diff = Math.abs(p2.firstPlayed - player.minFirstPlayed) + Math.abs(p2.lastPlayed - player.maxLastPlayed);
      return p1Diff - p2Diff;
    })
    .slice(0, 1000);

}

async function getAlts() {
    await loadData();
    return playerdata.filter(p => p.owner);
}

async function getPlayer(uuid, combineAlts) {

    await loadData();
    let player = structuredClone(playerdata.find(p => p.uuid === uuid));

    if (combineAlts) {
        let ownedAccounts = playerdata.filter(p => p.owner === uuid || p.uuid === uuid);
        player.firstPlayed = Math.min(...ownedAccounts.map(p => p.firstPlayed));
        player.lastPlayed = Math.max(...ownedAccounts.map(p => p.lastPlayed));
    }

    return player;
}

function getOwner(uuid) {
    let player = playerdata.find(p => p.uuid === uuid);
    return player.owner || uuid;
}

// Was used when cc-playerdata rest API was active.
// const BASE_URL = "https://fjbpf3sb3r4dpjauqwzebltr2y0gsqxa.lambda-url.us-east-2.on.aws/api/playerdata";

// async function getMostTime(all) {
//     return fetchJson(BASE_URL + "/most_time" + (all ? "" : "?limit=1000&combineAlts=true"));
// }

// async function getOverlap(uuid) {
//     return fetchJson(BASE_URL + "/overlap/" + uuid + "?limit=1000&combineAlts=true");
// }

// async function getAlts() {
//     return fetchJson(BASE_URL + "/alts");
// }

// async function getPlayer(uuid, combineAlts) {
//     return fetchJson(BASE_URL + "/uuid/" + uuid + (combineAlts ? "?combineAlts=true" : ""));
// }

// async function fetchJson(url) {
//     let response = await fetch(url);
//     return response.json();
// }
