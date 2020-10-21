logged_in = ''

$( function() {
    getLoggedUserName();
    //getStudentChar();

});



var getLoggedUserName = function(){

    //get the logged in user
    $.ajax({
        type:'GET',
        url:'http://'+ host_url +'/getUsername/',
        async: false, //wait for ajax call to finish, else logged_in is null in the following if condition
        success: function(e){
            logged_in  = e.name
            //console.log('logged in username (inside) :: ', logged_in)
        }
    });

}

var getStudentChar = function(){
    //get student characteristics from the database and save it into local machine
    $.ajax({
        type:'GET',
        url:'http://'+ host_url +'/getCharacteristic/',
        async: false, //wait for ajax call to finish, else logged_in is null in the following if condition
        success: function(data){

            localStorage.setItem("charac", JSON.stringify(data.info));

//            if(localStorage.getItem("charac")){
//                var charac = JSON.parse(localStorage.getItem("charac"));
//                console.log(charac['msc']);
//            }else{
//                console.log("characteristic not stored");
//            }

        }
    });

}