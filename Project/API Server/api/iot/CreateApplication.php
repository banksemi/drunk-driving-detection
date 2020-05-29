<?
    include_once("../../index.php");
    APILevel::Need(APILevel::student);

    
    ValueCheck::String($_POST["application_name"], "어플리케이션 이름을 입력해주세요.", ValueCheck::Option_NotSpace);
    $_POST["empty_layout"] = ValueCheck::Boolean($_POST["empty_layout"], "템플릿의 레이아웃을 적용할지 여부를 선택해주세요.");

    $user = UserInfo::GetInstance();

    $result = IOTApplication::Create($user, $_POST["application_name"], $_POST["description"], $_POST["template"], $_POST["empty_layout"]);
    if ($result == 1062)
    {
        ErrorExit("이미 계정 내에 같은 이름을 가진 어플리케이션이 존재합니다.");
    }
    else if ($result == -101)
    {
        ErrorExit("템플릿 생성 중에 실패했습니다. 관리자에게 문의해주세요.");
    }
    else if ($result instanceof IOTApplication)
    {
        $resultMessage->message = "어플리케이션을 등록하였습니다.";
        $resultMessage->application_name = $result->name;
        $resultMessage->token = $result->token;
    }
    else
    {
        ErrorExit("생성에 실패했습니다");
    }
?>