<?
    include_once("../index.php");
    APILevel::Need(APILevel::guest);

    ValueCheck::String($_POST["id"], "아이디를 입력해주세요.");
    ValueCheck::String($_POST["password"], "비밀번호를 입력해주세요.");
    
    $user = new UserInfo($_POST["id"]);
    if ($user->id == null)
    {
        ErrorExit("아이디가 올바르지 않습니다.".$_SESSION["count"]);
    }

    if ($user->PasswordCheck($_POST["password"]) == false)
    {
        ErrorExit("패스워드가 올바르지 않습니다.");
    }

    $_SESSION["id"] = $user->id;
?>