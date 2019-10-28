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
# forceURL_only_debug = "https://api.easyrobot.co.kr/upload/Health-2019-10-27 19-40-30.csv"


def algorithm(type, data):
    return "not implemented"

def echo_handler(connectionSock, add):
    global forceURL_only_debug
    print("--------------------------------------")
    print("Connected", add)
    url = connectionSock.recv(1024).decode('utf-8');
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
            result = algorithm(m[1], data)
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