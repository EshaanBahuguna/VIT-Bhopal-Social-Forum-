const userProfileButton = document.querySelector('#user-profile-button'), 
      userProfileCancelButton = document.querySelector('#user-profile > i')
      addSkillButton = document.querySelector('#add-skill-button'), 
      updateProfileButton = document.querySelector('#user-profile button');

// To load all events 
loadAllEvents();
function loadAllEvents(){

  userProfileButton.addEventListener('click', (event)=>{
    document.querySelector('#user-profile-wrapper').style.display = 'block';
    event.preventDefault();
  })

  userProfileCancelButton.addEventListener('click', (event)=>{
    event.target.parentElement.parentElement.style.display = 'none';
  })

  addSkillButton.addEventListener('click', (event)=>{
    // Create the input fields for new skill
    const div = document.createElement('div');
    div.className = 'flex flex-row mt-3';

    div.innerHTML = `
    <input type="text" name="" id="" class="border-2 rounded border-gray-500 focus:outline-none focus:border-violet-500 w-80 p-2 skill-name"> 
    <div class="ml-5">
      Proficiency <span class="text-zinc-400 italic text-base">(out of 10)</span>
      <input type="number" name="" id="" class="border-2 rounded border-gray-500 focus:outline-none focus:border-violet-500 w-20 p-2 skill-proficiency">
    </div>
    `;

    const userSkillsSection = document.querySelector('#user-skills-section');
    userSkillsSection.insertBefore(div, event.target);

    event.preventDefault();
  })

  updateProfileButton.addEventListener('click', (event)=>{
    const firstName = document.querySelector('#first-name').value, 
          lastName = document.querySelector('#last-name').value, 
          aboutMe = document.querySelector('#user-profile textarea').value, 
          hobbies = document.querySelector('#hobbies').value, 
          skillNameCollection = document.getElementsByClassName('skill-name'), 
          skillProficiencyCollection = document.getElementsByClassName('skill-proficiency');

    
    //Creating an object literal to store the values
    const updateProfile = {
      firstName: firstName, 
      lastName: lastName, 
      aboutMe: aboutMe, 
      hobbies: hobbies.split(','), 
      skills: []
    }
    // Converting HTML collection into arrays 
    let skillName = [], skillProficiency = [];
    Array.from(skillNameCollection).forEach((name)=>{
      skillName.push(name.value);
    })
    Array.from(skillProficiencyCollection).forEach((proficiency)=>{
      if(Number(proficiency.value) !== 0){
        skillProficiency.push(Number(proficiency.value));
      }
    })
    // Adding the skill name and the associated proficiency to updateProfile
    if(skillName.length === skillProficiency.length){
      let index = 0;
      skillName.forEach((name)=>{
        updateProfile.skills.push({
          skill: name, 
          proficiency: skillProficiency[index]
        })
        index++;
      })
    }
    else{
      throw new Error('Either name or proficiency or both of the skill(s) is/are absent');
    }
    
    let currentUrl = location.href;
    fetch(`${currentUrl}/updateProfile`, {
      method: 'POST', 
      headers: {'Content-Type': 'application/json'}, 
      body: JSON.stringify(updateProfile)
    })
    .then((response)=> response.text())
    .then((text)=> console.log(text));

    document.querySelector('#user-profile-wrapper').style.display = 'none';
    event.preventDefault();
  })
}























// const postButton = document.querySelector('#make-post button[type="submit"]');
// postButton.addEventListener('click', (event)=>{
//   const title = document.querySelector('#title').value, 
//         body = document.querySelector('#body').value;
  
//   fetch('/home', {
//     method: 'POST', 
//     headers: {'Content-Type': 'application/x-www-form-urlencoded'}, 
//     body: `title=${title}&body=${body}`
//   })
//   .then((response)=> response.text())
//   .then((text)=> console.log(text))
//   event.preventDefault();
// })