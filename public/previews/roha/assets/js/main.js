(function(){'use strict';
function show(id){
document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
document.getElementById('page-'+id).classList.add('active');
document.querySelectorAll('.header nav a').forEach(a=>a.classList.remove('active'));
document.getElementById('nav-'+id).classList.add('active');
window.scrollTo(0,0);
}
})();