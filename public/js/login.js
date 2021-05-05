var login = new firebaseui.auth.AuthUI(firebase.auth());

login.start('#firebaseui-auth-container', 
    {
        callbacks: {
            signInSuccessWithAuthResult: result => {
                var user = result.user;
                if (result.additionalUserInfo.isNewUser) {
                    database.collection("users").doc(user.uid).set({
                            name: user.displayName,
                            email: user.email
                        }).then(() => {
                            window.location.assign("index.html");
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                } else {
                    return true;
                }
                return false;
            },
        },
        signInSuccessUrl: "index.html",
        signInFlow: "popup",
        signInOptions: [
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            firebase.auth.EmailAuthProvider.PROVIDER_ID,
        ],
        tosUrl: "#",
        privacyPolicyUrl: "#"
    }
);