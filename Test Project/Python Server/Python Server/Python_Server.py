import socket
import threading
import pandas as pd
import io
import requests
import re

host=""
port=4000
forceURL_only_debug = ""

# If you want to force the URL, please uncomment below.
forceURL_only_debug = "https://api.easyrobot.co.kr/upload/Health-2019-10-29 23-56-55.csv"


def algorithm(type, data, token):
    return "not implemented" + token

def echo_handler(connectionSock, add):
    global forceURL_only_debug
    print("--------------------------------------")
    print("Connected", add)
    received = connectionSock.recv(1024).decode('utf-8');
    received = received.split("|");
    token = received[0];
    url = received[1];
    print('Original Token :', token)
    print('Original URL :', url)
    if forceURL_only_debug != "":
        url = forceURL_only_debug

    print('URL :', url)

    try:
        response = requests.get(url)
    except:
        connectionSock.close()
        return;

    print("From URL status code: ", response.status_code)
    if response.status_code == 200:
        s = response.content
        data = pd.read_csv(io.StringIO(s.decode('utf-8')))

        m = re.match(r'.*upload/([a-zA-Z]+).*', url)
        if len(m.regs) == 2:
            result = algorithm(m[1], data, token)
        else:
            result = "parsing error";
    else:
        result = 'not found'
    print("Result :", result)
    connectionSock.send(result.encode('utf-8'))

with socket.socket() as sock:
    sock.bind((host, port))
    while True:
        sock.listen(3)
        conn, addr = sock.accept()
        # 새 연결이 생성되면 새 스레드에서 에코잉을 처리하게 한다.
        t = threading.Thread(target=echo_handler, args=(conn, addr))
        t.start()
    sock.close()