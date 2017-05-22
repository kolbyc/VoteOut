function loadSongs(access_token, listId, response, profileId) {

  let allSongs = "{ \"songs\" : [ ";
  let songArtist = "";
  let j;
  let limit = 100;

  getSongs(listId, 0, 0);

  function getSongs(id, offset, readSongs) {
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
                  songId: songResponse.items[j].track.id
                },
                success: function(response) {
                  //console.log(response);
                  //console.log(j);
                  songName = songResponse.items[j].track.name;
                  songArtist = songResponse.items[j].track.artists[0].name;

                  readSongs++;

                  if(readSongs === songResponse.total) {

                    if(songName.includes("\"")) {
                      songName = songName.replace(/"/g, "\\\"");
                    }

                    allSongs += "{ \"name\": \"" + songName + "\", \"artist\": \"" + songArtist + "\", \"ups\": \"" + response.ups
                                    + "\", \"downs\": \"" + response.downs + "\", \"id\": \"" + response._id + "\"} ]} ";
                    let songs = JSON.parse(allSongs);

                    songsPlaceholder.innerHTML = songsTemplate(songs);
                    $("button").click(function() {
                      $.ajax({
                          type: "POST",
                          url: 'http://localhost:8888/api/' + id,
                          data: {
                            playlistId: id,
                            songId: songResponse.items[j].track.id,
                            userId: profileId
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
                                    + "\", \"downs\": \"" + response.downs + "\", \"id\": \"" + response._id + "\"}, ";
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
