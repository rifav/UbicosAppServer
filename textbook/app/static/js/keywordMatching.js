var keyword_relevance = "positive,negative,circle,circumference,diameter,rate of change,proportional,proportional relationship,function,linear,linear function,proportional function,linear function,non-linear function";
var keyword_social = "thanks,thank you,thankyou,love it,good job,great job,great";

var keywords_obj = new Object();
    keywords_obj.explanation="this is because,cause,would be,but,since,for example,an example,because";
    keywords_obj.feedback = "answer is wrong,correct,incorrect,correct answer,incorrect answer,right answer,wrong answer,didnt understand,did not understand,i understand";
    keywords_obj.suggestion = "i think,should,could be,try,next time try";
    keywords_obj.ques= "how,what,where,why,can you,can,did,do,does";
    keywords_obj.reflection="i agree,i disagree,confused";
    keywords_obj.cocon="based on your idea,compare your answer to my answer,you did,like your,you did,you have done,another way to do";

var badge_dict = {'suggestion': 'Suggestion', 'social' : 'Good Citizen', 'relevance' : 'Relevant Post', 'reflection' : 'Good Communication',
'ques' : 'Question', 'feedback' : 'Feedback', 'explanation' : 'Good Explanation', 'cocon': 'Creative Collaboration'};

var keywords_json = JSON.stringify(keywords_obj);

 $('.prompt-close-card').on('touch click', function(){
        $(this).closest('.prompt-card').removeClass('active');
    });


function auxMethod_displayBadgePrompt(platform,index,message){

        if(platform === 'ka'){
            $('.prompt-card.prompt-ka').addClass('active');
            $('#prompt-badge-img-ka').attr('src','/static/pics/'+index+'.png');
            $('p#prompt-p-ka').text("You earned a " + badge_dict[index] + " badge!");
        }else if(platform === 'gallery'){
            $('.prompt-card.prompt').addClass('active');
            $('#prompt-badge-img').attr('src','/static/pics/'+index+'.png');
            $('p#prompt-p').text("You earned a " + badge_dict[index] + " badge!");
        }else{
            $('.prompt-card.prompt-gm').addClass('active');
            $('#prompt-badge-img-gm').attr('src','/static/pics/'+index+'.png');
            $('p#prompt-p-gm').text("You earned a " + badge_dict[index] + " badge!");
        }

        //insert the badge in the database
         insertBadgeIngoinDB(message, index, platform);
         displayAllBadges();
         //getBadgesFromDB();

         enterLogIntoDatabase('badge display prompt', 'badge:'+index , message, current_pagenumber);

}

function showPrompt(message, platform){

    //get the length of the message
    var msg = message.split(" ");
    var lengthOfMsg = msg.length;

    //check the length condition first
    if(lengthOfMsg == 0) return false;

    if(platform === 'ka'){
        if(lengthOfMsg < 20) return false;//word based
    }else{
        if(lengthOfMsg < 7) return false;//word based
    }

    message = message.toLowerCase();

    //check for relevance next
    var regexExactMatchRelevance = new RegExp('\\b' + keyword_relevance.split(",").join("|")+ '\\b');

    //if it matches, check further, else check for social
    if(regexExactMatchRelevance.test(message)) {
        //since true, check whether the student got relevance badge before
        //will return -1 if not present in the badges array
        if(jQuery.inArray("relevance", badges) == -1){
            //no, give the relevance badge and return
            auxMethod_displayBadgePrompt(platform,"relevance",message);
            return false; //one badge at a time.
        }else{
            //yes, then check for other keywords
             //https://www.tjvantoll.com/2013/03/14/better-ways-of-comparing-a-javascript-string-to-multiple-values/
            //loop through key words other than relevance
            $.each(keywords_obj, function(index, keywords) {

                var regexExactMatch = new RegExp('\\b' + keywords.split(",").join("|")+ '\\b');

                if(regexExactMatch.test(message)){

                    //if question check if the question word is at the beginning of the sentence
                    if(index === 'ques' && regexExactMatch.exec(message).index != 0) return false; //the question keyword is not the beginning so no badge

                    //if matches with a badge already received before, return
                    //https://stackoverflow.com/questions/18867599/jquery-inarray-how-to-use-it-right
                    if(jQuery.inArray(index, badges) > -1) return false;

                    //display badge
                    auxMethod_displayBadgePrompt(platform,index,message);
                    return false; //one badge at a time.

                }
            });
        }
    }else{
        //check for social
        var regexExactMatchSocial = new RegExp('\\b' + keyword_social.split(",").join("|")+ '\\b');

        if(regexExactMatchSocial.test(message)){
            //check whether got social before?
            if(jQuery.inArray("social", badges) == -1){
            //give the relevance badge and return
            auxMethod_displayBadgePrompt(platform,"social",message);
            return false; //one badge at a time.
        }


     }
    }

}

var insertBadgeIngoinDB = function(message, badgeType, platform){

    $.ajax({
            type:'POST',
            url:'http://'+ host_url +'/insertBadges/',
            async: false,
            data:{
                'message': message,
                'badgeType': badgeType,
                'platform': platform

            },
            success: function(e){

            }
        })
}
