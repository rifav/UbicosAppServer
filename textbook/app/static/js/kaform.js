$(function(){

    ka_badge_form_Btn();

 });

var load_ka_card = function() {

    //make an ajax call to get the badges
    $.ajax({
        url: '/getBadges',
        type: 'POST',
        async: false,
        data: {"username": logged_in, 'platform' : 'KA'}, //passing username so TA code can use the same API
        success: function (data) {
            //here data is a dict, where each key element is a list
            console.log('kaform.js', data.badgeList);
            //assigning it to a global variable, so we can access it outside this call and update promp/sentence opener as needed
            global_badgeList = data.badgeList;
            //call the method and update the badge-option-view
            badge_option_div_update(data.badgeList, "ka"); //defined in gallery.js
        }
    });

}

var ka_badge_form_Btn = function(){

    $('#ka-copy-button').off().on('click', function(event){

        var $temp = $("<input>");
        $("body").append($temp);
        text = $('.badge-option-textarea textarea').val();
        $temp.val(text).select();
        document.execCommand("copy");
        $temp.remove();

    });
 }

