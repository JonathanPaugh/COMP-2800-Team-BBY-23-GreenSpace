/*
* Redirects to login page if not logged in
* Sets up click handler for post button
*/
$(document).ready(() => {
    requireLogin();
    $(".thread-post").click(post);
});

/*
* Creates a thread with a topic and content
* If topic or content is not filled, it will prompt the user to input valid data
*/
function post() {
    requireLogin();

    let invalid = false;
    if (!$(".thread-topic").val()) {
        $(".thread-topic").addClass("border border-danger");
        invalid = true;
    }

    if (!$(".thread-content").val()) {
        $(".thread-content").addClass("border border-danger");
        invalid = true;
    }

    if (invalid) {
        $(".thread-post").after(createDiv().html("Please fill out required fields").addClass("text-danger mx-2"));
        return;
    }

    withUser(user => {
        database.collection("threads").add({
            topic: $(".thread-topic").val(),
            content: $(".thread-content").val(),
            user: user.id
        }).then(doc => {
            setUrlQuery("id", doc.id);
            redirect("/thread.html");
        });
    });
}

/*
* Test that tries to posts a valid thread with dummy content
*/
function testValidPost() {
    $(".thread-topic").val("TestTopic");
    $(".thread-content").val("TestContent");
    post();
}

/*
* Test that tries to post an invalid thread and prompts user for proper data
*/
function testInvalidPost() {
    $(".thread-topic").val("");
    $(".thread-content").val("");
    post();
}