/*
* Displays all threads on document load
* Sets up click handler for create thread button
*/
$(document).ready(() => {
    displayThreads();

    $(".forum-create button").click(() => {
        requireLogin();
        redirect("/thread-create.html");
    })
});

/*
* Gets each thread and sends data to be displayed in page
*/
function displayThreads() {
    database.collection("threads").get().then(threads => {
        threads.docs.forEach(thread => {
            database.collection("threads").doc(thread.id).collection("replies").get().then(replies => {
                database.collection("users").doc(thread.data().user).get().then(user => {
                    createThread(thread.id, thread.data().topic, user.data().name, replies.size);
                });
            });
        });
    });
}

/*
* Creates a thread in the page
*/
function createThread(id, topic, user, count) {
    fetchTemplate("forum-thread.html", data => {
        let thread = $(data).appendTo(".forum-threads");

        let threadId = thread.find(".thread-id");
        threadId.attr("href", `${threadId.attr("href")}?id=${id}`);

        thread.find(".thread-topic").html(topic);
        thread.find(".thread-user").html(user);
        thread.find(".thread-count").html(`${count} Replies`);
    });
}

/*
* Test for injecting a dummy thread into the page
*/
function testCreateThread() {
    createThread("TestId", "TestTopic", "TestUser", "TestReplyCount");
}