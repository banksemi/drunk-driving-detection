<?
    function ErrorExit($message, $code = 0)
    {
        global $resultMessage;
        $resultMessage = new stdClass();
        $resultMessage->success = $code;
        $resultMessage->message = $message;
        exit(0);
    }
    function exit_event()
    {        
        global $resultMessage;
        global $session_disable;
        // 세션 종료
        if ( $session_disable != true)
            session_write_close();
        Mysql::AllClose();

        // 만약 API 권한 체크가 안되어있다면 결과를 리턴하지 않음 (보안)
        if (APILevel::$checked == false)
        {
            echo ("오류!!! : 해당 API는 권한을 확인하지 않습니다");
            return;
        }
        
        if (!isset($resultMessage->success))
            $resultMessage->success = 1;

        // 콜백 메소드가 있을경우 자동 추가
        if ($_POST["callback"] != null) 
            $resultMessage->callback = $_POST["callback"];

        header("Content-Type:application/json; charset=UTF-8");
        
        echo json_encode($resultMessage, JSON_UNESCAPED_UNICODE);

    }
    register_shutdown_function('exit_event');
?>