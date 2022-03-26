const submitButton = document.querySelector('button[type="submit"]'),
      userEmail = document.querySelector('#user-email').value, 
      userPassword = document.querySelector('#user-password').value, 
      confirmPassword = document.querySelector('#confirm-password').value;

submitButton.addEventListener('click', (event)=>{
  console.log(userEmail, userPassword, confirmPassword);
  event.preventDefault();
})