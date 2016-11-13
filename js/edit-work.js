var url = window.location;
var id;
var match = /id=(\d)+/.exec(url);
if (match != null) {
	id = parseInt(match.toString().split('=')[1]);
} else {
	id = -1;
}

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
var workRef = databaseRef.child('work');

var work = [];
var workIDs = [];
workRef.orderByChild('date').once('value', function(snapshot) {
    // console.log(snapshot.val());
    snapshot.forEach(function(child) {
    	work.push(child.val());
    	workIDs.push(child.key);
    });
    // console.log(projectIDs);
    if (id != -1) {
    	processWork(work);
    }
});

var processWork = function(work) {
	// console.log(projects);
	console.log(work[id]);
	var job = work[id];
	for (var itemId in job) {
		var toInsert = job[itemId];
		if (itemId.indexOf('date') != -1) {
			var date = new Date(job[itemId] * -1);
			var day = date.getDate() + '';
			if (day.length == 1) {
				day = '0' + day;
			}
			var month = (date.getMonth() + 1) + '';
			if (month.length == 1) {
				month = '0' + month;
			}
			toInsert = date.getFullYear() + '-' + month + '-' + day;
		}
		$('#' + itemId).val(toInsert);
	}
}

var save = function() {
	var item = {
		dateStart: new Date($('#dateStart').val()).getTime() * -1,
		dateLeft: new Date($('#dateLeft').val()).getTime() * -1,
		description: $('#description').val(),
		jobTitle: $('#jobTitle').val(),
		company: $('#company').val()
	};
	// console.log(item);
	if (id >= 0) {
		workRef.child(workIDs[id]).set(item)
			.then(function() {
				window.location.replace(window.location.href.split('/edit')[0]);
			}, function(error) {
				console.log(error);
			});
	} else {
		var newPostKey = workRef.push().key;
		var update = {};
		update[newPostKey] = item;
		workRef.update(update)
			.then(function() {
				window.location.replace(window.location.href.split('/edit')[0]);
			}, function(error) {
				console.log(error);
			});
	}
}

var deleteWork = function() {
	var verify = confirm('Are you sure? This change is permanent.');
	if (verify) {
		workRef.child(workIDs[id]).set(null)
		.then(function() {
			window.location.replace(window.location.href.split('/edit')[0]);
		}, function(error) {
			console.log(error);
		});
	}
}

$('#save').click(function(event) {
	save();

	event.preventDefault();
    event.returnValue = false;
    return false;
});

$('#delete').click(function(event) {
	deleteWork();

	event.preventDefault();
    event.returnValue = false;
    return false;
});

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