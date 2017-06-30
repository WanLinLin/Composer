$(document).ready(function() {
  $('form').submit(function(e) {
    var url = '/lyric';

    $.ajax({
      type: 'post',
      url: url,
      data: $('form').serialize(),
      success: function(data) {
        var words = data.words;
        var cardList = $('#word-list');

        cardList.empty();

        for (var i = 0; i < words.length; i++) {
          var word = words[i];
          cardList.append('<li class="list-group-item">' + word + '</li>\n');
        }
      }
    });

    e.preventDefault(); // avoid to execute the actual submit of the form.
  });
});