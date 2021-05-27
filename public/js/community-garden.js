// community garden api path from firestore
var gardens = database.collection("community-gardens");

// reads information of Vancouver community gardens stored in firestore
function createGarden(docID, name, year, address, org, plots, juris, email, website) {

    // fetches template file
    fetchFile("/template/community-garden.html", data => {
        let garden = $(data).appendTo("#container");
        communityGardens.push(garden);

        // gives attributes to the accordion components to flush correct element 
        garden.find(".accordion-header").attr("id", "flush-" + docID);
        garden.find(".accordion-button").attr("data-bs-target", "#A" + docID);
        garden.find(".accordion-button").attr("aria-controls", "A" + docID);
        garden.find(".accordion-collapse").attr("id", "A" + docID);
        garden.find(".accordion-collapse").attr("aria-labelledby", "flush-" + docID);

        // reads information of the gardens
        garden.find(".accordion-button").html(name);
        garden.find(".year-created").html(year);
        garden.find(".address").html(address);
        garden.find(".managing-org").html(org);
        garden.find(".plots").html(plots);
        garden.find(".juris").html(juris);
        garden.find(".email").html(email);
        garden.find(".website").html(website);
        garden.find(".website").attr("href", website);
    });
}

// searches Vancouver community gardens by their names or addresses
function search() {
    document.getElementById("search-garden").addEventListener("keyup", (e) => {
        var input = e.target.value.toLowerCase();

        // hides the garden lists when search box is clicked
        communityGardens.forEach(garden => {
            garden.hide();
        });

        // when the specific input is typed, shows the easter egg
        if (input === "the most beautiful garden") {
            $("#easter-egg").show();

        // the easter egg is not shown until the message is typed
        } else {
            $("#easter-egg").hide();
        }

        // returns the results based on what user have typed in the search box
        communityGardens.filter(garden => {
            var gardenTitles = garden.find(".community-garden-name").html().toLowerCase();
            var gardenAddress = garden.find(".address").html().toLowerCase();
            return gardenTitles.includes(input) || gardenAddress.includes(input);
        }).forEach(garden => {
            if (garden) {
                garden.show();
            }
        });
    })
}