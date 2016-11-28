// Do stuff on page load

$(document).ready(function() {
    
});

// Initialization Here

var url = window.location;
var login = false;
var match = /edit=.*/.exec(url);
if (match != null) {
    login = match.toString().split('=')[1] == 'true';
    console.log(login);
}

var height = window.innerHeight;
var sections = document.querySelectorAll('.section');
for (var i = 0; i < sections.length; i++) {
    sections[i].style.minHeight = (height - 50) + 'px';
}

var offset = 49;

$('a.nav-link, div.header a').click(function(event) {
    var elem = $($(this).attr('href'));
    $('html, body').stop().animate({
       scrollTop: elem.offset().top - offset
    }, 500);
    this.blur();
    event.preventDefault();
    event.returnValue = false;
    return false;
});


// Clipboard Here

$('#my-email').click(function(event) {
    $('#my-email').tooltip('show');

    setTimeout(function() {
        $('#my-email').tooltip('hide');
        $('#my-email').blur();
    }, 3000);

    event.preventDefault();
    event.returnValue = false;
    return false;
});

var clipboard = new Clipboard($('#my-email')[0], {
    text: function() {
        return 'tbauer16@uw.edu';
    }
});

clipboard.on('error', function(e) {
    console.log(e);
});


var assignUserPermissions = function(user) {
    if (user) {
        // User is signed in.
        username = user.email;
    } else {
        // No user is signed in.
        if (login && username == null) {
            $('#login').modal(options);
        }
        
        username = null;
        $('.admin').addClass('admin-hide');

        var options = {
            backdrop: true,//'static',
            keyboard: false,
            focus: true,
            show: true
        }
    }
}

// Firebase Stuff Here
var username;
firebase.auth().onAuthStateChanged(function(user) {
    assignUserPermissions(user);
});

// // References
// var database = firebase.database();
// var databaseRef = database.ref();
// var infoRef = databaseRef.child('info');
// var projectRef = databaseRef.child('projects');
// var workRef = databaseRef.child('work');

// var projects = [];
// projectRef.orderByChild('date').once('value', function(snapshot) {
//     // console.log(snapshot.val());
//     snapshot.forEach(function(child) {
//         projects.push(child.val());
//     });
//     // for (var name in items) {
//     //     projects.push(items[name]);
//     // }
//     processProjects(projects);
//     stopLoading();
// });

// var info;
// infoRef.once('value', function(snapshot) {
//     // console.log(snapshot.val());
//     info = snapshot.val();
//     processProfile(info);
//     stopLoading();
// });

// var work = [];
// workRef.orderByChild('dateLeft').once('value', function(snapshot) {
//     snapshot.forEach(function(child) {
//         work.push(child.val());
//     });
//     processWork(work);
//     stopLoading();
// });

$('body').on('loadFinish', function() {
    stopLoading();
});

var stopLoading = function() {
    var doneLoading = info != undefined && projects.length > 0 && work.length > 0;
    if (doneLoading) {
        $('div.hide').removeClass('hide');
        $('div.loader2').addClass('hide');
        processProjects(projects);
        processProfile(info);
        processWork(work);
    }
    return doneLoading;
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

var toggleAdminMode = function() {
    if (username == 'tyler.bauer7@gmail.com') {
        $('.admin').removeClass('admin-hide');
    } else {
        $('.admin').addClass('admin-hide');
    }
    var url = window.location.href
    if (url.indexOf('?edit=true') != -1) {
        window.history.pushState('none', 'none', '/');// = url.slice(0, url.indexOf('?edit=true'));
    }
}
$('.logout').off();
$('.logout').click(function(event) {
    logoutAccount();

    event.preventDefault();
    event.returnValue = false;
    return false;
});

$('#login').on('hidden.bs.modal', function() {
    toggleAdminMode();
});

$('.navbar, #aboutMe, #projects').on('infoChange', function() {
    toggleAdminMode();
});

var getDemoSite = function(project) {
    if (project.type == "github") {
        var githubArray = project.link.split("/");
        var index = githubArray.length - 1;
        var projectName = githubArray[index];
        return "http://demo-tbauer.rhcloud.com/" + projectName
    } else {
        return project.demo;
    }
}

var getDate = function(date, needDay) {
    if (needDay == undefined) {
        needDay = true;
    }
    var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];

    var date = new Date(date);
    var day = '';
    if (needDay) {
        day = date.getDate() + ', ';
    }
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
    return monthNames[monthIndex] + ' ' + day + year;
}

var processProfile = function(info) {
    // $('#aboutMe').empty();
    // $('#aboutMe').append(getProfileTemplate());
    $('#info-profile').attr('src', info.image);
    $('#info-dob').html(info.dob);
    $('#info-school').html(info.school);
    $('#info-degree').html(info.degree);
    $('#info-skills').html(getSkills());
    $('#info-languages').html(getLanguages());
    $('#info-description').html(info.description);
    $('#aboutMe')[0].dispatchEvent(new Event('infoChange'));
}

var processProjects = function(projects) {
    $('#projects-list').empty();
    for (var i = 0; i < projects.length; i += 2) {
        var row = $('<div class="row"></div>');
        row.append(getProjectTemplate(i));
        if (projects[i + 1] != undefined) {
            row.append(getProjectTemplate(i + 1));
        }
        $('#projects-list').append(row);
        $('#projects')[0].dispatchEvent(new Event('infoChange'));
    }
}

var processWork = function(work) {
    // $('#projects-list').empty();
    var div = $('<div></div>');
    for (var i = 0; i < work.length; i++) {
        $('#work-list').append(getWorkTemplate(i));
        $('#aboutMe')[0].dispatchEvent(new Event('infoChange'));
    }
    return div;
}

var getSkills = function() {
    var skills = '';
    for (var i = 0; i < info.skills.length; i++) {
        skills += '<li>' + info.skills[i] + '</li>\n';
    }
    return skills;
}

var getLanguages = function() {
    var languages = '';
    for (var i = 0; i < info.languages.length; i++) {
        languages += '<li>' + info.languages[i] + '</li>\n';
    }
    return languages;
}

var getProfileTemplate = function() {
    var profileTemplate = `
        <a class="admin admin-hide" href="edit/edit-profile/">Edit Profile</a>
        <h1>About Me</h1>
        <div class="row">
            <div class="col-xs-12 col-md-6">
                <img class="profile mx-auto d-block" src="` + info.image + `" alt="profile">
            </div>
            <div class="col-xs-12 col-md-6">
                <div class="margin-right-100">
                    <div class="row">
                        <div class="col-xs-6">Date of Birth:</div>
                        <div class="col-xs-6">` + info.dob + `</div>
                    </div>
                    <div class="row">
                        <div class="col-xs-6">Education:</div>
                        <div class="col-xs-6">` + info.school + `</div>
                    </div>
                    <div class="row">
                        <div class="col-xs-6">Degree:</div>
                        <div class="col-xs-6">` + info.degree + `</div>
                    </div>
                    <hr>
                    <div class="row">
                        <div class="col-xs-12 col-sm-6">
                            <p>Skills:</p>
                            <ul class="pl-1">
                                ` + getSkills() + `
                            </ul>
                        </div>
                        <div class="col-xs-12 col-sm-6">
                            <p>Languages:</p>
                            <ul class="pl-1">
                                ` + getLanguages() + `
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-1" id="work">
            <a class="admin admin-hide" href="edit/edit-work/">Add Work</a>
            <h2>Previous Work</h2>
            <div id="work-list">

            </div>
        </div>
        <div class="row mt-1">
            <div class="col-xs-12">
                <div>
                    <p class="pre-wrap">` + info.description + `</p>
                </div>
            </div>
        </div>
    `;
    return profileTemplate;
}

var getWorkTemplate = function(index) {
    var workTemplate = `
        <div class="col-xs-12">
            <div class="work">
                <a class="admin admin-hide" href="edit/edit-work/?id=` + index + `">Edit Work</a>
                <h3>` + work[index].company + `</h3>
                <p>` + work[index].jobTitle + `</p>
                <p>` + getDate(new Date(work[index].dateStart * -1), false) + ` - ` + getDate(new Date(work[index].dateLeft * -1), false) + `</p>
                <p>` + work[index].description + `</p>
            </div>
        </div>
    `;
    return workTemplate;
}

var getProjectTemplate = function(index) {
    var projectTemplate = `
        <div class="col-xs-12 col-md-6 px-0">
            <div class="project">
                <a class="admin admin-hide" href="edit/edit-project/?id=` + index + `">Edit Project</a>
                <h1>` + projects[index].title + `</h1>
                <a href="` + getDemoSite(projects[index]) + `" target="_blank"><div class="project-img" data-aspect-ratio="16:9"><img src="` + projects[index].image + `" alt="` + projects[index].title + ` screenshot"></div></a>
                <p>` + projects[index].description + `</p>
                <hr>
                <p class="date">- Completed: ` + getDate(projects[index].date * -1) + `</p>
                <a class="source" target="_blank" href="` + projects[index].link + `">Source Code</a>
            </div>
        </div>
    `;
    return projectTemplate;
}