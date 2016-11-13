// References
var database = firebase.database();
var databaseRef = database.ref();
var infoRef = databaseRef.child('info');
var projectRef = databaseRef.child('projects');
var workRef = databaseRef.child('work');

var projects = [];
projectRef.orderByChild('date').once('value', function(snapshot) {
    // console.log(snapshot.val());
    snapshot.forEach(function(child) {
        projects.push(child.val());
    });
    $('body')[0].dispatchEvent(new Event('loadFinish'));
});

var info;
infoRef.once('value', function(snapshot) {
    info = snapshot.val();
    $('body')[0].dispatchEvent(new Event('loadFinish'));
});

var work = [];
workRef.orderByChild('dateLeft').once('value', function(snapshot) {
    snapshot.forEach(function(child) {
        work.push(child.val());
    });
    $('body')[0].dispatchEvent(new Event('loadFinish'));
});