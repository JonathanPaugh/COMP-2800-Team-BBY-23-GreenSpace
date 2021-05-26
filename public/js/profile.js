/******************************************/
/* This is javascript for profile.html */
/******************************************/

$(document).ready(() => {
    //display the history or recent activities of user
    collection();
    //login prompt
    requireLogin();
    //show reminder posts
    showBlogs();
    //show photos in the gallery section
    showImages();
    //navigation bar to change sections 
    changeTab();
    //display profile information
    getProfile();
    //clost modal popup form
    getModal();

    //redirect to tracker page
    $(".user-tracker").click(() => {
        withUser(user => {
            window.location.href = `tracker.html?type=user&typeId=${user.id}`;
        });
    });
})

//clicking profile image allows user to upload user profile image.
function addProfileImage() {
    withUser(user => {
        var input = document.createElement('input');
        input.type = 'file';
        input.click();
        input.onchange = async function (selectAnImage) {
            selectAnImage.preventDefault();
            var fileSelected = selectAnImage.target.files[0];
            var imagRef = storage.ref().child("users/" + user.id + "/profileImage/" + fileSelected.name);
            await imagRef
                .put(fileSelected)
                .then(async function (snapshot) {
                    var link = await snapshot.ref.getDownloadURL();
                    $("#profile-image").attr("src", link);
                });
        }
    })

}

function collection() {
    withUser(user => {
        userCollect(user);
    })
}
function userCollect(user) {
    // $(".history-collect").empty();
    getCollect(user);
}
//http://localhost:3000/group-list.html?id=community-garden
function getCollect(user) {
    var collectList = [database.collection("groups").doc("categories").collection("community-garden"),
    database.collection("groups").doc("categories").collection("container-garden"),
    database.collection("groups").doc("categories").collection("greenhouse-garden"),
    database.collection("groups").doc("categories").collection("indoor-garden")];

    var collectForumList = database.collection("threads").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {

            forumPosts(user, doc.id, doc.data());
            console.log(doc.id, " => ", doc.data());
        });
    });


    var test = database.collection("groups").doc("categories").collection("container-garden");
    test.get().then(collection => {
        console.log("test: ", collection);
    })

    collectList.forEach(category => {

        category.get().then(collection => {

            collection.docs.forEach(garden => { //ilk
                var gardenRef = category.doc(garden.id);
                gardenPosts(gardenRef, user, category);

            })
        })
    })



}

function forumPosts(user, forumRef, forumData) {
    if (forumData.user == user.id) {
        var url = "/thread.html?id=" + forumRef;
        makeForumCollection(forumData, url, user);
    }
}


function makeForumCollection(data, url, user) {

    fetchTemplate("profile-collection-forum.html", card => {
        //card returned，appendTo
        console.log("nameL ", user.data());
        var forum_card = $(card).appendTo(".forum-collect");
        forum_card.find(".collect-title").html(data.topic);
        forum_card.find(".card-text").html(data.content);
        forum_card.find(".user-name").html(user.data().name);
        forum_card.find(".link").attr("href", url);
    })
}

function gardenPosts(gardenRef, user, category) {
    gardenRef.collection("posts").where("user", "==", user.data().name).get().then((posts) => {

        posts.docs.forEach((post) => {
            console.log(user.data().name);
            gardenRef.collection("posts").doc(post.id).get().then(doc => {
                console.log(doc.data());
                console.log(doc.data().user);
                var url = "/group-comments.html?id=" + category.id + "#" + gardenRef.id + "&" + post.id;
                makeCollection(doc.data(), url);
            });
        })
    })
    gardenRef.collection("posts").get().then((posts) => {
        posts.docs.forEach((post) => {
            var user_comment = gardenRef.collection("posts").doc(post.id).collection("comments");
            user_comment.where("user", "==", user.data().name).get().then(comments => {
                comments.forEach((comment) => {
                    user_comment.doc(comment.id).get().then(doc => {
                        //group id 
                        //post id
                        var url = "/group-comments.html?id=" + category.id + "#" + gardenRef.id + "&" + post.id;
                        console.log("cate: ", category.id);
                        makeCollection(doc.data(), url);
                    });
                })
            })
        })
    })
    gardenRef.collection("gallery").where("user", "==", user.data().name).get().then((gallery) => {
        gallery.docs.forEach((instance) => {
            gardenRef.collection("gallery").doc(instance.id).get().then(doc => {
                var url = "/group-gallery-comments.html?id=" + category.id + "#" + gardenRef.id + "&" + instance.id;
                makeGalleryCollection(doc.data(), url);
            });
        })
    })
}


function makeCollection(data, url) {

    fetchTemplate("profile-collection.html", card => {
        //card returned，appendTo
        var history_card = $(card).appendTo(".history-collect");
        history_card.find(".collect-title").html(data.title);
        history_card.find(".card-text").html(data.content);
        history_card.find(".user-name").html(data.user);
        history_card.find(".link").attr("href", url);
    })
}

function makeGalleryCollection(data, url) {
    fetchTemplate("profile-collection-gallery.html", card => {
        var history_gallery_card = $(card).appendTo(".gallery-collect");
        history_gallery_card.find(".collect-title").html(data.title);
        history_gallery_card.find(".card-text").html(data.content);
        history_gallery_card.find(".blog-img").attr("src", data.image);
        history_gallery_card.find(".blog-btn-right").click(() => {
            redirect(url);
        })
    })
}

/*
* Reference begins: 
* @see https://www.youtube.com/watch?v=PJe5Cc6iybQ
*/
function changeTab() {
    $('.nav_menu ul li').click(() => {
        $(this).addClass('true').siblings().removeClass('true');
    })
}
// var button = document.querySelectorAll('.nav_menu ul li');
var part_content = document.querySelectorAll('.click-part-content');
function clickParts(i) {
    part_content.forEach(part => {
        part.style.display = 'none';
    });
    part_content[i].style.display = 'block';
}
clickParts(0);
/*
* Reference ends
*/



const modal = document.getElementById("myModal");
function getModal() {
    // clicks anywhere outside 
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}
function closeTab() {
    modal.style.display = "none";
}

function openTab() {
    modal.style.display = "block";
}
function selectImage() {
    withUser(user => {
        // var images = database.collection("users").doc(user.id).collection("gallery");
        var input = document.createElement('input');
        input.type = 'file';
        input.click();
        input.onchange = async function (selectAnImage) {
            selectAnImage.preventDefault();
            var fileSelected = selectAnImage.target.files[0];
            var imagRef = storage.ref().child("users/" + user.id + "/gallery/" + fileSelected.name);
            await imagRef
                .put(fileSelected)
                .then(async function (snapshot) {
                    var link = await snapshot.ref.getDownloadURL();
                    createImageDiv(link);
                });
        }
    })

}


function createImageDiv(link) {
    fetchTemplate("profile-gallery.html", card => {
        //card returned，appendTo
        var gallery_card = $(card).appendTo(".gallery-images");
        gallery_card.find(".card-image-gallery").attr("src", link);
    })

}

function showImages() {
    withUser(user => {
        var listRef = storage.ref().child("users/" + user.id).child("gallery");
        listRef.listAll().then(function (array) {
            array.items.forEach(function (imgRef) {
                imgRef.getDownloadURL().then(function (url) {
                    createImageDiv(url);
                })
            })
        })
    })
}
function createBlog() {
    withUser(user => {
        //add user input to firebase 
        database.collection("users").doc(user.id).collection("blogs").add({
            blog_title: $(".ph-title").val(),
            blog_text: $(".placehold").val(),
            date: firebase.firestore.Timestamp.fromDate(new Date())
        })
            .then((docRef) => {
                console.log("Document written with ID: ", docRef.id);
                console.log(docRef.get());
                //get document with data above from docRef
                docRef.get().then(doc => {
                    console.log(doc);
                    makeBlog(doc);
                    closeTab();
                })

            })
            .catch((error) => {
                console.error("Error adding document: ", error);
            });
    })
}

function makeBlog(blog) {

    fetchTemplate("profile-blog.html", card => {
        let each = $(card);
        //set the doc data to the html selector
        each.find(".blog-title").html(blog.data().blog_title);
        each.find(".blog-content").html(blog.data().blog_text);
        each.find(".reminder-tag").html(blog.data().blog_like);
        each.find(".date").html(blog.data().date.toDate().toLocaleString());

        $(".blogs").prepend(each);
        each.find(".blog-edit").click(function () {
            setUrlQuery("blogId", blog.id);
            redirect("profile-edit.html");
        })
        each.find(".blog-remove").click(function () {
            withUser(user => {
                each.remove();
                database.collection("users").doc(user.id).collection("blogs").doc(blog.id).delete();
            })
        })
        each.find(".blog-like").click(function () {
            withUser(user => {

                var doc = database.collection("users").doc(user.id).collection("blogs").doc(blog.id);
                var reminder_count = each.find(".reminder-tag").html(); //it is a string
                reminder_count = parseInt(reminder_count); //convert to number
                each.find(".reminder-tag").html(++reminder_count); //increase it, then set back to html
                doc.update({
                    blog_like: firebase.firestore.FieldValue.increment(1)
                })
            })
        })




    });
}
function getProfile() {
    withUser(user => {
        $('#pro-name').html(user.data().name);
        $('#pro-email').html(user.data().email);
        $('#pro-web').html(user.data().website);
        $('#pro-bio').html(user.data().bio);
    })

}

function showBlogs() {
    withUser(user => {
        database.collection("users").doc(user.id).collection("blogs").orderBy("date", "asc").get().then((blogs) => {
            blogs.docs.forEach((blog) => {
                makeBlog(blog);
                //  console.log("check: ", blog.data().date)
            })

        });
    })
}
