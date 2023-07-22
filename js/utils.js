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

function createLoader() {

    let loader = document.createElement("div");
    loader.className = "loader";

    return loader;

}

function removeLoader() {
    const loader = document.querySelector(".loader");
    if (loader !== null) loader.remove();
}
