const timelineContainer = document.getElementById("timeline");
var timeline;

createTimeline();

async function createTimeline(uuid) {

    let hasPlayer = uuid !== undefined;
    let player = hasPlayer ? await getPlayer(uuid) : undefined;

    let playerdata = await (hasPlayer ? getOverlap(uuid) : getAll());
    let alts = await getAlts();

    let items = createItems(playerdata, alts);
    if (hasPlayer) items.push(createDarkenedBackground(player));

    timeline = new vis.Timeline(timelineContainer, items, getOptions(player));

    if (hasPlayer) {
        timeline.addCustomTime(player.firstPlayed, 'start');
        timeline.addCustomTime(player.lastPlayed, 'end');
    }

    // When clicking a player, a focused timeline is created showing overlapping players.
    timeline.on('select', function (properties) {
        timeline.destroy();
        createTimeline(properties.items);
    });

}

function createItems(playerdata, alts) {

    let altOwners = new Map();

    for (let alt of alts) {

        let owner = playerdata.find(player => player.uuid === alt.owner);
        if (owner === undefined) continue;

        if (!altOwners.has(owner.uuid)) altOwners.set(owner.uuid, []);
        altOwners.get(owner.uuid).push(alt);

    }

    let items = playerdata.map(player => ({
        id: player.uuid,
        content: player.username,
        start: player.firstPlayed,
        end: player.lastPlayed,
        className: translateRank(player.rank).toLowerCase()
    }));

    for (let item of items) {

        if (!altOwners.has(item.id)) continue;

        let altNames = altOwners.get(item.id).map(alt => alt.username);
        item.title = "Alts: " + altNames.join(', ');
        item.content = "<u>" + item.content + "</u>";

    }

    return items;

}

function createDarkenedBackground(player) {

    return {
        id: 'background', 
        content: '', 
        start: player.firstPlayed, 
        end: player.lastPlayed, 
        type: 'background', 
        style: 'background-color: #00000030'
    };

}
