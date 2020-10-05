var gallery_act_id;

$(function(){

    galleryMsgBtnAction();
    image_hover_func();
    realTimeMsgTransfer();

 });


var loadGalleryFeed = function(act_id){
    //based on the activity id, load the image, group member names, and set of comment made by the members
    gallery_act_id = act_id;
    //steps to be implement
    //1. make an ajax call to get the image, group member names, and the comments
    //2. display them
     $.ajax({
        type:'GET',
        url:'http://'+ host_url +'/getIndividualImages/'+act_id, //same url as this already gives us the images from all the group members
        async: false, //wait for ajax call to finish
        success: function(data){
            //display an image randomly -- choose the first image as random
            imageInfo = JSON.parse(data.imageData)[0];
            console.log(imageInfo);
            //set the src
            $('.section img').attr('src','/media/'+imageInfo.fields['image']);
            //set the primary key
            $('input[name="image-db-pk"]').val(imageInfo.pk);
        }
     });

    var imagePk = $('input[name="image-db-pk"]').val();
//   //get the comments and update discussion feed with each image
     $.ajax({
         type: 'GET',
         url: '/updateImageFeed/'+imagePk, //get image comment using primary id
         success: function(response){
                //console.log(response)
                //var logged_in_user = response.username //passed from views.py - updateFeed
                msg_data = response.success
                var obj = jQuery.parseJSON(msg_data);
                //console.log(obj)
                $.each(obj, function(key, value){

                    buildGalleryFeedwithMsgs(value.fields['posted_by'][0], value.fields['content']);

                });

                var element = document.getElementById("image-feed");
                element.scrollTop = element.scrollHeight;

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
            buildGalleryFeedwithMsgs(data.name, data.message);
        }

    });

}// end of realTimeMsgTransfer method

var buildGalleryFeedwithMsgs = function(name, message){
        //  add in the individual image discussion thread itself
        var li = $("<li/>").appendTo("#image-feed");

        if(logged_in == name){
               li.addClass('message self');
        }else{
               li.addClass('message');
        }

        var div = $("<div/>").appendTo(li);
        div.addClass('user-image');
        var span = $('<span/>', {text: name}).appendTo(div);
        var p = $('<p/>', {text: message}).appendTo(li);
        var div_msg = $("<div/>").appendTo(li);
        div_msg.addClass('msg-timestamp');
        var span_timestap = $('<span/>', {text: "add timestamp"}).appendTo(div_msg);

        $('#image-feed').scrollTop($('#image-feed')[0].scrollHeight);

}

var image_hover_func = function(){

     //hovering effect-start
    $('.section div').hover(function(){
    $(this).css({ "-webkit-transform": "scale(1.2)",
           "transform":"scale(1.2) " ,
           "transition":"transform 0.25s ease"
           });
    }, function(){ //remove hovering effect
        $(this).css({ "-webkit-transform": "scale(1)",
               "transform":"scale(1)" ,
               "transition":"transform 0.25s ease"});
    });
    //hovering effect-end

}// end of image_hover_func method


