const   addEventsButton = document.querySelector('#events-and-holidays button'), 
        deleteEventsButton = document.querySelector('#delete-events-button'), 
        deleteHolidaysButton = document.querySelector('#delete-holidays-button'), 
        eventAndHolidaysSection = document.querySelector('#events-and-holidays'), 
        contactCardsSection = document.querySelector('#display-contact-cards');

loadContactCards();
loadUserInformation();
addEventsButton.addEventListener('click', (event)=>{
    const   name = document.querySelector('#event-name').value, 
            type = document.querySelector('input[type="radio"]:checked').value
            date = document.querySelector('#event-date').value, 
            output = document.querySelector('#add-events-output');

    // Check if no field is empty
    if(name !== '' && type !== null && date !== ''){
        fetch('/addEvent', {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify({
                name: name, 
                type: type, 
                date: date, 
                month: date.split(' ')[1]
            })
        })
        .then((response)=> response.json())
        .then((result)=> {
            if(result.success === true){
                output.innerText = 'Event was successfully added';
                output.style.color = 'lightgreen';
            }
        })
    }
    else{
        output.innerText = 'All fields should be filled';
        output.style.color = 'red';
    }
    setTimeout(()=>{
        output.innerText = '';
    }, 2500);

    event.preventDefault();
})

deleteEventsButton.addEventListener('click', (event)=>{
    fetch('/getAllEvents')
    .then((response)=> response.json())
    .then((eventsDB)=>{
        const div = document.createElement('div');
        div.className = 'border-t-2 border-t-slate-500 mt-6 pt-3 text-center';
        const ul = document.createElement('ul');
        eventsDB.forEach((event)=>{
            const li = document.createElement('li');
            li.className = 'p-2'
            li.innerHTML = `
                ${event.eventName}  ${event.date}  <button class="delete-event" value="${event._id}"><i class="fas fa-times hover:text-violet-500 ml-5 hover:cursor-pointer"></i></button>
            `;
            ul.appendChild(li);
        })
        div.appendChild(ul);
        eventAndHolidaysSection.appendChild(div);

        // Adding event listener to delete event buttons
        const deleteEvents = document.getElementsByClassName('delete-event');
        Array.from(deleteEvents).forEach((button)=>{
            button.addEventListener('click', (e)=>{
                // Making delete event request
                fetch('/deleteEvent', {
                    method: 'POST', 
                    headers: {'Content-Type': 'application/json'}, 
                    body: JSON.stringify({id: e.target.parentElement.value})
                })
                .then((response)=> response.json())
                .then((result)=> {
                    if(result.eventDeleted === true){
                        e.target.parentElement.parentElement.style.textDecoration = 'line-through';
                    }
                })
                e.preventDefault();
            })
        })
    })
    event.preventDefault();
})

deleteHolidaysButton.addEventListener('click', (event)=>{
    fetch('/getAllHolidays')
    .then((response)=> response.json())
    .then((holidaysDB)=>{
        const div = document.createElement('div');
        div.className = 'border-t-2 border-t-slate-500 mt-6 pt-3 text-center';
        const ul = document.createElement('ul');
        holidaysDB.forEach((holiday)=>{
            const li = document.createElement('li');
            li.className = 'p-2'
            li.innerHTML = `
                ${holiday.holidayName}  ${holiday.date}  <button class="delete-holiday" value="${holiday._id}"><i class="fas fa-times hover:text-violet-500 ml-5 hover:cursor-pointer"></i></button>
            `;
            ul.appendChild(li);
        })
        div.appendChild(ul);
        eventAndHolidaysSection.appendChild(div);

        // Adding event listener to delete event buttons
        const deleteEvents = document.getElementsByClassName('delete-holiday');
        Array.from(deleteEvents).forEach((button)=>{
            // Making delete holiday request
            button.addEventListener('click', (e)=>{
                fetch('/deleteHoliday', {
                    method: 'POST', 
                    headers: {'Content-Type': 'application/json'}, 
                    body: JSON.stringify({id: e.target.parentElement.value})
                })
                .then((response)=> response.json())
                .then((result)=> {
                    if(result.holidayDeleted === true){
                        e.target.parentElement.parentElement.style.textDecoration = 'line-through';
                    }
                })
                e.preventDefault();
            })
        })
    })
    event.preventDefault();
})

function loadContactCards(){
    fetch('/getContactCards')
    .then((response)=> response.json())
    .then((result)=> {
        result.contacts.forEach((contact)=>{
            const div = document.createElement('div');
            div.className = 'card p-3 mt-3';
            div.innerHTML = ` 
                <div class="flex flex-row justify-between">
                    <div>
                        <p class="text-xs">posted by <span class="hover:underline cursor-pointer text-violet-400">${contact.name}</span></p>
                        <p class="text-xs">Email: <span class="hover:underline cursor-pointer text-violet-400">${contact.email}</span></p>
                    </div>
                    <button class="delete-contact-card" value="${contact._id}"><i class="fas fa-trash-alt hover:text-violet-500 ml-5 hover:cursor-pointer"></i></button>
                </div>
                <p class="mt-3">${contact.message}</p>
                
            `;
            contactCardsSection.appendChild(div);
        })

        // Adding event listeners to delete-contact-card buttons
        const deleteContactCard = document.getElementsByClassName('delete-contact-card');
        Array.from(deleteContactCard).forEach((button)=>{
            // Making delete holiday request
            button.addEventListener('click', (e)=>{
                fetch('/deleteContactCard', {
                    method: 'POST', 
                    headers: {'Content-Type': 'application/json'}, 
                    body: JSON.stringify({id: e.target.parentElement.value})
                })
                .then((response)=> response.json())
                .then((result)=> {
                    if(result.contactDeleted === true){
                        e.target.parentElement.parentElement.parentElement.remove();
                    }
                })
                e.preventDefault();
            })
        })
    })
}

function loadUserInformation(){
    fetch('/getUserAccounts')
    .then((response)=> response.json())
    .then((result)=>{
        document.querySelector('#registered-users').innerText = result.userAccounts;
    })
    fetch('/getActiveAccounts')
    .then((response)=> response.json())
    .then((result)=>{
        document.querySelector('#active-users').innerText = result.activeAccounts;
    })
}