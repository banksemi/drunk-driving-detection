<?
    class MysqlSetting 
    {
        public static $serverDomain = "localhost";
        public static $username = "root";
        public static $password = "root";
        public static $database = "db";
    }
    /*
        만약 Mysql 정보를 수정하고싶다면
        index.php가 위치한 폴더에 아래의 내용으로 config.php 파일을 만들어 수정해주세요.

        <?
            MysqlSetting::$serverDomain = "ip";
            MysqlSetting::$username = "id";
            MysqlSetting::$password = "password";
            MysqlSetting::$database = "db";
        ?>

    */
?>