const postsSection = document.querySelector('#all-user-posts');

getAllPosts();

function getAllPosts(){
    fetch(`${location.href}/getAllPosts`)
    .then((response)=>response.json())
    .then((result)=>{
        result.forEach((post)=>{
            postsSection.innerHTML += `
                <div class="card p-3 mt-5 ml-4">
                    <div class="flex flex-row justify-end">
                        <button class="delete-post" value="${post._id}"><i class="fas fa-trash-alt hover:text-violet-500 ml-5 hover:cursor-pointer"></i></button>
                    </div>
                    <p class="post-title">${post.postTitle}</p>
                    <p class="post-body mt-2">${post.postBody}</p>
                    <ul class="flex flex-row mt-2 text-base">
                    <li class="mr-3 hover:text-violet-400 cursor-pointer"><i class="fas fa-heart"></i><span class="ml-1">${post.likes}</span</li>
                    <li class="hover:text-violet-400 cursor-pointer"><i class="far fa-comment-alt"></i><span class="ml-1">${post.comments.length}</span></li>
                    </ul>
                </div>
            `;
        })
        
        const deletePost = document.getElementsByClassName('delete-post');
        console.log(deletePost)
        Array.from(deletePost).forEach((button)=>{
            // Adding event listener to delete button
            button.addEventListener('click', (e)=>{
              // Making delete Post request
              fetch(`${location.href}/deletePost`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify({id: e.target.parentElement.value}) 
              })
              .then((response)=> response.json())
              .then((result)=> {
                if(result.postDeleted === true){
                  e.target.parentElement.parentElement.parentElement.remove();
                }
              })
            })
        })
    })
}