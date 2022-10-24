const userProfileButton = document.querySelector('#user-profile-button'), 
      userProfileCancelButton = document.querySelector('#user-profile > i')
      addSkillButton = document.querySelector('#add-skill-button'), 
      updateProfileButton = document.querySelector('#user-profile button.primary-button'), 
      makePostButton = document.querySelector('#make-post button'), 
      deleteSkillsButton = document.querySelector('#delete-skills-button'), 
      deleteHobbiesButton = document.querySelector('#delete-hobbies-button'),
      userId = document.querySelector('#user-id').innerText.trim(), 
      uploadImageButton = document.querySelector('#user-profile > div > form > button');

// To load all events 
loadAllEvents();
loadSkills();
loadHobbies();
loadPosts();
loadProfilePhoto();
function loadAllEvents(){

  userProfileButton.addEventListener('click', (event)=>{
    document.querySelector('#user-profile-wrapper').style.display = 'block';
    const userPicture = document.querySelector('#user-picture img');
    const img = document.querySelector('#user-profile > div > img');
    img.src = userPicture.src;
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
    
    if(title.value !== '' && body.value !== ''){
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
            output = 'Profane word(s) found in title';
          }
          if(response.isBodyProfane === true){
            body.value = response.cleanBody; 
            output = 'Profane word(s) found in body'; 
          }
          if(response.isTitleProfane === true && response.isBodyProfane === true){
            output = 'Profane word(s) found in body and title';
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
    // Displaying all hobbies
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
      
      // Deleting the selected hobby from the DB
      const deleteHobby = document.getElementsByClassName('delete-hobby'); 
      Array.from(deleteHobby).forEach((button)=>{
        // Adding event listener to delete button
        button.addEventListener('click', (e)=>{
          // Making delete hobby request
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

  deleteSkillsButton.addEventListener('click', (event)=>{
    // Displaying all Skills and their respective proficiencies
    fetch(`${location.href}/skills`)
    .then((response)=> response.json())
    .then((skills)=>{
      const allSkillsSection = document.querySelector('#all-skills ul');
      skills.forEach((skill)=>{
        allSkillsSection.innerHTML += `
        <li class="p-2"><span>${skill.skill}</span> <span class="ml-10">Proficiency: ${(skill.proficiency/100)*10}</span><i class="fas fa-trash-alt hover:text-violet-500 ml-10 hover:cursor-pointer delete-skill"></i></li>
        `
      })
      allSkillsSection.parentElement.style.display = 'block';
      
      // Deleting the selected skill from the DB
      const deleteSkill = document.getElementsByClassName('delete-skill');
      Array.from(deleteSkill).forEach((button)=>{
        // Adding event listener to delete button
        button.addEventListener('click', (e)=>{
          // Making delete skill request
          fetch(`${location.href}/deleteSkill`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify({skill: e.target.parentElement.firstChild.innerText}) 
          })
          .then((response)=> response.json())
          .then((result)=> {
            if(result.skillDeleted === true){
              e.target.parentElement.style.textDecoration = 'line-through';
              loadSkills();
            }
          })
        })
      })
    })


    event.preventDefault();
  })

  uploadImageButton.addEventListener('click', (event)=>{
    event.preventDefault();

    const formData = new FormData(document.querySelector('#user-profile > div > form'));
    fetch(`/${userId}/uploadImage`, {
      method: 'POST', 
      body: formData
    })
    .then(response => response.json())
    .then((res)=> {
      const output = document.querySelector('#user-profile > div > p');

      if(res.image !== null){
        const img = document.querySelector('#user-profile > div > img');
        img.src = `data:${res.type};base64, ${res.image}`;

        loadProfilePhoto();
      }

      output.innerText = res.text;
      output.style.color = res.color; 

      if(res.color === 'green'){
        setTimeout(()=>{
          output.style.display = 'none';
        }, 3000)
      }
    })
  })
}

function loadSkills(){
  const skillsSection = document.querySelector('#skills');
  skillsSection.innerHTML = `
  <h3 class="mb-3 text-center">Skills</h3>
  `;
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
      <li class="p-2"><i class="fas fa-angle-right" style="margin-right: 0.5rem"></i>${hobby.hobby}</li>
      `
    })
  })
}
function loadPosts(){
  fetch('/getPosts')
  .then((response) => response.json())
  .then((posts)=> {
    const postsSection = document.querySelector('#posts > div');
          
    // Get updated Likes and Comments number
    posts.forEach((post)=>{
      fetch(`/likesAndCommentsNumber/${'email=' + post.username + '&postId=' + post._id}`)
      .then((response)=> response.json())
      .then((data)=> {

        // Get Liked Posts for the user
        let likeClassName = 'far fa-heart'
        fetch('/getLikedPosts/userId=' + userId)
        .then((res) => res.json())
        .then((likedPosts)=>{
          likedPosts.likedPosts.forEach((likedPost)=>{
            if(String(likedPost._id) === String(post._id)){
              likeClassName = 'fas fa-heart'; 
            }
          })

          //Get Image of user whose post needs to be displayed 
          fetch(`/${post.username}/userImage`)
          .then(imageResponse => imageResponse.json())
          .then((image)=>{
            
            // Displaying posts
            const div = document.createElement('div');
            div.className = 'card p-3 mt-3';
            div.innerHTML =  `
            <img src="data:${image.type};base64, ${image.data}" class="mr-1 mb-1 h-6 w-6 inline-block rounded-full"> <p class="text-xs inline-block mb-1">posted by <span class="hover:underline cursor-pointer text-violet-400">${post.username}</span></p>
            <p class="post-title">${post.title}</p>
            <p class="post-body">${post.body.substring(0, 200)}</p>
            <ul class="flex flex-row mt-2 text-base">
              <li class="mr-3 hover:text-violet-400 cursor-pointer"><i class="${likeClassName} like-button"></i><span class="ml-1">${data.likes}</span></li>
              <li class="hover:text-violet-400 cursor-pointer"><i class="far fa-comment-alt comment-button"></i><span class="ml-1">${data.comments}</span></li>
              <li class="hidden"> ${post._id} </li>
            </ul>
            `;
            postsSection.insertBefore(div, document.querySelector('#posts > div > button'));
          })
        })
      })
    })

    // Event delegation to dynamically add eventListener to Like & Reply Buttons
    postsSection.addEventListener('click', (event)=>{
      let postId, email;
      if(event.target.className.indexOf('like-button') != -1 || event.target.className.indexOf('comment-button') != -1){
        postId = event.target.parentElement.parentElement.children[2].innerText.trim();
        email = event.target.parentElement.parentElement.parentElement.children[1].children[0].innerText;      
        // console.log(email, postId);
      }
      if(event.target.className.indexOf("like-button") != -1){
        
        console.log("Like button was clicked!");

        fetch(`/likePost/email=${email}&postId=${postId}&userId=${userId}`)
        .then((response)=> response.json())
        .then((result)=>{
          if(result.liked){
            event.target.className = 'fas fa-heart like-button';
            event.target.style.color = '#A78BFA';
          }
          else if(result.unliked){
            event.target.className = 'far fa-heart like-button';
          }
          event.target.nextSibling.innerText = result.likedNumber;
        })
       
      }
      else if(event.target.className.indexOf("comment-button") != -1){
        console.log('Comment button was clicked!');
        const commentsSection = document.querySelector('#comments-section');

        // Remove comments section if clicked again 
        if(commentsSection != null){
          commentsSection.remove();
        }
        else{
          // Displaying comments section
          let div = document.createElement('div');
          div.id = 'comments-section';
          div.className = 'mt-4';
          div.innerHTML = `
          <textarea type="text" name="comment" placeholder="Write your Reply here" class="mt-3 mb-2 pl-1" style="width: 100%; height: 5rem; background-color: #2a2a2a; border-bottom: 3px solid #A78BFA; padding-bottom: 0.5rem; resize: none;"></textarea>
          <div class="flex flex-row justify-between mt-2"> 
            <div class="text-xs text-gray-400"><span>200</span>/200</div> <div><button class="primary-button relative bottom-2" id="reply-button">Submit</button></div>
          </div> 
          `;
          const post = event.target.parentElement.parentElement.parentElement;
          post.appendChild(div);
          
          // Appending user-comments section 
          const userCommentsSection = document.createElement('div');
          userCommentsSection.id = 'user-comments';
          div.appendChild(userCommentsSection);

          // Event Listener for typing replies/comments
          div.addEventListener('keyup', (e)=>{
            const charactersLeft = e.target.parentElement.children[1].children[0].firstChild;
            let value = 200 - e.target.value.length;
            charactersLeft.innerText = value;
          })
          div.addEventListener('keydown', (e)=>{
            if(e.target.nodeName === 'TEXTAREA' && e.target.value.length === 200){
              e.preventDefault();
            }
          })

          // Load all comments 
          loadComments(email, postId);

          // Comment Submit button event listener
          document.querySelector('#reply-button').addEventListener('click', (e)=>{
            const text = e.target.parentElement.parentElement.parentElement.firstChild.nextSibling.value;
            if(text.length === 0){
              alert('No text found in the reply submitted');
            }
            else{
              // console.log(email, postId);
              fetch(`/makeComment/email=${email}&postId=${postId}&userId=${userId}`, {
                method: 'POST', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify({
                  comment: text
                })
              })
              .then((response)=> response.json())
              .then((res)=>{
                if(res.commentAdded){
                  while(userCommentsSection.firstChild != null){
                    userCommentsSection.firstChild.remove();
                  }
                  loadComments(email, postId);
                }
              })
            }
          })
        }
      }
    })
  })
}

function loadComments(email, postId){
  // console.log(email, postId);
  fetch(`/getComments/email=${email}&postId=${postId}`)
  .then((response)=> response.json())
  .then((comments)=>{
    if(comments.length > 0){
      comments.forEach((comment)=>{
        fetch(`/${comment.username}/userImage`)
        .then(imgResponse => imgResponse.json())
        .then((image)=>{
          const div = document.createElement('div');
          div.className = 'my-3 bg-zinc-900 p-3 rounded';
          div.innerHTML = `
              <img src="data:${image.type};base64, ${image.data}" class="inline-block h-6 w-6 rounded-full mr-2 mb-3"><p class="text-xs mb-1 inline-block"><span class="hover:underline cursor-pointer text-violet-400 relative bottom-1">${comment.username}</span></p>
              <p class="text-sm indent-1"> ${comment.comment} </p>
          `;
          document.querySelector('#user-comments').appendChild(div);
        })
      })
    }
  })
}

function loadProfilePhoto(){
  fetch(`/${userId}/profilePhoto`)
  .then(response => response.json())
  .then((profilePhoto)=>{
    const userPicture = document.querySelector('#user-picture img');
    
    userPicture.src = `data:${profilePhoto.image.type};base64, ${profilePhoto.image.data}`;
  })
}