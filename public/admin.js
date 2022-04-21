const addEventsButton = document.querySelector('#events-and-holidays button');

addEventsButton.addEventListener('click', (event)=>{
    const   name = document.querySelector('#event-name').value, 
            type = document.querySelector('input[type="radio"]:checked').value
            date = document.querySelector('#event-date').value;

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
                console.log('Event was successfully added');
            }
        })
    }
    else{
        console.log('All fields should be filled')
    }


    event.preventDefault();
})