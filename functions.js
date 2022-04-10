exports.getUsername = function(userEmail){
    let username = '';
    for(let i = 0;  i < userEmail.length; i++){
        if(userEmail[i] === '@'){
        break;
        }
        else if(userEmail[i] === '.'){
        username += '-';
        }
        else{
        username += userEmail[i];
        }
    }
    return username;
}

exports.getEmailId = function(username){
    let userEmail = '';
    for(let i = 0; i < username.length; i++){
        if(username[i] === '-'){
            userEmail += '.'
        }
        else{
            userEmail += username[i];
        }
    }
    userEmail += '@vitbhopal.ac.in';
    return userEmail;
}

exports.isHobbyPresent = function(hobby, hobbiesDB){
    let result = false;
    for(let i = 0; i < hobbiesDB.length; i++){
        if(hobby.toLowerCase() === hobbiesDB[i].hobby.toLowerCase()){
          return true;
        }
      }
      return result; 
}

exports.isSkillPresent = function(skill, skillsDB){
    let result = false; 
    for(let i = 0; i < skillsDB.length; i++){
        if(skill.toLowerCase() === skillsDB[i].skill.toLowerCase()){
          return true;
        }
      }
      return result; 
}