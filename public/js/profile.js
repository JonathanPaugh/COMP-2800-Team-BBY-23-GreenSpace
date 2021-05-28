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

//display collection to the specific user who has logined 
function collection() {
    withUser(user => {
        getCollect(user);
    })
}

//collect user activities (such as posts and replies from Groups and Forum)
function getCollect(user) {
    var collectList = [database.collection("groups").doc("categories").collection("community-garden"),
    database.collection("groups").doc("categories").collection("container-garden"),
    database.collection("groups").doc("categories").collection("greenhouse-garden"),
    database.collection("groups").doc("categories").collection("indoor-garden")];

    database.collection("threads").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            //from each posts to the forum, display the posts in the user collection
            forumPosts(user, doc.id, doc.data());
        });
    });
    database.collection("threads").get().then((threads)=>{
        threads.docs.forEach(thread =>{
             var user_reply = database.collection("threads").doc(thread.id).collection("replies");
             user_reply.where("user", "==", user.id).get().then(replies =>{
              
                 replies.forEach((reply)=>{
                     user_reply.doc(reply.id).get().then(doc => {
                        var url = "/thread.html?id=" + thread.id;
                        makeReplyCollection(doc.data(), url);
                     })
                 })
             })
        })
    })
    collectList.forEach(category => {
        category.get().then(collection => {
            collection.docs.forEach(garden => { 
                var gardenRef = category.doc(garden.id);
                //from each posts to gallery, display the posts in the user collection
                gardenPosts(gardenRef, user, category);
            })
        })
    })
}

//get the user's posts from forum
function makeReplyCollection(replyData, url) {
    fetchTemplate("profile-forum-reply.html", card => {
        var forum_reply_card = $(card).appendTo(".forum-collect");
        
        forum_reply_card.find(".card-text").html(replyData.content);
        var session = forum_reply_card.find(".go_image");

        if (replyData.images.length > 0) {
            (replyData.images).forEach(async function(each) {
                let url = await storage.ref().child(each).getDownloadURL();
                createElement("img").addClass("blog-img-forum").appendTo(session).attr("src", url);
            });
        } else {
            session.remove();
        }
        forum_reply_card.find(".reply").click(() => {
            redirect(url);
        })
    })
}

//get the user's posts from forum
function forumPosts(user, forumRef, forumData) {
    if (forumData.user == user.id) {
        var url = "/thread.html?id=" + forumRef;
        //make the post display in the makeCollection
        makeForumCollection(forumData, url, user);
    }
}

//display the data of the user's posts from Forum to the collection
function makeForumCollection(data, url, user) {

    fetchTemplate("profile-collection-forum.html", card => {
        var forum_card = $(card).appendTo(".forum-collect");
        forum_card.find(".collect-title").html(data.topic);
        forum_card.find(".card-text").html(data.content);
        forum_card.find(".user-name").html(user.data().name);
        forum_card.find(".link").attr("href", url);
    })
}

//find the data of the user's posts posted in the Group
function gardenPosts(gardenRef, user, category) {
    gardenRef.collection("posts").where("user", "==", user.data().name).get().then((posts) => {

        posts.docs.forEach((post) => {
            //find each Group post user created in the Group
            gardenRef.collection("posts").doc(post.id).get().then(doc => {
                var url = "/group-comments.html?id=" + category.id + "#" + gardenRef.id + "&" + post.id;
                //display each Group post user posted to the collection 
                makeCollection(doc.data(), url);
            });
        })
    })
    gardenRef.collection("posts").get().then((posts) => {
        posts.docs.forEach((post) => {
            //find each Group comments or replies that user posted in the Group 
            var user_comment = gardenRef.collection("posts").doc(post.id).collection("comments");
            user_comment.where("user", "==", user.data().name).get().then(comments => {
                comments.forEach((comment) => {
                    user_comment.doc(comment.id).get().then(doc => {
                        //url path based on catergory of garden, group id and post id
                        var url = "/group-comments.html?id=" + category.id + "#" + gardenRef.id + "&" + post.id;
                        //display the data in the collection 
                        makeCollection(doc.data(), url);
                    });
                })
            })
        })
    })
    gardenRef.collection("gallery").where("user", "==", user.data().name).get().then((gallery) => {
        gallery.docs.forEach((instance) => {
            //find each Gallery post user posted in the Group
            gardenRef.collection("gallery").doc(instance.id).get().then(doc => {
                var url = "/group-gallery-comments.html?id=" + category.id + "#" + gardenRef.id + "&" + instance.id;
                 //display the data in the collection
                makeGalleryCollection(doc.data(), url);
            });
        })
    })
}

//display data (text and title) in the collection
//also redirect to where user posted his/her posts
function makeCollection(data, url) {

    fetchTemplate("profile-collection.html", card => {
        var history_card = $(card).appendTo(".history-collect");
        history_card.find(".collect-title").html(data.title);
        history_card.find(".card-text").html(data.content);
        history_card.find(".user-name").html(data.user);
        history_card.find(".user-name").after(data.user);
        history_card.find(".link").attr("href", url);
    })
}

//display the gallery data in the collection (text, image and title)
//redirect to where user posted his/her gallery posts
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
* change between sections (reminder, collection, gallery, plant tracker)
* Reference begins: 
* @see https://www.youtube.com/watch?v=PJe5Cc6iybQ
*/
function changeTab() {
    $('.nav_menu ul li').click(() => {
        $(this).addClass('true').siblings().removeClass('true');
    })
}
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


/**
 * Modal starts.
 * display a modal popup that user can create their post
 * by filling out the title and the content 
 */
const modal = document.getElementById("myModal");
function getModal() {
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


/**
 * Modal ends
 */

//upload a image from user devices (mobile, desktop and etc)
function selectImage() {
    withUser(user => {
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
                    //display the photo in the gallery page
                    createImageDiv(link);
                });
        }
    })

}

//a image displayed in the gallery section of the profile page
function createImageDiv(link) {
    fetchTemplate("profile-gallery.html", card => {
        var gallery_card = $(card).appendTo(".gallery-images");
        gallery_card.find(".card-image-gallery").attr("src", link);
    })

}

//display all the images user uploaded to the gallery section of the profile page
function showImages() {
    withUser(user => {
        var listRef = storage.ref().child("users/" + user.id).child("gallery");
        listRef.listAll().then(function (array) {
            array.items.forEach(function (imgRef) {
                imgRef.getDownloadURL().then(function (url) {
                    //for each image uploaded, display it to the gallery one by one
                    createImageDiv(url);
                })
            })
        })
    })
}

//store the reminder's post content, title and date posted in the firestore
function createBlog() {
    withUser(user => {
        database.collection("users").doc(user.id).collection("blogs").add({
            blog_title: $(".ph-title").val(),
            blog_text: $(".placehold").val(),
            date: firebase.firestore.Timestamp.fromDate(new Date())
        })
            .then((docRef) => {
                docRef.get().then(doc => {
                    makeBlog(doc);
                    closeTab();
                })
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
            });
    })
}

//display the reminder's blog with title, content and reminder aler tag
function makeBlog(blog) {

    fetchTemplate("profile-blog.html", card => {
        let each = $(card);
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

//user can edit the user profile information
function getProfile() {
    withUser(user => {
        $('#pro-name').html(user.data().name);
        $('#pro-email').html(user.data().email);
        $('#pro-web').html(user.data().website);
        $('#pro-bio').html(user.data().bio);
    })

}

//display all reminder user created to the profile reminder session
function showBlogs() {
    withUser(user => {
        database.collection("users").doc(user.id).collection("blogs").orderBy("date", "asc").get().then((blogs) => {
            blogs.docs.forEach((blog) => {
                makeBlog(blog);
            })
        });
    })
}

function filterMost() {
    withUser(user => {
        $(".blogs").empty();

        database.collection("users").doc(user.id).collection("blogs").orderBy("blog_like", "asc").get().then((blogs) => {
            blogs.docs.forEach((blog) => {
                makeBlog(blog);
            })
        });
    })
}

function filterLeast() {
    withUser(user => {
        $(".blogs").empty();

        database.collection("users").doc(user.id).collection("blogs").orderBy("blog_like", "desc").get().then((blogs) => {
            blogs.docs.forEach((blog) => {
                makeBlog(blog);
            })
        });
    })
}

