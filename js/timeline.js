const timelineContainer = document.getElementById("timeline");
var timeline;
var options;

createTimeline();

async function createTimeline(uuid) {

    if (timeline !== undefined) {
        timeline.destroy();
        timelineContainer.append(createLoader());
        document.getElementById("player-search").blur();
    }

    timeline = new vis.Timeline(timelineContainer);

    let hasPlayer = uuid !== undefined;
    let player = hasPlayer ? await getPlayer(uuid, true) : undefined;
    
    options = getOptions(player);
    timeline.setOptions(options);

    let playerdata = await (hasPlayer ? getOverlap(uuid) : getMostTime());
    let alts = await getAlts();
    let items = await createItems(playerdata, alts, player);

    if (hasPlayer) {
        timeline.setGroups([{id: "focused", content: ""}, {id: "unfocused", content: ""}]);
        items.push(createDarkenedBackground(player));
        timeline.addCustomTime(player.firstPlayed, "start");
        timeline.addCustomTime(player.lastPlayed, "end");
    }

    timeline.setItems(items);
    events();

}

async function createItems(playerdata, alts, focusedPlayer) {

    let altOwners = new Map();

    for (let alt of alts) {

        let owner = playerdata.find(player => player.uuid === alt.owner);
        if (owner === undefined) continue;

        if (!altOwners.has(owner.uuid)) altOwners.set(owner.uuid, []);
        altOwners.get(owner.uuid).push(alt);

    }

    // Adds the focused player's alts and reverts to focused player's original time span instead of combined.
    if (focusedPlayer && altOwners.has(focusedPlayer.uuid)) {
        Array.prototype.push.apply(playerdata, altOwners.get(focusedPlayer.uuid));
        focusedPlayer = await getPlayer(focusedPlayer.uuid, false);
    }

    let items = playerdata.map(player => ({
        id: player.uuid,
        content: player.username,
        start: focusedPlayer && focusedPlayer.uuid == player.uuid ? focusedPlayer.firstPlayed : player.firstPlayed,
        end: focusedPlayer && focusedPlayer.uuid == player.uuid ? focusedPlayer.lastPlayed :  player.lastPlayed,
        className: translateRank(player.rank).toLowerCase(),
        owner: player.owner,
        group: focusedPlayer && (player.uuid === focusedPlayer.uuid || player.owner === focusedPlayer.uuid) ? "focused" : "unfocused"
    }));

    for (let item of items) {

        if (!altOwners.has(item.id)) continue;

        let altNames = altOwners.get(item.id)
            .sort((a, b) => (b.lastPlayed-b.firstPlayed) - (a.lastPlayed-a.firstPlayed))
            .map(alt => {

                let span = document.createElement("span");
                span.innerText = alt.username;

                let rank = translateRank(alt.rank).toLowerCase();
                if (rank) span.className = rank;

                return span;

            });
            
        let title = document.createElement("span");
        title.innerText = "Alts: ";

        for (let i = 0; i < altNames.length; ++i) {

            title.appendChild(altNames[i]);
            if (i >= altNames.length-1) continue;

            let comma = document.createElement("span");
            comma.innerText = ", ";
            title.appendChild(comma);

        }

        item.title = title;

        let underlinedName = document.createElement("u");
        underlinedName.innerText = item.content;
        item.content = underlinedName;

    }

    return items;

}

function createDarkenedBackground(player) {

    return {
        id: "background", 
        content: "", 
        start: player.firstPlayed, 
        end: player.lastPlayed, 
        type: "background", 
        style: "background-color: #0000003a"
    };

}

function events() {

    // When clicking a player, a focused timeline is created showing overlapping players.
    timeline.on("select", (properties) => {
        document.getElementById("player-search").value = "";
        createTimeline(properties.items);
    });

    // Removes loading screen
    timeline.on("changed", () => removeLoader());
    
}
