window.onload = ()=>{
    const url = location.href.split('/')
          materialsPage = document.querySelector('#materials-page-link'),
          eventsPage = document.querySelector('#events-page-link'),
          homePage = document.querySelector('#home-page-link'),
          logOutButton = document.querySelector('#logout-button'), 
          userPostsButton = document.querySelector('#user-posts-button');

    let linkPagesurl = ''; 
    for(let i = 0; i < url.length; i++){
        if(url[i] === 'home'){
            break;
        }
        else{
            linkPagesurl += url[i] + '/'
        }
    }
    linkPagesurl += 'home';

    materialsPage.setAttribute('href', linkPagesurl + '/materials');
    eventsPage.setAttribute('href', linkPagesurl + '/events');
    homePage.setAttribute('href', linkPagesurl);
    userPostsButton.setAttribute('href', `${linkPagesurl}/posts`);
    logOutButton.setAttribute('href', `${linkPagesurl}/logout`);
  }