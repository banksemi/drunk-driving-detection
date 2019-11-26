<?
    $resultMessage = new stdClass();
    // PHP 파일 이름이 들어간 절대 서버 경로
    $file_server_path = realpath(__FILE__);

    // API 폴더 경로
    $server_path = str_replace(basename(__FILE__), "", $file_server_path);

    // 세팅 기본값 로드
    include_once($server_path."Setting/MysqlSetting.php");
    include_once($server_path."Setting/Setting.php");
    include_once($server_path."Setting/ServerInfo.php");

    // 사용자 설정 세팅값 로드
    include_once($server_path."config.php");

    // 헤더 설정
    if (Setting::$AccessAnyOrigin)
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");

    if (Setting::$AccessAnyCredential)
        header("Access-Control-Allow-Credentials: true");

    header("Access-Control-Allow-Headers: content-type");
    
    // 모듈 로드
    include_once($server_path."Mysql/Mysql.php"); // MYSQL에 싱글톤 패턴 적용
    include_once($server_path."ExitCode.php"); // 요청 완료시 자동으로 열려진 세션 종료
    include_once($server_path."Session.php"); // 세션을 MYSQL으로 관리
    
    include_once($server_path."User/APILevel.php"); // API 레벨 세팅, 권한 체크
    include_once($server_path."User/UserInfo.php"); // 유저 정보를 객체화
    
    include_once($server_path."IOT/IOTApplication.php"); // IOT 어플리케이션을 객체화
    include_once($server_path."IOT/IOTValueType.php"); // IOT 변수 타입 세팅
    include_once($server_path."IOT/IOTTemplate.php"); // IOT 템플릿
    include_once($server_path."IOT/IOTStatistics.php"); // IOT 통계

    include_once($server_path."TokenGenerater.php"); // 토큰 생성
    include_once($server_path."DebugOption.php"); // 디버그 기능 제공
    include_once($server_path."ValueCheck.php"); // 변수 검사

    // 서버 상태를 확인하는 메소드일경우 세션을 사용하지 않도록 함. 
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS')
        $session_disable = true;

    // 세션 시작
    if ($session_disable != true)
        session_start();

    $_SESSION['count'] += 1;
    $_SESSION['log_v'] = "새로운 API 버전 개발 중";

?>