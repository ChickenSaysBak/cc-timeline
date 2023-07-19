const timelineContainer = document.getElementById("timeline");
var timeline;

createTimeline();

async function createTimeline(uuid) {

    let hasPlayer = uuid !== undefined;
    let player = hasPlayer ? await getPlayerData('/uuid/' + uuid) : undefined;

    let params = hasPlayer ? '/overlap/' + uuid + "?limit=1000" : '/most_time?limit=1000';
    let data = await getPlayerData(params);
    if (hasPlayer) data.push(getDarkenedBackground(player));

    timeline = new vis.Timeline(timelineContainer, data, getOptions(player));

    if (hasPlayer) {
        timeline.addCustomTime(player.start, 'start');
        timeline.addCustomTime(player.end, 'end');
    }

    events();

}

function events() {

    // When clicking a player, a focused timeline is created showing overlapping players.
    timeline.on('select', function (properties) {
        timeline.destroy();
        createTimeline(properties.items);
    });

}

function getDarkenedBackground(player) {

    return {
        id: 'background', 
        content: '', 
        start: player.start, 
        end: player.end, 
        type: 'background', 
        style: 'background-color: #00000030'
    };

}
