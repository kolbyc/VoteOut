function createSideBar(access_token) {

  $.ajax({
    url: 'https://api.spotify.com/v1/me/playlists',
    headers: {
      'Authorization': 'Bearer ' + access_token
    },
    success: function(playlistResponse) {

      sidebarPlaceholder.innerHTML = sidebarTemplate(playlistResponse);

      $("button").click(function() {
        let listId = this.id;
        let listOwner = this.value;
        let loader = "";

        loader += "<div id=\"loader\" class=\"loader\"></div>";
        welcomePlaceholder.innerHTML = loader;

        $.ajax({
          url: 'https://api.spotify.com/v1/users/' + listOwner + '/playlists/' + listId,
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          success: function(response) {

            songsPlaceholder.innerHTML = songsTemplate(response);

            loadSongs(access_token, listId, response);
          }
        });
      });
    }
});
}
