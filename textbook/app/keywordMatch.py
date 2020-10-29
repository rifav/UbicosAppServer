import string

#three ways these keywords are chosen/matched:
#1. common known phrases
#2. sentence openers
#3. previous data

#the following dict contains keywords from #1 and #2
#the keywords are the badgenames (so check with the excel sheet and be consistent, else error)
keywords_dict = \
    {'brainstorm': ['this is similar', 'think about a'],
     'question': ['how', 'what', 'where', 'why', 'can you', 'can', 'did', 'do', 'does'],
     'critique': ['what evidence'],
     'elaborate': ['we can combine', 'this is because', 'because', 'would be', 'but', 'since', 'for example',
                   'an example', 'cause'],
     'share': ['here is a clarification', 'let me clarify'],
     'challenge': ['are you sure', 'what if'],
     'feedback': ['i think', 'should', 'could', 'next time', ''],
     'addon': ['would like to add'],
     'summarize': ['to summarize', 'let me summarize', 'summarize', 'summarizing', 'summarized', 'in summary'],
     'answer': ['to answer', 'answering'],
     'reflect': ['i agree', 'i disagree'],
     'assess': ['is this the same as'],
     'participate': [''],
     'appreciate': ["thank you", "thanks", "good job", "great job", "great work"],
     'ecourage': ['']
     }

week1_relevance = [];

import re
#sentence_opener dict
class keywordMatch():
    def matchingMethod(self, message, selected_badge):

        #TODO: pre-process messages
        # remove punctuation
        # print(message.translate(str.maketrans('', '', string.punctuation)));

        if(selected_badge == 'question'):
            # todo use the rule-based classifier that I have
            # split messages based on sentence; and see if the
            # keywords are used in the beginning of the sentence
            print('question');
        if(selected_badge == 'participate'):
            #check for the length
            print()

        # for each keywords in the selected list, check if the keyword is present in the user message
        for elem in keywords_dict[selected_badge]:
            if elem in message.lower():
                print("for debug purpose")
                print('elem :: ', elem)
                print('message :: ', message)
                print("matched");
                return True;

        return False;




if __name__ == "__main__":
    #keywordMatch.matchingMethod(None, "Good job", "appreciate");
    keywordMatch.matchingMethod(None, "Yes because you have to have a formula?", "elaborate");