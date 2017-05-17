function loadSongs(access_token, listId, response) {

  let allSongs = "";
  let songArtist = "";
  let j;
  let limit = 100;

  //allSongs += "<div class=\"playlistName\">";
  //allSongs += "<center class=\"playlistTitle\">" + response.name + "</center>";
  //allSongs += "<center><input class=\"playLink\" type=\"button\" onclick=\"window.open('" + response.external_urls.spotify +
  //              "')\" value=\"Open in Spotify\" /></center> </br></br>";
  //allSongs += "</div>";
  //allSongs += "<div class=\"main\" id=\"style-1\">";
  //allSongs += "<table>";

  getSongs(listId, 0, 0);

  function getSongs(id, offset, readSongs) {
    $.ajax({
      url: 'https://api.spotify.com/v1/users/' + response.owner.id + '/playlists/' + id + '/tracks?offset=' + offset,
      headers: {
        'Authorization': 'Bearer ' + access_token
      },
      success: function(songResponse) {

        //songsPlaceholder.innerHTML = songsTemplate(songResponse);

        if((songResponse.total-readSongs) < limit){
          limit = songResponse.total-readSongs;
        }

        for(j=0; j < limit; j++) {
          songName = songResponse.items[j].track.name;
          songArtist = songResponse.items[j].track.artists[0].name;
          //allSongs += "<tr><td class=\"upvote\">&nbsp;&nbsp;0</td> <td class=\"downvote\">0&nbsp;&nbsp;</td><td><h4>" + songName + "</h4><h5>" + songArtist + "</h5></td>";
          //allSongs += "<td><button type=\"button\" class=\"btn btn-default\"><span class=\"glyphicon glyphicon-thumbs-up\"></span></button>&nbsp;";
          //allSongs += "<button type=\"button\" class=\"btn btn-default\"><span class=\"glyphicon glyphicon-thumbs-down\"></span></button></td></tr>";
          if(j === 99){
            getSongs(id, readSongs+100, readSongs+100);
          }
        }
        readSongs += j;

        //console.log("SONGS READ: " + readSongs);

        if(readSongs === songResponse.total) {
          //allSongs += "</table></div>";
          welcomePlaceholder.innerHTML = allSongs;
        }
      }
    });
  }
}
