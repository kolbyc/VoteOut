function loadSongs(access_token, listId, response) {

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
          songName = songResponse.items[j].track.name;
          songArtist = songResponse.items[j].track.artists[0].name;

          readSongs++;

          if(readSongs === songResponse.total) {

            if(songName.includes("\"")) {
              songName = songName.replace(/"/g, "\\\"");
            }

            allSongs += "{ \"name\": \"" + songName + "\", \"artist\": \"" + songArtist + "\"} ]} ";
            let songs = JSON.parse(allSongs);
            songsPlaceholder.innerHTML = songsTemplate(songs);
          }
          else {
            if(songName.includes("\"")) {
              songName = songName.replace(/"/g, "\\\"");
            }
            allSongs += "{ \"name\": \"" + songName + "\", \"artist\": \"" + songArtist + "\"}, ";
          }

          if(j === 99){
            getSongs(id, readSongs+100, readSongs+100);
          }
        }
      }
    });
  }
}
