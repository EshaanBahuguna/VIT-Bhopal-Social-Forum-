const contactFormButton = document.querySelector('#contact-form button');

contactFormButton.addEventListener('click', (event)=>{
    const   name = document.querySelector('#contact-name').value,
            email = document.querySelector('#contact-email').value, 
            message = document.querySelector('#contact-message').value;
    console.log(name, email, message)
    if(name !== '' && email !== '' && message !== ''){
        fetch('/contact', {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify({
                name: name, 
                email: email, 
                message: message
            })
        })
        .then((response)=> response.text())
        .then((message)=> alert(message))
    }
    else{
        alert('All fields in the contact form should be filled.');
    }

    event.preventDefault();
})