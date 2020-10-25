var gallery_act_id;
var global_badgeList;

$(function(){

    galleryMsgBtnAction();
    image_hover_func();
    realTimeMsgTransfer();

 });

//this method is used to load digital discussion gallery feed
//called from digTextBook.js
var loadGalleryFeed = function(act_id){
    //based on the activity id, load the image, group member names, and set of comment made by the members
    gallery_act_id = act_id;
    //steps implemented
    //1. make an ajax call to get the image
    //2. display them
     $.ajax({
        type:'GET',
        url:'http://'+ host_url +'/getIndividualImages/'+act_id, //same url as this already gives us the images from all the group members
        async: false, //wait for ajax call to finish
        success: function(data){
            //TODO: display image outside the group
            //display an image randomly -- choose the first image as random
            imageInfo = JSON.parse(data.imageData)[0];
            //console.log(imageInfo);
            //set the src
            $('.section img').attr('src','/media/'+imageInfo.fields['image']);
            //set the primary key
            $('input[name="image-db-pk"]').val(imageInfo.pk);
        }
     });

    //get the image primary key which is set above
    var imagePk = $('input[name="image-db-pk"]').val();

    //3. make an ajax call to get the comments and update discussion feed with each image [TODO: get the group member info as well]
     $.ajax({
         type: 'GET',
         url: '/updateImageFeed/'+imagePk, //get image comment using primary id
         success: function(response){
                //console.log(response)

                msg_data = response.success;
                var obj = jQuery.parseJSON(msg_data);
                //console.log(obj)
                //clear the image feed so it doesn't add to the previously loaded feed
                $('#image-feed').empty();
                //iterate through the response data to display the comments in the interface
                $.each(obj, function(key, value){
                    //this method is defined in individual_gallery.js
                    buildFeedwithMsgs(value.fields['content'], "#image-feed",value.fields['posted_by'][0]);
                });

                //scrollbar
                var element = document.getElementById("image-feed");
                element.scrollTop = element.scrollHeight;

             }
     });


    //todo call the computational model to see whether the student will participate or not; display badge based on that
    //output from above: 1. ['msc','hsc','fam'] or 2. ['con','social']
     var badgeArray = [];
//     badgeArray.push('msc');
//     badgeArray.push('hsc');
//     badgeArray.push('fam');
     badgeArray.push('con1');
     badgeArray.push('con2');
     badgeArray.push('fam');
     //console.log(badgeArray)

     //https://stackoverflow.com/questions/18045867/post-jquery-array-to-django

     //1. make an ajax call and use that to get badge info for gallery
     $.ajax({
        url: '/getBadgeOptions',
        type: 'POST',
        async: false,
        data: {"username": logged_in, 'platform' : 'MB', "badges": JSON.stringify(badgeArray)}, //passing username so TA code can use the same API
        success: function (data) {
            //here data is a dict, where each key element is a list
            console.log('gallery.js', data.badgeList);
            //assigning it to a global variable, so we can access it outside this call and update promp/sentence opener as needed
            global_badgeList = data.badgeList;
            //call the method and update the badge-option-view
            badge_option_div_update(data.badgeList,"mb");
        }
    });


} //end of loadGalleryFeed method


var galleryMsgBtnAction = function(){

    //adding event listener to the chat button click
    $("#image-msg-send-btn").off().on('click', function(e){
        e.preventDefault();
        //alert("im clicked");
        postImageMessage();

    });

    //adding event lister for 'enter' button
    $('#image-msg-text').off().on('keypress', function (e) {
        if (e.which == 13) {

            postImageMessage();
            return false;
        }
      });

      //badge-option-div related button clicks -- start

      $('.badge-option-closebtn').off().on('click', function(e){
             $("#badge-option").css("display", "none");
      });

      $('.badgeRequest img').on('click', function(e){
            //if the badge-option div is visible do nothing, else toggle
            if($('#badge-option').is(":visible")){
                //alert("visible");
            }else{
                //alert("not visible");
                $("#badge-option").css("display", "block");
            }
      });

      $('.badge-option-display div').off().on('click', function(e){
        //set all background color to original
        $(this).siblings().css({backgroundColor: '#f4f4f4'});
        //set the selected background color to
        $(this).css({backgroundColor: '#d9d9d9'});
        var char = $(this).attr('data-char');
        console.log(char);
        var prompt;
        var sentence_opener;
        if(char === 'none'){
            prompt = "You can proceed without selecting any of the three options";
            sentence_opener = "";
        }else{
            prompt = global_badgeList[char][0]['prompt'];
            sentence_opener = global_badgeList[char][0]['sentence_opener'];
        }

        //set the prompt
        //console.log(global_badgeList[char][0]['prompt']);
        $('.badge-prompt-text p').text(''); //clear the p tag first
        $('.badge-prompt-text p').text(prompt);
        //set the sentence opener
        $('.badge-option-textarea textarea').text(''); //clear the p tag first
        $('.badge-option-textarea textarea').text(sentence_opener);


      });

        //copy button
      $('.badge-option-footer button').off().on('click', function(e){
            var badge_textarea_value = $('#badge-textarea-id').val();
            //console.log(badge_textarea_value);
            //set it to the message textbox
            $('#image-msg-text').val(badge_textarea_value);

      });

      //badge-option-div related button clicks -- end

} //end of galleryMsgBtnAction method

var postImageMessage = function () {

        //get the currently typed message
        var inputEl = $("#image-msg-text");
        var message = inputEl.val();

        if(!message){
            //entry into user log -- TODO fix the language
            enterLogIntoDatabase('input button click', 'image-feed empty message input' , message, current_pagenumber)
            return;
        }

        //console.log('user message :: '+message)
        //todo: add the keyword matching algo here and display badge based on the algorithm

        //get the user name who posted
        var user_name = $("input[name='username']").val()
        console.log(user_name);

        var imagePk = $("input[name='image-db-pk']").val();
        console.log('image pk :: ',imagePk)

        //posts student comment in database - can be extracted using image primary key.
        $.post({
            url: '/imageComment/',
            data: {
            'username': user_name,
            'message':  message,
            'imagePk': imagePk,
            'activityID': gallery_act_id,
            },
            success: function (data) {
                //empty the message pane
                $("input[name='image-msg-text']").val('');

            },
            error: function(data){
                //inputEl.prop('disabled', false);
            }
        });

}// end of postImageMessage method

var realTimeMsgTransfer = function(){

    //channel for individual image message
    var pusher_gallery = new Pusher('f6bea936b66e4ad47f97',{
        cluster: 'us2',
        encrypted: true
    });

    //subscribe to the channel you want to listen to
    var my_channel = pusher_gallery.subscribe('b_channel');

     my_channel.bind("bn_event", function (data) {

        //console.log(data);
        //console.log('(server)', data.imageid)
        //console.log('(local)', $("input[name='image-db-pk']").val())

        //if student commenting on one image is the same as the other user is viewing show the comment else don't show
        if(data.imageid == $("input[name='image-db-pk']").val()){
            //call to the method to post the message in the feed
            buildFeedwithMsgs(data.message, "#image-feed", data.name);

        }

    });

}// end of realTimeMsgTransfer method


//TODO: this hover changes the original position; fix it
var image_hover_func = function(){

     //hovering effect-start
    $('.section div').hover(function(){
    $(this).css({ "-webkit-transform": "scale(1.2)",
           "transform":"scale(1.2) " ,
           "transform-origin": "center",
           "transition":"transform 0.25s ease"
           });
    }, function(){ //remove hovering effect
        $(this).css({ "-webkit-transform": "scale(1)",
               "transform":"scale(1)" ,
               "transition":"transform 0.25s ease"});
    });
    //hovering effect-end

}// end of image_hover_func method

//this method updates the badge option div (images) based on the info retrieved from the database
//use in gallery.js
var badge_option_div_update = function(badgeList, platform){
    //TODO: change the dict to list of lists
    console.log("from the method", badgeList)
    i = 1;
    $.each(badgeList, function(key, element){
        //console.log(element[0]['badgeName']);
        //update the badge-option-display div elements with badgeNames but not the prompt
        $("div#"+platform+"-badge"+i+" span").text(element[0]['badgeName']);
        //update the data-char
        //https://stackoverflow.com/questions/51278220/how-to-set-data-attribute-with-jquery
        $("div#"+platform+"-badge"+i).attr('data-char',key);
        console.log($("div#"+platform+"-badge"+i).attr('data-char'));
        //increment the counter
        i = i + 1;
    });

    //console.log(badgeList['hsc'][0]['prompt'])

}
