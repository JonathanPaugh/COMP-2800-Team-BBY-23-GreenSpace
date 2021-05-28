var id = getUrlQuery().get("id");

/*
* Displays thread components
*/
$(document).ready(() => {
    displayThread();
});

/*
* Inserts post, replies and submit box into page
*/
function displayThread() {
    displayPost();
    displayReplies();
    displaySubmit();
}

/*
* Gets post data and sends it to be displayed in page
*/
function displayPost() {
    database.collection("threads").doc(id).get().then(post => {
        createPost(post.id, post.data().topic, post.data().content, post.data().user);
    });
}

/*
* Creates a post in page
*/
function createPost(postId, topic, content, user) {
    fetchTemplate("thread-post.html", data => {
        let post = $(data).appendTo(".thread-post");
        post.find(".post-topic").html(topic);
        post.find(".post-content").html(content);

        if (user) {
            database.collection("users").doc(user).get().then(user => {
                post.find(".post-user").html(user.data().name);
            });

            // If post is from active user, allow it to be deleted
            withUser(currentUser => {
                if (currentUser.id == user) {
                    fetchTemplate("delete.html", data => {
                        let remove = $(data).prependTo(post.find(".post-body"));
                        remove.click(() => {
                            database.collection("threads").doc(id)
                                .delete()
                                .then(() => { 
                                    
                                    clearUrlQuery();
                                    redirect("/forum.html");
                            });
                        });
                    });
                }
            });
        }
    });
}

/*
* Gets each reply and sends data to be displayed in page
*/
function displayReplies() {
    database.collection("threads").doc(id)
        .collection("replies").orderBy("date", "asc")
        .get().then(replies => {

        replies.docs.forEach(reply => {
            createReply(
                reply.id, 
                reply.data().content, 
                reply.data().user,
                 reply.data().images
            );
        });
    });
}

/*
* Creates a reply in page
*/
function createReply(replyId, content, user, images) {
    fetchTemplate("thread-reply.html", data => {
        let reply = $(data).appendTo(".thread-replies");
        reply.find(".reply-content").html(content);

        if (user) {
            database.collection("users").doc(user).get().then(user => {
                reply.find(".reply-user").html(user.data().name);
            });

            // If reply is from active user, allow it to be deleted
            withUser(currentUser => {
                if (currentUser.id == user) {
                    fetchTemplate("delete.html", data => {
                        let remove = $(data).prependTo(reply.find(".reply-body"));
                        remove.click(() => {
                            database.collection("threads").doc(id)
                                .collection("replies").doc(replyId)
                                .delete()
                                .then(() => redirect("/thread.html"));
                        });
                    });
                }
            });
        }

        // If there are image urls in this post, find them in firebase storage and append them to page
        if (images?.length) {
            let container = createElement("div")
                .appendTo(reply)
                .addClass("card-footer");
            
            images.forEach(async function(image) {
                let url = await storage.ref().child(image).getDownloadURL();
                createElement("img")
                    .appendTo(container)
                    .addClass("img-fluid")
                    .attr("src", url)
                    .attr("alt", `${reply.find(".reply-user").html()} User Image`);
            });
        }
    });
}

/*
* Displays the submit reply box in page
*/
function displaySubmit() {
    fetchTemplate("thread-submit.html", data => {
        let submit = $(data).appendTo(".thread-submit");
        submit.find(".submit-button").click(reply);
        submit.find(".insert-plant").click(selectPlant);
        submit.find(".plant-modal-button").click(insertPlant);
        submit.find(".insert-image").click(selectImage);
        submit.find(".insert-image-file").on("change", insertImage);
    });
}

/*
* Replies to the thread with submit box content.
* If content is not filled, it will prompt the user to input valid data
*/
function reply() {
    requireLogin();

    if (!$(".submit-content").html()) {
        $(".submit-content").addClass("border border-danger");
        return;
    }

    withUser(user => {
        database.collection("threads").doc(id).collection("replies").add({
            content: $(".submit-content").html(),
            user: user.id,
            date: new Date()
        }).then(async function(reply) {
            let paths = [];
            for (let i = 0; i < images.length; i++) {
                let path = `threads/${id}/${reply.id}-${i}.${images[i].name.split(".").pop()}`;
                paths.push(path);
                await storage.ref().child(path).put(images[i]);
            }
            reply.set({
                images: paths
            }, { merge: true }).then(() => {
                redirect("/thread.html");
            });
        });
    });
}

/*
* Shows the select plant modal from submit box
*/
function selectPlant() {
    $(".modal").modal("show");
    $(".plant-modal-input").val("");
}

/*
* Inserts the selected plant into reply content
*/
function insertPlant() {
    let link = createElement("a")
        .appendTo(".submit-content")
        .attr("href", `/search-plant.html?search=${$(".plant-modal-input").val()}`)
        .html($(".plant-modal-input").val());

    $(".modal").modal("hide");
}

/*
* Shows image file picker
*/
function selectImage(event) {
    let input = createElement("input")
        .appendTo(".upload-images")
        .addClass(".upload-image")
        .css("display", "none")
        .attr("type", "file")
        .attr("multiple", "");

    input.on("change", insertImage);
    input.trigger("click");
}

/*
* The images to be uploaded when reply is posted
*/
var images = [];

/*
* Prepares an image to be uploaded
*/
function insertImage(event) {
    let files = Array.from(event.target.files);

    if (!files.length) { 
        return; 
    }

    files.forEach(file => {
        images.push(file);
    });

    // Increases image file counter based on amount of files added
    let counter = $(".upload-counter");
    if (!counter.length) {
        let container = createDiv()
            .insertAfter(".insert-buttons")
            .addClass("d-flex mt-3")

        createDiv()
            .appendTo(container)
            .addClass("mx-1")
            .html("Uploaded Images:")

        counter = createDiv()
            .appendTo(container)
            .addClass("upload-counter")
            .html(files.length);
    } else {
        let count = parseInt(counter.html());
        counter.html(count + files.length);
    }
}

/*
* Test for injecting a dummy reply into the page
*/
function testCreateReply() {
    createReply("TestId", "TestReply", null, null);
}