const userProfileButton = document.querySelector('#user-profile-button'), 
      userProfileCancelButton = document.querySelector('#user-profile > i')
      addSkillButton = document.querySelector('#add-skill-button'), 
      updateProfileButton = document.querySelector('#user-profile button'), 
      makePostButton = document.querySelector('#make-post button'), 
      deleteSkillsButton = document.querySelector('#delete-skill-button'), 
      deleteHobbiesButton = document.querySelector('#delete-hobbies-button');

// To load all events 
window.onload = function(){
  const homePageLinkNavbar = location.href;
  document.querySelector('nav ul li:first-child').setAttribute('href', homePageLinkNavbar); 
}
loadAllEvents();
loadSkills();
loadHobbies();
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
    userSkillsSection.insertBefore(div, event.target.parentElement);

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
    console.log(skillNameCollection, skillProficiencyCollection); 
    let skillName = [], skillProficiency = [];
    Array.from(skillNameCollection).forEach((name)=>{
      if(name.value !== ''){
        skillName.push(name.value);
      }
    })
    Array.from(skillProficiencyCollection).forEach((proficiency)=>{
      if(Number(proficiency.value) !== 0){
        skillProficiency.push(Number((proficiency.value/10) * 100));
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
    .then((text)=> {
      console.log(text);
      document.location.reload();
    });
    

    document.querySelector('#user-profile-wrapper').style.display = 'none';
    event.preventDefault();
  })

  makePostButton.addEventListener('click', (event)=>{
    const title = document.querySelector('#make-post input[type="text"]'), 
          body = document.querySelector('#make-post textarea'), 
          userId = document.querySelector('#make-post input[type="hidden"]').value, 
          makePostOutput = document.querySelector('#make-post-output'); 
    
    if(title !== '' && body !== ''){
      fetch(`${location.href}/makePost`, {
        method: 'POST', 
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify({
          title: title.value, 
          body: body.value, 
          userId: userId
        })
      })
      .then((serverResponse)=> serverResponse.json())
      .then((response)=> {
        let output;
        if(response.isTitleProfane === false && response.isBodyProfane === false){
          makePostOutput.style.color = 'lightgreen'; 
          output = 'Post was successfully submitted'; 
        }
        if(response.isTitleProfane === true || response.isBodyProfane === true){
          makePostOutput.style.color = 'red'; 
          if(response.isTitleProfane === true){
            title.value = response.cleanTitle; 
            output = 'Profane words found in title';
          }
          if(response.isBodyProfane === true){
            body.value = response.cleanBody; 
            output = 'Profane words found in body'; 
          }
          if(response.isTitleProfane === true && response.isBodyProfane === true){
            output = 'Profane words found in body and title';
          }
        }
        makePostOutput.innerText = output;
      })
    }
    else{
      makePostOutput.style.color = 'red';
      makePostOutput.innerText = 'Title or Body of Post is Empty';
    }
    setTimeout(()=>{
      makePostOutput.innerText = ''; 
    }, 2500)

    event.preventDefault();
  })

  deleteHobbiesButton.addEventListener('click', (event)=>{
    fetch(`${location.href}/hobbies`)
    .then((response)=> response.json())
    .then((hobbies)=> {
      const allHobbiesSection = document.querySelector('#all-hobbies ul');
      hobbies.forEach((hobby)=>{
        allHobbiesSection.innerHTML += `
        <li class="p-2">${hobby.hobby} <i class="fas fa-trash-alt hover:text-violet-500 ml-10 hover:cursor-pointer delete-hobby"></i></li>
        `
      })
      allHobbiesSection.parentElement.style.display = 'block';
      
      const deleteHobby = document.getElementsByClassName('delete-hobby'); 
      Array.from(deleteHobby).forEach((button)=>{
        button.addEventListener('click', (e)=>{
          fetch(`${location.href}/deleteHobby`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify({hobby: e.target.parentElement.innerText}) 
          })
          .then((response)=> response.json())
          .then((result)=> {
            if(result.hobbyDeleted === true){
              e.target.parentElement.style.textDecoration = 'line-through';
              loadHobbies();
            }
          })
        })
      })
    })
    event.preventDefault();
  })
}

function loadSkills(){
  const skillsSection = document.querySelector('#skills');
  fetch(`${location.href}/skills`)
  .then((response)=> response.json())
  .then((skills)=>{
    skills.forEach((skill)=>{
      skillsSection.innerHTML += `
      <div class="mb-3">
      <p class="font-bold mb-2">${skill.skill}</p>
        <div class="bg-slate-700 h-3 rounded">
          <div style="width: ${skill.proficiency}%; height: 0.75rem" class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500  rounded"></div>
        </div>
      </div>
      `
    })
  });
}
function loadHobbies(){
  const hobbiesSection = document.querySelector('#about-me div:last-child ul');
  hobbiesSection.innerHTML = ``;
  fetch(`${location.href}/hobbies`)
  .then((response) => response.json())
  .then((hobbies)=>{
    hobbies.forEach((hobby)=>{
      hobbiesSection.innerHTML += `
      <li class="p-2"><i class="fas fa-angle-right mr-1"></i>${hobby.hobby}</li>
      `
    })
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