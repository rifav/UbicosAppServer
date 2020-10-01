var host_url = window.location.host

$(function(){

});

//call this function when individual comment is loaded for a particular number of activity
var loadIndividualFeed = function(act_id) {
//    //this method will load images from the current users' group members uploaded photo
//    //the messages associated with each photo is only visible to the current student

//      steps to be implemented
//      1. get the current users group-mate info -- done in the server side
//      2. make a query to retrieve the images and send back to the client side -- done
//      3. display the images -- done
//      4. setup commenting and display [only visible to the current user] --TODO
        $.ajax({
            type:'GET',
            url:'http://'+ host_url +'/getIndividualImages/'+act_id,
            async: false, //wait for ajax call to finish
            success: function(data){
                data = JSON.parse(data.imageData);
                //console.log(data)
                //console.log(data[0].fields['gallery_id']);

                //loop through the data to access each image
                $.each(data, function(key, value){
                    image_src = value.fields['image'];
                    image_posted_by = value.fields['posted_by'];
                    var id=key+1;
                    $('#slide-'+id).find('img').attr('src','/media/'+image_src);
                    //TODO: display who posted the image

                    //hovering the image
                    $('#slide-'+id+' img').hover(function(){
                        $(this).css({ "-webkit-transform": "scale(1.2)",
                               "transform":"scale(1.2) " ,
                               "transition":"transform 0.25s ease"
                               });
                        }, function(){ //remove hovering effect
                            $(this).css({ "-webkit-transform": "scale(1)",
                                   "transform":"scale(1)" ,
                                   "transition":"transform 0.25s ease"});
                        });

                      //  TODO  display the comment for each image part:


                });

            }
        })

} //end of loadIndividualFeed method


//        //  add in the thread itself
//        var li = $("<li/>").appendTo("#activity-feed");
//
//        console.log ('message posted by', data.name)
//        console.log('logged in username (outside):: ', logged_in)
//        if(logged_in == data.name){
//               li.addClass('message self');
//        }else{
//               li.addClass('message');
//        }
//
//        var div = $("<div/>").appendTo(li);
//        div.addClass('user-image');
//
//        var span = $('<span/>', {
//            text: data.name}).appendTo(div);
//
//        var p = $('<p/>', {
//                text: data.message}).appendTo(li);
//
//         var div_msg = $("<div/>").appendTo(li);
//
//         div_msg.addClass('msg-timestamp');
//
//         var span_timestap = $('<span/>', {
//                text: "add_timestamp"}).appendTo(div_msg);
//
//
//        // Scroll view
//        $('#dynamic-content').animate({ scrollTop: $('#activity-feed').height() }, 400);
//
//    });

//
//    //add event listener to the chat button click
//    $("#ind-msg-send-btn").off().on('click', function(e){
//        e.preventDefault();
//        //postIndMessage();
//        alert($("input[name='ind-msg-text']").val());
//    });
//    $('#msg-text').off().on('keypress', function (e) {
//        if (e.which == 13) {
//          postMessage();
//          return false;
//        }
//      });
//
//}

function postIndMessage(){

    //get the currently typed message
    var inputEl = $("input[name='ind-msg-text']");
    var message = inputEl.val();
    if(!message){
        //empty;
            //TODO: display a message for students
            //entry into user log -- TODO fix the language
            enterLogIntoDatabase('input button click', 'image-feed empty message input' , message, current_pagenumber)
            return;
        }

    //get the user name who posted
    var user_name = $("input[name='username']").val()


    enterLogIntoDatabase('click', 'activity-feed message input' , message, current_pagenumber)
//    //triggers the event in views.py
//    $.post({
//        url: '/ajax/chat/',
//        data: {
//        'username': user_name,
//        'message': message
//        },
//        success: function (data) {
//            //empty the message pane
//            inputEl.val('');
//            //inputEl.prop('disabled', false);
//        },
//        error: function(){
//            //inputEl.prop('disabled', false);
//        }
//    });



}

function loadFeed(type){
    //alert("calling loadFeed method");
    //clear existing html so the new ones dont get appended
    $('#activity-feed').empty();

    $.ajax({

            type:'GET',
            url:'http://'+ host_url +'/updateFeed/'+type,

            success: function(response){

                var logged_in_user = response.username //passed from views.py - updateFeed

                msg_data = response.success
                var obj = jQuery.parseJSON(msg_data);

                //console.log(obj)

                $.each(obj, function(key, value){

                    //  add in the thread itself
                    var li = $("<li/>").appendTo("#activity-feed");
                    if(value.fields['posted_by'][0] == logged_in_user){
                        li.addClass('message self');
                    }else{
                        li.addClass('message');
                    }

                    var div = $("<div/>").appendTo(li);
                    div.addClass('user-image');

                    var span = $('<span/>', {
                        text: value.fields['posted_by'][0]}).appendTo(div);

                    var p = $('<p/>', {
                            text: value.fields['content']}).appendTo(li);


                    var div_msg = $("<div/>").appendTo(li);
                    div_msg.addClass('msg-timestamp');

                    var span_timestap = $('<span/>', {
                            text: "add timestamp"}).appendTo(div_msg);

                });

                // Scroll page to bottom
                $('#dynamic-content').animate({ scrollTop: $('#activity-feed').height() }, 400);
            }
        });
}

