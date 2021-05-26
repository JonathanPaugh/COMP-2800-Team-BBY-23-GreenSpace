/******************************************/
/* This is javascript for profile-edit.html */
/******************************************/
$(document).ready(() => {
    withUser(user => {
        var blogId = getUrlQuery().get("blogId");
        var dataRef = database.collection("users").doc(user.id).collection("blogs").doc(blogId);
        dataRef.get().then(blog => {
            makeBlog(blog);
        })
    })
    $(".blog-update").on("click", updateBlog);
})
function updateBlog() {
    withUser(user => {
        var blogId = getUrlQuery().get("blogId");
        var dataRef = database.collection("users").doc(user.id).collection("blogs").doc(blogId);
        dataRef.set({
            blog_text: $(".blog-content").val(),
            blog_title: $(".blog-title").val(),
            date: new Date()
        }, { merge: true }).then(() => {
            redirect("/profile.html");
        });
    })
}

function makeBlog(blog) {
    $(".blog-edit").attr("id", blog.id);
    $(".blog-reminder").attr("id", blog.id);
    $(".blog-remove").attr("id", blog.id);
    $(".blog-title").val(blog.data().blog_title);
    $(".blog-content").html(blog.data().blog_text);
    $(".date").html(blog.data().date.toDate().toLocaleString());
}

//same function from profile.js
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