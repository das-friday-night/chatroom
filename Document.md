## GET: `/`
#### description: 
get the index page

#### Response:
status code | description 
----------- | -----------
200 | get index page successful
404 | index page not found
500 | other server error


## POST: `/auth/login`
#### description: 
user login, if login success a session will be generate for user

#### paramesters: 
name | description
---- | ----
username | user email
password | user password

#### Response:
status code | description 
----------- | -----------
200 | login success
401 | login failed


## GET: `/auth/logout`
#### description: 
user logout, user's session will also be destroyed

#### Response:
status code | description 
----------- | -----------
200 | log out success


## GET: `/v1/room/:userid`
#### description: 
a user want to find all the room existed so far and all the room that he has joined

#### paramesters: 
name | description
---- | ----
userid | essitially the user's email, to identify the targeting user

#### Response:
status code | description 
----------- | -----------
200 | get rooms information success
400 | failed to get user's room information due to request format error and other problems

#### Response object:
on success:
```
{
	allrooms: all_existing_rooms, 
	join_rooms: all_room_user_currently_joined
}
```
on failure:
```
null object
```


## POST: `/v1/room`
#### description: 
help a user join a room or leave a room. 
1. when join a room
	* if the `roomid` in request is null, server will create a room and then joins the user in this new room. 
	* based on `roomid`, server only joins user in that room if room existed. otherwise server will return 400 error
2. when leave a room
	* based on `roomid`, server only leave user out of the room if room existed. otherwise server will return 400 error
	* if this user is the last one leaving the room, room will be deleted after user's leave and a 'room deleted' message will respond to client.

#### paramesters: 
name | description
---- | ----
userid | essitially the user's email, to identify the targeting user
action | either `enter` or `leave`
roomid | specify which room that user want to enter or leave. If roomid is `null`, it means the user want to create a new room for himself.

#### Response:
status code | description 
----------- | -----------
200 | enter/leave room success
400 | failed to help user make the room action, it can occurs due to request format error, enter a non-exist room and other issues

#### Response object:
on success:
```
{
	roomid: the room id that user want to join or leave, if this is the last user leaving this room, a 'room deleted' will be returned.
}
```
on failure:
```
{
	roomid: null
}
```
or 
```
wrong request format
```
when the input object format is not expected


## GET: `/v1/logs/:roomid`
#### description: 
get all the conversations from a room identified by `roomid`

#### paramesters: 
name | description
---- | ----
roomid | the identification of a room, all roomids are unique

#### Response:
status code | description 
----------- | -----------
200 | get rooms conversation success
400 | failed to get conversation from a room due to invalid roomid or database internal error

#### Response object:
on success:
```
{
	logs: [conversation object {
      m: user message,
      u: userid,
      t: posting date,
    }]
}
```
on failure:
```
{
	logs: []
}
```


## GET: `/v1/stats`
#### description: 
get all stats logs about this chatroom application, such as number of rooms created, number of users registered, other logs information related to chat message as well as user's entering/leaving room.

#### Response:
status code | description 
----------- | -----------
200 | get rooms conversation success
500 | failed to get stats, due to database internal errors

#### Response object:
on success:
```
{
	room: number of rooms created,
    user: number of users registered,
	logs: [stats log object {
      m: user message,
      u: userid,
      t: posting date,
      act: action this user made
    }]
}
```
on failure:
```
a error page rendered on serverside using pug
```


## POST: `/v1/image`
#### description: 
upload a image to s3, the request object is first processed by multer, and results a request object with a new file object attached.

#### paramesters in multipart/form-data: 
name | description
---- | ----
key  | submit form key to the upload image
file | upload image

#### Response:
status code | description 
----------- | -----------
200 | upload image success
500 | error when parsing an invalid form 

#### Response object:
on success:
```
{
	url: upload image location on S3
}
```
on failure:
```
a error page rendered on serverside using pug
```