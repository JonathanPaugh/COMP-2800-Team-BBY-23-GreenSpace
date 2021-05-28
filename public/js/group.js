// variables used to get the parameters of URL
// the parameters are passed to the pathes of firestore
var parsedUrl = new URL(window.location.href);
var id = parsedUrl.searchParams.get("id");
var hash = window.location.hash.substr(1).split("&");
var groupName = parsedUrl.hash.substr(1);

// pathes of firestore to create, read, update and delete
var groups = database.collection("groups").doc("categories").collection(id);
var group = groups.doc(groupName);
var posts = group.collection("posts");
var gallery = group.collection("gallery");

// group.html
// redirects users to the group list page based on category they choose
function redirect() {
    document.querySelectorAll("a").forEach(item => {
        item.addEventListener('click', event => {
            window.location.href = "/group-list.html?id=" + $(event.target).attr("id");
        });
    });
}

// group-list.html
// replaces the heading to the category that users have chosen
function replaceHeading() {
    $("h2").text("Groups of " + id);
}

// group-list.html
// reads the information such as title, decription and image of groups in the category from firestore
function displayGroup(docID, title, description, img) {
    fetchFile("/template/group-info.html", data => {
        let group = $(data).appendTo("#group");

        group.find(".group-title").html(title);
        group.find(".group-description").html(description);
        group.find(".join-button").attr("href", "/group-main.html?id=" + id + "#" + docID);
        group.find(".group-image").attr("src", img);
    });
}

// group-list.html
// if users enter category of community garden, it shows the link of Vancouver community garden list
function displayCommunityGardensLink() {
    $("#community-garden-list").hide();
    if (id === "community-garden") {
        $("#community-garden-list").show();
    }
}

// group-list.html
// redirects to the page where users can create a group in the category
function addGroup() {
    $("#group-create-button").attr("href", "/group-create-group.html?id=" + id);
}

// group-create-group.html
// allows users to create a group in the category they have chosen
function writeGroup(url) {
    let groupTitle = document.querySelector(".group-title").value;
    let groupDescription = document.querySelector(".group-description").value;

    groups.add({
        title: groupTitle,
        description: groupDescription,
        image: url
    }).then(function () {
        window.location.href = "/group-list.html?id=" + id;
    });
}

// group-create-group.html
// uploads an image of group to firebase storage when creating new group
// get the url from the storage and passes it to writeGroup function
function writeImages() {
    $("#add-file").on("change", async function (event) {
        event.preventDefault();
        var uploadedIMG = event.target.files[0];

        storage.ref().child("groups/group/" + uploadedIMG.name).put(uploadedIMG)
            .then((snapshot) => {
                $("#create-group").click(async function (e) {
                    e.preventDefault();
                    var url = await snapshot.ref.getDownloadURL();
                    writeGroup(url);
                })
            })
    });
}

// group-main.html
// reads the title of the group user joined from firestore
function readGroupTitle() {
    group.get().then(info => {
        $("#group-title").html(info.data().title);
    });
}

// group-main.html
// reads the image of the group user joined from firestore
function readMainImage() {
    group.get().then(info => {
        $("#main-image").attr("src", info.data().image);
    });
}

// group-main.html
// reads top 3 posts of the group based on the number of likes and displays it
function readTopPosts() {
    group.collection("posts").limit(3).orderBy("likes", "desc").get()
        .then(function (posts) {
            posts.docs.forEach(function (post) {
                $("#top-post-title").append("<li id=" + post.id + ">" +
                    post.data().title + "</li>");
            });
        });
}

// group-main.html
// reads top 10 images of the group based on the number of likes and displays it
function readTopImages() {
    group.collection("gallery").limit(10).orderBy("likes", "desc").get()
        .then(function (posts) {
            posts.docs.forEach(function (post) {
                $("#top-gallery-image").append("<img class='top-images' id='" + post.id +
                    "' src='" + post.data().image + "'>");
            });
        });
}

// group-main.html
// redirects the users to the post clicked in Top Posts
function redirectToTopPost() {
    $("li").click(e => {
        e.preventDefault();
        window.location.href = "/group-comments.html?id=" + id + "#" +
            groupName + "&" + $(event.target).attr("id");
    });
}

// group-main.html
// redirects the users to the image clicked in Gallery
function redirectToTopImage() {
    $(".top-images").click(e => {
        e.preventDefault();
        window.location.href = "/group-comments.html?id=" + id + "#" +
            groupName + "&" + $(event.target).attr("id");
    });
}

// group-posts.html
// reads posts of the group from firestore
function displayPosts(docID, title, content, user, like, comment) {

    // fetches template file  
    fetchFile("/template/group-post.html", data => {
        let group = $(data).appendTo("#posts");
        group.find(".delete").attr("id", "d-" + docID);
        group.find(".post-title").html(title);
        group.find(".post-content").html(content);
        group.find(".post-user").html(user);
        group.find(".post-like").html(like);
        group.find(".post-comment").html(comment);
        group.find(".like-button").attr("id", docID);
        group.find(".view-button").attr("href", "/group-comments.html?id=" + id +
            "#" + groupName + "&" + docID);
        group.find(".like-button").click(e => {
            e.preventDefault();
            increaseLikeInPosts(docID);
        });

        // hides delete button unless the logged-in user is not the writer of the post 
        $(".delete").hide();

        // shows delete button if the logged-in user is the writer of the post
        firebase.auth().onAuthStateChanged(function (usr) {
            database.collection("users").doc(usr.uid).get()
                .then(function (doc) {
                    if (doc.data().name === user) {
                        group.find(".delete").show();
                    }
                });
        });
        deletePost("d-" + docID);
    });
}

// group-posts.html
// increasess like 
function increaseLikeInPosts(likeid) {
    posts.doc(likeid).update({
        likes: firebase.firestore.FieldValue.increment(1)
    }).then(function () {
        location.reload();
    });
}

// group-posts.html
// deletes post, only available for the user who actually wrote the post
function deletePost(buttonID) {
    $("#" + buttonID).click(async function (e) {
        e.preventDefault();
        var id = e.target.id.substr(2);

        // confirming message
        var confirm = await window.confirm("Are you sure you want to delete?");

        // if the user confirms, it deletes the post
        if (confirm) {
            var del = await posts.doc(id).delete();
            location.reload();
        }
    });
}

// group-posts.html
// redirects to the main page of the group 
function redirectToGroupMain() {
    $("#back-button").attr("href", "/group-main.html?id=" + id + "#" + groupName);
}

// group-posts.html
// redirects to the post creating page
function addPost() {
    $("#post-button").attr("href", "/group-create-post.html?id=" + id + "#" + groupName);
}

// group-comments.html
// reads the post the user has clicked in the comment page
function readPosts(docID, title, content, user, like, comment) {

    // fetches template file
    fetchFile("/template/group-post.html", data => {
        let group = $(data).appendTo("#posts");
        group.find(".delete").attr("id", "d-" + docID);
        group.find(".post-title").html(title);
        group.find(".post-content").html(content);
        group.find(".post-user").html(user);
        group.find(".post-like").html(like);
        group.find(".post-comment").html(comment);
        group.find(".view-button").hide();
        group.find(".like-button").click(increaseLikeInComments);

        // hides delete button unless the logged-in user is not the writer of the post 
        $(".delete").hide();

        // shows delete button if the logged-in user is the writer of the post
        firebase.auth().onAuthStateChanged(function (usr) {
            database.collection("users").doc(usr.uid).get()
                .then(function (doc) {
                    if (doc.data().name === user) {
                        group.find(".delete").show();
                    }
                });
        });
        deletePostInComment("d-" + docID);
    });
}

// group-comments.html
// reads the comments of the post user has clicked 
function readComments(docID, user, comment) {

    // fetches template file
    fetchFile("/template/group-comment.html", data => {
        let comm = $(data).appendTo("#comments");
        comm.find(".delete-comment").attr("id", "d-" + docID);
        comm.find(".new-user").html(user);
        comm.find(".new-comment").html(comment);

        // hides delete button unless the logged-in user is not the writer of the post 
        $(".delete-comment").hide();

        // shows delete button if the logged-in user is the writer of the post
        firebase.auth().onAuthStateChanged(function (usr) {
            database.collection("users").doc(usr.uid).get()
                .then(function (doc) {
                    if (doc.data().name === user) {
                        comm.find(".delete-comment").show();
                    }
                });
        });
        deleteComment("d-" + docID);
    });
}

// group-comment.html
// writes comment that user left to firestore
function writeComments() {

    // requires login, otherwise not be able to leave a comment
    requireLogin();

    let comment = document.querySelector("#comment-value").value;
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            database.collection("users").doc(user.uid).get()
                .then(function (doc) {

                    posts.collection("comments").add({
                        content: comment,
                        user: doc.data().name

                    }).then(function () {
                        location.reload();
                    });
                    // increases the number of comment
                }).then(increaseComment);
        }
    });
}

// group-comment.html
// increases the number of likes
function increaseLikeInComments() {

    // requires login, otherwise not be able to leave a comment
    requireLogin();

    posts.update({
        likes: firebase.firestore.FieldValue.increment(1)
    }).then(function () {
        location.reload();
    });
}

// group-comment.html
// increases the number of comments
function increaseComment() {
    posts.update({
        comments: firebase.firestore.FieldValue.increment(1)
    });
}

// group-comment.html
// decreases the number of likes when deleting
function decreaseComment() {
    posts.update({
        comments: firebase.firestore.FieldValue.increment(-1)
    });
}

// group-comment.html
// deletes the comment in the comment page and redirects to the previous page
function deletePostInComment(buttonID) {
    $("#" + buttonID).click(async function (e) {
        e.preventDefault();

        // confirming message
        var confirm = await window.confirm("Are you sure you want to delete?");

        // if the user confirms, it deletes the post
        if (confirm) {
            var del = await posts.delete();
            window.location.href = "/group-posts.html?id=" + id + "#" + groupName;
        }
    });
}

// group-comment.html
// delete the comment in the comment page
function deleteComment(buttonID) {
    $("#" + buttonID).click(async function (e) {
        e.preventDefault();

        var id = e.target.id.substr(2);

        // confirming message
        var confirm = await window.confirm("Are you sure you want to delete?");

        // if the user confirms, it deletes the post then reload the page
        if (confirm) {
            var del = await posts.collection("comments").doc(id).delete();
            var dec = await decreaseComment();
            location.reload();
        }
    });
}

// group-create-post.html
// write a post to the firestore
function writePosts() {
    let postTitle = document.querySelector(".post-title");
    let postContent = document.querySelector(".post-content");

    // does not allow users to leave input fields blank
    if (postTitle.value.trim() === "") {
        postTitle.reportValidity();
    } else if (postContent.value.trim() === "") {
        postContent.reportValidity();
    } else if (postTitle.value.trim() !== "" && postContent.value.trim() !== "") {

        // if required fields are filled, then allows writing
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                database.collection("users").doc(user.uid).get()
                    .then(function (doc) {
                        posts.add({
                            user: doc.data().name,
                            title: postTitle.value,
                            content: postContent.value
                        }).then(function () {
                            window.location.href = "/group-posts.html?id=" + id + "#" + groupName;
                        });
                    });
            }
        });
    }

}

// group-gallery.html
// reads gallery posts from firestore
function readImages(docID, title, content, image, user, like, comment) {

    // fetches template file
    fetchFile("/template/group-post.html", data => {
        let group = $(data).appendTo("#posts");
        group.find(".delete").attr("id", "d-" + docID);
        group.find(".post-title").html(title);
        group.find(".post-content").html(content);
        group.find(".post-content").append("<br><img class='post-images' src='" + image + "'>");
        group.find(".post-user").html(user);
        group.find(".post-like").html(like);
        group.find(".post-comment").html(comment);
        group.find(".view-button").attr("href", "/group-gallery-comments.html?id=" + id +
            "#" + groupName + "&" + docID);
        group.find(".like-button").click(e => {
            e.preventDefault();
            increaseLikeInGallery(docID);
        });

        // hides delete button unless the logged-in user is not the writer of the post 
        $(".delete").hide();

        // shows delete button if the logged-in user is the writer of the post
        firebase.auth().onAuthStateChanged(function (usr) {
            database.collection("users").doc(usr.uid).get()
                .then(function (doc) {
                    if (doc.data().name === user) {
                        group.find(".delete").show();
                    }
                });
        });
        deleteImage("d-" + docID);
    });
}

// group-gallery.html
// increases the number of likes in the gallry post page
function increaseLikeInGallery(likeid) {
    gallery.doc(likeid).update({
        likes: firebase.firestore.FieldValue.increment(1)
    }).then(function () {
        location.reload();
    });
}

// group-gallery.html
// deletes image post from the firestore
function deleteImage(buttonID) {
    $("#" + buttonID).click(async function (e) {
        e.preventDefault();
        var id = e.target.id.substr(2);

        // confirming message
        var confirm = await window.confirm("Are you sure you want to delete?")

        // if the user confirms, it deletes the post then reload the page
        if (confirm) {
            var del = await gallery.doc(id).delete();
            location.reload();
        }
    });
}

// group-gallery.html
// redirects to the image uploading page
function addImage() {
    $("#post-button").attr("href", "/group-create-gallery.html?id=" + id + "#" + groupName);
}

// group-create-gallry.html
// writes post with the image user uploads
function writeGallery(url) {
    let postTitle = document.querySelector(".post-title").value;
    let postContent = document.querySelector(".post-content").value;

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            database.collection("users").doc(user.uid).get()
                .then(function (doc) {
                    gallery.add({
                        user: doc.data().name,
                        title: postTitle,
                        content: postContent,
                        image: url
                    }).then(function () {
                        window.location.href = "/group-gallery.html?id=" + id + "#" + groupName;
                    });
                });
        }
    });
}

// group-create-gallry.html
// uploads an image of the post to firebase storage when creating new group
// get the url from the storage and passes it to writeGroup function
function uploadImages() {
    $("#add-file").on("change", async function (event) {
        event.preventDefault();
        var uploadedIMG = event.target.files[0];

        storage.ref().child("groups/posts/" + uploadedIMG.name).put(uploadedIMG)
            .then((snapshot) => {
                $("#create-post").click(async function (e) {
                    e.preventDefault();
                    var url = await snapshot.ref.getDownloadURL();
                    writeGallery(url);
                })
            })
    });
}

// group-gallery-comments.html
// reads the post with image stored in firebase and display it
function readGalleryPosts(docID, title, content, image, user, like, comment) {
    fetchFile("/template/group-post.html", data => {
        let group = $(data).appendTo("#posts");
        group.find(".delete").attr("id", "d-" + docID);
        group.find(".post-title").html(title);
        group.find(".post-content").html(content);
        group.find(".post-content").append("<br><img class='post-content' src='" + image + "'>");
        group.find(".post-user").html(user);
        group.find(".post-like").html(like);
        group.find(".post-comment").html(comment);
        group.find(".view-button").hide();
        group.find(".like-button").click(increaseLikeInComments);

        // hides delete button unless the logged-in user is not the writer of the post 
        $(".delete").hide();

        // shows delete button if the logged-in user is the writer of the post
        firebase.auth().onAuthStateChanged(function (usr) {
            database.collection("users").doc(usr.uid).get()
                .then(function (doc) {
                    if (doc.data().name === user) {
                        group.find(".delete").show();
                    }
                });
        });
        deletePostInComment("d-" + docID);
    });
}

// tests writing group data to firebase
function testWriteGroup() {
    $(".group-title").value("My Group");
    $(".group-description").value("Hello World");
    writeGroup(null);
}

// tests writing invaild group data
function testWriteIvalidGroup() {
    $(".group-title").value("");
    $(".group-description").value("");
    writeGroup("");
}

// tests increasing like if invalid button is clicked 
function testInvalidLikeIncrease() {
    increaseLikeInPosts(null);
}

// tests writing comments in posts 
function testWriteComments() {
    $("#comment-value").value("Test Comment");
    writeComments();
}

// tests whether emptly comments would be written
function testEmptyComments() {
    $("#comment-value").value("");
    writeComments();
}

// tests whether invalid posts would be deleted
function testInvalidDeletePost() {
    deletePostInComment(null);
}

// tests wrting posts 
function testWritePosts() {
    $(".post-title").value("Title test");
    $(".post-content").value("Content test");
    writePosts();
}

// tests whether invalid post will be written
function testWriteEmptyPosts() {
    $(".post-title").value("");
    $(".post-content").value("");
    writePosts();
}