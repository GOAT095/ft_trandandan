from enum import Enum
import requests
import socketio
import random
import json
from faker import Faker


class ROOM_ACCESS_TYPE(str, Enum):
    PRIVATE = "private"
    PROTECTED = "protected"
    PUBLIC = "public"
    DIRECT_MESSAGE = "dm"

class Room:
    def __init__(self, data, **kwargs):
        self.name = data.get("name")
        self.owner = data.get("owner")
        self.type = ROOM_ACCESS_TYPE(data.get("type"))
        self.id = data.get("id")
        self.data = data

    def refresh(self):
        self.__init__(api.get_room(self.id))

    def __repr__(self):
        return f"<{self.name}: {self.type}>"



fake = Faker()

user_id = random.randint(int(1e5), int(1e7))

sio = socketio.Client()


def get_random_user_id() -> int:
    global user_id
    user_id += 1
    return user_id


def generate_api_token(
    url: str = "http://localhost:3000",
    data: dict = dict(id=0xFFAC, name="mock", email="mock@localhost.local"),
    new: bool = False,
) -> str:
    if new:
        return requests.get(
            f"{url}/auth/loginAs/{data['name']}", allow_redirects=False
        ).cookies.get("auth-cookie")
    return requests.post(f"{url}/user", data=data).text


class Api:
    session: requests.Session
    url: str

    def __init__(
        self, url: str = "http://localhost:3000", token: str = generate_api_token()
    ) -> None:
        self.url = url
        self.session = requests.Session()
        self.session.cookies.set("auth-cookie", token)

    def get_players(self) -> dict:
        return self.session.get(f"{self.url}/user").json()

    def get_player(self) -> dict:
        return self.session.get(f"{self.url}/user/me").json()

    def update_player_username(self, username: str, id: str) -> dict:
        return self.session.post(
            f"{self.url}/user/{id}/updatename", data=dict(name=username)
        ).json()

    def get_player_friends_requests(self) -> list:
        return self.session.get(f"{self.url}/friends/getfriendrequests").json()

    def get_player_friends(self) -> dict:
        return self.session.get(f"{self.url}/friends/friends").json()

    def send_friend_request(self, player_id: str) -> dict:
        return self.session.post(f"{self.url}/friends/sendRequest/{player_id}").json()

    def accept_friend_request(self, request_id: str) -> dict:
        return self.session.post(
            f"{self.url}/friends/acceptRequest/{request_id}"
        ).json()

    def delete_user(self, user_id: str) -> bool:
        return self.session.delete(f"{self.url}/user/{user_id}/delete").json()

    def block(self, user_id: str) -> dict:
        return self.session.post(f"{self.url}/user/block/{user_id}").json()

    def unblock(self, user_id: str) -> bool:
        return self.session.post(f"{self.url}/user/unblock/{user_id}").json()

    def new_room(
        self, name: str, owner: int, type: ROOM_ACCESS_TYPE, password: str = ""
    ) -> dict:
        return self.session.post(
            f"{self.url}/chat/room/",
            headers={"Content-Type": "application/json"},
            data=json.dumps(
                {
                    "name": name,
                    "owner": owner,
                    "type": type,
                }
            ),
        ).json()

    def new_protected_room(
        self, name: str, owner: int, type: ROOM_ACCESS_TYPE, password: str = ""
    ) -> dict:
        return self.session.post(
            f"{self.url}/chat/room/",
            headers={"Content-Type": "application/json"},
            data=json.dumps(
                {
                    "name": name,
                    "owner": owner,
                    "type": type,
                    "password": password
                }
            ),
        ).json()

    def update_room(self, room: 'Room', name: str, type: ROOM_ACCESS_TYPE) -> dict:
        return self.session.post(
            f"{self.url}/chat/room/{room.id}",
            headers={"Content-Type": "application/json"},
            data=json.dumps(
                {
                    "name": name,
                    "type": type,
                }
            )
        ).json()

    def update_room_password(self, room: 'Room', name: str, type: ROOM_ACCESS_TYPE, password: str) -> dict:
        return self.session.post(
            f"{self.url}/chat/room/{room.id}",
            headers={"Content-Type": "application/json"},
            data=json.dumps(
                {
                    "name": name,
                    "type": type,
                    "password": password
                }
            )
        ).json()


    def join_room(self, player: 'User', room: Room) -> dict:
        return self.session.post(
            f"{self.url}/chat/room/{room.id}/join",
            headers={"Content-Type": "application/json"},
            data=json.dumps(
                {
                    "playerId": player.user_id
                }
            )
            ).json()

    def join_protected_room(self, player: 'User', room: Room, password: str) -> dict:
        return self.session.post(
            f"{self.url}/chat/room/{room.id}/join",
            headers={"Content-Type": "application/json"},
            data=json.dumps(
                {
                    "playerId": player.user_id,
                    "password": password
                }
            )
            ).json()


    def leave_room(self, room: Room) -> dict:
        return self.session.post(f"{self.url}/chat/room/{room.id}/leave").json()

    def get_room(self, room_id: int) -> dict:
        return self.session.post(f"{self.url}/chat/room/{room_id}").json()

    def kick_player(self, user: "User", room: Room) -> dict:
        return self.session.post(
            f"{self.url}/chat/room/{room.id}/kick/{user.user_id}"
        ).json()

    def mute_player(self, user: "User", room: Room) -> dict:
        return self.session.post(
            f"{self.url}/chat/room/{room.id}/mute/{user.user_id}"
        ).json()

    def ban_player(self, user: "User", room: Room) -> dict:
        return self.session.post(
            f"{self.url}/chat/room/{room.id}/ban/{user.user_id}"
        ).json()

    def give_admin_to(self, user: "User", room: Room) -> dict:
        return self.session.post(
            f"{self.url}/chat/room/{room.id}/set-as-admin/{user.user_id}"
        ).json()

    def change_password_on_room(self, room: Room, new_password: str) -> dict:
        return self.session.post(
            f"{self.url}/chat/room/{room.id}/key",
            headers={"Content-Type": "application/json"},
            data=json.dumps({"password": new_password}),
        ).json()

    def disable_password_on_room(self, room: Room) -> dict:
        return self.session.post(f"{self.url}/chat/room/{room.id}/key/disable").json()


api = Api()



class User:
    """
    Args:
        # user_name: str = fake.user_name(),
        # user_id: int = get_random_user_id(),
        # email: str = fake.email(),

    Usage:
        foo = User() # creates a new user
        bar = User()
        foo.send_friend_request_to(bar)
        bar.accept_friend_request_from(foo)
    """

    # TODO: add ability to loginAs/:user_name
    def __init__(
        self,
        **kwargs
        # user_name: str = fake.user_name(),
        # user_id: int = get_random_user_id(),
        # email: str = fake.email(),
    ) -> None:
        """
        # user_name: str = fake.user_name(),
        # user_id: int = get_random_user_id(),
        # email: str = fake.email(),
        """
        self.user_name: str = kwargs.get("user_name", fake.user_name())
        self.user_id: int = kwargs.get("user_id", get_random_user_id())
        self.email: str = kwargs.get("email", fake.email())
        new = "user_name" in kwargs
        self.token = generate_api_token(
            data=dict(id=self.user_id, name=self.user_name, email=self.email),
            new=new,
        )
        if new:
            self.refresh()

    def send_friend_request_to(self, user: "User") -> None:
        api.session.cookies.clear()
        api.session.cookies.set("auth-cookie", self.token)
        api.send_friend_request(str(user.user_id))

    def accept_friend_request_from(self, user: "User") -> None:
        api.session.cookies.clear()
        api.session.cookies.set("auth-cookie", self.token)
        friend_requests = api.get_player_friends_requests()
        for friend_request in friend_requests:
            if friend_request["requestSender"]["id"] == user.user_id:
                api.accept_friend_request(friend_request["id"])

    def remove(self) -> None:
        api.session.cookies.clear()
        api.session.cookies.set("auth-cookie", self.token)
        api.delete_user(str(self.user_id))

    def refresh(self) -> None:
        api.session.cookies.clear()
        api.session.cookies.set("auth-cookie", self.token)
        data = api.get_player()
        self.user_name = data["name"]
        self.user_id = data["id"]
        self.email = data["email"]

    def block(self, user: "User") -> dict:
        api.session.cookies.clear()
        api.session.cookies.set("auth-cookie", self.token)
        return api.block(str(user.user_id))

    def unblock(self, user: "User") -> bool:
        return api.unblock(str(user.user_id))

    def create_room(self, **kwargs) -> Room:
        api.session.cookies.clear()
        api.session.cookies.set("auth-cookie", self.token)
        data = api.new_room(
            name=kwargs.get("name", " ".join(fake.words()[1:]).title()),
            owner=self.user_id,
            type=kwargs.get("type", ROOM_ACCESS_TYPE.PUBLIC),
        )
        room = Room(data)
        return room

    def create_protected_room(self, **kwargs) -> Room:
        api.session.cookies.clear()
        api.session.cookies.set("auth-cookie", self.token)
        data = api.new_protected_room(
            name=kwargs.get("name", " ".join(fake.words()[1:]).title()),
            owner=self.user_id,
            type=ROOM_ACCESS_TYPE.PROTECTED,
            password=kwargs.get("password", "foobar32")
        )
        room = Room(data)
        return room

    def update_room(self, room, **kwargs) -> Room:
        api.session.cookies.clear()
        api.session.cookies.set("auth-cookie", self.token)

        password = kwargs.get('password', '')
        data = {}

        if password:
            data = api.update_room_password(room, name=kwargs.get('name', room.name), type=kwargs.get('type', room.type), password=password)
        else:
            data = api.update_room(room, name=kwargs.get('name', room.name), type=kwargs.get('type', room.type))
        return Room(data)

    def join_room(self, room: Room) -> Room:
        api.session.cookies.clear()
        api.session.cookies.set("auth-cookie", self.token)
        return Room(api.join_room(self, room))

    def join_protected_room(self, room: Room, password: str) -> Room:
        api.session.cookies.clear()
        api.session.cookies.set("auth-cookie", self.token)
        return Room(api.join_protected_room(self, room, password))


    def leave_room(self, room: Room):
        api.session.cookies.clear()
        api.session.cookies.set("auth-cookie", self.token)
        api.leave_room(room)

    def kick_player(self, user, room):
        api.session.cookies.clear()
        api.session.cookies.set("auth-cookie", self.token)
        api.kick_player(room, user)

    def mute_player(self, user, room):
        api.session.cookies.clear()
        api.session.cookies.set("auth-cookie", self.token)
        api.mute_player(room, user)

    def ban_player(self, user, room):
        api.session.cookies.clear()
        api.session.cookies.set("auth-cookie", self.token)
        api.ban_player(room, user)

    def give_admin_to(self, user, room):
        api.session.cookies.clear()
        api.session.cookies.set("auth-cookie", self.token)
        api.give_admin_to(room, user)

    def change_password_on_room(self, room, new_password):
        api.session.cookies.clear()
        api.session.cookies.set("auth-cookie", self.token)
        api.change_password_on_room(room, new_password)

    def disable_password_on_room(self, room):
        api.session.cookies.clear()
        api.session.cookies.set("auth-cookie", self.token)
        api.disable_password_on_room(room)

    def post_message_to_room(self, room):
        # TODO: impl using sio
        pass

    def send_message_to_user(self, user):
        # TODO: impl using sio
        pass

    def __repr__(self):
        return f"<User: {self.user_id}"


if __name__ == "__main__":
    pass
