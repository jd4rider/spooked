if(window.localStorage.username == null){
    window.location.href = '/login.html';
}else{
    var username = window.localStorage.username;
}

$.ajax({
	url: "https://api.mlab.com/api/1/databases/darknessprevails/collections/darknessprevailssubmissions?s={'submitdate':-1}&apiKey=aDwl-yLfA68HFnJWjDsZmF8akGTu3lKJ",
	method: 'get',
	success: function(data){
		console.log(data[0]._id.$oid);
		$('#outerstorycont').html(
		`<div class="container" onclick='gotoread("`+data[0]._id.$oid+`")'>
			 <div class="story">
			<div class="entrytext">
					<p class="title">`+data[0].title+`</p>
					<p class="authordate"> By `+data[0].penname+` on `+fixdate(data[0].submitdate)+`<br>
`+data[0].category+` | `+(data[0].views).length+` View(s) </p>
			</div>
			<div class="votes"> <button id="upvote" class="upvote" type="image" onclick='upvote(event, "`+data[0]._id.$oid+`")'></button>
					<p class="votecount">`+data[0].votes+`</p>
				<button id="downvote" class="downvote" onclick='downvote(event, "`+data[0]._id.$oid+`")'></button> </div>
		<hr class="break"> </div>
	</div>`
		)
		for(i=1;i<data.length;i++){
			$('#outerstorycont').append(
			`<div class="container" onclick='gotoread("`+data[i]._id.$oid+`")'>
			 <div class="story">
			<div class="entrytext">
					<p class="title">`+data[i].title+`</p>
					<p class="authordate"> By `+data[i].penname+` on `+fixdate(data[i].submitdate)+`<br>
`+data[i].category+` | `+(data[i].views).length+` View(s) </p>
			</div>
			<div class="votes"> <button id="upvote" class="upvote" type="image"></button>
					<p class="votecount">`+data[i].votes+`</p>
				<button id="downvote" class="downvote"></button> </div>
		<hr class="break"> </div>
	</div>`
		)
		}
	},
    complete: function(){
        runupdatevotes();    
    }
})


function upvote(e, storyid){
    e.stopPropagation();
    console.log("Upvote");
    $.ajax({
        url: "https://api.mlab.com/api/1/databases/darknessprevails/collections/darknessprevailssubmissions/"+storyid+"?apiKey=aDwl-yLfA68HFnJWjDsZmF8akGTu3lKJ",
        method: 'get',
        success: function(data){
            console.log(data.votes);
            console.log(data.voters);
            var voters = data.voters;
            var votetype = data.votetype;
            console.log(votetype[voters.indexOf(username)])
            if(voters.indexOf(username) < 0 || votetype[voters.indexOf(username)] == 'D' || votetype[voters.indexOf(username)] == 'N'){
                if(voters.indexOf(username) < 0){
                    voters.push(username);
                } else if (votetype[voters.indexOf(username)] == 'D') {
                    votetype[voters.indexOf(username)] = 'N';
                } else {
                    votetype[voters.indexOf(username)] = 'U';
                }
                var votes = data.votes + 1;
                updatestoryvotes(votes, voters, votetype, storyid);
            }
        }
    })
}

function downvote(e, storyid){
    e.stopPropagation();
    console.log("Downvote");
    $.ajax({
        url: "https://api.mlab.com/api/1/databases/darknessprevails/collections/darknessprevailssubmissions/"+storyid+"?apiKey=aDwl-yLfA68HFnJWjDsZmF8akGTu3lKJ",
        method: 'get',
        success: function(data){
            console.log(data.votes);
            console.log(data.voters);
            var voters = data.voters;
            var votetype = data.votetype;
            console.log(votetype[voters.indexOf(username)])
            if(voters.indexOf(username) < 0 || votetype[voters.indexOf(username)] == 'U' || votetype[voters.indexOf(username)] == 'N'){
                if(voters.indexOf(username) < 0){
                    voters.push(username);
                } else if (votetype[voters.indexOf(username)] == 'U') {
                    votetype[voters.indexOf(username)] = 'N';
                } else {
                    votetype[voters.indexOf(username)] = 'D';
                }
                var votes = data.votes - 1;
                updatestoryvotes(votes, voters, votetype, storyid);
            }
        }
    })
}

function updatestoryvotes(votes, voters, votetype, storyID){
    $.ajax({
        url: "https://api.mlab.com/api/1/databases/darknessprevails/collections/darknessprevailssubmissions/"+storyID+"?apiKey=aDwl-yLfA68HFnJWjDsZmF8akGTu3lKJ",
        type: 'put',
        contentType: 'application/json',
        data: JSON.stringify({ "$set" : {"votes": votes, "voters": voters, "votetype": votetype}}),
        success: function(data) {
            //... do something with the data...
          console.log(data);
          $('.votecount').html(votes);
          if(votes == 0){ 
              $('.upvote').css('background-image', 'url(/images/feed/upvote_empty.png)');
              $('.downvote').css('background-image', 'url(/images/feed/downvote_empty.png)');
          } else if(votes < 0) {
              $('.upvote').css('background-image', 'url(/images/feed/upvote_empty.png)');
              $('.downvote').css('background-image', 'url(/images/feed/downvote_clicked.png)');
          } else if(votes > 0) {
              $('.upvote').css('background-image', 'url(/images/feed/upvote_clicked.png)');
              $('.downvote').css('background-image', 'url(/images/feed/downvote_empty.png)');
          }

        }
    }); 
}

function fixdate(datechange){
    var feeddate = new Date(datechange);
    feeddate = feeddate.toDateString();
    return feeddate.substr(4, feeddate.length-1);
}

function gotoread(storyId){
    window.location.href = '/read.html?id='+storyId;
}

function runupdatevotes(){
    console.log('hello');
    $('.votecount').each(function(index, value){
        val = $(this).html();
        console.log(val);
        if(val == 0){ 
            $(this).siblings('.upvote').css('background-image', 'url(/images/feed/upvote_empty.png)');
            $(this).siblings('.downvote').css('background-image', 'url(/images/feed/downvote_empty.png)');
        } else if(val < 0) {
            $(this).siblings('.upvote').css('background-image', 'url(/images/feed/upvote_empty.png)');
            $(this).siblings('.downvote').css('background-image', 'url(/images/feed/downvote_clicked.png)');
        } else if(val > 0) {
            $(this).siblings('.upvote').css('background-image', 'url(/images/feed/upvote_clicked.png)');
            $(this).siblings('.downvote').css('background-image', 'url(/images/feed/downvote_empty.png)');
        }
    })
}

$(document).ready(function(){
    runupdatevotes();
})

//https://dl.dropbox.com/s/bkmd8qhu038pmm3/feed.js