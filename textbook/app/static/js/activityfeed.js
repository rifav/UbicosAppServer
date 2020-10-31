var host_url = window.location.host

$(function(){

    updateActivityFeedRealtime();
})


function updateActivityFeedRealtime(){

    //this part of the code shows messages instantly when a message is posted.
    //initiate puhser with your application key
    var pusher = new Pusher('ea517de8755ddb1edd03',{
      cluster: 'us2',
      encrypted: true
    });

    //subscribe to the channel you want to listen to
    var my_channel = pusher.subscribe('a_channel');

    //wait for an event to be triggered in that channel - when
    my_channel.bind("an_event", function (data) {

        //  add in the thread itself
        //defined in utility.js
        buildFeedwithMsgs(data.message, "#activity-feed", data.name);

    });

    //add event listener to the chat button click
    $("#msg-send-btn").off().on('click', function(e){
        e.preventDefault();
        postMessage();
    });

    $('#msg-text').off().on('keypress', function (e) {
        if (e.which == 13) {
          postMessage();
          return false;
        }
      });

}

function postMessage(){

    //get the currently typed message
    var inputEl = $("input[name='msg-text']");
    var message = inputEl.val();
    if(!message){
        //empty;
            //TODO: display a message for students
            //entry into user log -- TODO fix the language
            enterLogIntoDatabase('input button click', 'image-feed empty message input' , message, global_current_pagenumber)
            return;
        }

    //get the user name who posted
    var user_name = $("input[name='username']").val()


    enterLogIntoDatabase('click', 'activity-feed message input' , message, global_current_pagenumber)
    //triggers the event in views.py
    $.post({
        url: '/ajax/chat/',
        data: {
        'username': user_name,
        'message': message,
        'activity_id': activity_id //global variable defined in digTextBook.js

        },
        success: function (data) {
            //empty the message pane
            inputEl.val('');
            //inputEl.prop('disabled', false);
        },
        error: function(){
            //inputEl.prop('disabled', false);
        }
    });

}

function loadFeed(id){

    //clear existing html so the new ones dont get appended
    $('#activity-feed').empty();

    //make an ajax call to load the existing conversation
    $.ajax({

            type:'GET',
            url:'http://'+ host_url +'/updateFeed/'+id,
            //add week id to get the correct messages

            success: function(response){

                //var logged_in_user = response.username //passed from views.py - updateFeed //why do we need it?

                msg_data = response.success
                var obj = jQuery.parseJSON(msg_data);

                //console.log(obj)

                $.each(obj, function(key, value){
                    //method defined in individual_gallery.js
                    var message = value.fields['content'];
                    var posted_by = value.fields['posted_by'][0];
                    buildFeedwithMsgs(message, "#activity-feed", posted_by);

                });
//
//                // Scroll page to bottom
//                $('#activity-feed').animate({ scrollTop: $('#activity-feed').height() }, 400);
            }
        });
}

