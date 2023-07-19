async function getPlayerData(params) {

    let response = await fetch('https://cc-playerdata-webapp.azuremicroservices.io/api/playerdata' + params);
    let json = await response.json();

    const mapPlayerData = playerdata => ({
        id: playerdata.uuid,
        content: playerdata.username,
        start: playerdata.firstPlayed,
        end: playerdata.lastPlayed,
        className: translateRank(playerdata.rank).toLowerCase()
    });
    
    if (Array.isArray(json)) return json.map(mapPlayerData);
    else return mapPlayerData(json);

}

function translateRank(rank) {
    
    switch (rank) {

        case 5:
            return "Cloudian";
            
        case 4:
            return "Elder";

        case 3:
            return "Chicken";

        case 2:
            return "Chick";

        case 1:
            return "Egg";

        default:
            return "";

    };

}
