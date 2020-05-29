<?
    include_once("../../index.php");
    APILevel::Need(APILevel::student);
    
    ValueCheck::String($_POST["application_name"], "어플리케이션 이름을 입력해주세요.", ValueCheck::Option_NotSpace);
    ValueCheck::String($_POST["type"], "메소드 타입을 입력해주세요.");

    $user = UserInfo::GetInstance();

    $token = IOTApplication::GetToken($user, $_POST["application_name"]);
    $iotApplication = new IOTApplication($token);

    if ($iotApplication->vaildation == false)
        ErrorExit("어플리케이션이 존재하지 않습니다.");

    if ($_POST["type"] == "add")
    {
        $result = $iotApplication->AddComponentInLayout($_POST["count"]);
        if ($result != 0)
        {
            ErrorExit("레이아웃 변경 중 에러입니다.");
        }
        else
        {
            $resultMessage->layout = $iotApplication->Statistics();
            $resultMessage->message = "빈 컴포넌트가 추가되었습니다.";
        }
    }
    else if ($_POST["type"] == "modify")
    {
        ValueCheck::String($_POST["createTime"], "createTime을 통해 수정하려는 컴포넌트를 지정해주세요.");
        ValueCheck::String($_POST["component"], "component를 입력해주세요.");
        $result = $iotApplication->ModifyComponentInLayout($_POST["createTime"], json_decode($_POST["component"]));
        if ($result != 0)
        {
            ErrorExit($result);
        }
        else
        {
            $resultMessage->layout = $iotApplication->Statistics();
            $resultMessage->message = "레이아웃이 수정되었습니다.";
        }
    }
    else if ($_POST["type"] == "delete")
    {
        ValueCheck::String($_POST["createTime"], "createTime을 통해 수정하려는 컴포넌트를 지정해주세요.");
        $result = $iotApplication->DeleteComponentInLayout($_POST["createTime"]);
        if ($result != 0)
        {
            ErrorExit($result);
        }
        else
        {
            $resultMessage->layout = $iotApplication->Statistics();
            $resultMessage->message = "컴포넌트가 삭제되었습니다.";
        }
    }

?>