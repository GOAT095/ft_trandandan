import requests
import random
from faker import Faker

fake = Faker()

user_id = random.randint(int(1e5), int(1e7))


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
        return self.session.post(f"{self.url}/user/ublock/{user_id}").json()

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
        new = ("user_name" in kwargs)
        self.token = generate_api_token(
            data=dict(id=self.user_id, name=self.user_name, email=self.email),
            new=new,
        )
        if new: self.refresh()

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

if __name__ == "__main__":
    pass
