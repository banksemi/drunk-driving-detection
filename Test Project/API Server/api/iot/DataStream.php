<?

    $session_disable = true;
    include_once("../../index.php");
    APILevel::Need(APILevel::guest);

    ValueCheck::String($_GET["token"], "토큰이 명시되지 않았습니다. (GET 파라미터에 'token' 입력 필요)");
    ValueCheck::String($_GET["key"], "변수 이름이 지정되지 않았습니다. (GET 파라미터에 'key' 입력 필요)");

    $object = new IOTApplication($_GET["token"]);

    if ($object->vaildation == false)
        ErrorExit("토큰이 유효하지 않습니다.");

    if ($_SERVER['REQUEST_METHOD'] === 'GET')
    {
        $list = $object->Read($_GET["key"], $_GET["limit"]);
		$resultMessage->key = $_GET['key'];
		$resultMessage->data = $list;
    }
    else if ($_SERVER['REQUEST_METHOD'] === 'POST')
    {
        ValueCheck::String($_POST["value"], "입력할 데이터가 존재하지 않습니다 (POST 파라미터에 'value' 입력 필요)");

        $result = $object->Insert($_GET["key"], $_POST["value"], $_POST["device"], $_POST["time"]);
        if ($result == 1452) // 외래키로 설정된 토큰,키  쌍이 존재하지 않음.
        {
            ErrorExit("해당 어플리케이션에 입력한 변수가 존재하지 않습니다");
        }
        
        if (IOTValueType::ErrorMessage($result) !== null)
            ErrorExit(IOTValueType::ErrorMessage($result));

        if ($result != 0)
        {
            ErrorExit("쿼리 실패");
        }
    }
    else
    {
        ErrorExit("GET 또는 POST 메소드를 이용해주세요.");
    }
?>