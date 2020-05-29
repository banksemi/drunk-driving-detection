<?
    include_once("../../index.php");
    APILevel::Need(APILevel::student);
    
    ValueCheck::String($_POST["application_name"], "어플리케이션 이름을 입력해주세요.", ValueCheck::Option_NotSpace);
    ValueCheck::String($_POST["key"], "추가할 key를 입력해주세요.", ValueCheck::Option_NotSpace);
    ValueCheck::String($_POST["type"], "추가할 type을 입력해주세요.");

    $user = UserInfo::GetInstance();

    $token = IOTApplication::GetToken($user, $_POST["application_name"]);

    $iotApplication = new IOTApplication($token);

    $result = $iotApplication->CreateValue($_POST["key"], $_POST["type"], null);
    if ($result == 1062)
    {
        ErrorExit("해당 어플리케이션에 같은 이름을 가진 변수가 존재합니다.");
    }
    else if ($result == IOTValueType::ErrorCode())
    {
        ErrorExit("변수 타입은 'number', 'string', 'boolean' 중 하나이어야합니다.");
    }
    else
    {
        $resultMessage->message = "변수를 등록했습니다.";
        $resultMessage->application_name = $_POST["application_name"];
        $resultMessage->token = $token;
    }
?>