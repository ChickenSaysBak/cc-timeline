const searchBar = document.getElementById("player-search");
var players = [];

(async function() {
    players = await getMostTime(true);
    autocomplete();
})();

function autocomplete() {

    let currentFocus;
    let currentHover;
    
    searchBar.addEventListener("input", () => search());
    searchBar.addEventListener("focus", () => search());
    searchBar.addEventListener("blur", () => closeResults());
    
    searchBar.addEventListener("keydown", function(e) {
        
        switch (e.key) {

            case "ArrowDown":
                e.preventDefault();
                shiftFocus(1);
                break;
                
            case "ArrowUp":
                e.preventDefault();
                shiftFocus(-1);
                break;

            case "Enter":
                let focused = getFocusedResult();
                submitSearch(focused ? focused.id : undefined);
                break;

        }
        
    });

    function submitSearch(uuid) {

        closeResults();

        if (!uuid) {
            let matching = players.filter(player => player.username.toLowerCase() === searchBar.value.toLowerCase());
            if (matching.length > 0) uuid = matching[0].uuid;
        }

        if (uuid) {
            let matching = players.filter(player => player.uuid === uuid);
            if (matching.length > 0 && matching[0].owner) uuid = matching[0].owner;
            createTimeline(uuid);
        }

    }

    function search() {
    
        const MAX = 12;
        let input = searchBar.value, inputLower = input.toLowerCase();
        
        closeResults();
        if (!input) return false;

        currentFocus = -1;
        shiftFocus();

        let resultsContainer = document.createElement("div");
        resultsContainer.id = searchBar.id + "-results";
        resultsContainer.className = "autocomplete-results";
        searchBar.parentNode.appendChild(resultsContainer);

        let startingWithSearch = players
            .filter(player => player.username.toLowerCase().startsWith(inputLower))
            .slice(0, MAX);

        let includingSearch = players
            .filter(player => !startingWithSearch.includes(player) && player.username.toLowerCase().includes(inputLower))
            .slice(0, MAX - startingWithSearch.length);

        let allResults = startingWithSearch.concat(includingSearch);

        for (let player of allResults) {

            let name = player.username;
            let matchIndex = name.toLowerCase().indexOf(inputLower);
            if (matchIndex < 0) continue;

            let beforeMatch = name.substring(0, matchIndex);
            let matchedText = name.substring(matchIndex, matchIndex + input.length);
            let afterMatch = name.substring(matchIndex + input.length);
        
            let resultDiv = document.createElement("div");
            resultDiv.id = player.uuid;
            resultDiv.innerHTML = `${beforeMatch}<strong>${matchedText}</strong>${afterMatch}`;

            resultDiv.addEventListener("mousedown", (e) => {
                closeResults();
                submitSearch(e.target.id);
            });

            resultDiv.addEventListener("mousemove", () => {
                if (currentHover === resultDiv.id) return;
                currentHover = resultDiv.id;
                setFocus(resultDiv.id);
            });

            resultsContainer.appendChild(resultDiv);

        }
        
    }

    function setFocus(uuid) {

        let resultsContainer = document.getElementById(searchBar.id + "-results");
        if (!resultsContainer) return;

        let results = resultsContainer.getElementsByTagName("div");
        if (!results) return;

        currentFocus = Array.from(results).map(div => div.id).indexOf(uuid);
        shiftFocus(0);

    }

    function shiftFocus(direction) {

        let resultsContainer = document.getElementById(searchBar.id + "-results");
        if (!resultsContainer) return;

        let results = resultsContainer.getElementsByTagName("div");
        if (!results) return;

        for (let result of results) result.classList.remove("autocomplete-focused");
        if (direction === undefined) return;

        currentFocus += direction;

        if (currentFocus >= results.length) currentFocus = 0;
        else if (currentFocus < 0) currentFocus = results.length-1;

        let currentResult = results[currentFocus];
        currentResult.classList.add("autocomplete-focused");
        searchBar.value = currentResult.textContent;

    }
    
    function getFocusedResult() {

        if (currentFocus < 0) return;

        let resultsContainer = document.getElementById(searchBar.id + "-results");
        if (!resultsContainer) return;

        let results = resultsContainer.getElementsByTagName("div");
        if (!results) return;

        return results[currentFocus];

    }

    function closeResults() {
        for (let results of document.getElementsByClassName("autocomplete-results")) results.parentNode.removeChild(results);
    }

    // function setActive(results) {
    
    //     if (!results) return;
    //     removeActive(results);
        
    //     if (currentFocus >= results.length) currentFocus = 0;
    //     if (currentFocus < 0) currentFocus = (results.length - 1);
        
    //     let currentResult = results[currentFocus];
    //     currentResult.classList.add("autocomplete-focused");
    //     searchBar.value = currentResult.getElementsByTagName("input")[0].value;
      
    // }
    
    // function removeActive(results) {
    //     for (let result of results) result.classList.remove("autocomplete-focused");
    // }
    
}
