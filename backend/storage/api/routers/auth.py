import os
from datetime import datetime, timedelta
from typing import Optional

import requests
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Form, status
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
    OAuth2PasswordBearer,
    OAuth2PasswordRequestForm,
)
from jose import jwt, JWTError

router = APIRouter(prefix="/api")

# Load the .env file
load_dotenv()
SECRET_KEY = "8649277f5ed8258114805af6cf7a3c521739019adeda1d464281080af01af040"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


CREDENTIALS = {
    "Admin": "Admin123",
    "ProjectTeam": "ProjectTeam123",
    "TestEngineer": "TestEngineer123",
}

ALGORITHM = "HS256"


def authenticate_user(role: str,password: str):
    """
    Authenticate a user based on role and password.
    """
    if role in CREDENTIALS and CREDENTIALS[role] == password:
        return {
            "role": role,
        }
    return None


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Create a JWT access token.

    @param:
    data (dict): The data to encode in the token.
    expires_delta (Optional[timedelta]): The expiration time of the token. Defaults to 15 minutes if not provided.

    @return:
    str: The JWT access token.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Get the current authenticated user based on the JWT token.

    @param:
    token (str): The JWT access token.

    @return:
    dict: A dictionary containing the username and role of the authenticated user.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        role: str = payload.get("role")
        team: str = payload.get("team")
    except JWTError:
        raise credentials_exception

    return {"username": username, "role": role, "team": team}


class OAuth2PasswordRequestFormSimple:
    def __init__(
        self,
        username: str = Form(...),
        password: str = Form(...),
    ):
        self.username = username
        self.password = password


@router.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestFormSimple = Depends()):
    """
    Log in a user and provide an access token for authentication.

    @param:
    form_data (OAuth2PasswordRequestForm): The form containing the user's login credentials.

    @return:
    dict: A dictionary containing the access token and its type.
    """
    user = authenticate_user(
        form_data.username, form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={
            "role": user["role"],
        },
        expires_delta=access_token_expires,
    )

    return {"access_token": access_token, "token_type": "bearer"}


async def check_access_token(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer()),
):
    """
    Function for JWT token validation.
    :param credentials: HTTPBasicCredentials object containing the JWT token.
    :type credentials: HTTPBasicCredentials
    :return: Decoded JWT payload if the token is valid.
    :rtype: dict[str, Any]
    :raises HTTPException: If the token is invalid or the user is not authorized.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            algorithms=["HS256"],
            key="secret",
            issuer="auth.mahindra.com",
            options={
                "verify_signature": False,
                "verify_sub": False,
                "verify_exp": False,
            },
        )
        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials: Payload not present",
                headers={"WWW-Authenticate": "Bearer"},
            )
        username = payload.get("user")
        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials: Username not present in payload",
                headers={"WWW-Authenticate": "Bearer"},
            )
        # Use the `requests` library correctly here
        response = requests.get(
            f"{AUTH_LOG_URL}/{AUTH_GROUP_ID}/user/{username}", data=payload
        )
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Could not validate credentials: {response.json()}",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials:please try again later",
            headers={"WWW-Authenticate": "Bearer"},
        )