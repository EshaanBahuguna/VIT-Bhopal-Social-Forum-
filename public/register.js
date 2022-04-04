const registerPageButton = document.querySelector('#register-page button[type="submit"]');

registerPageButton.addEventListener('click', (event)=>{
    const userEmail = document.querySelector('#user-email').value,
          userPassword = document.querySelector('#user-password').value,
          confirmPassword = document.querySelector('#confirm-password').value;

    //CLIENT SIDE VALIDATION
    const regExp = /@vitbhopal.ac.in$/
    let validEmail = regExp.test(userEmail);
    let validPassword;
    if(userPassword === confirmPassword){
      validPassword = true;
    }
    else{
      validPassword = false;
    }
    // When password and email are correct
    if(validEmail === true && validPassword === true){
      fetch('/register', {
        method: 'POST', 
        headers: {'Content-Type': 'application/x-www-form-urlencoded'} , 
        body: `userEmail=${userEmail}&userPassword=${userPassword}`
      })
      .then((response)=> response.json())
      .then((result)=> {
        displayRegisterOutput(result);
        setTimeout(()=>{
            location.href = '/login';
        }, 1800)
      })
    }
    // When entered password is incorrect 
    else if(validPassword == false){
      displayRegisterOutput({message: 'Password is incorrect', color: 'red'});
    }
    // When entered email id is incorrect 
    else if(validEmail == false){
      displayRegisterOutput({message: 'Email is incorrect', color: 'red'});
    }
    event.preventDefault();
  })

function displayRegisterOutput(result){
  const registerOutput = document.querySelector('#register-output');
  registerOutput.style.color = result.color;
  registerOutput.innerText = result.message;
  registerOutput.style.display = 'block';
  setTimeout(()=>{
      registerOutput.style.display = 'none';
  }, 5000)
}