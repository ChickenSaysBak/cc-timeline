const timelineContainer = document.getElementById('timeline');
var timeline;
var options;

createTimeline();

async function createTimeline(uuid) {

    if (timeline !== undefined) timeline.destroy();
    timeline = new vis.Timeline(timelineContainer);

    let hasPlayer = uuid !== undefined;
    let player = hasPlayer ? await getPlayer(uuid) : undefined;
    
    options = getOptions(player);
    timeline.setOptions(options);

    let playerdata = await (hasPlayer ? getOverlap(uuid) : getAll());
    let alts = await getAlts();

    let items = createItems(playerdata, alts);

    if (hasPlayer) {
        items.push(createDarkenedBackground(player));
        timeline.addCustomTime(player.firstPlayed, 'start');
        timeline.addCustomTime(player.lastPlayed, 'end');
    }

    timeline.setItems(items);
    events();

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

        let altNames = altOwners.get(item.id)
            .sort((a, b) => (b.lastPlayed-b.firstPlayed) - (a.lastPlayed-a.firstPlayed))
            .map(alt => {

                let span = document.createElement('span');
                span.innerText = alt.username;

                let rank = translateRank(alt.rank).toLowerCase();
                if (rank) span.className = rank;

                return span;

            });
            
        let title = document.createElement('span');
        title.innerText = 'Alts: ';

        for (let i = 0; i < altNames.length; ++i) {

            title.appendChild(altNames[i]);
            if (i >= altNames.length-1) continue;

            let comma = document.createElement('span');
            comma.innerText = ', ';
            title.appendChild(comma);

        }

        item.title = title;

        let underlinedName = document.createElement('u');
        underlinedName.innerText = item.content;
        item.content = underlinedName;

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

function events() {

    // When clicking a player, a focused timeline is created showing overlapping players.
    timeline.on('select', function (properties) {
        createTimeline(properties.items);
    });

    // Adjusts height when zoom has changed.
    timeline.on('changed', function () {

        // Prevents window from resetting.
        let window = timeline.getWindow();
        options.start = window.start;
        options.end = window.end;

        options.height = innerHeight-20;
        timeline.setOptions(options);

    });
    
}
