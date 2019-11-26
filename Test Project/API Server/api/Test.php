<?
    include_once("../index.php");
    APILevel::Need(APILevel::guest);
    
    $file = $_FILES['uploaded_file'];
    $_SESSION["file"] = $file;
    $path = "upload/" . $_GET["type"]."-".date("Y-m-d H-i-s").'.csv';

    move_uploaded_file($file['tmp_name'], $path);

    $resultMessage->error = null;

    $address = "192.168.1.204"; // 접속할 IP //
    $port = 4000; // 접속할 PORT //
    $socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP); // TCP 통신용 소켓 생성 //
   
    if ($socket === false)
        $resultMessage->create_error = socket_strerror(socket_last_error());
    
    socket_set_option($socket, SOL_SOCKET, SO_RCVTIMEO, array('sec' => 1, 'usec' => 0));
    socket_set_option($socket, SOL_SOCKET, SO_SNDTIMEO, array('sec' => 1, 'usec' => 0));


    $result = socket_connect($socket, $address, $port); // 소켓 연결 및 $result에 접속값 지정 //
    if ($result === false)
        $resultMessage->connect_error = socket_strerror(socket_last_error($socket));
    else
    {
        $sendURL = "https://api.easyrobot.co.kr/".$path;
        socket_write($socket, $sendURL, strlen($sendURL));
        $resultMessage->result = socket_read($socket, 1024);
        socket_close($socket);
    }


?>