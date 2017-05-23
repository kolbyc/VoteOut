function loadSongs(access_token, listId, response, profileId) {

  let allSongs = "{ \"songs\" : [ ";
  let songArtist = "";
  let j;
  let limit = 100;

  getSongs(listId, 0, 0);

  function getSongs(id, offset, readSongs) {
    let buttonClass = '';

    $.ajax({
      url: 'https://api.spotify.com/v1/users/' + response.owner.id + '/playlists/' + id + '/tracks?offset=' + offset,
      headers: {
        'Authorization': 'Bearer ' + access_token
      },
      success: function(songResponse) {

        if((songResponse.total-readSongs) < limit){
          limit = songResponse.total-readSongs;
        }

        for(j=0; j < limit; j++) {
          (function(j) {
            $.ajax({
                type: "GET",
                url: 'http://localhost:8888/api/' + id,
                data: {
                  playlistId: id,
                  songId: songResponse.items[j].track.id,
                  userId: profileId
                },
                success: function(response) {
                  console.log(response.users.vote);
                  if(response.users.vote === 1) {
                    buttonClass = "upvoteEnabled";
                  }
                  else if(response.users.vote === -1) {
                    buttonClass = "downvoteEnabled"
                  }
                  else {
                    buttonClass = "";
                  }
                  //console.log(j);
                  songName = songResponse.items[j].track.name;
                  songArtist = songResponse.items[j].track.artists[0].name;

                  readSongs++;

                  if(readSongs === songResponse.total) {

                    if(songName.includes("\"")) {
                      songName = songName.replace(/"/g, "\\\"");
                    }

                    allSongs += "{ \"name\": \"" + songName + "\", \"artist\": \"" + songArtist + "\", \"ups\": \"" + response.ups
                                    + "\", \"downs\": \"" + response.downs + "\", \"id\": \"" + response._id
                                    + "\", \"class\": \"" + buttonClass + "\"} ]} ";
                    let songs = JSON.parse(allSongs);

                    songsPlaceholder.innerHTML = songsTemplate(songs);
                    $("button").click(function() {
                      $(this).blur();
                      let mongoId = this.id.slice(0, -1);
                      let vote;
                      console.log(mongoId);
                      //console.log(this.id[this.id.length-1]);
                      if(this.id[this.id.length-1] === 'u') {
                        if(response.users.vote === 1) {
                          vote = 0;
                          document.getElementById(this.id).classList.remove('upvoteEnabled');
                        }
                        else {
                          vote = 1;
                          console.log("HERE");
                          document.getElementById(this.id).classList.add('upvoteEnabled');
                        }
                      }
                      if(this.id[this.id.length-1] === 'd') {
                        if(response.users.vote === -1) {
                          vote = 0;
                          document.getElementById(this.id).classList.remove('downvoteEnabled');
                        }
                        else {
                          vote = -1;
                          document.getElementById(this.id).classList.add('downvoteEnabled');
                        }
                      }
                      $.ajax({
                          type: "POST",
                          url: 'http://localhost:8888/api/' + this.id,
                          data: {
                            playlistId: this.id,
                            songId: songResponse.items[j].track.id,
                            userId: profileId,
                            mongoId: mongoId,
                            vote: vote
                          },
                          success: function(postResponse) {
                            console.log(postResponse);
                          }
                      });
                    });
                  }
                  else {
                    if(songName.includes("\"")) {
                      songName = songName.replace(/"/g, "\\\"");
                    }
                    allSongs += "{ \"name\": \"" + songName + "\", \"artist\": \"" + songArtist + "\", \"ups\": \"" + response.ups
                                    + "\", \"downs\": \"" + response.downs + "\", \"id\": \"" + response._id
                                    + "\", \"class\": \"" + buttonClass + "\"}, ";
                  }

                  if(j === 99){
                    getSongs(id, readSongs, readSongs);
                  }
              }
            });
          })(j);
        }
      }
    });
  }
}
