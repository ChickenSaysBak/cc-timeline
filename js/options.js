const timeFormat = {

    minorLabels: {
      millisecond:"SSS",
      second:     "s",
      minute:     "hh:mm a",
      hour:       "hh:mm a",
      weekday:    "ddd D",
      day:        "D",
      week:       "w",
      month:      "MMM",
      year:       "YYYY"
    },

    majorLabels: {
      millisecond:"hh:mm:ss a",
      second:     "D MMMM hh:mm a",
      minute:     "ddd D MMMM",
      hour:       "ddd D MMMM",
      weekday:    "MMMM YYYY",
      day:        "MMMM YYYY",
      week:       "MMMM YYYY",
      month:      "YYYY",
      year:       ""
    }

};

function getDefaultOptions() {

    return {

        showCurrentTime: false,
        height: "100%",
        start: "2016-01-01",
        end: "2023-06-01",
        min: "2016-01-01",
        max: "2023-06-01",
        zoomKey: "ctrlKey",
        verticalScroll: true,
        horizontalScroll: true,
        orientation: {axis: "both", item: "top"},
        tooltip: {delay: 0, followMouse: true},
        format: timeFormat,
        order: (item1, item2) => (item2.end-item2.start) - (item1.end-item1.start)
    
    };

}

function getPlayerOptions(player) {

    let options = getDefaultOptions();
    let start = player.firstPlayed, end = player.lastPlayed;
    let margin = (end-start) * 0.05;

    options.start = start-margin;
    options.end = end+margin;

    options.order = (item1, item2) => {
    
        if (player.uuid === item1.id) return -1;
        else if (player.uuid === item2.id) return 1;

        let s = player.firstPlayed, e = player.lastPlayed;
        let s1 = item1.start, e1 = item1.end;
        let s2 = item2.start, e2 = item2.end;

        let absDif1 = Math.abs(s-s1) + Math.abs(e-e1);
        let absDif2 = Math.abs(s-s2) + Math.abs(e-e2);

        return absDif1 - absDif2;

    };

    return options;

}

function getOptions(player) {
    if (player !== undefined) return getPlayerOptions(player);
    return getDefaultOptions();
}
