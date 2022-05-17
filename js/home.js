const graphs = ['tendency.html','affected.html'];
var tabs = document.getElementById('nav').children;
function select(i){
    for(let j = 0; j < tabs.length; ++j){
        tabs[j].className = "";
    }
    tabs[i].className = 'active';
    document.getElementById('graph').setAttribute('src', graphs[i]);
}
for(let i = 0; i < tabs.length; ++i){
    tabs[i].onclick = ()=>{
        select(i);
    }
}
select(0);