firebase.auth().onAuthStateChanged(function(user) {
    if(user) {
        var userID = user.uid;
        var userInfo = db.collection("users").doc(user.uid);
        // showBlogs();
        // changeTab();
        // getProfile();
    
        // getModal();
    }
})
 // clickpart(0)
 $(document).ready(()=>{
    requireLogin();
   
   
    // $('#MyButton').click(profile);

})

/*
* Reference begins: 
* @see https://www.youtube.com/watch?v=PJe5Cc6iybQ
*/
function changeTab(){
    $('.nav_menu ul li').click(()=>{
        $(this).addClass('true').siblings().removeClass('true');
    })
}
// var button = document.querySelectorAll('.nav_menu ul li');
var part_content = document.querySelectorAll('.click-part-content');
function clickParts(i) {
    part_content.forEach(part=>{
        part.style.display='none';
    });
    part_content[i].style.display = 'block';
}
clickParts(0);
/*
* Reference ends
*/
        


const modal = document.getElementById("myModal");
function getModal(){
    // clicks anywhere outside 
    window.onclick = function(event) {
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
function editBlog() {

}
function createBlog() {
    database.collection("profile_post_collections").add({
        blog_title: $(".ph-title").val(),
        blog_text: $(".placehold").val(),
        
        date: firebase.firestore.Timestamp.fromDate(new Date())
    })
    .then((docRef) => {
       console.log("Document written with ID: ", docRef.id);
        readBlog(docRef.id);
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
    });
}
function readBlog(id) {
    database.collection("profile_post_collections").doc(id).get().then(doc=>{
        makeBlog(id, doc.data());
    })
}

function getProfile() {
    withUser(user=>{
        $('#pro-name').html(user.data().name);
        $('#pro-email').html(user.data().email);
        $('#pro-web').html(user.data().website);
        $('#pro-bio').html(user.data().bio);
    })
    
}

function showBlogs() {
    withUser(user => {
        database.collection("users").doc(user.uid).collection("blogs").get().then((blogs)=>{
                blogs.docs.forEach((blog)=>{
                 makeBlog(blog.id, blog.data());
                 console.log("check: ", blog.data().date)
             })
       
        });
    })
}

function makeBlog(id, box) {
    
    fetchTemplate("profile-blog.html", card=>{
       let each = $(card);
       each.find(".blog-title").html(box.blog_title);
       each.find(".blog-content").html(box.blog_text);  
       each.find(".date").html(box.date.toDate().toLocaleString());
       $(".blogs").prepend(each);
       
    });
}