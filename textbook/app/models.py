from django.db import models
from django.conf import settings
import jsonfield

# Create your models here.

# saves students personality
class studentCharacteristicModel (models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    has_msc = models.BooleanField(default=False)
    has_hsc = models.BooleanField(default=False)
    has_fam = models.BooleanField(default=False)
    has_con = models.BooleanField(default=False)


# saves the image
class imageModel(models.Model):

    gallery_id = models.IntegerField()
    group_id = models.IntegerField()
    posted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    posted_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='images')

    class Meta:
        unique_together = (('posted_by', 'id'),)

    #https://docs.djangoproject.com/en/2.0/topics/serialization/
    #https://stackoverflow.com/questions/28591176/serializing-django-model-and-including-further-information-for-foreignkeyfield
    def natural_key(self):
        #return (self.posted_by.username)
        return (self.id)

# saves comment from the digital gallery discussion
class imageComment(models.Model):
    content = models.CharField(max_length=400)
    posted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    posted_at = models.DateTimeField(auto_now_add=True)
    imageId = models.ForeignKey(imageModel, on_delete=models.CASCADE)
    activityID = models.IntegerField(null=True)

    def natural_key(self):
        return (self.posted_by.username)

# saves comment from the individual commenting section
class individualMsgComment(models.Model):
    activityID = models.IntegerField(null=True)
    imageId = models.ForeignKey(imageModel, on_delete=models.CASCADE)
    content = models.CharField(max_length=400)
    posted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    posted_at = models.DateTimeField(auto_now_add=True)

    def natural_key(self):
        return (self.posted_by.username)

class KAPostModel(models.Model):
    posted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title =  models.CharField(max_length=100)
    textareaID = models.CharField(max_length=20)
    content = models.CharField(max_length=400)
    posted_at = models.DateTimeField(auto_now_add=True)

    def natural_key(self):
        return (self.posted_by.username)

# activity feed message
# rename the following method for clarification
class Message(models.Model):
    content = models.CharField(max_length=400)
    activity_id = models.IntegerField(null=True)
    posted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    posted_at = models.DateTimeField(auto_now_add=True)

    def natural_key(self):
        return (self.posted_by.username)

class badgeInfo(models.Model):
    charac = models.CharField(max_length=20)
    value =  models.CharField(max_length=20)
    index = models.IntegerField(null=True)
    badgeName = models.CharField(max_length=20)
    platform = models.CharField(max_length=20)
    prompt = models.CharField(max_length=500)
    sentence_opener = models.CharField(max_length=500);

class badgeModel(models.Model):
    userid = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    message = models.CharField(max_length=400)
    badgeType = models.CharField(max_length=400)
    platform = models.CharField(max_length=10)

    def natural_key(self):
        return (self.userid.username)


class brainstormNote(models.Model):
    brainstormID = models.IntegerField(null=True)
    ideaText = models.CharField(max_length=400)
    color = models.CharField(max_length=20)
    position_top = models.CharField(max_length=20)
    position_left = models.CharField(max_length=20)
    posted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def natural_key(self):
        return (self.posted_by.username)

class tableChartData(models.Model):
    posted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    table_id = models.IntegerField(null=True)
    plot_type = models.CharField(max_length=20) #enumeration
    plot_data = jsonfield.JSONField() #https://stackoverflow.com/questions/37007109/django-1-9-jsonfield-in-models

class userQuesAnswerTable(models.Model):
    questionIDbyPage = models.IntegerField(null=True)
    answer = jsonfield.JSONField()
    posted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    posted_at = models.DateTimeField(auto_now_add=True)

#temp solution for pilot-1 -- start
class groupInfo(models.Model):
    activityID = models.IntegerField(null=True)
    group = models.IntegerField(null=True)
    users = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return '%s %s' % (self.activityID, self.group)
#temp solution for pilot-1 -- end


class userLogTable(models.Model):
    username = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    action = models.CharField(max_length=20)
    type = models.CharField(max_length=200)
    input = models.CharField(max_length=200)
    pagenumber = models.IntegerField(null=True)
    posted_at = models.DateTimeField(auto_now_add=True)
