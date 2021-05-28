var type = getUrlQuery().get("type");
var typeId = getUrlQuery().get("typeId");

/*
* Plant selected using the search bar
*/
var selectedPlant;

/*
* Inserts options into page, inserts tracked plants into page, 
*   inserts time slider into page in bottom navbar
*/
$(document).ready(() => {
    createOptions();
    displayPlants();
    $(document).on("navbottom", createTime);
});

/*
* Gets all the trackers matching the type and typeId
* This is so this page can be implemented into any feature in the site
* 
* The type query specifies the type of tracker
* The typeId query specifies the id for that type
* 
* Having two parameters allows id's to never clash for example, if the 
*   user collection and group collection have two docs of the same id
* 
* User Tracker Ex: url?type=user&typeId={USERID}
* Group Tracker Ex: url?type=group&typeId={GROUPID}
*/
function getTrackers() {
    return database.collection("tracker")
        .where("_type", "==", type)
        .where("_typeId", "==", typeId)
        .get();
}

/*
* Gets all plants in database, callback is called when they are retreived with the plant data
*/
function withPlants(callback) {
    getTrackers().then(trackers => {
        trackers.docs.forEach(tracker => {
            let trackerRef = database.collection("tracker").doc(tracker.id);
            trackerRef.collection("plants").get().then(plants => {
                callback(plants.docs);
            });
        });
    });
}

/*
* Sets a plant's values in database with given id
* Can include a callback the is called when plant is successfully updated
*/
function setPlant(id, data, callback) {
    getTrackers().then(trackers => {
        trackers.docs.forEach(tracker => {
            let trackerRef = database.collection("tracker").doc(tracker.id);
            trackerRef.collection("plants").doc(id).set(data, { merge: true }).then(() => {
                if (callback) {
                    callback();
                }
            });
        });
    });
}

/*
* Deletes a plant from database with given id
* Can include a callback the is called when plant is successfully deleted
*/
function deletePlant(id, callback) {
    getTrackers().then(trackers => {
        trackers.docs.forEach(tracker => {
            let trackerRef = database.collection("tracker").doc(tracker.id);
            trackerRef.collection("plants").doc(id).delete().then(() => {
                if (callback) {
                    callback();
                }
            });
        });
    });
}

/*
* Creates options, waiting for each to finish setting up so they are always in order
*/
async function createOptions() {
    await createOptionTrack();
    await createOptionSettings();
}

/*
* Creates the track option and attaches a modal to the button click
* The modal inits the search box on show
* The modal validates the selected plant and adds it to tracker 
*   and closes if successful or shows the user a validation errot if not
* 
* Returns a promise that is resolved after the option is all set up and inserted in dom
*/
function createOptionTrack() {
    return new Promise(resolve => {
        fetchTemplate("tracker/tracker-option-track.html", data => {
            let track = $(data).appendTo(".tracker-options");
            track.find(".tracker-option-track").click(() => {
                createModal("track", modal => {
                    searchInit();
                }, null, modal => {
                    if (selectedPlant) {
                        addPlant(selectedPlant, modal.find(".selected-plant"));
                        modal.modal("hide");
                        modal.remove();
                    } else {
                        addPlantError();
                    }
                });
            });
            resolve();
        });
    });
}

/*
* Creates the settings modal and attaches a modal to the button click
* The modal creates plant settings on show, 
* The modal refreshes the page if the modal is hidden or button is clicked
* 
* Returns a promise that is resolved after the modal is all set up and inserted in dom
*/
function createOptionSettings() {
    return new Promise(resolve => {
        fetchTemplate("tracker/tracker-option-settings.html", data => {
            let track = $(data).appendTo(".tracker-options");
            track.find(".tracker-option-settings").click(() => {
                createModal("settings", modal => {
                    withPlants(plants => {
                        plants.forEach(plant => {
                            createPlantSetting(plant, modal.find(".modal-body"));
                        });
                    });
                }, modal => {
                    redirect("/tracker.html");
                }, modal => {
                    redirect("/tracker.html");
                }); 
            });
            resolve();
        });
    });
}

/*
* Generic function for injecting modals into page and cleaning them up when they are closed
* Fetches the file from first parameter, Ex: tracker/tracker-modal-{PARAMETER}.html 
* The callbacks show, hide and click allow the modal behaviour to be controlled from an outside function
*/
function createModal(modal, show, hide, click) {
    fetchTemplate(`tracker/tracker-modal-${modal}.html`, data => {
        let modal = $(data).prependTo("body");
        modal.modal("show");
        if (show) {
            show(modal);
        }
        modal.on("hidden.bs.modal", event => {
            if (hide) {
                hide(modal);
            }
            event.preventDefault();
            modal.remove();
        });
        modal.find(".modal-click").click(() => {
            if (click) {
                click(modal);
            }
        });
    });
}

/*
* Inits the plant search with success and error handlers
*/
function searchInit() {
    searchPlantInit(searchPlantSuccess, searchPlantError);
}

/*
* In case of plant search success, creates selected plant in modal
*/
function searchPlantSuccess(plant) {
    $(".modal-click").removeClass("btn-disabled");
    $(".search-result").empty();
    createSelection(plant);
    
}

/*
* In case of plant search error when result cannot be found
*/
function searchPlantError(error) {
    console.log(error);
    $(".modal-click").addClass("btn-disabled");
    $(".search-result").empty();
    selectedPlant = null;
    createDiv()
        .appendTo(".search-result")
        .addClass("search-error pt-4 text-danger text-center")
        .html(error.responseText);
}

/*
* In case of error when user does not search for a plant to add before trying to create it
*/
function addPlantError() {
    $(".search-result").empty();
    createDiv()
        .appendTo(".search-result")
        .addClass("search-error pt-4 text-danger text-center")
        .html("Please search for a plant to create");
}

/*
* Displays the searched plant in the modal window with attributes
*/
function createSelection(plant) {
    $(".selected-plant").empty();
    selectedPlant = plant;
    fetchTemplate("/tracker/tracker-selection.html", data => {
        let selection = $(data).appendTo(".search-result");
        selection.find(".selected-plant-name").html(plant.primaryCommonName);
        selection.find(".selected-plant-date").val(new Date().toLocaleDateString("en-CA"));
        if (plant.images) {
            selection.find(".selected-plant-image").attr("src", plant.images[0]);
        }
    });
}

/*
* Adds the selected plant and attributes to the tracker
*/
function addPlant(plant, selection) {
    getTrackers().then(async function(trackers) {
        let docs = trackers.docs;

        if (!docs.length) {
            await database.collection("tracker").add({
                _type: type,
                _typeId: typeId,
            }).then(tracker => {
                docs.push(tracker);
            });
        }

        for (let tracker of docs) {
            let trackerRef = database.collection("tracker").doc(tracker.id);
            await trackerRef.collection("plants").add({
                id: plant.uniqueId,
                image: plant.images ? plant.images[0] : null,
                date: new Date(selection.find(".selected-plant-date").val()),
                quantity: selection.find(".selected-plant-quantity").val()
            });
        }

        redirect("tracker.html");
    });
}

/*
* Gets all plants from the database and displays them in the page
*/
function displayPlants() {
    withPlants(plants => {
        plants.forEach(plant => {
            createPlantTracked(plant, $(".tracker-plants"));
        });
    });
}

/*
* Creates a tracked plant from template file and injects it into the given container
* This container will usually be the tracked plants container but it is a parameter just in case for modularity
*/
function createPlantTracked(doc, container) {
    request("/get-plant", { id: doc.data().id }, plant => {
        fetchTemplate("/tracker/tracker-plant.html", data => {

            let tracked = $(data).appendTo(container);
            tracked.find(".tracker-plant-name").html(plant.primaryCommonName);
            tracked.find(".tracker-plant-image").attr("src", doc.data().image);

            let date = doc.data().date.toDate();
            tracked.find(".tracker-plant-date").html(`Planted ${date.toLocaleDateString("en-ca")}`);

            let age = getAge(date);
            tracked.find(".tracker-plant-age").attr("default", age).html(age);

            let quantity = doc.data().quantity;
            tracked.find(".tracker-plant-quantity").attr("default", quantity).html(quantity);

            let maturity = doc.data().maturity;
            let maxHeight = doc.data().maxHeight;
            if (maturity && maxHeight) {
                let height = getHeight(age, maturity, maxHeight);
                tracked.find(".tracker-plant-height")
                    .attr("maturity", maturity)
                    .attr("max-height", maxHeight)
                    .html(height + "m");
            }

            tracked.find(".tracker-plant-delete").click(() => {
                deletePlant(doc.id, () => redirect("/tracker.html"));
            });
        });
    });
}

/*
* Creates a plant setting from template file and injects it into the given container
* This container will usually be the options container but it is a parameter just in case for modularity
*/
function createPlantSetting(doc, container) {
    request("/get-plant", { id: doc.data().id }, plant => {
        fetchTemplate("/tracker/tracker-setting.html", data => {
            let setting = $(data).appendTo(container);
            let safeId = doc.data().id.replaceAll(".", "");
            setting.find(".setting-body").attr("id", safeId);
            setting.find(".setting-name")
                .attr("data-bs-target", `#${safeId}`)
                .attr("aria-controls", safeId)
                .html(plant.primaryCommonName);

            setting.find(".setting-maturity").val(doc.data().maturity).on("input", function() {
                setPlant(doc.id, { maturity: $(this).val() });
            });

            setting.find(".setting-max-height").val(doc.data().maxHeight).on("input", function() {
                setPlant(doc.id, { maxHeight: $(this).val() });
            });;
        });
    });
}

/*
* Creates time slider from template file and injects it into the bottom navbar
*/
function createTime() {
    fetchTemplate("/tracker/tracker-time.html", data => {
        $(data).appendTo(".navbar-bottom");
        $(".time-slider").on("input change", timeUpdate);
        $(".navbar-bottom").addClass("px-2").css("background-color", "var(--color-background)")
        $(".time-info").popover()
    });
}

/*
* Updates the values of all plants when time slider is dragged
* Calculates new age, and uses this age to calculate heights
*/
function timeUpdate() {
    let value = parseInt($(this).val());
    $(".tracker-plant-attributes").each(function() {
        let age = $(this).find(".tracker-plant-age");
        let ageDefault = parseInt(age.attr("default"));
        let ageValue = ageDefault + value;
        age.html(ageValue);

        let height = $(this).find(".tracker-plant-height");

        if (height.html() != "N/A") {
            let heightValue = getHeight(ageValue, height.attr("maturity"), height.attr("max-height"));
            height.html(heightValue + "m");
        }
    });
}

/* Used a stackoverflow.com reference to build the invert function
* @author André Snede @ stackoverflow.com
* @see https://stackoverflow.com/questions/4060004/calculate-age-given-the-birth-date-in-the-format-yyyymmdd
*/

/*
* Reference Start
*/

/*
* Calculates age based on current date
* May be slightly off depending on leap years
*/
function getAge(date) {
    let age = new Date(Date.now() - date.getTime());
    return Math.abs(age.getUTCFullYear() - 1970);
}

/*
* Reference End
*/

/*
* Calculates height based on age, and max height at age of maturity
* The range is (0 to maxHeight)
*/
function getHeight(age, maturity, maxHeight) {
    return (Math.min(age / maturity, 1) * maxHeight).toFixed(2);
}

/*
* Test for injecting a dummy option into the page
*/
function testCreateOptionContainer() {
    let option = createElement("div").appendTo(".tracker-options").addClass("tracker-option col");
    createElement("div").appendTo(option).addClass("card h-100").html("TestOption");
}

/*
* Test for injecting a dummy plant into the page
*/
function testCreatePlantContainer() {
    fetchTemplate("/tracker/tracker-plant.html", data => {
        let tracked = $(data).appendTo(".tracker-plants");
    });
}