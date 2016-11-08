// Firebase Stuff Here
var username;
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // User is signed in.
        username = user.email;
    } else {
        // No user is signed in.
        username = null;
        var options = {
			backdrop: true,//'static',
			keyboard: false,
			focus: true,
			show: true
		}
		$('#login').modal(options);
    }
});

// References
var database = firebase.database();
var databaseRef = database.ref();
var infoRef = databaseRef.child('info');
var projectRef = databaseRef.child('projects');

var info;
infoRef.once('value', function(snapshot) {
    // console.log(snapshot.val());
    info = snapshot.val();
    processProfile(info);
});

var processProfile = function(profile) {
	// console.log(projects);
	console.log(profile);
	for (var itemId in profile) {
		var toInsert = profile[itemId];
		// if (itemId == 'date') {
		// 	var date = new Date(project[itemId] * -1);
		// 	var day = date.getDate() + '';
		// 	if (day.length == 1) {
		// 		day = '0' + day;
		// 	}
		// 	var month = (date.getMonth() + 1) + '';
		// 	if (month.length == 1) {
		// 		month = '0' + month;
		// 	}
		// 	toInsert = date.getFullYear() + '-' + month + '-' + day;
		// }
		$('#' + itemId).val(toInsert);
	}
}

var save = function() {
	var item = {
		degree: $('#degree').val(),
		dob: $('#dob').val(),
		description: $('#description').val(),
		image: $('#image').val(),
		languages: $('#languages').val().split(','),
		school: $('#school').val(),
		skills: $('#skills').val().split(',')
	};
	// console.log(item);
	infoRef.set(item)
	.then(function() {
		window.location.replace(window.location.href.split('/edit')[0]);
	}, function(error) {
		console.log(error);
	});
}

$('#save').click(function(event) {
	save();

	event.preventDefault();
    event.returnValue = false;
    return false;
});

var clearImg = function() {
	$('#image').val('');
}

$('#login-form').on('submit', function(event) {

   var email = $('#email').val();
   var password = $('#password').val();
   loginAccount(email, password);

   //don't submit as usual!
   event.preventDefault();    //current standard
   event.returnValue = false; //some older browsers
   return false;              //most older browsers

});

var tryLogin = function() {
	return false;
}

var loginAccount = function(email, password) {
	firebase.auth().signInWithEmailAndPassword(email, password).then(function(data) {
		$('#login').modal('hide');
	}).catch(function(error) {
		// Handle Errors here.
		var errorCode = error.code;
		var errorMessage = error.message;
	});
}

var logoutAccount = function() {
	firebase.auth().signOut().then(function() {
		// Sign-out successful.
		}, function(error) {
		// An error happened.
	});
}