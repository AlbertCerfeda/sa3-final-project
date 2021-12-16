let base_documents = []; // Array containing all the documents of the page (without filter)
let call = false;
let reverse = false;

function init_documents() {

    setSearchListener();

    setDeleteListeners();

    setSwitchButtonListener();
    
    setEditListeners();

    setEditReadUsernames();

    setOwnersUsernames();

    setFilterRowClick();

    setSaveListeners();

    setBaseDocuments();

    setToolBarSortListeners();

    setSortListeners();

    formatDates();
}

// Set search listener on any input to search between all the titles and owners
function setSearchListener() {
    let search = document.getElementById('search');
    search.oninput = function(){
        
        // First we redisplay the section
        let list = document.querySelector('section#table-of-documents');
        document.querySelectorAll('.card-element').forEach(doc=>{
            doc.style.display = 'grid';
        })

        // And then hide what doesn't match the search

        let text = search.value;
        document.querySelectorAll('.card-element').forEach((row)=>{
            let owner = row.querySelector('.info.owner').innerHTML;
            let title = row.querySelector('.title').innerHTML;
            if (!title.toLowerCase().includes(text.toLowerCase()) && !owner.toLowerCase().includes(text.toLowerCase())) {
                row.style.display = 'none';
            }
        });

        document.querySelector('input[name="filter-submit"]').click();
    };

}

// Set all the listeners for a Document (row in list view)
function setDocumentListeners() {
    setEditListeners();
    setDeleteListeners();
}

// Set switch button between the list and grid view
function setSwitchButtonListener(){
    document.querySelector('.switch-list-grid a.grid-view').addEventListener('click', (event) => {
        event.preventDefault();

        document.getElementById("table-of-documents").className = "cards";
        document.querySelector('.switch-list-grid a.grid-view').style = "background-color: var(--bg-contrast); color: var(--accent)";
        document.querySelector(".switch-list-grid a.list-view").style = "background-color: var(--bg); color: var(--text)";

    })
    

    document.querySelector('.switch-list-grid a.list-view').addEventListener('click', (event) => {
        event.preventDefault();

        document.getElementById("table-of-documents").className = "list";
        document.querySelector('.switch-list-grid a.list-view').style = "background-color: var(--bg-contrast); color: var(--accent)";
        document.querySelector(".switch-list-grid a.grid-view").style = "background-color: var(--bg); color: var(--text)";

    })
}

// Set both edit and delete listeners buttons
function setDeleteListeners() {

    document.querySelectorAll(".svgimgform").forEach(btn => {
        btn.addEventListener("click", deletecard)
    })

    function deletecard(e) {
        let id = e.target.parentNode.id;
        fetch(id, {
            method: "DELETE"
        }).then(res => {
            console.log(res.status);
            e.target.parentNode.parentNode.remove();
        })
    }
}

// Set list edit links for each document and sort links for the header buttons
function setEditListeners() {
    document.querySelectorAll('.card-element').forEach(row=>{
        row.childNodes.forEach(el=>{
            if ((el.classList != undefined && !el.classList.contains('delete'))) {
                el.addEventListener('click',function(event){
                    window.location = row.querySelector('a#icon').href;
                })
            }
        })
    })
}

// Sets the tool bar sort listeners so that they act as the headline's buttons of the table
function setToolBarSortListeners() {
    let row = document.querySelector('.list-element.head');

    let elements = document.querySelector('.dropdown.sort');
    elements.querySelectorAll('.dropdown-item').forEach(item=>{
        item.addEventListener('click',function(event){
            event.preventDefault();
            let className = item.getAttribute('rel');
            row.querySelector(`a[rel="${className}"]`).click();
            elements.parentElement.querySelector('.reverse-sort').style.display = 'block';
        });
    })
}

// Set sort on click over buttons in the head line of the list
function setSortListeners() {

    let row = document.querySelector('.list-element.head');

    row.querySelectorAll('.info > b > a').forEach(a=>a.addEventListener('click',function(event){
        event.preventDefault();

        let type;
        let action = a.getAttribute('rel');
        if (action.endsWith('-date')) {
            type = ".actual-" + action;
        } else {
            type = '.' + action;
        }

        let activeSort = document.querySelector('button.active-sort');
        activeSort.setAttribute('data-toggle',action);
        let item = document.querySelector('div.sort > .dropdown-menu').querySelector(`a[rel="${action}"]`);
        document.querySelector('.sort > .btn-secondary.dropdown-toggle').innerHTML = item.innerHTML;
        document.querySelectorAll('.active-sort-display').forEach(item=>{
            if (a.parentNode.parentNode.querySelector('.reverse-sort') != item) {
                item.classList.remove('active-sort-display');
            }
        });
        debugger

        a.parentNode.parentNode.querySelector('.reverse-sort').classList.add('active-sort-display');
        
        // First, we take all the actual values
        let values = [];
        let nonCaseSensitiveValues = [];
        document.querySelectorAll(type).forEach(val=>{
            if (type.startsWith('.actual') && type.endsWith('-date')) {
                values.push(new Date(val.innerHTML));
            } else if (type == '.shared') {
                let n = parseInt(val.childNodes[0].nodeValue);
                values.push(n);
            } else {
                values.push(val.innerHTML);
                nonCaseSensitiveValues.push(val.innerHTML.toLowerCase());
            }
        });


        // Then we get all the document rows and empty the section
        let documents_rows = [];
        let list = document.querySelector('section#table-of-documents');
        document.querySelectorAll('.card-element').forEach(doc=>{
            documents_rows.push(doc);
            list.removeChild(doc);
        })

        // Finally we sort the array of values and for each of them place in the section the first node matching the value
        nonCaseSensitiveValues.sort();
        let sortedValues = [];
        nonCaseSensitiveValues.forEach(val=>{
            values.forEach(el=>{
                if (el.toLowerCase() == val) {
                    sortedValues.push(el);
                    delete el;
                }
            })
        })
        if (type.endsWith('-date')) {
            values.sort(function(d1,d2){
                return new Date(d1) - new Date(d2);
            });
            sortedValues = values;
        } else if (type == '.shared') {
            insertionSort(values);
            sortedValues = values;
        }

        sortedValues.forEach(val=>{
            let done = false;
            documents_rows.forEach(doc=>{
                if (!done && doc != undefined && doc.querySelector(type).innerHTML == String(val)){
                    list.appendChild(doc);
                    documents_rows = documents_rows.filter(x=>(x != doc));
                    done = true;
                }
            })
        });
        
        // setEditListeners();
        // setSortListeners();
        // $('[data-toggle="popover"]').popover({
        //     html:true
        // });
        // setDocumentListeners();
    }))
}

// Returns the username matching the given User's Id
function getUsernameById(id){
    return new Promise((resolve,reject)=>{
        let filter = {_id: id};
        fetch('/users/'+filter._id)
        .then(res=>res.json())
        .then(user=>{
            if (user.username == document.querySelector('#info > h2').innerHTML) {
                resolve("<i>me</i>");
            } else {
                resolve(user.username);
            }
        })
        .catch(err=>{
            reject("invalid user");
        });
        
    })
}

// Sets the username matching the given User's Id in the given DOM element
function setUsernameById(dom, id){
    return new Promise((resolve,reject)=>{
        getUsernameById(id)
        .then(username=>{
            dom.innerHTML = username;
            resolve(dom);
        })
        .catch(username=>{
            dom.innerHTML = username;
            resolve(dom);
        })
    })
}

// Set usernames instead of Ids in the permissions section of the document
function setEditReadUsernames() {
    document.querySelectorAll('a.perms#end').forEach(el=>{
        let articles = document.createElement('SECTION');
        articles.innerHTML = el.getAttribute('data-content');
        let promises = [];
        articles.querySelectorAll('.dropdown-item.user').forEach(item=>{
            let user = item.querySelector(".user").innerHTML;

            promises.push(new Promise((resolve,reject)=>{
                setUsernameById(item.querySelector(".user"), user)
                .then((dom)=>{
                    resolve();
                })
            }))
        })
        Promise.all(promises)
        .then(()=>{  
            el.setAttribute('data-content',articles.innerHTML);
        })
    })
}

// Set usernames instead of Ids in the owner section of the document
function setOwnersUsernames() {
    document.querySelectorAll('p.owner').forEach(x=>{
        let span = x.parentNode.querySelector('span.owner');
        setUsernameById(span,x.innerHTML);
    })
}

// Set selection for filters so that you can select a filter without having to go on the checkbox
function setFilterRowClick() {
    document.getElementById('filters').querySelectorAll('.dropdown-item').forEach(item=>{
        let checkbox = item.querySelector('input');
        item.addEventListener('click',function(event){
            checkbox.checked = !checkbox.checked;
            document.querySelector('input[name="filter-submit"]').click();
        })

        // Set checkbox click so that it works even on itself
        checkbox.addEventListener('change',function(event){
            checkbox.checked = !checkbox.checked;
            document.querySelector('input[name="filter-submit"]').click();
        })
    })
}

// Set listener for saving filters 
function setSaveListeners() {
    // Save filters sets all the selected filters
    document.querySelector('input[name="filter-submit"]').addEventListener('click',function(event){
        event.preventDefault();
        
        if (call == false){
            call = true;
            document.getElementById('search').oninput();
            call = false;
        }

        // Then set all the filters only if they're checked
        document.getElementById('filters').querySelectorAll('input[type="checkbox"]').forEach(checkbox=>{
            let active = document.querySelector('.active-filters');
            let item = checkbox.parentNode.querySelector('label[for="' + checkbox.name + '"]');
            if (checkbox.checked == true){
                if (active.querySelector('.active-filter.' + checkbox.name) == null) {
                    let button = document.createElement('BUTTON');
                    button.classList.add('active-filter');
                    button.classList.add(checkbox.name);
                    button.innerHTML = item.innerHTML + " X";
                    active.appendChild(button);
                    button.addEventListener('click',(event)=>{
                        checkbox.click();
                        document.querySelector('input[name="filter-submit"]').click();
                    });
                }
                setActiveFilter(checkbox);
            } else {
                let btn = active.querySelector('.' + checkbox.name);
                if (btn != null) {
                    active.removeChild(btn);
                }
            }
        })
    })
}

/**
 * setActiveFilter sets the filter corresponding to the given checkbox
 * @param {HTMLElement} checkbox the checkbox filter
 */
function setActiveFilter(checkbox){
    if (checkbox.type != 'checkbox') {
        return undefined;
    }
    
    let rows = [];
    document.querySelectorAll('.card-element').forEach(el=>{
        rows.push(el);
    });
    let type = checkbox.name.split('-')[1];

    /**
     * removeRow checks on the row if check is never true, then it hides the row, otherwise leaves it there 
     * @param {HTMLElement} row the row to be removed
     * @param {Function} check the function to check for the element
     */
    function removeRow(row, check = true) {
        let articles = document.createElement('SECTION');
                articles.innerHTML = row.querySelector('a.perms').getAttribute('data-content');
                let found = false;
                articles.querySelectorAll('.dropdown-item').forEach(item=>{
                    if (!item.innerHTML.includes('Document not shared')) {
                        let role = item.querySelector('.role').innerHTML;
                        let user = item.querySelector('.user').innerHTML;
                        if (check(role, user)){
                            found = true;
                        }
                    }
                })
                if (found == false) {
                    row.style.display = 'none';
                }
    }


    if (type == 'owned'){
        rows.forEach(row=>{
            if (row.querySelector('.info.owner').innerHTML != '<i>me</i>'){
                row.style.display = 'none';
            }
        })
    } else if (type == 'read'){
        rows.forEach(row=>{
            removeRow(row,(role,user)=>{
                return role == type && user == '<i>me</i>';
            })
        })
    } else if (type == 'edit') {
        rows.forEach(row=>{
            if (row.querySelector('.info.owner').innerHTML != '<i>me</i>'){
                removeRow(row,(role,user)=>{
                    return role == type && user == '<i>me</i>';
                });
            }
        })
    } else if (type == 'notmine') {
        rows.forEach(row=>{
            removeRow(row,(role,user)=>{
                return role != 'owner' && user == '<i>me</i>';
            })
        })
    } else {
        rows.forEach(row=>{
            let n = parseInt(row.querySelector('p.shared').innerHTML);
            if (n == 0) {
                row.style.display = 'none';
            }
        })
    }
}

// Set base documents variable
function setBaseDocuments() {
    base_documents = [];
    document.querySelectorAll('.card-element').forEach(el=>{
        base_documents.push(el);
    })
}

// Time Formatting Functions

// Takes a Date object and returns a date string considering:
// - If the document was created the same day it specifies the time:
// eg: Today at 12:17
// - If the document was created yesterday it specifies the time:
// eg: Yesterday at 12:17
// - If the document was created at most 7 days ago it specifies how many days ago:
//  eg: 5 days ago
// - If the document was created at most 1 month ago it specifies how many weeks ago
// eg: 2 weeks ago 
// - If the document was created more than one month ago it specifies the full date
// eg: On 07/12/2021

function formatDates() {
    document.querySelectorAll('.card-element').forEach((doc) => {
        let date = doc.querySelector(".creation-date")
        let editdate = doc.querySelector(".edit-date");
        editdate.innerHTML = formatTime(editdate.innerHTML)
        date.innerHTML = formatTime(date.innerHTML)
    })
}

function formatTime(date) {

    date = new Date(date);

    const now = new Date();
    let nowmonth = checkLess(now.getUTCMonth() + 1); //months from 1-12
    let nowday = checkLess(now.getUTCDate());
    let nowyear = now.getUTCFullYear();

    let month = checkLess(date.getUTCMonth() + 1); //months from 1-12
    let day = checkLess(date.getUTCDate());
    let year = date.getUTCFullYear();
    let hour = checkLess(date.getHours());
    let minutes = checkLess(date.getMinutes());
    
    if (day === nowday && month === nowmonth && year === nowyear) {
        return "Today at " + hour + ":" + minutes;
    }

    if (((nowday - day) === 1) && year === nowyear && month === nowmonth) {
        return "Yesterday at " + hour + ":" + minutes;
    }
    
    if ((((now.getTime() - date.getTime()) / 86400000) <= 7) && ((now.getTime() - date.getTime()) / 86400000) >= 2){
        return Math.floor(((now.getTime() - date.getTime()) / 86400000)) + " days ago"
    }

    if ((((now.getTime() - date.getTime()) / (86400000 * 7)) <= 4) && ((now.getTime() - date.getTime()) / (86400000 * 7) >= 1)){
        return Math.floor(((now.getTime() - date.getTime()) / (86400000 * 7))) + " weeks ago"
    }

    return "On " + day + "/" + month + "/" + year
    
}

function checkLess(n) {
    if (n < 10) {
        n = "0" + n 
    }
    return n;
}

/**
 * insertionSort takes an array of integers and sorts it in numerical order
 * @param {Array[Integer]} a the array of integers to be sorted 
 */
function insertionSort(a){
    for(let i = 1; i < a.length; i++){
        let value = a[i];
        let j = i - 1;
        while (j >= 0 && a[j] > value){
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = value;
    }
}






















///////////////////////////////// TESTING

// document.querySelector("#send_put").addEventListener('submit',function(e){
//     e.preventDefault();
    
//     fetch(`/docs/61b5f0ea7c3c3522425dfb72`,{
//         method: "PUT",
//         headers: {  "Content-Type":"application/json"},
//         body: JSON.stringify({tags: {
//             title: "ALBERT",
//             perm_edit_add: ['61b5f2947c3c3522425dfb73'],
//             // perm_read: [],
//             // owner: "61ace1efb83303c3053efa78" // Albert
//             // owner: '61ace20fb83303c3053efa79' // Ale
//         }})
//     });
// })
