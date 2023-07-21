const timeFormat = {

    minorLabels: {
      millisecond:'SSS',
      second:     's',
      minute:     'hh:mm a',
      hour:       'hh:mm a',
      weekday:    'ddd D',
      day:        'D',
      week:       'w',
      month:      'MMM',
      year:       'YYYY'
    },

    majorLabels: {
      millisecond:'hh:mm:ss a',
      second:     'D MMMM hh:mm a',
      minute:     'ddd D MMMM',
      hour:       'ddd D MMMM',
      weekday:    'MMMM YYYY',
      day:        'MMMM YYYY',
      week:       'MMMM YYYY',
      month:      'YYYY',
      year:       ''
    }

};

function getDefaultOptions() {

    return {

        showCurrentTime: false,
        height: innerHeight-20,
        start: '2016-01-01',
        end: '2023-06-01',
        min: '2016-01-01',
        max: '2023-06-01',
        zoomKey: 'ctrlKey',
        verticalScroll: true,
        horizontalScroll: true,
        orientation: {axis: 'both', item: 'top'},
        tooltip: {delay: 100},
        format: timeFormat,
    
        order: (item1, item2) => {
    
            let total1 = item1.end-item1.start;
            let total2 = item2.end-item2.start;
    
            if (total1 > total2) return -1;
            else if (total1 < total2) return 1;
            else return 0;
    
        }
    
    };

}

function getPlayerOptions(player) {

    let options = getDefaultOptions();
    let start = player.start, end = player.end;
    let margin = (end-start) * 0.05;

    options.start = start-margin;
    options.end = end+margin;

    options.order = (item1, item2) => {
    
        if (player.id === item1.id) return -1;
        else if (player.id === item2.id) return 1;

        let s = player.start, e = player.end;
        let s1 = item1.start, e1 = item1.end;
        let s2 = item2.start, e2 = item2.end;

        let absDif1 = Math.abs(s-s1) + Math.abs(e-e1);
        let absDif2 = Math.abs(s-s2) + Math.abs(e-e2);

        if (absDif1 < absDif2) return -1;
        else if (absDif1 > absDif2) return 1;
        else return 0;

    };

    return options;

}

function getOptions(player) {
    if (player !== undefined) return getPlayerOptions(player);
    return getDefaultOptions();
}
